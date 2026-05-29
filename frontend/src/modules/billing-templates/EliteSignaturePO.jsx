import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

const EliteSignaturePO = ({ saleData, activeColumns, colorScheme = 'blue' }) => {
    if (!saleData) return null;
    const { storeName, storeAddress, storeGSTIN, billNo, billDate, customerName, customerAddress, items, summary } = saleData;

    return (
        <div style={{
            width: '210mm', 
            height: '297mm', 
            padding: '10mm', 
            backgroundColor: '#fff',
            fontFamily: "'Inter', sans-serif", 
            color: '#1e293b', 
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ borderLeft: '10px solid #2563eb', paddingLeft: '20px', marginBottom: '10mm' }}>
                <h1 style={{ fontSize: '28pt', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>PURCHASE ORDER</h1>
                <p style={{ color: '#64748b', fontSize: '10pt', margin: 0 }}>Reference: {billNo} {"//"} Date: {billDate}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10mm' }}>
                <div style={{ width: '45%' }}>
                    <h3 style={{ fontSize: '10pt', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '5px' }}>Issued By</h3>
                    <p style={{ fontSize: '12pt', fontWeight: '900', margin: 0 }}>{storeName}</p>
                    <p style={{ fontSize: '9pt', color: '#64748b', margin: '2px 0' }}>{storeAddress}</p>
                    <p style={{ fontSize: '9pt', fontWeight: '700' }}>GSTIN: {storeGSTIN}</p>
                </div>
                <div style={{ width: '45%', textAlign: 'right' }}>
                    <h3 style={{ fontSize: '10pt', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '5px' }}>Vendor</h3>
                    <p style={{ fontSize: '12pt', fontWeight: '900', margin: 0 }}>{customerName}</p>
                    <p style={{ fontSize: '9pt', color: '#64748b', margin: '2px 0' }}>{customerAddress}</p>
                </div>
            </div>

            <div style={{ marginBottom: '10mm' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: '#f8fafc', 
                        borderColor: '#e2e8f0',
                        headerColor: '#1e293b',
                        primary: '#2563eb'
                    }} 
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15mm' }}>
                <div style={{ width: '200px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '9pt' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: '700' }}>₹{summary.basicTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '5px' }}>
                        <span style={{ fontWeight: '800' }}>Total</span>
                        <span style={{ fontWeight: '900', fontSize: '14pt' }}>₹{summary.grandTotal}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20mm', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '40%', textAlign: 'center' }}>
                    <div style={{ height: '20mm', borderBottom: '1px solid #e2e8f0', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '9pt', fontWeight: '700', margin: 0 }}>Authorized Signatory</p>
                    <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>{storeName}</p>
                </div>
                <div style={{ width: '40%', textAlign: 'center' }}>
                    <div style={{ height: '20mm', borderBottom: '1px solid #e2e8f0', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '9pt', fontWeight: '700', margin: 0 }}>Vendor Signature</p>
                    <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>Accepted</p>
                </div>
            </div>
        </div>
    );
};

export default EliteSignaturePO;
