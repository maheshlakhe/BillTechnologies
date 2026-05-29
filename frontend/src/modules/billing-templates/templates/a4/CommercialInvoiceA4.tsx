import React from 'react';

/**
 * CommercialInvoiceA4.tsx
 * Professional B2B Commercial Layout
 * Clean, modern, and data-dense for corporate billing.
 */
export function CommercialInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Company Name',
    storeAddress = 'Full Business Address Details',
    storeGSTIN = '27AABCA1234B1Z5',
    storePhone = '+91-XXXXXXXXXX',
    storeEmail = 'your@email.com',
    businessLogo,

    billNo = 'CM-2026-042',
    billDate = '10-Apr-2026',
    dueDate = '25-Apr-2026',
    
    customerName = 'Client Company Name',
    customerAddress = 'Full Shipping Address',
    customerGSTIN = 'N/A',
    
    items = [],
    summary = {},
    bankName = 'HDFC BANK',
    accountNumber = '50100123456789',
    ifscCode = 'HDFC0001234',
    branchName = 'Branch Name',
    billType = 'Tax Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#1e293b' }}>
      <div className="p-[10mm] flex flex-col font-sans text-[10px]" style={{ height: '100%' }}>

        {/* Top Branding Section */}
        <div className="flex border-b-4 border-slate-800 pb-4 mb-4 justify-between">
          <div className="w-2/3">
            <div className="flex items-center gap-3 mb-2">
              {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-slate-800 text-white flex items-center justify-center font-black text-xl">{storeName.charAt(0)}</div>
              )}
              <h1 className="text-2xl font-black text-slate-800 leading-none">{storeName}</h1>
            </div>
            <p className="font-bold text-teal-600 text-[8px] italic mb-2 uppercase tracking-widest">Modern • Professional • Corporate Ready</p>
            <div className="text-slate-500 space-y-0 text-[9px]">
              <p>{storeAddress}</p>
              <p>Phone: {storePhone} | Email: {storeEmail}</p>
              <p>GSTIN: {storeGSTIN}</p>
            </div>
          </div>
          <div className="w-1/3 text-right">
            <div className="bg-slate-800 p-3 text-white inline-block">
              <h2 className="text-lg font-bold uppercase tracking-[0.2em] mb-0.5">Commercial</h2>
              <h2 className="text-2xl font-black italic text-teal-400">{billType || 'Invoice'}</h2>
            </div>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-4 bg-slate-50 border border-slate-200 divide-x divide-slate-200 mb-4 overflow-hidden rounded-md shadow-inner">
          <div className="p-2">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Invoice No</p>
            <p className="font-bold text-sm text-slate-800 tracking-tight">{billNo}</p>
          </div>
          <div className="p-2">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Issue Date</p>
            <p className="font-bold">{billDate}</p>
          </div>
          <div className="p-2">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Due Date</p>
            <p className="font-bold text-teal-600">{dueDate || '-'}</p>
          </div>
          <div className="p-2">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Currency</p>
            <p className="font-bold">INR</p>
          </div>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-1 border border-slate-200 rounded-md mb-4 bg-slate-50/30">
          <div className="p-3">
            <h3 className="font-black text-slate-800 uppercase text-[9px] mb-2 border-b-2 border-teal-500 inline-block pb-0.5">Bill To (Buyer)</h3>
            <div className="space-y-0.5 text-slate-600 text-[9px]">
              <p className="text-sm font-bold text-slate-800 italic underline decoration-teal-500 decoration-2 underline-offset-4">{customerName}</p>
              <p className="whitespace-pre-wrap">{customerAddress}</p>
              <p className="font-bold mt-1">GSTIN: {customerGSTIN}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-teal-400 text-[9px] uppercase font-black tracking-widest">
                <th className="p-2 text-left border-r border-slate-700 rounded-tl-lg">Item Description</th>
                <th className="p-2 text-center border-r border-slate-700">Qty</th>
                <th className="p-2 text-right border-r border-slate-700">Unit Price</th>
                <th className="p-2 text-center border-r border-slate-700 w-12">Tax</th>
                <th className="p-2 text-right rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody className="border border-slate-200 font-bold divide-y divide-slate-100">
              {items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 text-slate-800 font-bold">{item.name}</td>
                  <td className="p-2 text-center">{item.qty} {item.unit}</td>
                  <td className="p-2 text-right">{formatCurr(item.rate)}</td>
                  <td className="p-2 text-center text-slate-400">{item.taxRate}%</td>
                  <td className="p-2 text-right text-slate-900 underline decoration-teal-500/30">{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-6">
                  <td className="p-1 border-r border-slate-100 opacity-5"></td>
                  <td className="p-1 border-r border-slate-100 opacity-5"></td>
                  <td className="p-1 border-r border-slate-100 opacity-5"></td>
                  <td className="p-1 border-r border-slate-100 opacity-5"></td>
                  <td className="p-1 opacity-5"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Section */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-lg relative overflow-hidden">
            <h3 className="font-black text-slate-800 uppercase text-[9px] mb-2 flex items-center gap-2">
              <span className="w-1 h-3 bg-teal-500 rounded-full" />
              Payment & Terms
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[9px] font-bold">
              <div className="space-y-0.5 opacity-80">
                <p className="text-slate-400 uppercase text-[7px]">Payment Details</p>
                <p>{bankName}</p>
                <p>A/C: {accountNumber}</p>
                <p>IFSC: {ifscCode}</p>
              </div>
              <div className="space-y-0.5 opacity-80">
                <p className="text-slate-400 uppercase text-[7px]">Terms</p>
                <p>Due within 15 days</p>
                <p>Non-returnable goods</p>
              </div>
            </div>
          </div>
          <div className="w-1/3">
            <div className="space-y-1.5 p-1">
              <div className="flex justify-between text-slate-500 font-bold text-[10px]">
                <span>Subtotal</span>
                <span>{formatCurr(summary.basicTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold text-[10px]">
                <span>Tax Amount</span>
                <span>{formatCurr(summary.taxTotal)}</span>
              </div>
              <div className="h-0.5 w-full bg-slate-100 my-1" />
              <div className="flex justify-between text-slate-800 font-black text-lg tracking-tighter bg-teal-50 p-2 rounded-md border-b-4 border-teal-500">
                <span>Total</span>
                <span className="text-teal-600">₹{formatCurr(summary.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signatory Footer */}
        <div className="mt-4 flex justify-between items-end border-t border-slate-100 pt-3 italic text-slate-400 text-[9px]">
          <div className="max-w-[40%] leading-snug">
            <div className="flex items-center gap-2 mb-1">
              <img src="/logo.svg" alt="BillSoft" className="h-4 w-auto opacity-60 grayscale" />
              <span className="font-black uppercase tracking-widest text-[7px] text-slate-500">BillSoft • Powered by AGB Technologies</span>
            </div>
            <p>This document is a system-generated commercial invoice compliant with B2B trade regulations.</p>
          </div>
          <div className="text-right">
            <p className="font-black text-slate-800 uppercase text-[10px] non-italic mb-6">Authorized Signatory</p>
            <div className="h-px w-48 bg-slate-800 mb-1 ml-auto" />
            <p className="font-bold text-slate-500 uppercase tracking-widest text-[7px]">Signature & Official Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

