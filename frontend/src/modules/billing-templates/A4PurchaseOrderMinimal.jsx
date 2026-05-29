import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * A4PurchaseOrderMinimal.jsx
 * Clean, ultra-minimal A4 Purchase Order — whitespace-forward design with teal
 * accent lines. Inspired by modern SaaS / IT company documentation style.
 */
const A4PurchaseOrderMinimal = ({ saleData, activeColumns }) => {
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

    const TEAL = '#0d9488';
    const TEAL_LIGHT = '#f0fdfa';
    const GRAY = '#6b7280';
    const DARK = '#111827';
    const DIVIDER = '#e5e7eb';

    const formatCurr = (val) =>
        Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const subtotal = summary.basicTotal ?? items.reduce((a, b) => a + (b.total ?? b.qty * b.rate), 0);
    const cgst = summary.cgst ?? subtotal * 0.09;
    const sgst = summary.sgst ?? subtotal * 0.09;
    const grandTotal = summary.grandTotal ?? subtotal + cgst + sgst;

    const defaultTerms = [
        'All services delivered as per agreed scope and timelines.',
        'Timesheets approved weekly by client project manager.',
        'Invoice must reference this PO Number.',
        'Extra scope requires prior written approval.',
        'Payment within 30 days of invoice submission.',
        'GST per applicable regulations.',
    ];
    const termsList = terms.length > 0 ? terms : defaultTerms;

    const SectionTitle = ({ children }) => (
        <div style={{
            fontSize: '6.5pt',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: TEAL,
            borderBottom: `1.5pt solid ${TEAL}`,
            paddingBottom: '0.8mm',
            marginBottom: '2mm',
        }}>
            {children}
        </div>
    );

    const MetaRow = ({ label, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', marginBottom: '1mm', alignItems: 'flex-start' }}>
            <span style={{ color: GRAY, minWidth: '90px', flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: '600', textAlign: 'right', color: DARK }}>{value}</span>
        </div>
    );

    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            backgroundColor: '#fff',
            padding: '10mm 10mm 8mm',
            fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
            color: DARK,
            fontSize: '8pt',
            lineHeight: '1.35',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* ── 1. TOP HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm', paddingBottom: '3mm', borderBottom: `2pt solid ${TEAL}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3mm' }}>
                    {businessLogo ? (
                        <img src={businessLogo} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    ) : (
                        <div style={{
                            width: '36px', height: '36px', backgroundColor: TEAL, borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '14pt', fontWeight: '900',
                        }}>
                            {storeName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: '11pt', fontWeight: '900', color: DARK, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{storeName}</div>
                        <div style={{ fontSize: '7pt', color: GRAY, marginTop: '0.5px' }}>{storeAddress}</div>
                        <div style={{ fontSize: '7pt', color: GRAY }}>GSTIN: {storeGSTIN} &nbsp;|&nbsp; {storeEmail} &nbsp;|&nbsp; {storePhone}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '6.5pt', color: TEAL, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Purchase Order</div>
                    <div style={{ fontSize: '16pt', fontWeight: '900', color: DARK, marginTop: '0.5mm' }}>{billNo}</div>
                    <div style={{ fontSize: '7.5pt', color: GRAY }}>Dated: {billDate}</div>
                </div>
            </div>

            {/* ── 2. TWO-COLUMN: SUPPLIER + PO DETAILS ── */}
            <div style={{ display: 'flex', gap: '5mm', marginBottom: '4mm' }}>
                <div style={{ flex: 1, backgroundColor: TEAL_LIGHT, borderRadius: '4px', padding: '3mm', borderLeft: `3pt solid ${TEAL}` }}>
                    <SectionTitle>Supplier (Vendor)</SectionTitle>
                    <div style={{ fontWeight: '800', fontSize: '9pt', color: DARK, textTransform: 'uppercase' }}>{customerName}</div>
                    <div style={{ fontSize: '7pt', color: GRAY, margin: '1px 0' }}>{customerAddress}</div>
                    <div style={{ fontSize: '7pt' }}><span style={{ color: GRAY }}>GSTIN: </span><strong>{customerGSTIN}</strong></div>
                    <div style={{ fontSize: '7pt', color: GRAY }}>{customerEmail} &nbsp;|&nbsp; {customerPhone}</div>
                </div>
                <div style={{ flex: 1, padding: '3mm', border: `0.5pt solid ${DIVIDER}`, borderRadius: '4px' }}>
                    <SectionTitle>Purchase Order Details</SectionTitle>
                    <MetaRow label="Delivery Period" value={deliveryPeriod} />
                    <MetaRow label="Place of Supply" value={placeOfSupply} />
                    <MetaRow label="Payment Terms" value={paymentTerms} />
                    <MetaRow label="Payment Mode" value={paymentMode} />
                </div>
            </div>

            {/* ── 3. PROJECT STRIP ── */}
            <div style={{ backgroundColor: TEAL_LIGHT, borderRadius: '4px', padding: '2.5mm', marginBottom: '4mm', borderLeft: `3pt solid ${TEAL}` }}>
                <SectionTitle>Project / Service Details</SectionTitle>
                <div style={{ display: 'flex', gap: '5mm', fontSize: '7.5pt', flexWrap: 'wrap' }}>
                    <div><span style={{ color: GRAY }}>Project: </span><strong>{projectName}</strong></div>
                    <div><span style={{ color: GRAY }}>Engagement: </span>{engagementType}</div>
                    <div style={{ width: '100%', marginTop: '0.5mm' }}><span style={{ color: GRAY }}>Scope: </span>{scopeOfWork}</div>
                </div>
            </div>

            {/* ── 4. ITEMS TABLE ── */}
            <div style={{ marginBottom: '4mm' }}>
                <UniversalPOTable 
                    columns={activeColumns} 
                    data={items} 
                    s={{ 
                        headerBg: TEAL, 
                        headerColor: '#fff',
                        borderColor: DIVIDER
                    }} 
                />
            </div>

            {/* ── 5. TOTALS + BANK ── */}
            <div style={{ display: 'flex', gap: '5mm', marginBottom: '4mm' }}>
                {/* Bank */}
                <div style={{ flex: 1, padding: '3mm', border: `0.5pt solid ${DIVIDER}`, borderRadius: '4px' }}>
                    <SectionTitle>Bank Details (Supplier)</SectionTitle>
                    {[
                        ['Account Name', accountName],
                        ['Bank Name', bankName],
                        ['Account No.', accountNumber],
                        ['IFSC / Branch', `${ifscCode} / ${branchName}`],
                    ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', fontSize: '7pt', marginBottom: '1mm' }}>
                            <span style={{ width: '90px', color: GRAY, flexShrink: 0 }}>{l}</span>
                            <span style={{ fontWeight: '700' }}>{v}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div style={{ width: '42%' }}>
                    <div style={{ border: `0.5pt solid ${DIVIDER}`, borderRadius: '4px', overflow: 'hidden' }}>
                        {[
                            ['Subtotal', subtotal],
                            ['CGST (9%)', cgst],
                            ['SGST (9%)', sgst],
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 3mm', fontSize: '7.5pt', borderBottom: `0.5pt solid ${DIVIDER}` }}>
                                <span style={{ color: GRAY }}>{label}</span>
                                <span style={{ fontWeight: '600' }}>₹ {formatCurr(value)}</span>
                            </div>
                        ))}
                        <div style={{ backgroundColor: TEAL, padding: '2.5mm 3mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '7.5pt', fontWeight: '700', opacity: 0.9 }}>Total Amount</span>
                            <span style={{ color: '#fff', fontSize: '12pt', fontWeight: '900' }}>₹ {formatCurr(grandTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 6. TERMS + SIGNATURES ── */}
            <div style={{ display: 'flex', gap: '5mm' }}>
                {/* Terms */}
                <div style={{ flex: 1 }}>
                    <SectionTitle>Terms &amp; Conditions</SectionTitle>
                    <ol style={{ margin: 0, paddingLeft: '14px', fontSize: '7pt', lineHeight: '1.7', color: GRAY }}>
                        {termsList.map((t, i) => <li key={i}>{t}</li>)}
                    </ol>
                </div>

                {/* Signatures */}
                <div style={{ width: '42%', display: 'flex', flexDirection: 'column', gap: '3mm' }}>
                    {[
                        { label: `For ${storeName}`, role: 'Buyer' },
                        { label: `For ${customerName}`, role: 'Supplier' },
                    ].map(({ label, role }) => (
                        <div key={role} style={{ border: `0.5pt solid ${DIVIDER}`, borderRadius: '4px', padding: '2mm 3mm', borderTop: `2pt solid ${TEAL}` }}>
                            <div style={{ fontSize: '7.5pt', fontWeight: '800', color: DARK }}>{label}</div>
                            <div style={{ fontSize: '6.5pt', color: GRAY, marginBottom: '5mm' }}>({role})</div>
                            {['Name', 'Designation', 'Signature'].map(f => (
                                <div key={f} style={{ display: 'flex', fontSize: '7pt', alignItems: 'center', marginBottom: '1mm' }}>
                                    <span style={{ color: GRAY, width: '58px', flexShrink: 0 }}>{f}:</span>
                                    <div style={{ flex: 1, borderBottom: `0.5pt solid ${DIVIDER}` }}>&nbsp;</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── TEAL BOTTOM ACCENT ── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '3mm', backgroundColor: TEAL,
            }}></div>
            <div style={{
                position: 'absolute', bottom: '3.5mm', left: '10mm', right: '10mm',
                display: 'flex', justifyContent: 'space-between', fontSize: '6pt', color: GRAY,
            }}>
                <span>{billNo} | {billDate}</span>
                <span style={{ color: TEAL, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Purchase Order</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    );
};

export default A4PurchaseOrderMinimal;
