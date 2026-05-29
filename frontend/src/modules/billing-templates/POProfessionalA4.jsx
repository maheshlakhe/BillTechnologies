import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * POProfessionalA4.jsx
 * High-Fidelity "GST Purchase Order Format"
 * Adapted from Professional Invoice.
 */
const POProfessionalA4 = ({ saleData, activeColumns }) => {
    if (!saleData) return null;

    const {
        storeName = 'XYZ & CO',
        storeAddress = '123 Business Park, Rajajinagar, Bangalore - 560010',
        storeGSTIN = '29AAAAA0000A1Z5',
        storePhone = '91-9876543210',
        billNo = 'PO/2026/045',
        billDate = '10-Apr-2026',
        customerName = 'ABC RETAILS',
        customerAddress = '456 Market Road, Shivajinagar, Pune - 411001',
        customerGSTIN = '27BBBBB0000B1Z2',
        items = [],
        summary = {},
        paymentMode = 'Bank Transfer',
        businessLogo,
        bankName = 'HDFC BANK LTD',
        accountNumber = '50200012345678',
        ifscCode = 'HDFC0001234',
        projectName = 'Standard Supply',
        deliveryPeriod = '15 Days',
        placeOfSupply = 'Karnataka (29)',
        state = 'Karnataka',
        stateCode = '29'
    } = saleData;

    const formatCurr = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="gst-invoice-wrapper" style={{ 
            width: '210mm', 
            height: '297mm', 
            padding: '10mm', 
            backgroundColor: '#fff', 
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            color: '#000',
            fontSize: '8.5pt',
            lineHeight: '1.2',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1mm' }}>
                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>GST Purchase Order Format</div>
                <div style={{ textAlign: 'right', border: '0.5pt solid #000', padding: '1px 5px', fontSize: '6.5pt' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <span>[ ] Original</span>
                        <span>[ ] Duplicate</span>
                        <span>[ ] Triplicate</span>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                <h2 style={{ margin: 0, fontSize: '14pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Purchase Order</h2>
            </div>

            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt' }}>
                <tr>
                    <td style={{ width: '60%', padding: '3mm', borderRight: '1pt solid #000' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3mm' }}>
                            {businessLogo ? (
                                <img src={businessLogo} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ width: '40px', height: '40px', border: '1pt solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12pt', fontWeight: 'bold' }}>
                                    {storeName.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: '13pt', fontWeight: '900', textTransform: 'uppercase' }}>{storeName}</div>
                                <div style={{ fontSize: '7.5pt' }}>{storeAddress}</div>
                                <div style={{ fontWeight: 'bold' }}>GSTIN: {storeGSTIN}</div>
                                <div>Phone: {storePhone}</div>
                            </div>
                        </div>
                    </td>
                    <td style={{ width: '40%', padding: '1.5mm', verticalAlign: 'top' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5pt' }}>
                            <tr><td style={{ fontWeight: 'bold' }}>PO No.</td><td>: {billNo}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>PO Date</td><td>: {billDate}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>Project</td><td>: {projectName}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>State / Code</td><td>: {state} / {stateCode}</td></tr>
                        </table>
                    </td>
                </tr>
            </table>

            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt', fontSize: '7.5pt' }}>
                <tr>
                    <td style={{ width: '33%', padding: '1.5mm', borderRight: '1pt solid #000' }}><strong>Delivery:</strong> {deliveryPeriod}</td>
                    <td style={{ width: '33%', padding: '1.5mm', borderRight: '1pt solid #000' }}><strong>Payment:</strong> {paymentMode}</td>
                    <td style={{ width: '34%', padding: '1.5mm' }}><strong>POS:</strong> {placeOfSupply}</td>
                </tr>
            </table>

            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt' }}>
                <tr>
                    <td style={{ width: '50%', padding: '2.5mm', borderRight: '1pt solid #000', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '6pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', color: '#666' }}>Buyer (Bill To)</div>
                        <div style={{ fontWeight: '900', fontSize: '9pt', textTransform: 'uppercase' }}>{storeName}</div>
                        <div style={{ fontSize: '7.5pt' }}>{storeAddress}</div>
                        <div><strong>GSTIN:</strong> {storeGSTIN}</div>
                    </td>
                    <td style={{ width: '50%', padding: '2.5mm', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '6pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', color: '#666' }}>Supplier (Vendor)</div>
                        <div style={{ fontWeight: '900', fontSize: '9pt', textTransform: 'uppercase' }}>{customerName}</div>
                        <div style={{ fontSize: '7.5pt' }}>{customerAddress}</div>
                        <div><strong>GSTIN:</strong> {customerGSTIN}</div>
                    </td>
                </tr>
            </table>

            <div style={{ marginBottom: '-1pt' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: '#f2f2f2', 
                        borderColor: '#000',
                        headerColor: '#000'
                    }} 
                />
            </div>

            <div style={{ display: 'flex', border: '1pt solid #000', marginTop: '-1pt' }}>
                <div style={{ width: '60%', padding: '1.5mm', borderRight: '1pt solid #000' }}>
                    <div style={{ marginBottom: '1.5mm' }}><strong>Amount in Words:</strong> <span style={{ textTransform: 'capitalize' }}>{summary.totalInWords || 'Zero only'}</span></div>
                </div>
                <div style={{ width: '40%', padding: '1.5mm' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                        <tr><td>Sub-Total</td><td style={{ textAlign: 'right' }}>{formatCurr(summary.basicTotal)}</td></tr>
                        <tr><td>Grand Total</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {formatCurr(summary.grandTotal)}</td></tr>
                    </table>
                </div>
            </div>

            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginTop: '-1pt' }}>
                <tr>
                    <td style={{ width: '60%', padding: '2mm', borderRight: '1pt solid #000', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', fontSize: '7.5pt' }}>Bank Details (Supplier):</div>
                        <div style={{ fontSize: '7.5pt' }}>Bank: <strong>{bankName}</strong> | A/c No: <strong>{accountNumber}</strong> | IFSC: {ifscCode}</div>
                    </td>
                    <td style={{ width: '40%', padding: '2mm', textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '7.5pt' }}>For {storeName} (Buyer)</div>
                        <div style={{ height: '8mm' }}></div>
                        <div style={{ borderTop: '0.5pt solid #000', display: 'inline-block', minWidth: '35mm', fontWeight: 'bold' }}>Auth. Signatory</div>
                    </td>
                </tr>
            </table>
        </div>
    );
};

export default POProfessionalA4;
