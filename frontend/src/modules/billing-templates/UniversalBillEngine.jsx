import React from 'react';
import { resolveFileUrl } from '../../utils/url';

const UniversalBillEngine = ({ 
  bill = {}, 
  saleData = null, 
  size: propSize = null, 
  activeColumns, 
  sizeConfig = null,
  billType = ''
}) => {
  const data = saleData || bill;

  // STRICT RULE: Selected Size = Input Size
  const size = propSize || data?.defaultBillSize || data?.settings?.billSize || 'A4';
  const currentSizeConfig = sizeConfig;

  // Derive Invoice Title
  const invoiceTitle = billType || data?.billType || "TAX INVOICE";

  // --- FALLBACK DATA ---
  const defaultData = {
    businessName: data?.user?.companyName || data?.storeName || "Demo Store",
    businessAddress: data?.user?.address || data?.storeAddress || "City, State",
    businessPhone: data?.user?.phone || data?.storePhone || "+91 00000 00000",
    businessEmail: data?.user?.email || data?.storeEmail || "contact@billsoft.com",
    businessGst: data?.user?.gstNumber || data?.storeGSTIN || "27ABCDE1234F1Z5",
    customerName: data?.customerName || "Walking Customer",
    customerPhone: data?.customerPhone || data?.customer?.phone || "N/A",
    billNumber: data?.billNumber || data?.billNo || `BILL-${Math.floor(Math.random() * 9000) + 1000}`,
    date: data?.createdAt || data?.billDate ? new Date(data.createdAt || data.billDate).toLocaleDateString() : new Date().toLocaleDateString(),
    items: (data?.items && data.items.length > 0) ? data.items.map(i => ({
      productName: i.productName || i.name || "Sample Item",
      quantity: i.quantity || i.qty || 1,
      price: i.price || i.rate || 0,
      total: i.total || ((i.quantity || i.qty || 1) * (i.price || i.rate || 0)),
      hsn: i.hsn || i.customFields?.hsn || "",
      batch: i.batch || i.customFields?.batch || "",
      exp: i.exp || i.customFields?.exp || "",
      taxRate: i.taxRate || i.customFields?.taxRate || 0,
      discount: i.discount || 0
    })) : [
      { productName: "Professional Service", quantity: 1, price: 4500, total: 4500 },
      { productName: "Consulting Fee", quantity: 2, price: 1200, total: 2400 },
      { productName: "Technical Support", quantity: 5, price: 250, total: 1250 }
    ],
    subtotal: data?.subtotal || 0,
    taxAmount: data?.taxAmount || 0,
    totalAmount: data?.totalAmount || 0,
    paymentMode: data?.paymentMode || "Cash",
    paymentStatus: data?.paymentStatus || data?.status || "PAID",
    logoUrl: data?.user?.logoUrl || data?.logoUrl || data?.businessLogo || null,
  };

  if (defaultData.totalAmount === 0 && defaultData.items.length > 0) {
    defaultData.totalAmount = defaultData.items.reduce((acc, i) => acc + i.total, 0);
    defaultData.taxAmount = defaultData.items.reduce((acc, i) => acc + (i.total * (i.taxRate / (100 + i.taxRate))), 0);
    defaultData.subtotal = defaultData.totalAmount - defaultData.taxAmount;
  }

  // 🧮 DETAILED TAX BREAKDOWN
  const taxableValue = defaultData.subtotal || 0;
  const totalTax = defaultData.taxAmount || 0;
  const totalWithTax = taxableValue + totalTax;
  const actualTotal = defaultData.totalAmount || totalWithTax;

  const containerStyle = {
    fontFamily: "'Inter', sans-serif",
    color: '#1e293b',
    backgroundColor: '#fff',
    margin: '0 auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const getLayoutStyles = () => {
    const s = size.toLowerCase();
    
    if (s === 'a4' || s === 'a5') {
      return {
        padding: s === 'a4' ? '15mm' : '10mm',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      };
    }
    if (s === '80mm' || s === '58mm') {
      return {
        width: s === '80mm' ? '300px' : '220px',
        padding: '5mm',
        backgroundColor: '#fff',
        border: '1px dashed #cbd5e1'
      };
    }
    return {
      padding: '5mm',
      border: '2px solid #334155',
      borderRadius: '4px',
      background: '#f8fafc'
    };
  };

  // 🛡️ REFINED COLUMN PRIORITY SYSTEM
  const COLUMN_PRIORITY = ['S.No', 'Item Name', 'Qty', 'Unit', 'Rate', 'Amount', 'Tax', 'Discount', 'HSN', 'Batch', 'Exp'];

  const dynamicCols = data?.settings?.dynamicColumns;
  const isDynamic = !!dynamicCols && dynamicCols.length > 0;

  const getColsList = () => {
    if (isDynamic) {
        return dynamicCols.filter(c => c.visible !== false);
    }
    
    const baseCols = activeColumns || ['Item Name', 'Qty', 'Amount'];
    const sortedCols = [...baseCols].sort((a, b) => {
      const pA = COLUMN_PRIORITY.indexOf(a);
      const pB = COLUMN_PRIORITY.indexOf(b);
      return (pA === -1 ? 99 : pA) - (pB === -1 ? 99 : pB);
    });
    const filtered = sortedCols.filter(c => c !== 'Amount');
    return sortedCols.includes('Amount') ? [...filtered, 'Amount'] : filtered;
  };

  const cols = getColsList();

  const getColLabel = (col) => {
    if (typeof col === 'object') return col.label;

    // 1. Priority: System Label Overrides (from Manage Columns Modal)
    const customLabel = data?.settings?.columnLabels?.[col] || (data?.customColumns?.find(c => c.id === col)?.label);
    if (customLabel) return customLabel;

    // 2. Default Mappings
    switch (col) {
      case 'S.No': return 'Sr No';
      case 'Item Name': return 'Description of Goods';
      case 'HSN': return 'HSN';
      case 'Qty': return 'Qty';
      case 'Rate': return 'Price';
      case 'Amount': return 'Total';
      case 'Batch': return 'Batch';
      case 'Exp': return 'Exp';
      case 'Unit': return 'Unit';
      case 'Tax': return 'GST%';
      case 'Discount': return 'Disc%';
      default: return col;
    }
  };

  const getColStyles = (col, sizeId, sizeConfig = null) => {
    const isThermal = sizeId.includes('mm') || sizeId.includes('1/7') || sizeId.includes('1/8');

    const configWidths = sizeConfig?.widths || {};
    const width = configWidths[col] || 'auto';

    const baseStyle = {
      width: width,
      boxSizing: 'border-box',
      padding: isThermal ? '4px 6px' : '8px 12px',
      borderBottom: '1px solid #f1f5f9',
      borderRight: isThermal ? 'none' : '1px solid #e2e8f0',
      textAlign: 'center !important',
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'nowrap',
      fontSize: sizeConfig?.fontSize || '10px',
      lineHeight: 1.2
    };

    return baseStyle;
  };

  const renderCellContent = (item, idx, c) => {
    switch (c) {
      case 'S.No': return idx + 1;
      case 'Item Name':
      case 'Description of Goods':
      case 'Product Description':
      case 'PRODUCT DESCRIPTION':
        return <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName || item.name}</div>;
      case 'HSN': return item.hsn || '-';
      case 'Qty': return item.quantity || item.qty;
      case 'Unit': return item.unit || item.customFields?.unit || 'NOS';
      case 'Rate':
      case 'Price':
        return (item.price || item.rate || 0).toFixed(2);
      case 'Amount':
      case 'Total':
        return (item.total || 0).toFixed(2);
      case 'Batch': return item.batch || '-';
      case 'Exp': return item.exp || '-';
      case 'Tax': return `${item.taxRate || 0}%`;
      case 'Discount': return `${item.discount || 0}%`;
      default: {
        const exact = item[c];
        const foundKey = Object.keys(item).find(k => k.toLowerCase() === c.toLowerCase());
        return exact !== undefined ? exact : (foundKey ? item[foundKey] : '-');
      }
    }
  };

  const capitalize = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderItemRow = (item, idx, sizeId, sizeConfig = null) => {
    return cols.map((c, cIdx) => {
      const isColObj = typeof c === 'object';
      const colLabel = isColObj ? c.label : c;
      const s = getColStyles(colLabel, sizeId, sizeConfig);
      
      let content = '-';
      if (isColObj) {
        const val = c.dbField ? (c.dbField.split('.').reduce((o, i) => o?.[i], item)) : item[c.key];
        content = val !== undefined ? val : '-';

        // CAPITALIZATION LOGIC
        if (c.autoCapitalize && content && typeof content === 'string') {
          content = capitalize(content);
        }
      } else {
        content = renderCellContent(item, idx, c);
      }
      
      return <td key={cIdx} style={s}>{content}</td>;
    });
  };

  const renderA4 = () => {
    return (
      <div className={`invoice-container a4-standard-layout`} style={{ ...containerStyle, fontSize: currentSizeConfig?.fontSize || '11px', width: '210mm', minHeight: '297mm', padding: '15mm', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #000', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {defaultData.logoUrl && (
              <img src={defaultData.logoUrl} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '4px' }} />
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: currentSizeConfig?.titleSize || '28px', fontWeight: '950' }}>{defaultData.businessName}</h1>
              <p style={{ opacity: 0.7, maxWidth: '400px', fontSize: '12px', margin: '4px 0' }}>{defaultData.businessAddress}</p>
              <p style={{ fontWeight: 'bold', fontSize: '12px', margin: 0 }}>GSTIN: {defaultData.businessGst}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, color: '#1e40af', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>{invoiceTitle}</h1>
            <p style={{ fontWeight: '900', fontSize: '20px', margin: '5px 0' }}>#{defaultData.billNumber}</p>
            <p style={{ fontSize: '12px', margin: 0 }}>{defaultData.date}</p>
          </div>
        </div>
        
        <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'collapse', border: '2px solid black', tableLayout: 'auto' }}>
            <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid black' }}>
                    {cols.map((col, idx) => {
                        const colLabel = typeof col === 'object' ? col.label : getColLabel(col);
                        return <th key={idx} style={{ ...getColStyles(colLabel, 'A4', currentSizeConfig), fontWeight: '900', border: '1px solid black' }}>{colLabel}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                {defaultData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        {renderItemRow(item, idx, 'A4', currentSizeConfig)}
                    </tr>
                ))}
            </tbody>
        </table>

        <div style={{ marginTop: 'auto', borderTop: '4px solid #000', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ opacity: 0.5, fontSize: '9px', fontStyle: 'italic' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
               <img src="/logo.svg" alt="BillSoft" style={{ height: '14px', width: 'auto', filter: 'grayscale(100%)' }} />
               <span style={{ fontWeight: '900', letterSpacing: '1px' }}>BillSoft • Powered by AGB Technologies</span>
            </div>
            <p style={{ margin: 0 }}>This is a computer generated document. No signature required.</p>
          </div>
          <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Taxable:</span><span>₹{taxableValue.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span><span>₹{totalTax.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '5px' }}><span>Total:</span><span>₹{actualTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...containerStyle, ...getLayoutStyles() }}>
      {(() => {
        // Simplified: Focus on A4 for now as per user previous focus, other sizes follow base layout
        return renderA4();
      })()}
    </div>
  );
};

export default UniversalBillEngine;
