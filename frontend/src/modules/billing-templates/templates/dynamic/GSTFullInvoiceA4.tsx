import React from 'react';

/**
 * GSTFullInvoiceA4.tsx
 * High-fidelity GST Master Invoice
 * Features checkbox-style headers for copy types and detailed GST breakdowns.
 */
export function GSTFullInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = '',
    storeAddress = '',
    storePhone = '',
    storeGSTIN = '',
    businessLogo,
    storeState = '',

    billNo = '',
    billDate = '',
    
    customerName = '',
    customerAddress = '',
    customerGSTIN = '',
    customerState = '',
    
    items = [],
    summary = {},
    billType = 'Tax Invoice',
    
    bankName = '',
    accountNumber = '',
    ifscCode = '',
    branchName = '',
    
    transportMode = '-',
    vehicleNo = '-',
    placeOfSupply = '',
    freight = 0,
    insurance = 0,
    packing = 0
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white text-black p-[8mm] flex flex-col font-sans border border-black" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', fontSize: '9px', lineHeight: '1.2', boxSizing: 'border-box' }}>
      
      {/* Main Content Bounding Box */}
      <div className="border-[1.5px] border-black flex flex-col">
        {/* Tax Invoice Banner */}
        <div className="bg-gray-100 text-center font-bold py-1 border-b-[1.5px] border-black uppercase tracking-widest text-[10px]">
          {billType || 'Tax Invoice'}
        </div>

        {/* Top Header Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', borderBottom: '1.5px solid black' }}>
          {/* Company Info (Left) */}
          <div style={{ gridColumn: 'span 9', padding: '8px', display: 'flex', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {businessLogo ? (
                <img 
                  src={businessLogo} 
                  alt="Logo" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d1d5db' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '12px' }}>LOGO</span>
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Billed By:</p>
              <h1 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '4px', lineHeight: 1 }}>{storeName}</h1>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>{storeAddress}</p>
              <p style={{ fontWeight: 600, marginTop: '4px' }}>Phone: {storePhone}</p>
              <p style={{ fontWeight: 'bold' }}>GSTIN: {storeGSTIN}</p>
              <p style={{ fontWeight: 600 }}>State: {storeState}</p>
            </div>
          </div>

          {/* Copy Type (Right) */}
          <div style={{ gridColumn: 'span 3', padding: '8px', borderLeft: '1.5px solid black', fontSize: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', border: '1px solid black' }} /> Original For Recipient</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', border: '1px solid black' }} /> Duplicate For Transporter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><div style={{ width: '10px', height: '10px', border: '1px solid black' }} /> Triplicate For Supplier</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', border: '1px solid black' }} /> Extra Copy</div>
          </div>
        </div>

        {/* Meta Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1.5px solid black', fontSize: '9px' }}>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Invoice No:</p>
            <p style={{ fontWeight: 'bold' }}>{billNo}</p>
          </div>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Invoice Date:</p>
            <p style={{ fontWeight: 'bold' }}>{billDate}</p>
          </div>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Reverse Charge:</p>
            <p style={{ fontWeight: 'bold', textAlign: 'center' }}>No</p>
          </div>
          <div style={{ padding: '4px' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>State:</p>
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{storeState || '-'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1.5px solid black', fontSize: '9px' }}>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Transport Mode:</p>
            <p style={{ fontWeight: 'bold' }}>{transportMode}</p>
          </div>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Vehicle No:</p>
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{vehicleNo}</p>
          </div>
          <div style={{ padding: '4px', borderRight: '1.5px solid black' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Date of Supply:</p>
            <p style={{ fontWeight: 'bold' }}>{billDate}</p>
          </div>
          <div style={{ padding: '4px' }}>
            <p style={{ color: '#6b7280', fontSize: '8px' }}>Place of Supply:</p>
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{placeOfSupply || storeState || '-'}</p>
          </div>
        </div>

        {/* Billed To */}
        <div style={{ borderBottom: '1.5px solid black' }}>
          <div style={{ padding: '8px' }}>
            <p style={{ fontWeight: 'bold', borderBottom: '1px solid black', marginBottom: '4px', padding: '2px', fontSize: '8px', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>Billed To:</p>
            <p style={{ fontWeight: 900, fontSize: '12px', marginBottom: '2px' }}>{customerName}</p>
            <p style={{ color: '#1f2937', fontSize: '10px', whiteSpace: 'pre-wrap' }}>{customerAddress}</p>
            <p style={{ fontWeight: 'bold', marginTop: '8px' }}>GSTIN: {customerGSTIN || 'N/A'}</p>
            <p style={{ fontWeight: 'bold' }}>State: {customerState || 'N/A'}</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex-grow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-[1.5px] border-black font-bold text-[8px] text-center">
                <th rowSpan={2} className="border-r border-black w-6">Sr.</th>
                <th rowSpan={2} className="border-r border-black text-left px-4">Product Description</th>
                <th rowSpan={2} className="border-r border-black w-10">HSN</th>
                <th rowSpan={2} className="border-r border-black w-8">Qty</th>
                <th rowSpan={2} className="border-r border-black w-10">Unit</th>
                <th rowSpan={2} className="border-r border-black w-20">Rate</th>
                <th rowSpan={2} className="border-r border-black w-24">Amount</th>
                <th rowSpan={2} className="border-r border-black w-14">Disc.</th>
                <th rowSpan={2} className="border-r border-black w-20">Taxable</th>
                <th colSpan={2} className="border-r border-black">CGST</th>
                <th colSpan={2} className="border-r border-black">SGST</th>
                <th rowSpan={2} className="w-24">Total</th>
              </tr>
              <tr className="bg-gray-50 border-b-[1.5px] border-black font-bold text-[7px] text-center">
                <th className="border-r border-black w-8">%</th>
                <th className="border-r border-black w-14">Amt</th>
                <th className="border-r border-black w-8">%</th>
                <th className="border-r border-black w-14">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const cgstRate = (item.taxRate || 0) / 2;
                const sgstRate = (item.taxRate || 0) / 2;
                const cgstAmt = (item.taxAmount || 0) / 2;
                const sgstAmt = (item.taxAmount || 0) / 2;

                return (
                  <tr key={idx} className="border-b border-black/10 text-center font-bold h-10 text-[10px]">
                    <td className="border-r border-black">{idx + 1}</td>
                    <td className="border-r border-black text-left pl-2">{item.name}</td>
                    <td className="border-r border-black">{item.hsn || '-'}</td>
                    <td className="border-r border-black">{item.qty}</td>
                    <td className="border-r border-black">{item.unit || 'Nos'}</td>
                    <td className="border-r border-black">₹{formatCurr(item.rate)}</td>
                    <td className="border-r border-black">₹{formatCurr(item.total)}</td>
                    <td className="border-r border-black">{item.discount > 0 ? `₹${formatCurr(item.discount)}` : '-'}</td>
                    <td className="border-r border-black">₹{formatCurr(item.total - (item.discount || 0))}</td>
                    <td className="border-r border-black text-[8px]">{cgstRate}%</td>
                    <td className="border-r border-black">₹{formatCurr(cgstAmt)}</td>
                    <td className="border-r border-black text-[8px]">{sgstRate}%</td>
                    <td className="border-r border-black">₹{formatCurr(sgstAmt)}</td>
                    <td className="font-black bg-gray-50/20">₹{formatCurr(item.total + (item.taxAmount || 0))}</td>
                  </tr>
                );
              })}
              {/* Fill empty space */}
              {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-10 border-b border-black/5 text-transparent">
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-r border-black">.</td>
                  <td className="border-none">.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Freight/Insurance Section */}
      <div className="grid grid-cols-3 border-x border-b border-black text-[9px] font-bold py-1 px-2">
        <div>Freight: ₹{formatCurr(freight)}</div>
        <div>Insurance: ₹{formatCurr(insurance)}</div>
        <div>Packing & Forwarding: ₹{formatCurr(packing)}</div>
      </div>

      {/* Summary Bar */}
      <div className="bg-gray-50 flex justify-between px-4 py-2 border-x border-b border-black font-black text-[10px] uppercase">
        <span>Total Qty: {items.reduce((s: number, i: any) => s + Number(i.qty), 0)}</span>
        <span>Basic Total: ₹{formatCurr(summary.basicTotal)}</span>
        <span>Tax Amount: ₹{formatCurr(summary.taxTotal)}</span>
      </div>

      {/* Footer Area Grid */}
      <div className="grid grid-cols-12 border-x border-b border-black min-h-[140px]">
        {/* Left Side: Bank & Terms */}
        <div className="col-span-8 p-3 border-r border-black flex flex-col gap-4">
          <div>
            <p className="font-bold border-b border-black mb-1 pb-0.5 text-[9px] underline">Bank Details:</p>
            {bankName ? (
              <div className="text-[9px] space-y-0.5">
                <p><span className="font-semibold">Bank Name:</span> {bankName}</p>
                <p><span className="font-semibold">A/C No:</span> {accountNumber}</p>
                <p><span className="font-semibold">IFSC:</span> {ifscCode}</p>
                <p><span className="font-semibold">Branch:</span> {branchName}</p>
              </div>
            ) : (
               <div className="text-[9px] space-y-0.5 italic text-gray-400">
                <p>Bank details not provided</p>
              </div>
            )}
          </div>
          <div>
            <p className="font-bold border-b border-black mb-1 pb-0.5 text-[9px] underline">Terms & Conditions:</p>
            <ol className="text-[8px] space-y-0.5 pl-3 list-decimal">
              <li>Payment due within 15 days</li>
              <li>Goods once sold cannot be returned</li>
              <li>Subject to local jurisdiction</li>
            </ol>
          </div>
        </div>

        {/* Right Side: Tax Summary & Totals */}
        <div className="col-span-4 flex flex-col p-2 space-y-1">
          <p className="font-bold border-b border-black mb-1 text-[9px] underline">Tax Summary:</p>
          <div className="text-[9px] space-y-1">
            <div className="flex justify-between"><span>Total Before Tax:</span> <span>₹{formatCurr(summary.basicTotal)}</span></div>
            <div className="flex justify-between"><span>Total Tax (GST):</span> <span>₹{formatCurr(summary.taxTotal)}</span></div>
            <div className="flex justify-between font-bold pt-1 border-t border-black/10"><span>Final Bill Amount:</span> <span>₹{formatCurr(summary.grandTotal)}</span></div>
          </div>
          
          <div className="mt-2 pt-2 border-t-2 border-black space-y-1 font-bold">
            <div className="flex justify-between text-base border-t-2 border-black pt-1 bg-gray-100 px-1 mt-1">
              <span>Payable:</span> 
              <span>₹{formatCurr(summary.grandTotal + (freight || 0) + (insurance || 0) + (packing || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Declaration & Signatory */}
      <div className="grid grid-cols-2 border border-black border-t-0 h-32">
        <div className="p-3">
          <p className="font-bold text-[9px] underline mb-1">Declaration:</p>
          <p className="text-[8px] italic leading-relaxed">
            We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </p>
        </div>
        <div className="border-l border-black p-3 flex flex-col justify-between items-end">
          <p className="font-bold text-[10px]">For {storeName}</p>
          <div className="w-48 border-t border-black pt-1 text-center font-bold text-[9px]">
            Authorized Signatory
          </div>
        </div>
      </div>

      {/* Bottom Footer Line */}
      <div className="text-center text-[7px] text-gray-400 mt-2 italic flex flex-col items-center gap-1">
        <div className="flex justify-center gap-4">
          <span>Head Office: {storeAddress.split('\n')[0]}</span>
          <span>|</span>
          <span>GSTIN: {storeGSTIN}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale" />
          <span className="font-bold uppercase tracking-widest text-[6px]">BillSoft • Powered by AGB Technologies</span>
        </div>
      </div>
    </div>
  );
}

