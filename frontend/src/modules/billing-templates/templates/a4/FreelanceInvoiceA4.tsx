import React from 'react';

/**
 * FreelanceInvoiceA4.tsx
 * Creative Freelancer & Designer Layout
 * Playful, vibrant, and focused on service engagement.
 */
export function FreelanceInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Name / Brand',
    storeAddress = 'Freelancer Address',
    storePhone = '+91-XXXXXXXXXX',
    storeEmail = 'your@email.com',
    businessLogo,

    billNo = 'FL-2026-042',
    billDate = '10 APR 2026',
    dueDate = '25 APR 2026',
    
    customerName = 'Awesome Client Name',
    customerAddress = 'Client Address Details',
    customerEmail = 'contact@client.com',
    
    items = [],
    summary = {},
    bankName = 'Bank Name',
    accountNumber = 'XXXX XXXX XXXX',
    ifscCode = 'XXXXXXXX',
    upiId = 'username@upi',
    billType = 'Freelance Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#1e293b' }}>
      <div className="p-[12mm] flex flex-col font-sans text-rose-950" style={{ height: '100%' }}>

        {/* Header / Brand Section */}
        <div className="flex justify-between items-start mb-5 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-12 w-auto object-contain bg-rose-500 rotate-3 p-1 shadow-lg shadow-rose-200" />
              ) : (
                <div className="h-12 w-12 bg-rose-500 rotate-3 flex items-center justify-center shadow-lg shadow-rose-200">
                  <span className="text-white font-black text-2xl italic">{storeName.charAt(0)}</span>
                </div>
              )}
              <h1 className="text-2xl font-black italic tracking-tighter leading-none">{storeName}</h1>
            </div>
            <div className="space-y-0.5 pl-1 border-l-4 border-rose-500 text-[10px]">
              <p className="font-black uppercase text-[9px] tracking-widest text-rose-500">Freelancer / Designer</p>
              <p className="font-bold text-rose-800">{storeEmail}</p>
              <p className="font-medium text-rose-400 italic">{storePhone}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block px-6 py-3 bg-rose-50 border-l-8 border-rose-500 shadow-sm">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-rose-500 leading-none mb-0.5">{billType || 'Invoice'}</h2>
              <div className="flex justify-end gap-4 text-[10px] font-black text-rose-950 pt-1 border-t border-rose-200">
                <p className="uppercase"><span className="text-rose-300">#</span> {billNo}</p>
                <p className="uppercase text-rose-400">{billDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Date Card */}
        <div className="bg-zinc-50 rounded-2xl p-4 mb-4 flex justify-between border-2 border-zinc-100 shadow-inner">
          <div className="space-y-1">
            <p className="font-black text-[8px] uppercase tracking-[0.3em] text-rose-400 italic flex items-center gap-2">
              Billed To
            </p>
            <p className="text-lg font-black tracking-tight text-rose-950">{customerName}</p>
            <p className="font-medium text-rose-400 text-[9px] whitespace-pre-wrap">{customerAddress}</p>
            <p className="font-bold text-rose-800 italic text-[10px]">{customerEmail}</p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="font-black text-[8px] uppercase tracking-[0.3em] text-rose-400 italic">Payment Goal</p>
            <p className="text-base font-black text-rose-950 underline decoration-rose-500 decoration-4 underline-offset-4">{dueDate || '-'}</p>
          </div>
        </div>

        {/* Work Summary Table */}
        <div className="flex-1">
          <h3 className="font-black uppercase text-[10px] tracking-widest mb-2 italic border-b-2 border-rose-100 pb-1 inline-block">Work Summary</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[9px] font-black uppercase text-rose-400 italic border-b-2 border-rose-200">
                <th className="py-2 text-left w-8">#</th>
                <th className="py-2 text-left">Service Engagement</th>
                <th className="py-2 text-center">Unit / Qty</th>
                <th className="py-2 text-center">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {items.map((item: any, i: number) => (
                <tr key={i} className="group hover:bg-rose-50/20 transition-colors">
                  <td className="py-2.5 font-black text-rose-200 italic">{i + 1}</td>
                  <td className="py-2.5 font-black text-rose-950 tracking-tight text-[11px]">{item.name}</td>
                  <td className="py-2.5 text-center font-bold text-rose-400 italic">{item.qty} {item.unit || 'Units'}</td>
                  <td className="py-2.5 text-center font-black text-rose-800">{formatCurr(item.rate)}</td>
                  <td className="py-2.5 text-right font-black text-rose-950 tabular-nums">₹{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8 opacity-10">
                  <td className="py-1"></td><td className="py-1"></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Section */}
        <div className="mt-4 flex justify-between items-end border-t-4 border-rose-500 pt-4">
          <div className="w-1/2 space-y-3">
            <div>
              <p className="font-black text-[9px] uppercase tracking-widest text-rose-400 mb-2 italic">Payment Information</p>
              <div className="grid grid-cols-2 gap-4 font-bold text-[10px] text-rose-900 leading-snug italic">
                <div className="space-y-0.5">
                  <p className="text-zinc-300 font-black uppercase text-[7px] tracking-widest">Bank Transfer</p>
                  <p>{bankName}</p>
                  <p>A/C: {accountNumber}</p>
                  <p>IFSC: {ifscCode}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-zinc-300 font-black uppercase text-[7px] tracking-widest">Digital UPI</p>
                  <p className="underline decoration-rose-400">{upiId}</p>
                </div>
              </div>
            </div>
            <div className="italic text-[9px] text-rose-300 font-black leading-snug">
              Terms: Payment due within 15 days. Late payments subject to convenience fee.
            </div>
          </div>

          <div className="w-[200px] flex flex-col items-end">
            <div className="w-full space-y-1 mb-2 pr-1">
              <div className="flex justify-between font-bold text-rose-400 text-[10px]"><span>Subtotal</span><span>₹{formatCurr(summary.basicTotal)}</span></div>
              <div className="flex justify-between font-bold text-rose-400 italic text-[10px]"><span>Tax Amount</span><span>₹{formatCurr(summary.taxTotal)}</span></div>
            </div>
            <div className="bg-rose-500 w-full p-4 text-white rotate-1 shadow-xl shadow-rose-200/50">
              <p className="font-black uppercase text-[8px] tracking-[0.4em] mb-0.5 opacity-80">Final Due</p>
              <p className="text-3xl font-black italic tracking-tighter tabular-nums leading-none">₹{formatCurr(summary.grandTotal)}</p>
            </div>
            <div className="mt-4 text-center w-full">
              <div className="h-6 italic text-rose-200 text-[10px] font-black underline decoration-rose-100 underline-offset-8">Freelance Digitally Signed</div>
              <p className="font-black uppercase text-rose-950 text-[9px] mt-1">Thanks for the collaboration!</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-rose-50 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em] text-rose-200">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale opacity-50" />
            <span className="tracking-[0.1em]">BillSoft • Powered by AGB Technologies</span>
          </div>
          <div className="flex gap-4">
            <span>Creative Assets License Included</span>
            <span>Proprietary Branding Invoice Format</span>
          </div>
        </div>
      </div>
    </div>
  );
}

