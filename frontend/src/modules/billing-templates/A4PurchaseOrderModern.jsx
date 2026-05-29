import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * A4PurchaseOrderModern.jsx
 * Modern corporate A4 Purchase Order — navy blue accent header, clean grid,
 * professional dual-signature footer. Inspired by Fortune-500 corporate PO style.
 */
const A4PurchaseOrderModern = ({ saleData, activeColumns }) => {
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
        deliveryPeriod = '15-Apr-2026 to 30-Apr-2026',
        placeOfSupply = 'Maharashtra',
        paymentTerms = '30 Days from Invoice Date',
        paymentMode = 'Bank Transfer',

        projectName = 'Cloud Infrastructure Deployment',
        scopeOfWork = 'AWS infrastructure setup, CI/CD pipeline configuration, and performance optimization',
        engagementType = 'Time & Material (Hourly Billing)',

        customerName = 'XYZ Consulting Services LLP',
        customerAddress = '2nd Floor, Tech Park Plaza, Mumbai – 400051',
        customerGSTIN = '27XYZAB5678K1Z2',
        customerEmail = 'billing@xyzconsulting.com',
        customerPhone = '+91 9123456780',

        items = [
            { name: 'Cloud Architecture Setup', qty: 40, rate: 2000, total: 80000 },
            { name: 'CI/CD Pipeline Implementation', qty: 35, rate: 1800, total: 63000 },
            { name: 'Performance Optimization', qty: 25, rate: 1500, total: 37500 },
        ],
        summary = {},

        bankName = 'HDFC Bank',
        accountName = 'XYZ Consulting Services LLP',
        accountNumber = '123456789012',
        ifscCode = 'HDFC0001234',
        branchName = 'Mumbai',

        terms = [],
    } = saleData;

    const NAVY = '#1a2e5a';
    const NAVY_LIGHT = '#e8edf7';
    const ACCENT = '#2563eb';

    const formatCurr = (val) =>
        Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const subtotal = summary.basicTotal ?? items.reduce((a, b) => a + (b.total ?? b.qty * b.rate), 0);
    const cgst = summary.cgst ?? subtotal * 0.09;
    const sgst = summary.sgst ?? subtotal * 0.09;
    const grandTotal = summary.grandTotal ?? subtotal + cgst + sgst;

    const defaultTerms = [
        'All services delivered per agreed scope and timelines.',
        'Timesheets approved weekly by client project manager.',
        'Invoice must reference this PO Number.',
        'Extra scope requires prior written approval.',
        'Payment within 30 days of invoice submission.',
        'GST applicable as per regulations.',
    ];
    const termsList = terms.length > 0 ? terms : defaultTerms;

    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            backgroundColor: '#fff',
            padding: '0',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            color: '#111',
            fontSize: '8pt',
            lineHeight: '1.3',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* ── 1. NAVY HEADER BAND ── */}
            <div style={{ backgroundColor: NAVY, padding: '5mm 8mm 4mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3mm' }}>
                    {businessLogo ? (
                        <img src={businessLogo} alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '3px', padding: '2px' }} />
                    ) : (
                        <div style={{ width: '38px', height: '38px', backgroundColor: ACCENT, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16pt', fontWeight: '900' }}>
                            {storeName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div style={{ color: '#fff', fontSize: '11pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{storeName}</div>
                        <div style={{ color: '#a8c0e8', fontSize: '6.5pt', marginTop: '1px' }}>{storeAddress}</div>
                        <div style={{ color: '#a8c0e8', fontSize: '6.5pt' }}>GSTIN: {storeGSTIN} | {storeEmail} | {storePhone}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#a8c0e8', fontSize: '7pt', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase' }}>Purchase Order</div>
                    <div style={{ color: '#fff', fontSize: '14pt', fontWeight: '900', marginTop: '1mm' }}>{billNo}</div>
                    <div style={{ color: '#a8c0e8', fontSize: '7pt' }}>Date: {billDate}</div>
                </div>
            </div>

            {/* ── CONTENT AREA ── */}
            <div style={{ padding: '4mm 8mm' }}>

                {/* ── 2. PO META + SUPPLIER ── */}
                <div style={{ display: 'flex', gap: '4mm', marginBottom: '3mm' }}>
                    {/* PO Details */}
                    <div style={{ width: '48%', backgroundColor: NAVY_LIGHT, borderRadius: '3px', padding: '3mm', border: `0.5pt solid #c5d0e8` }}>
                        <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5mm', borderBottom: `1pt solid ${NAVY}`, paddingBottom: '0.5mm' }}>
                            PO Details
                        </div>
                        {[
                            ['Delivery Period', deliveryPeriod],
                            ['Place of Supply', placeOfSupply],
                            ['Payment Terms', paymentTerms],
                            ['Payment Mode', paymentMode],
                        ].map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8mm', fontSize: '7pt' }}>
                                <span style={{ color: '#556', fontWeight: '600' }}>{l}</span>
                                <span style={{ fontWeight: '700', textAlign: 'right' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Supplier */}
                    <div style={{ width: '52%', border: `0.5pt solid #c5d0e8`, borderRadius: '3px', padding: '3mm' }}>
                        <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5mm', borderBottom: `1pt solid ${NAVY}`, paddingBottom: '0.5mm' }}>
                            Supplier (Vendor)
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '9pt', textTransform: 'uppercase', color: NAVY }}>{customerName}</div>
                        <div style={{ fontSize: '7pt', color: '#444', marginTop: '1px' }}>{customerAddress}</div>
                        <div style={{ fontSize: '7pt', marginTop: '1px' }}><strong>GSTIN:</strong> {customerGSTIN}</div>
                        <div style={{ fontSize: '7pt' }}>{customerEmail} | {customerPhone}</div>
                    </div>
                </div>

                {/* ── 3. PROJECT DETAILS ── */}
                <div style={{ backgroundColor: NAVY_LIGHT, border: `0.5pt solid #c5d0e8`, borderRadius: '3px', padding: '2.5mm', marginBottom: '3mm' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5mm' }}>
                        Project / Service Details
                    </div>
                    <div style={{ display: 'flex', gap: '4mm', fontSize: '7.5pt' }}>
                        <div style={{ flex: 1 }}><span style={{ color: '#556', fontWeight: '600' }}>Project: </span><span style={{ fontWeight: '700' }}>{projectName}</span></div>
                        <div style={{ flex: 1 }}><span style={{ color: '#556', fontWeight: '600' }}>Engagement: </span>{engagementType}</div>
                    </div>
                    <div style={{ fontSize: '7.5pt', marginTop: '1mm' }}><span style={{ color: '#556', fontWeight: '600' }}>Scope: </span>{scopeOfWork}</div>
                </div>

                {/* ── 4. ITEMS TABLE ── */}
                <div style={{ marginBottom: '3mm' }}>
                    <UniversalPOTable 
                        columns={activeColumns} 
                        data={items} 
                        s={{ 
                            headerBg: NAVY, 
                            headerColor: '#fff',
                            borderColor: '#c5d0e8'
                        }} 
                    />
                </div>

                {/* ── 5. TOTALS + BANK ── */}
                <div style={{ display: 'flex', gap: '4mm', marginBottom: '3mm' }}>
                    {/* Bank */}
                    <div style={{ width: '52%', border: `0.5pt solid #c5d0e8`, borderRadius: '3px', padding: '2.5mm' }}>
                        <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', marginBottom: '1.5mm', borderBottom: `1pt solid ${NAVY}`, paddingBottom: '0.5mm' }}>
                            Bank Details (Supplier)
                        </div>
                        {[
                            ['Account Name', accountName],
                            ['Bank', bankName],
                            ['Account No.', accountNumber],
                            ['IFSC / Branch', `${ifscCode} / ${branchName}`],
                        ].map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', fontSize: '7pt', marginBottom: '0.8mm' }}>
                                <span style={{ width: '90px', color: '#556', fontWeight: '600', flexShrink: 0 }}>{l}</span>
                                <span style={{ fontWeight: '700' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div style={{ width: '48%', border: `0.5pt solid #c5d0e8`, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: NAVY_LIGHT, padding: '2mm 3mm', fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', borderBottom: `0.5pt solid #c5d0e8` }}>
                            Summary of Charges
                        </div>
                        <div style={{ padding: '2mm 3mm' }}>
                            {[
                                ['Subtotal', subtotal, false],
                                ['CGST (9%)', cgst, false],
                                ['SGST (9%)', sgst, false],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', marginBottom: '1mm' }}>
                                    <span style={{ color: '#556' }}>{label}</span>
                                    <span>₹ {formatCurr(value)}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ backgroundColor: NAVY, padding: '2.5mm 3mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#a8c0e8', fontSize: '7pt', fontWeight: '700', textTransform: 'uppercase' }}>Total Amount</span>
                            <span style={{ color: '#fff', fontSize: '11pt', fontWeight: '900' }}>₹ {formatCurr(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* ── 6. TERMS ── */}
                <div style={{ border: `0.5pt solid #c5d0e8`, borderRadius: '3px', padding: '2.5mm', marginBottom: '3mm' }}>
                    <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, textTransform: 'uppercase', marginBottom: '1.5mm' }}>Terms &amp; Conditions</div>
                    <ol style={{ margin: 0, paddingLeft: '13px', fontSize: '7pt', lineHeight: '1.6', columnCount: 2, columnGap: '5mm' }}>
                        {termsList.map((t, i) => <li key={i}>{t}</li>)}
                    </ol>
                </div>

                {/* ── 7. SIGNATURES ── */}
                <div style={{ display: 'flex', gap: '4mm' }}>
                    {[
                        { label: `For ${storeName}`, role: 'Buyer' },
                        { label: `For ${customerName}`, role: 'Supplier' },
                    ].map(({ label, role }) => (
                        <div key={role} style={{ flex: 1, border: `0.5pt solid #c5d0e8`, borderRadius: '3px', padding: '2.5mm' }}>
                            <div style={{ fontSize: '7pt', fontWeight: '900', color: NAVY, marginBottom: '1mm' }}>{label}</div>
                            <div style={{ fontSize: '6.5pt', color: '#888', marginBottom: '6mm' }}>({role})</div>
                            <div style={{ borderBottom: `1pt solid ${NAVY}`, marginBottom: '1.5mm' }}></div>
                            {['Name', 'Designation', 'Signature', 'Date'].map(f => (
                                <div key={f} style={{ fontSize: '7pt', color: '#666', marginBottom: '1mm' }}>
                                    <strong style={{ color: '#333' }}>{f}:</strong> _______________________
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FOOTER STRIP ── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: NAVY, padding: '1.5mm 8mm',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ color: '#a8c0e8', fontSize: '6pt' }}>{billNo} • {billDate}</span>
                <span style={{ color: '#a8c0e8', fontSize: '6pt' }}>Computer Generated Purchase Order</span>
                <span style={{ color: '#a8c0e8', fontSize: '6pt' }}>Page 1 of 1</span>
            </div>
        </div>
    );
};

export default A4PurchaseOrderModern;
