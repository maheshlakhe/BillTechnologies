import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * A4PurchaseOrderClassic.jsx
 * Classic, bordered, GST-compliant A4 Purchase Order
 * Buyer → Supplier flow with full PO details, service table, and dual signatures.
 */
const A4PurchaseOrderClassic = ({ saleData, activeColumns }) => {
    if (!saleData) return null;

    const {
        storeName = 'ABC Technologies Pvt. Ltd.',
        storeAddress = '5th Floor, Business Hub Tower, Hinjewadi Phase 1, Pune – 411057',
        storeGSTIN = '27ABCDE1234F1Z5',
        storeEmail = 'accounts@abctech.com',
        storePhone = '+91 9876543210',
        businessLogo,

        billNo = 'PO-2026-045',
        billDate = '11-Apr-2026',
        paymentTerms = '30 Days from Invoice Date',
        paymentMode = 'Bank Transfer',

        projectName = 'Cloud Infrastructure Deployment',
        scopeOfWork = 'AWS infrastructure setup, CI/CD pipeline configuration, and performance optimization',
        engagementType = 'Time & Material (Hourly Billing)',

        customerName = 'XYZ Consulting Services LLP',
        customerAddress = '2nd Floor, Tech Park Plaza, Mumbai – 400051',
        customerGSTIN = '27XYZAB5678K1Z2',
        customerEmail = 'billing@xyzconsulting.com',

        items = [
            { name: 'Cloud Architecture Setup', qty: 40, rate: 2000, total: 80000, unit: 'Hrs' },
            { name: 'CI/CD Pipeline Implementation', qty: 35, rate: 1800, total: 63000, unit: 'Hrs' },
            { name: 'Performance Optimization', qty: 25, rate: 1500, total: 37500, unit: 'Hrs' },
        ],
        summary = {},
        terms = [],
    } = saleData;

    const formatCurr = (val) =>
        Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const subtotal = summary.basicTotal ?? items.reduce((a, b) => a + (b.qty * (b.rate || 0)), 0);
    const cgst = summary.cgst ?? subtotal * 0.09;
    const sgst = summary.sgst ?? subtotal * 0.09;
    const grandTotal = summary.grandTotal ?? subtotal + cgst + sgst;

    const defaultTerms = [
        'All services will be delivered as per agreed scope and timelines.',
        'Invoice must reference this Purchase Order Number.',
        'Any additional work outside scope will require written approval.',
        'Payment will be released within 30 days of invoice submission.',
        'Applicable taxes will be charged as per GST regulations.',
    ];
    const termsList = terms.length > 0 ? terms : defaultTerms;



    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            backgroundColor: '#fff',
            padding: '10mm',
            fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
            color: '#1a1a1a',
            fontSize: '9pt',
            lineHeight: '1.4',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* ── 1. TITLE & LOGO SECTION ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
                <div>
                   <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: '950', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                       Purchase Order
                   </h1>
                   <div style={{ fontSize: '8pt', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', mt: '1mm' }}>
                       GST Compliant Document
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {businessLogo ? (
                        <img src={businessLogo} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '60px', height: '60px', border: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20pt', fontWeight: '950' }}>
                            {storeName.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '6mm' }} />

            {/* ── 2. PO DETAILS GRID ── */}
            <div style={{ display: 'flex', gap: '6mm', marginBottom: '6mm' }}>
                <div style={{ flex: 1, padding: '4mm', border: '1.5px solid #1a1a1a', borderRadius: '2mm' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '950', color: '#666', textTransform: 'uppercase', mb: '2mm' }}>Issued By (Buyer)</div>
                    <div style={{ fontSize: '11pt', fontWeight: '950', textTransform: 'uppercase', mb: '1mm' }}>{storeName}</div>
                    <div style={{ fontSize: '8.5pt', color: '#333' }}>{storeAddress}</div>
                    <div style={{ mt: '2mm', fontSize: '8.5pt' }}><strong>GSTIN:</strong> {storeGSTIN}</div>
                    <div style={{ fontSize: '8.5pt' }}><strong>Email:</strong> {storeEmail} | <strong>Ph:</strong> {storePhone}</div>
                </div>
                <div style={{ width: '85mm', padding: '4mm', bgcolor: '#f8fafc', border: '1.5px solid #1a1a1a', borderRadius: '2mm' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                        <tbody>
                            {[
                                ['PO Number', billNo],
                                ['PO Date', billDate],
                                ['Payment Mode', paymentMode],
                                ['Payment Terms', paymentTerms],
                            ].map(([label, value]) => (
                                <tr key={label}>
                                    <td style={{ fontWeight: '800', py: '1mm', color: '#444' }}>{label}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '950' }}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── 3. VENDOR & PROJECT ── */}
            <div style={{ display: 'flex', gap: '6mm', marginBottom: '6mm' }}>
                <div style={{ flex: 1, padding: '4mm', border: '1.5px solid #1a1a1a', borderRadius: '2mm' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '950', color: '#666', textTransform: 'uppercase', mb: '2mm' }}>Supplier (Vendor)</div>
                    <div style={{ fontSize: '11pt', fontWeight: '950', textTransform: 'uppercase', mb: '1mm' }}>{customerName}</div>
                    <div style={{ fontSize: '8.5pt', color: '#333' }}>{customerAddress}</div>
                    <div style={{ mt: '2mm', fontSize: '8.5pt' }}><strong>GSTIN:</strong> {customerGSTIN}</div>
                    <div style={{ fontSize: '8.5pt' }}><strong>Email:</strong> {customerEmail}</div>
                </div>
                <div style={{ flex: 1, padding: '4mm', border: '1.5px solid #1a1a1a', borderRadius: '2mm' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '950', color: '#666', textTransform: 'uppercase', mb: '2mm' }}>Project Information</div>
                    <div style={{ fontSize: '10pt', fontWeight: '950', color: '#1a1a1a' }}>{projectName}</div>
                    <div style={{ fontSize: '8.5pt', color: '#444', mt: '1mm' }}>{scopeOfWork}</div>
                    <div style={{ fontSize: '8pt', mt: '2mm', px: '2mm', py: '0.5mm', bgcolor: '#f1f5f9', display: 'inline-block', borderRadius: '1mm', fontWeight: '800' }}>
                        Type: {engagementType}
                    </div>
                </div>
            </div>

            {/* ── 4. ITEMS TABLE ── */}
            <div style={{ marginBottom: '6mm' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: '#1e293b', 
                        borderColor: '#1a1a1a',
                        headerColor: '#fff',
                        primary: '#1a1a1a'
                    }} 
                />
            </div>

            {/* ── 5. SUMMARY & TOTALS ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8mm' }}>
                <div style={{ width: '90mm' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                        <tbody>
                            <tr>
                                <td style={{ py: '1.5mm', borderBottom: '1px solid #eee', color: '#666', fontWeight: '600' }}>Subtotal</td>
                                <td style={{ py: '1.5mm', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: '800' }}>₹ {formatCurr(subtotal)}</td>
                            </tr>
                            <tr>
                                <td style={{ py: '1.5mm', borderBottom: '1px solid #1a1a1a', color: '#666', fontWeight: '600' }}>GST (18%)</td>
                                <td style={{ py: '1.5mm', borderBottom: '1px solid #1a1a1a', textAlign: 'right', fontWeight: '800' }}>₹ {formatCurr(cgst + sgst)}</td>
                            </tr>
                            <tr>
                                <td style={{ py: '3mm', fontSize: '14pt', fontWeight: '950', color: '#1a1a1a' }}>Total Amount</td>
                                <td style={{ py: '3mm', fontSize: '14pt', fontWeight: '950', textAlign: 'right', color: '#1a1a1a' }}>₹ {formatCurr(grandTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10mm' }}>
                {/* ── 6. TERMS ── */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '8pt', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px', mb: '2mm', color: '#666' }}>Terms & Conditions</div>
                    <ul style={{ margin: 0, paddingLeft: '4mm', fontSize: '8pt', color: '#444' }}>
                        {termsList.map((t, i) => <li key={i} style={{ marginBottom: '1mm' }}>{t}</li>)}
                    </ul>
                </div>
                {/* ── 7. SIGNATURES ── */}
                <div style={{ width: '90mm', display: 'flex', gap: '4mm' }}>
                    <div style={{ flex: 1, textAlign: 'center', p: '4mm', border: '1px dashed #ccc', borderRadius: '2mm' }}>
                        <div style={{ height: '15mm' }}></div>
                        <div style={{ borderTop: '1px solid #1a1a1a', pt: '1mm', fontSize: '8pt', fontWeight: '950' }}>Authorized Buyer</div>
                        <div style={{ fontSize: '7pt', color: '#666' }}>Stamp & Signature</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', p: '4mm', border: '1px dashed #ccc', borderRadius: '2mm' }}>
                        <div style={{ height: '15mm' }}></div>
                        <div style={{ borderTop: '1px solid #1a1a1a', pt: '1mm', fontSize: '8pt', fontWeight: '950' }}>Vendor Acceptance</div>
                        <div style={{ fontSize: '7pt', color: '#666' }}>Signature & Date</div>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ position: 'absolute', bottom: '8mm', left: '10mm', right: '10mm', textAlign: 'center', fontSize: '7pt', color: '#999', borderTop: '1px solid #f1f1f1', paddingTop: '3mm' }}>
                Computer generated document. Valid without physical signature if authorized. | Powered by Elite SaaS
            </div>
        </div>
    );
};

export default A4PurchaseOrderClassic;
