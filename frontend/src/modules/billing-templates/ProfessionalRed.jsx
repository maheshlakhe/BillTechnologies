import React from 'react';
import UniversalBillEngine from './UniversalBillEngine';
import './InvoiceTemplates.css';

/**
 * ProfessionalRed.jsx
 * A bold, modern business template with red/white theme and categorized billing.
 */
const ProfessionalRed = ({ saleData }) => {
    if (!saleData) return null;

    // Strict Size Guard: This template is ONLY for A4
    if (saleData.settings?.billSize && saleData.settings.billSize !== 'A4') {
        return <UniversalBillEngine saleData={saleData} />;
    }

    const {
        storeName = 'Company Name',
        storeAddress = 'Street Address, City, State, Zip',
        storeEmail = 'company@email.com',
        billNo = 'INV-001',
        billDate = '10/04/2026',
        dueDate = '25/04/2026',
        customerName = 'Client Company Name',
        customerAddress = 'Client Address',
        customerPhone = 'Client Phone',
        customerEmail = 'client@email.com',
        items = [],
        summary = {},
        bankName = 'Bank Name',
        accountNumber = 'Account No.',
        projectName = 'Project Name',
        projectNo = 'PROJ-99',
        terms = 'Payment conditions and terms here.'
    } = saleData;

    const formatCurr = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Helper to group items by category if available, else group everything in 'Other' or 'Labor'
    const categorized = items.reduce((acc, item) => {
        const cat = (item.category || item.customFields?.category || 'Other').toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    // Ensure we show sections even if empty as per the user's high-fidelity request
    const sections = [
        { key: 'labor', label: 'Labor', cols: ['Description', 'Hours', 'Rate', 'Amount'] },
        { key: 'material', label: 'Material', cols: ['Description', 'Quantity', 'Unit Price', 'Amount'] },
        { key: 'other', label: 'Other', cols: ['Description', 'Qty', 'Unit Price', 'Amount'] }
    ];

    return (
        <div className="professional-red-invoice" style={{
            width: '210mm',
            minWidth: '210mm',
            maxWidth: '210mm',
            height: '297mm',
            minHeight: '297mm',
            backgroundColor: '#fff',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#334155',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 🔴 HEADER SECTION */}
            <div style={{
                backgroundColor: '#dc2626',
                color: '#fff',
                padding: '8mm 12mm',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '28pt',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    textTransform: 'uppercase'
                }}>Invoice</h1>
            </div>

            <div style={{ padding: '10mm 12mm' }}>
                {/* 📄 COMPANY & CLIENT DETAILS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8mm' }}>
                    <div style={{ width: '45%' }}>
                        <h3 style={{ borderBottom: '2px solid #dc2626', paddingBottom: '1mm', marginBottom: '3mm', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', fontSize: '9pt' }}>From</h3>
                        <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>{storeName}</div>
                        <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-line' }}>{storeAddress}</div>
                        <div style={{ fontSize: '9.5pt', marginTop: '1mm' }}>{storeEmail}</div>
                    </div>
                    <div style={{ width: '45%' }}>
                        <h3 style={{ borderBottom: '2px solid #dc2626', paddingBottom: '1mm', marginBottom: '3mm', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', fontSize: '9pt' }}>Bill To</h3>
                        <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>{customerName}</div>
                        <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-line' }}>{customerAddress}</div>
                        <div style={{ fontSize: '9.5pt', marginTop: '1mm' }}>{customerPhone}</div>
                        <div style={{ fontSize: '9.5pt' }}>{customerEmail}</div>
                    </div>
                </div>

                {/* 📌 REFERENCE & PROJECT INFORMATION */}
                <div style={{ display: 'flex', gap: '30px', backgroundColor: '#f8fafc', padding: '4mm', borderRadius: '4px', marginBottom: '6mm' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Inv No:</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '9pt' }}>{billNo}</span>
                        </div>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Date:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{billDate}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Due Date:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{dueDate}</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '90px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Project:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{projectName}</span>
                        </div>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '90px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Project No:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{projectNo}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ width: '90px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Client:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{customerName}</span>
                        </div>
                    </div>
                </div>

                {/* 📊 BILLING SECTIONS */}
                <div style={{ maxHeight: '120mm', overflow: 'hidden' }}>
                    {sections.map(section => (
                        <div key={section.key} style={{ marginBottom: '4mm' }}>
                            <h4 style={{
                                backgroundColor: '#1e293b',
                                color: '#fff',
                                padding: '1mm 3mm',
                                margin: '0 0 1mm 0',
                                fontSize: '8pt',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{section.label}</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1.5px solid #dc2626' }}>
                                        {section.cols.map((col, i) => (
                                            <th key={i} style={{
                                                textAlign: i === 0 ? 'left' : 'right',
                                                padding: '1.5mm',
                                                fontSize: '8pt',
                                                color: '#64748b',
                                                textTransform: 'uppercase'
                                            }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(categorized[section.key] || []).length > 0 ? (categorized[section.key] || []).map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1.5mm', fontWeight: '600', color: '#334155', fontSize: '9pt' }}>{item.name}</td>
                                            <td style={{ padding: '1.5mm', textAlign: 'right', fontSize: '9pt' }}>{item.qty || item.hours || 0}</td>
                                            <td style={{ padding: '1.5mm', textAlign: 'right', fontSize: '9pt' }}>{formatCurr(item.rate)}</td>
                                            <td style={{ padding: '1.5mm', textAlign: 'right', fontWeight: 'bold', fontSize: '9pt' }}>{formatCurr((item.qty || item.hours || 0) * item.rate)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2mm', textAlign: 'center', color: '#cbd5e1', fontSize: '7.5pt', fontStyle: 'italic' }}>No entries</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* 💰 SUMMARY SECTION */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4mm' }}>
                    <div style={{ width: '240px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                            <tr>
                                <td style={{ padding: '1mm 0', color: '#64748b' }}>Subtotal</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurr(summary.basicTotal)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '1mm 0', color: '#64748b' }}>Disc ({summary.discountPct || 0}%)</td>
                                <td style={{ textAlign: 'right', color: '#dc2626' }}>- {formatCurr(summary.discountTotal || 0)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '1mm 0', color: '#64748b' }}>Tax ({(summary.taxRate || 0)}%)</td>
                                <td style={{ textAlign: 'right' }}>{formatCurr(summary.taxTotal)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #dc2626', marginTop: '1mm' }}>
                                <td style={{ padding: '2mm 0', fontSize: '12pt', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase' }}>Total</td>
                                <td style={{ textAlign: 'right', fontSize: '15pt', fontWeight: '900', color: '#dc2626' }}>₹ {formatCurr(summary.grandTotal)}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                {/* 📝 FOOTER DETAILS */}
                <div style={{ position: 'absolute', bottom: '10mm', left: '12mm', right: '12mm', borderTop: '1px solid #e2e8f0', paddingTop: '4mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '60%' }}>
                            <h4 style={{ color: '#dc2626', textTransform: 'uppercase', fontSize: '8pt', margin: '0 0 1mm 0' }}>Terms</h4>
                            <p style={{ fontSize: '7.5pt', color: '#64748b', lineHeight: '1.4', margin: 0 }}>{terms}</p>
                        </div>
                        <div style={{ width: '35%', textAlign: 'right' }}>
                            <h4 style={{ color: '#dc2626', textTransform: 'uppercase', fontSize: '8pt', margin: '0 0 1mm 0' }}>Payment Info</h4>
                            <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>{bankName}</div>
                            <div style={{ fontSize: '7.5pt', color: '#64748b' }}>A/c: {accountNumber}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '6mm', fontSize: '11pt', fontWeight: 'bold', color: '#1e293b', fontStyle: 'italic' }}>
                        "Thank you for your business!"
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProfessionalRed;
