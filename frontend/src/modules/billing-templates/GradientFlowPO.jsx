import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

const GradientFlowPO = ({ saleData, activeColumns, colorScheme = 'violet' }) => {
    if (!saleData) return null;
    const { storeName, storeAddress, billNo, billDate, customerName, customerAddress, items, summary } = saleData;

    return (
        <div style={{
            width: '210mm', height: '297mm', backgroundColor: '#fff',
            fontFamily: "'Outfit', sans-serif", color: '#1a1a1a', boxSizing: 'border-box', overflow: 'hidden'
        }}>
            <div style={{ height: '60mm', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', padding: '15mm', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32pt', fontWeight: '900', margin: 0 }}>PO</h1>
                        <p style={{ opacity: 0.8, fontSize: '11pt', margin: 0 }}>OFFICIAL DOCUMENT</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14pt', fontWeight: '800', margin: 0 }}>{billNo}</p>
                        <p style={{ opacity: 0.8, fontSize: '10pt', margin: 0 }}>Issued: {billDate}</p>
                    </div>
                </div>
                <div style={{ marginTop: '5mm', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '5mm' }}>
                    <p style={{ fontSize: '12pt', fontWeight: '700', margin: 0 }}>{storeName}</p>
                    <p style={{ opacity: 0.8, fontSize: '9pt', margin: 0 }}>{storeAddress}</p>
                </div>
            </div>

            <div style={{ padding: '15mm' }}>
                <div style={{ marginBottom: '10mm', backgroundColor: '#f5f3ff', padding: '5mm', borderRadius: '4px', borderLeft: '4px solid #7c3aed' }}>
                    <h3 style={{ fontSize: '9pt', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '2px' }}>Supplier</h3>
                    <p style={{ fontSize: '11pt', fontWeight: '900', margin: 0 }}>{customerName}</p>
                    <p style={{ fontSize: '9pt', color: '#4c1d95', opacity: 0.7, margin: 0 }}>{customerAddress}</p>
                </div>

                <div style={{ marginBottom: '10mm' }}>
                    <UniversalPOTable 
                        columns={activeColumns} 
                        data={items} 
                        s={{ 
                            headerBg: '#f5f3ff', 
                            borderColor: '#ddd6fe',
                            headerColor: '#7c3aed',
                            primary: '#7c3aed'
                        }} 
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2mm', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: '10pt', color: '#6b7280' }}>Amount Payable</span>
                            <span style={{ fontSize: '18pt', fontWeight: '900', color: '#1a1a1a' }}>₹{summary.grandTotal}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20mm', display: 'flex', gap: '10mm' }}>
                    <div style={{ flex: 1, padding: '5mm', border: '1px dashed #ddd6fe', borderRadius: '8px' }}>
                        <p style={{ fontSize: '8pt', fontWeight: '800', color: '#7c3aed', marginBottom: '10mm' }}>AUTHORIZED BY</p>
                        <div style={{ borderTop: '1px solid #1a1a1a', width: '100px' }}></div>
                        <p style={{ fontSize: '8pt', marginTop: '2px' }}>Project Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientFlowPO;
