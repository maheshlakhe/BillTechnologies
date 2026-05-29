import React from 'react';

/**
 * ConsultingInvoiceA4.tsx
 * Minimalist Professional Consulting Layout
 * Focuses on service descriptions, billing periods, and professional branding.
 */
export function ConsultingInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Company / Name',
    storeAddress = 'Full Business Address',
    storePhone = '+91-XXXXXXXXXX',
    storeEmail = 'your@email.com',
    businessLogo,

    billNo = 'CS-2026-001',
    billDate = '10 Apr 2026',
    dueDate = '25 Apr 2026',
    billingPeriod = '01 Mar 2026 — 31 Mar 2026',
    
    customerName = 'Client Name / Business Entity',
    customerAddress = 'Full Business Address, City, ZIP',
    customerEmail = 'contact@clientbusiness.com',
    
    items = [],
    summary = {},
    bankName = 'HDFC Private Banking',
    accountNumber = '50200045566778',
    ifscCode = 'HDFC0001234',
    upiId = 'pay@consultant.upi',
    billType = 'Consulting Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm ring-1 ring-neutral-200 shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#1e293b' }}>
      <div className="p-[12mm] flex flex-col font-sans text-[10px]" style={{ height: '100%' }}>

        {/* Minimalist Professional Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="space-y-2">
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-12 w-auto object-contain bg-indigo-900 p-1" />
            ) : (
                <div className="h-12 w-12 bg-indigo-900 flex items-center justify-center rounded-sm text-white font-black text-xl">
                    {storeName.charAt(0)}
                </div>
            )}
            <div>
              <h1 className="text-xl font-black text-indigo-900 tracking-tight leading-none mb-0.5">{storeName}</h1>
              <p className="text-indigo-600 font-bold uppercase text-[8px] tracking-[0.3em] mb-2">Consultant / Professional Services</p>
              <div className="text-neutral-500 font-medium italic text-[9px]">
                <p>{storeEmail}</p>
                <p>{storePhone}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-4xl font-black text-neutral-100 uppercase select-none leading-none mb-2 tracking-tighter">Consulting</div>
            <div className="space-y-2 pt-2 border-t-2 border-indigo-900 w-full text-right">
              <div>
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Invoice Number</p>
                <p className="text-base font-black text-indigo-900">{billNo}</p>
              </div>
              <div className="flex gap-4 justify-end">
                <div>
                  <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Issue Date</p>
                  <p className="font-bold text-[10px]">{billDate}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest underline decoration-red-500 underline-offset-4">Due Date</p>
                  <p className="font-bold text-red-600 text-[10px]">{dueDate || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parties & Period Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2 space-y-1">
            <h3 className="font-black text-indigo-900 uppercase text-[9px] tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-indigo-900" /> Bill To
            </h3>
            <div className="pl-6 border-l-2 border-neutral-100">
              <p className="text-base font-black text-neutral-900">{customerName}</p>
              <p className="text-neutral-500 text-[9px] whitespace-pre-wrap">{customerAddress}</p>
              <p className="text-indigo-600 font-bold italic text-[9px] underline decoration-indigo-200">{customerEmail}</p>
            </div>
          </div>
          <div className="space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100 font-medium text-[9px]">
            <h3 className="font-black text-neutral-400 uppercase text-[8px] tracking-widest mb-1 flex items-center gap-2">
              Billing Period
            </h3>
            <p className="text-neutral-900 font-bold">{billingPeriod}</p>
            <div className="h-px bg-neutral-200 my-1" />
            <p className="text-[9px] text-neutral-500 leading-snug italic">Charges based on Technical Advisory & Professional services for current Project Phase.</p>
          </div>
        </div>

        {/* Timesheet Section / Service Summary */}
        <div className="mb-3 flex-1">
          <h3 className="font-black text-indigo-900 uppercase text-[9px] tracking-widest mb-2 flex items-center gap-2 italic">
            Services & Technical Advisory
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white text-[8px] uppercase font-black tracking-widest">
                <th className="p-2 text-left w-8 rounded-tl-sm">#</th>
                <th className="p-2 text-left">Service / Technical Role</th>
                <th className="p-2 text-center">Unit</th>
                <th className="p-2 text-center">Rate</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right rounded-tr-sm">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 border-x border-b border-neutral-100">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-2 text-center font-black text-neutral-300 italic">{i + 1}</td>
                  <td className="p-2 font-black text-neutral-900">{item.name}</td>
                  <td className="p-2 text-center font-bold text-neutral-500">{item.unit || 'Hourly'}</td>
                  <td className="p-2 text-center font-bold text-indigo-600">{formatCurr(item.rate)}</td>
                  <td className="p-2 text-center font-black text-neutral-800 italic">{item.qty}</td>
                  <td className="p-2 text-right font-black text-neutral-900">₹{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-6">
                  <td className="p-1 opacity-10"></td><td className="p-1"></td><td className="p-1"></td><td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="pt-4 flex justify-between items-start">
          <div className="w-1/2 space-y-3">
            <div>
              <h4 className="text-[9px] font-black text-indigo-900 uppercase tracking-widest mb-1.5 italic">Payment Channels</h4>
              <div className="flex gap-4 text-[9px] font-bold text-neutral-500">
                <div className="space-y-0.5">
                  <p className="text-[7px] uppercase text-neutral-300">Bank Transfer</p>
                  <p className="text-neutral-800">{bankName}</p>
                  <p>A/C: {accountNumber}</p>
                  <p>IFSC: {ifscCode}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] uppercase text-neutral-300">Digital / UPI</p>
                  <p className="text-indigo-600 underline">{upiId}</p>
                  <p className="text-[8px] leading-snug italic mt-1 text-neutral-400">Include invoice number in remarks.</p>
                </div>
              </div>
            </div>
            <div className="p-2 bg-indigo-50/50 rounded-lg border-l-4 border-indigo-900 italic text-neutral-600 text-[9px] leading-snug">
              <strong>Professional Policy:</strong> Late payments exceeding 15 days will incur a penalty of 2% per month.
            </div>
          </div>

          <div className="w-[180px] flex flex-col gap-1.5">
            <div className="flex justify-between font-bold text-neutral-500 text-[10px]">
              <span>Gross Amount</span>
              <span className="text-neutral-900">{formatCurr(summary.basicTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-neutral-500 text-[10px]">
              <span>Tax (GST)</span>
              <span className="text-neutral-900">{formatCurr(summary.taxTotal)}</span>
            </div>
            <div className="h-px bg-neutral-200 my-1" />
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-0.5">Total Amount Due</p>
              <div className="text-2xl font-black text-indigo-900 tracking-tighter tabular-nums decoration-indigo-500 decoration-4 underline-offset-4 underline">
                ₹{formatCurr(summary.grandTotal)}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="w-full h-px bg-neutral-900 mb-1" />
              <p className="text-[10px] font-black uppercase text-neutral-900 italic">No Signature Required</p>
              <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-0.5">System Generated Professional Invoice</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Line */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em] text-neutral-300">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale opacity-50" />
            <span>BillSoft • Powered by AGB Technologies</span>
          </div>
          <span>Intellectual Assets & Professional Services • Confidential Document</span>
        </div>
      </div>
    </div>
  );
}
