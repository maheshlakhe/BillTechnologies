import React from 'react';
import './InvoiceTemplates.css';
import { UniversalPOTable } from './PurchaseOrderLayouts';

/**
 * POProfessionalRedA4.jsx
 * A bold, modern business template with red/white theme for Purchase Orders.
 */
const POProfessionalRedA4 = ({ saleData, activeColumns }) => {
    if (!saleData) return null;

    const {
        storeName = 'Company Name',
        storeAddress = 'Street Address, City, State, Zip',
        storeEmail = 'company@email.com',
        billNo = 'PO-2026-045',
        billDate = '10/04/2026',
        deliveryPeriod = '15 Days',
        customerName = 'Vendor Company Name',
        customerAddress = 'Vendor Address',
        customerPhone = 'Vendor Phone',
        customerEmail = 'vendor@email.com',
        items = [],
        summary = {},
        bankName = 'Vendor Bank',
        accountNumber = 'Account No.',
        projectName = 'Standard Supply',
        projectNo = 'PROJ-99',
        terms = 'Deliver by the specified date. Payment within 30 days.'
    } = saleData;

    const formatCurr = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });



    return (
        <div className="professional-red-invoice" style={{
            width: '210mm',
            height: '297mm',
            backgroundColor: '#fff',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#334155',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
        }}>
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
                }}>Purchase Order</h1>
            </div>

            <div style={{ padding: '10mm 12mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8mm' }}>
                    <div style={{ width: '45%' }}>
                        <h3 style={{ borderBottom: '2px solid #dc2626', paddingBottom: '1mm', marginBottom: '3mm', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', fontSize: '9pt' }}>Buyer</h3>
                        <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>{storeName}</div>
                        <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-line' }}>{storeAddress}</div>
                        <div style={{ fontSize: '9.5pt', marginTop: '1mm' }}>{storeEmail}</div>
                    </div>
                    <div style={{ width: '45%' }}>
                        <h3 style={{ borderBottom: '2px solid #dc2626', paddingBottom: '1mm', marginBottom: '3mm', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', fontSize: '9pt' }}>Supplier</h3>
                        <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>{customerName}</div>
                        <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-line' }}>{customerAddress}</div>
                        <div style={{ fontSize: '9.5pt', marginTop: '1mm' }}>{customerPhone}</div>
                        <div style={{ fontSize: '9.5pt' }}>{customerEmail}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', backgroundColor: '#f8fafc', padding: '4mm', borderRadius: '4px', marginBottom: '6mm' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>PO No:</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '9pt' }}>{billNo}</span>
                        </div>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Date:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{billDate}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ width: '80px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Delivery:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{deliveryPeriod}</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                        <div style={{ display: 'flex', marginBottom: '0.5mm' }}>
                            <span style={{ width: '90px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Project:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{projectName}</span>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ width: '90px', fontWeight: 'bold', color: '#64748b', fontSize: '8.5pt' }}>Project No:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '9pt' }}>{projectNo}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '4mm' }}>
                    <UniversalPOTable 
                        columns={activeColumns} 
                        data={items} 
                        s={{ 
                            headerBg: '#1e293b', 
                            borderColor: '#dc2626',
                            headerColor: '#fff',
                            primary: '#dc2626'
                        }} 
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4mm' }}>
                    <div style={{ width: '240px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                            <tr>
                                <td style={{ padding: '1mm 0', color: '#64748b' }}>Subtotal</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurr(summary.basicTotal)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #dc2626', marginTop: '1mm' }}>
                                <td style={{ padding: '2mm 0', fontSize: '12pt', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase' }}>Total</td>
                                <td style={{ textAlign: 'right', fontSize: '15pt', fontWeight: '900', color: '#dc2626' }}>₹ {formatCurr(summary.grandTotal)}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '10mm', left: '12mm', right: '12mm', borderTop: '1px solid #e2e8f0', paddingTop: '4mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '60%' }}>
                            <h4 style={{ color: '#dc2626', textTransform: 'uppercase', fontSize: '8pt', margin: '0 0 1mm 0' }}>PO Terms</h4>
                            <p style={{ fontSize: '7.5pt', color: '#64748b', lineHeight: '1.4', margin: 0 }}>{terms}</p>
                        </div>
                        <div style={{ width: '35%', textAlign: 'right' }}>
                            <h4 style={{ color: '#dc2626', textTransform: 'uppercase', fontSize: '8pt', margin: '0 0 1mm 0' }}>Supplier Bank</h4>
                            <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>{bankName}</div>
                            <div style={{ fontSize: '7.5pt', color: '#64748b' }}>A/c: {accountNumber}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POProfessionalRedA4;
