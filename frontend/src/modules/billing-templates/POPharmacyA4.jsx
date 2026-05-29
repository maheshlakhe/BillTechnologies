import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * POPharmacyA4.jsx
 * Specialized Purchase Order for Pharmaceutical/Medical Stores.
 * Includes Exp, Batch, and Drug Licence info.
 */
const POPharmacyA4 = ({ saleData, activeColumns }) => {
    if (!saleData) return null;
    const { summary, items, storeName, storeAddress, storeGSTIN, billNo, billDate, customerName, customerAddress } = saleData;

    const formatCurr = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="invoice-container a4-standard-layout pharmacy-theme" style={{ 
            width: '210mm', 
            height: '297mm', 
            padding: '10mm', 
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-300">
                <div className="w-2/3">
                    <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>{storeName}</h1>
                    <p style={{ fontSize: '10pt', margin: '4px 0' }}>{storeAddress}</p>
                    <p style={{ fontSize: '9pt', fontWeight: 'bold' }}>GSTIN: {storeGSTIN} | DL No: DL-PH-001/45</p>
                </div>
                <div className="text-right w-1/3">
                    <h2 style={{ fontSize: '14pt', fontWeight: 'bold', background: '#000', color: '#fff', padding: '4px 12px', display: 'inline-block' }}>PURCHASE ORDER</h2>
                    <div style={{ marginTop: '10px', fontSize: '9pt', border: '1px solid #ddd', padding: '6px' }}>
                        <p>PO No: <b>{billNo}</b></p>
                        <p>Date: <b>{billDate}</b></p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <p style={{ fontSize: '8pt', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Supplier (Vendor)</p>
                    <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{customerName}</p>
                    <p style={{ fontSize: '9pt' }}>{customerAddress}</p>
                    <p style={{ fontSize: '9pt' }}>GST: {saleData.customerGSTIN}</p>
                </div>
                <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'right' }}>
                    <p style={{ fontSize: '8pt', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Project Reference</p>
                    <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>{saleData.projectName || 'Medical Stock Replenishment'}</p>
                    <p style={{ fontSize: '9pt' }}>PO Validity: 15 Days</p>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: '#f8fafc', 
                        borderColor: '#000',
                        headerColor: '#1e3a8a'
                    }} 
                />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 'bold' }}>₹{formatCurr(summary.basicTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#1e3a8a', color: '#fff', borderRadius: '4px', marginTop: '10px' }}>
                        <span style={{ fontWeight: 'bold' }}>TOTAL PO VALUE</span>
                        <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>₹{formatCurr(summary.grandTotal)}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '70%', fontSize: '8pt', color: '#666' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>PO Terms & Declaration:</p>
                    <p>1. Supply must be from fresh batch with at least 18 months expiry. 2. Damaged goods will not be accepted. 3. Invoice must reference this PO.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '9pt', fontWeight: '900', color: '#1e3a8a', marginBottom: '30px' }}>FOR {storeName.toUpperCase()}</p>
                    <p style={{ borderTop: '1px solid #000', paddingTop: '4px', fontWeight: 'bold' }}>Authorized Pharmacist</p>
                </div>
            </div>
        </div>
    );
};

export default POPharmacyA4;
