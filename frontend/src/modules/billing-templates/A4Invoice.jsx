import React from 'react';
import UniversalBillEngine from './UniversalBillEngine';
import './InvoiceTemplates.css';

/**
 * A4Invoice.jsx - Redesigned to High-Fidelity "GST Tax Invoice Format"
 * A traditional, monochrome, table-based GST compliant document.
 */
const A4Invoice = ({ saleData, activeColumns }) => {
    if (!saleData) return null;

    // Strict Size Guard: This template is ONLY for A4
    if (saleData.settings?.billSize && saleData.settings.billSize !== 'A4') {
        return <UniversalBillEngine saleData={saleData} activeColumns={activeColumns} />;
    }

    const {
        storeName = 'XYZ & CO',
        storeAddress = '123 Business Park, Rajajinagar, Bangalore - 560010',
        storeGSTIN = '29AAAAA0000A1Z5',
        storePhone = '91-9876543210',
        billNo = 'INV/2024/001',
        billDate = '10-Apr-2026',
        customerName = 'ABC RETAILS',
        customerPhone = '91-9988776655',
        customerAddress = '456 Market Road, Shivajinagar, Pune - 411001',
        customerGSTIN = '27BBBBB0000B1Z2',
        items = [],
        summary = {},
        businessLogo,
        bankName = 'HDFC BANK LTD',
        accountNumber = '50200012345678',
        ifscCode = 'HDFC0001234',
        branchName = 'Rajajinagar Branch',
        reverseCharge = 'No',
        transportMode = 'Road',
        vehicleNo = 'KA-01-AB-1234',
        placeOfSupply = 'Maharashtra (27)',
        state = 'Karnataka',
        stateCode = '29'
    } = saleData;

    // GST Breakdown Logic
    const isInterState = saleData.isInterState || false;

    // Formatting for money
    const formatCurr = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="gst-invoice-wrapper shadow-sm mx-auto" style={{ 
            width: '210mm', 
            minWidth: '210mm',
            maxWidth: '210mm',
            height: '297mm', 
            backgroundColor: '#fff', 
            padding: '8mm',
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            color: '#000',
            fontSize: '8.5pt',
            lineHeight: '1.2',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 1. TOP INDICATORS & MAIN TITLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1mm' }}>
                <div style={{ fontSize: '6.5pt', fontWeight: 'bold' }}>
                </div>
                <div style={{ textAlign: 'right', border: '0.5pt solid #000', padding: '1px 5px', fontSize: '6.5pt' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <span>[ ] Original</span>
                        <span>[ ] Duplicate</span>
                        <span>[ ] Triplicate</span>
                        <span>[ ] Extra Copy</span>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                <h2 style={{ margin: 0, fontSize: '14pt', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Tax Invoice</h2>
            </div>

            {/* 2. COMPANY HEADER BOX */}
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
                            <tr>
                                <td style={{ fontWeight: 'bold', padding: '1px' }}>Invoice No.</td>
                                <td style={{ padding: '1px' }}>: {billNo}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold', padding: '1px' }}>Dated</td>
                                <td style={{ padding: '1px' }}>: {billDate}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold', padding: '1px' }}>Reverse Charge</td>
                                <td style={{ padding: '1px' }}>: {reverseCharge}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold', padding: '1px' }}>State / Code</td>
                                <td style={{ padding: '1px' }}>: {state} / {stateCode}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            {/* 3. ADDITIONAL DETAILS BAR */}
            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt', fontSize: '7.5pt' }}>
                <tr>
                    <td style={{ width: '33%', padding: '1.5mm', borderRight: '1pt solid #000' }}>
                        <strong>Transport Mode:</strong> {transportMode}
                    </td>
                    <td style={{ width: '33%', padding: '1.5mm', borderRight: '1pt solid #000' }}>
                        <strong>Vehicle Number:</strong> {vehicleNo}
                    </td>
                    <td style={{ width: '34%', padding: '1.5mm' }}>
                        <strong>Place of Supply:</strong> {placeOfSupply}
                    </td>
                </tr>
            </table>

            {/* 4. BUYER & CONSIGNEE SECTION */}
            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt' }}>
                <tr>
                    <td style={{ width: '50%', padding: '2.5mm', borderRight: '1pt solid #000', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '6pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', color: '#666' }}>Details of Receiver (Billed To)</div>
                        <div style={{ fontWeight: '900', fontSize: '9pt', textTransform: 'uppercase' }}>{customerName}</div>
                        <div style={{ fontSize: '7.5pt' }}>{customerAddress}</div>
                        <div style={{ marginTop: '1.5mm' }}><strong>GSTIN:</strong> {customerGSTIN}</div>
                        <div><strong>Phone:</strong> {customerPhone}</div>
                    </td>
                    <td style={{ width: '50%', padding: '2.5mm', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '6pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', color: '#666' }}>Details of Consignee (Shipped To)</div>
                        <div style={{ fontWeight: '900', fontSize: '9pt', textTransform: 'uppercase' }}>{customerName}</div>
                        <div style={{ fontSize: '7.5pt' }}>{customerAddress}</div>
                        <div style={{ marginTop: '1.5mm' }}><strong>GSTIN:</strong> {customerGSTIN}</div>
                        <div><strong>Phone:</strong> {customerPhone}</div>
                    </td>
                </tr>
            </table>

            {/* 5. ITEMIZED TABLE */}
            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginBottom: '-1pt' }}>
                <thead style={{ backgroundColor: '#f2f2f2' }}>
                    <tr style={{ fontSize: '7pt', fontWeight: 'bold', textAlign: 'center' }}>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '25px' }}>Sr</th>
                        <th style={{ border: '1pt solid #000', padding: '2px' }}>Description of Goods</th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '50px' }}>HSN</th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '35px' }}>Qty</th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '35px' }}>Unit</th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '55px' }}>Rate</th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '75px' }}>Value</th>
                        <th style={{ border: '1pt solid #000', padding: '0', width: '130px' }}>
                            <div style={{ borderBottom: '1pt solid #000', padding: '1px' }}>Tax (CGST/SGST/IGST)</div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: 1, borderRight: '1pt solid #000', padding: '1px' }}>C</div>
                                <div style={{ flex: 1, borderRight: '1pt solid #000', padding: '1px' }}>S</div>
                                <div style={{ flex: 1, padding: '1px' }}>I</div>
                            </div>
                        </th>
                        <th style={{ border: '1pt solid #000', padding: '2px', width: '85px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const taxableVal = item.qty * item.rate;
                        const cgst = !isInterState ? (taxableVal * (item.taxRate / 2) / 100) : 0;
                        const sgst = !isInterState ? (taxableVal * (item.taxRate / 2) / 100) : 0;
                        const igst = isInterState ? (taxableVal * item.taxRate / 100) : 0;
                        const rowTotal = taxableVal + cgst + sgst + igst;

                        return (
                            <tr key={idx} style={{ height: '7mm', verticalAlign: 'middle', textAlign: 'center', fontSize: '8pt' }}>
                                <td style={{ border: '1pt solid #000' }}>{idx + 1}</td>
                                <td style={{ border: '1pt solid #000', textAlign: 'left', fontWeight: 'bold', paddingLeft: '2px' }}>{item.name}</td>
                                <td style={{ border: '1pt solid #000' }}>{item.hsn}</td>
                                <td style={{ border: '1pt solid #000' }}>{item.qty}</td>
                                <td style={{ border: '1pt solid #000' }}>{item.unit}</td>
                                <td style={{ border: '1pt solid #000' }}>{formatCurr(item.rate)}</td>
                                <td style={{ border: '1pt solid #000' }}>{formatCurr(taxableVal)}</td>
                                <td style={{ border: '1pt solid #000', padding: '0' }}>
                                    <div style={{ display: 'flex', height: '100% ' }}>
                                        <div style={{ flex: 1, borderRight: '1pt solid #000' }}>{cgst ? formatCurr(cgst) : '-'}</div>
                                        <div style={{ flex: 1, borderRight: '1pt solid #000' }}>{sgst ? formatCurr(sgst) : '-'}</div>
                                        <div style={{ flex: 1 }}>{igst ? formatCurr(igst) : '-'}</div>
                                    </div>
                                </td>
                                <td style={{ border: '1pt solid #000', fontWeight: 'bold' }}>{formatCurr(rowTotal)}</td>
                            </tr>
                        );
                    })}

                    {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: '7mm' }}>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000' }}></td>
                            <td style={{ border: '1pt solid #000', padding: '0' }}>
                                <div style={{ display: 'flex', height: '7mm' }}>
                                    <div style={{ flex: 1, borderRight: '1pt solid #000' }}></div>
                                    <div style={{ flex: 1, borderRight: '1pt solid #000' }}></div>
                                    <div style={{ flex: 1 }}></div>
                                </div>
                            </td>
                            <td style={{ border: '1pt solid #000' }}></td>
                        </tr>
                    ))}

                    <tr style={{ height: '8mm', fontWeight: 'bold', backgroundColor: '#f9f9f9', fontSize: '8pt' }}>
                        <td colSpan={3} style={{ border: '1pt solid #000', textAlign: 'center' }}>TOTALS</td>
                        <td style={{ border: '1pt solid #000', textAlign: 'center' }}>{summary.totalQty || items.reduce((a,b)=>a+b.qty,0)}</td>
                        <td style={{ border: '1pt solid #000' }}></td>
                        <td style={{ border: '1pt solid #000' }}></td>
                        <td style={{ border: '1pt solid #000', textAlign: 'center' }}>{formatCurr(summary.basicTotal)}</td>
                        <td style={{ border: '1pt solid #000', textAlign: 'center' }}>{formatCurr(summary.taxTotal)}</td>
                        <td style={{ border: '1pt solid #000', textAlign: 'center' }}>{formatCurr(summary.grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

            {/* 6. CHARGES & TAX SUMMARY BLOCK */}
            <div style={{ display: 'flex', border: '1pt solid #000', marginTop: '-1pt' }}>
                <div style={{ width: '60%', padding: '1.5mm', borderRight: '1pt solid #000' }}>
                    <div style={{ marginBottom: '1.5mm' }}><strong>Amount in Words:</strong> <span style={{ textTransform: 'capitalize' }}>{summary.totalInWords || 'Zero only'}</span></div>
                    <table style={{ width: '100%', fontSize: '7.5pt' }}>
                        <tr><td>Freight / Insurance</td><td>: {formatCurr((summary.frieght || 0) + (summary.insurance || 0))}</td></tr>
                        <tr><td>Packing & Forwarding</td><td>: {formatCurr(summary.packing || 0)}</td></tr>
                    </table>
                </div>
                <div style={{ width: '40%', padding: '1.5mm' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                        <tr><td>Sub-Total</td><td style={{ textAlign: 'right' }}>{formatCurr(summary.basicTotal)}</td></tr>
                        {!isInterState ? (
                            <>
                                <tr><td>CGST</td><td style={{ textAlign: 'right' }}>{formatCurr(summary.taxTotal / 2)}</td></tr>
                                <tr><td>SGST</td><td style={{ textAlign: 'right' }}>{formatCurr(summary.taxTotal / 2)}</td></tr>
                            </>
                        ) : (
                            <tr><td>IGST</td><td style={{ textAlign: 'right' }}>{formatCurr(summary.taxTotal)}</td></tr>
                        )}
                        <tr style={{ borderTop: '0.5pt solid #000', fontWeight: 'bold' }}>
                            <td>Grand Total</td>
                            <td style={{ textAlign: 'right', fontSize: '10pt' }}>₹ {formatCurr(summary.grandTotal)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            {/* 7. BANK DETAILS & SIGNATURE */}
            <table style={{ width: '100%', border: '1pt solid #000', borderCollapse: 'collapse', marginTop: '-1pt' }}>
                <tr>
                    <td style={{ width: '60%', padding: '2mm', borderRight: '1pt solid #000', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1px', fontSize: '7.5pt' }}>Bank Details:</div>
                        <div style={{ fontSize: '7.5pt' }}>Bank: <strong>{bankName}</strong> | A/c No: <strong>{accountNumber}</strong></div>
                        <div style={{ fontSize: '7.5pt' }}>IFSC: <strong>{ifscCode}</strong> | Branch: {branchName}</div>

                        <div style={{ marginTop: '3mm', fontSize: '6.5pt', lineHeight: '1.1' }}>
                            <strong>Terms:</strong> 1. Goods once sold not returned. 2. Interest @18% p.a. for delays. 3. Disputes subject to local jurisdiction.
                        </div>
                    </td>
                    <td style={{ width: '40%', padding: '2mm', textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '6pt', textAlign: 'left', fontStyle: 'italic', marginBottom: '2mm' }}>Verified correct details.</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '7.5pt' }}>For {storeName}</div>
                        <div style={{ height: '10mm' }}></div>
                        <div style={{ borderTop: '0.5pt solid #000', display: 'inline-block', minWidth: '35mm', padding: '2px', fontWeight: 'bold', fontSize: '7.5pt' }}>Auth. Signatory</div>
                    </td>
                </tr>
            </table>

            {/* 8. FOOTER */}
            <div style={{ position: 'absolute', bottom: '8mm', left: '8mm', right: '8mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '6.5pt', color: '#666', borderTop: '0.5pt solid #eee', paddingTop: '1mm' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="/logo.svg" alt="BillSoft" style={{ height: '10px', opacity: 0.6, filter: 'grayscale(100%)' }} />
                    <span style={{ fontWeight: 'bold' }}>BillSoft • Powered by AGB Technologies</span>
                </div>
                <div>Regd Office: {storeAddress.split('\n')[0]}</div>
            </div>
        </div>
    );
};

export default A4Invoice;
