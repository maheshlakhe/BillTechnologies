import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

const IndustrialShadowPO = ({ saleData, activeColumns, colorScheme = 'slate' }) => {
    if (!saleData) return null;
    const { storeName, storeAddress, billNo, billDate, customerName, customerAddress, items, summary } = saleData;

    return (
        <div style={{
            width: '210mm', height: '297mm', padding: '12mm', backgroundColor: '#f8fafc',
            fontFamily: "'Inter', sans-serif", color: '#0f172a', boxSizing: 'border-box'
        }}>
            <div style={{ backgroundColor: '#fff', height: '100%', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10mm', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40mm', height: '40mm', backgroundColor: '#0f172a', clipPath: 'polygon(0 0, 100% 0, 100% 100%)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', padding: '5mm' }}>
                    <p style={{ color: '#fff', fontWeight: '900', fontSize: '12pt', transform: 'rotate(0deg)' }}>PO</p>
                </div>

                <div style={{ marginBottom: '15mm' }}>
                    <h2 style={{ fontSize: '24pt', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px' }}>{storeName}</h2>
                    <p style={{ fontSize: '9pt', maxWidth: '300px', opacity: 0.7 }}>{storeAddress}</p>
                    <p style={{ fontWeight: '800', marginTop: '2mm' }}>ID: {billNo}</p>
                </div>

                <div style={{ display: 'flex', gap: '5mm', marginBottom: '10mm' }}>
                    <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '4mm' }}>
                        <p style={{ fontSize: '8pt', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Vendor Details</p>
                        <h4 style={{ margin: '1mm 0', fontSize: '11pt' }}>{customerName}</h4>
                        <p style={{ fontSize: '8pt', opacity: 0.8 }}>{customerAddress}</p>
                    </div>
                    <div style={{ width: '60mm', border: '2px solid #0f172a', padding: '4mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontSize: '8pt', opacity: 0.6 }}>Date Issued</p>
                        <p style={{ fontSize: '12pt', fontWeight: '900' }}>{billDate}</p>
                    </div>
                </div>

                <div style={{ marginBottom: '10mm' }}>
                    <UniversalPOTable 
                        columns={activeColumns} 
                        data={items} 
                        s={{ 
                            headerBg: '#0f172a', 
                            borderColor: '#0f172a',
                            headerColor: '#fff',
                            primary: '#0f172a'
                        }} 
                    />
                </div>

                <div style={{ position: 'absolute', bottom: '10mm', left: '10mm', right: '10mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '4px solid #0f172a', paddingTop: '5mm' }}>
                        <div>
                            <p style={{ fontSize: '8pt', color: '#64748b' }}>Technical Review By</p>
                            <div style={{ height: '12mm', width: '50mm', borderBottom: '1px solid #0f172a' }}></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '10pt', opacity: 0.6 }}>NET PAYABLE</p>
                            <p style={{ fontSize: '24pt', fontWeight: '900' }}>₹{summary.grandTotal}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndustrialShadowPO;
