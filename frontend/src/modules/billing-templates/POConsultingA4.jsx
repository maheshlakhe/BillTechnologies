import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * POConsultingA4.jsx
 * Corporate/Professional design for Purchase Orders.
 */
const POConsultingA4 = ({ saleData, activeColumns, size = 'A4' }) => {
    if (!saleData) return null;

    const {
        summary = {}, items = [], storeName = "ADVISORY GROUP", storeAddress = "",
        storeGSTIN = "", billNo = "PO-2026-045", billDate = "", customerName = "",
        customerPhone = "", customerAddress = "", paymentMode = "Bank Transfer",
        deliveryPeriod = "15 Days", projectName = "Consulting Project"
    } = saleData;

    const s = { w: '210mm', minH: '290mm', p: '40px', f: '12px', h: '36px', b: '16px', sr: '12%' };

    const noWrapStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };



    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            padding: '10mm',
            backgroundColor: '#fff',
            color: '#1e1b4b',
            fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box',
            lineHeight: 1.4,
            position: 'relative',
            overflow: 'hidden'
        }} className="consulting-theme">

            <div className="corporate-top-accent"></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div style={{ width: '60%' }}>
                    <div className="project-badge" style={{ fontSize: '10px' }}>Procurement Record</div>
                    <h1 style={{ fontSize: s.h, fontWeight: '900', color: '#1e1b4b', margin: '8px 0 2px 0', textTransform: 'uppercase', ...noWrapStyle }}>{storeName}</h1>
                    <p style={{ fontSize: s.f, color: '#64748b', margin: 0, fontWeight: '500', ...noWrapStyle }}>{storeAddress}</p>
                    <p style={{ fontSize: '9px', fontWeight: '800', color: '#1e1b4b', marginTop: '4px' }}>GSTIN: {storeGSTIN || 'NOT REGISTERED'}</p>
                </div>
                <div style={{ textAlign: 'right', width: '38%' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', margin: 0 }}>PURCHASE ORDER</p>
                    <p style={{ fontSize: s.b, fontWeight: '900', color: '#1e1b4b', margin: '1px 0', ...noWrapStyle }}>{billNo}</p>
                    <p style={{ fontSize: s.f, fontWeight: '700', color: '#64748b', margin: 0 }}>{billDate}</p>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '20px 0', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '50%' }}>
                    <p style={{ fontSize: '8px', fontWeight: '900', color: '#3730e3', marginBottom: '4px' }}>SUPPLIER (VENDOR)</p>
                    <h2 style={{ fontSize: s.b, fontWeight: '800', margin: 0, textTransform: 'uppercase', ...noWrapStyle }}>{customerName}</h2>
                    <p style={{ fontSize: s.f, color: '#64748b', marginTop: '2px', ...noWrapStyle }}>{customerPhone}</p>
                    <p style={{ fontSize: '9px', color: '#94a3b8', ...noWrapStyle }}>{customerAddress}</p>
                </div>
                <div style={{ width: '48%', textAlign: 'right' }}>
                    <p style={{ fontSize: '8px', fontWeight: '900', color: '#3730e3', marginBottom: '4px' }}>PROJECT & DELIVERY</p>
                    <p style={{ fontSize: s.f, fontWeight: '700', ...noWrapStyle }}>Project: {projectName}</p>
                    <p style={{ fontSize: '9px', color: '#94a3b8', ...noWrapStyle }}>Delivery: {deliveryPeriod}</p>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: '#f8fafc', 
                        borderColor: '#e2e8f0',
                        headerColor: '#1e1b4b'
                    }} 
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '45%' }}>
                    <div style={{ padding: '0 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: s.f, fontWeight: '700' }}>
                            <span style={{ color: '#94a3b8' }}>TAXABLE VALUE</span>
                            <span>₹{summary.basicTotal}</span>
                        </div>
                    </div>
                    <div className="consulting-total-card" style={{ backgroundColor: '#1e1b4b', color: '#fff', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', fontWeight: '900', opacity: '0.8' }}>GRAND TOTAL</span>
                            <span style={{ fontSize: '26px', fontWeight: '900' }}>₹{summary.grandTotal}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '60px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ width: '55%' }}>
                    <p style={{ fontSize: '9px', fontWeight: '950', color: '#1e1b4b', marginBottom: '4px' }}>Purchase Terms</p>
                    <p style={{ fontSize: '8px', color: '#94a3b8', lineHeight: '1.4' }}>
                        Goods/Services must be delivered within the specified period. Invoice must reference this PO.
                        Payment: {paymentMode}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#1e1b4b', marginBottom: '40px' }}>FOR {storeName.toUpperCase()}</p>
                    <div style={{ borderTop: '1px solid #1e1b4b', width: '180px', display: 'inline-block' }}></div>
                    <p style={{ fontSize: '9px', fontWeight: '800', marginTop: '4px' }}>Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
};

export default POConsultingA4;
