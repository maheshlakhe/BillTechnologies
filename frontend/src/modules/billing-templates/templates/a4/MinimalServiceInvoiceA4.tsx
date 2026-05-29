import React from 'react';

/**
 * MinimalServiceInvoiceA4.tsx
 * Ultra-minimal studio layout.
 * Focuses on typography, whitespace, and a "less is more" aesthetic.
 */
export function MinimalServiceInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'studio_invoice',
    storeAddress = 'london / new york / bangalore',
    storePhone = '+91 9988 7766 55',
    storeEmail = 'your@email.com',
    businessLogo,

    billNo = 'inv_0042',
    billDate = 'april 10 / 2026',
    dueDate = '25 apr 2026',
    
    customerName = 'client name / entity',
    customerAddress = 'studio address line 01, city, state',
    
    items = [],
    summary = {},
    bankName = 'hdfc bank india',
    accountNumber = 'ending in 8842',
    billType = 'studio_invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#0a0a0a' }}>
      <div className="p-[15mm] flex flex-col font-sans text-xs lowercase tracking-tight leading-relaxed" style={{ height: '100%' }}>

        {/* Minimal Header */}
        <div className="flex justify-between items-baseline mb-10">
          <div>
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-10 w-auto object-contain grayscale mb-2" />
            ) : (
                <h1 className="text-2xl font-light tracking-tighter mb-2">{storeName.toLowerCase().replace(/\s+/g, '_')}</h1>
            )}
            <div className="space-y-0 text-neutral-400 font-medium text-[10px]">
              <p>{storeEmail.toLowerCase()}</p>
              <p>{storePhone}</p>
              <p>{storeAddress.toLowerCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-[0.3em] mb-1 leading-none">id / date</p>
            <p className="text-2xl font-black font-serif tracking-tighter italic">{billNo.toLowerCase()}</p>
            <p className="text-neutral-400 font-medium mt-0.5 text-[10px]">{billDate.toLowerCase()}</p>
          </div>
        </div>

        {/* Client Section */}
        <div className="mb-10 flex gap-10">
          <div className="w-1/2">
            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-[0.3em] mb-2">bill_to</p>
            <div className="text-neutral-900 space-y-0.5">
              <p className="text-lg font-bold tracking-tighter italic">{customerName.toLowerCase()}</p>
              <p className="font-medium text-neutral-400 max-w-xs leading-snug text-[10px] whitespace-pre-wrap">{customerAddress.toLowerCase()}</p>
            </div>
          </div>
          <div className="w-1/2">
            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-[0.3em] mb-2">due_date</p>
            <p className="text-lg font-bold text-neutral-900 tabular-nums italic underline decoration-neutral-100 decoration-8 underline-offset-[-2px]">
              {dueDate.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1">
          <div className="h-px bg-neutral-100 w-full mb-4" />
          <table className="w-full text-left">
            <thead>
              <tr className="text-[8px] font-bold text-neutral-300 uppercase tracking-[0.2em]">
                <th className="pb-4 font-bold">description</th>
                <th className="pb-4 text-center w-16">qty</th>
                <th className="pb-4 text-right w-28">amt</th>
              </tr>
            </thead>
            <tbody className="text-neutral-900 font-medium text-sm italic divide-y divide-neutral-50 shadow-sm shadow-black/5">
              {items.map((item: any, i: number) => (
                <tr key={i} className="group transition-all hover:bg-neutral-50/50">
                  <td className="py-4 font-bold tracking-tighter">{item.name.toLowerCase()}</td>
                  <td className="py-4 text-center text-neutral-300 tabular-nums">{item.qty}</td>
                  <td className="py-4 text-right font-black tracking-tighter underline decoration-neutral-100 decoration-4 underline-offset-4">₹{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i: number) => (
                <tr key={`empty-${i}`} className="h-10 opacity-5">
                   <td className="py-4"></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="mt-8 border-t-2 border-neutral-900 pt-6 flex justify-between items-start">
          <div className="space-y-4 text-[10px] font-medium text-neutral-400 max-w-xs">
            <div>
              <p className="font-black text-neutral-900 mb-1 italic">payment</p>
              <p className="leading-snug text-[9px]">bank transfer / upi. kindly use invoice id for tracking. {bankName} / {accountNumber}.</p>
            </div>
            <div>
              <p className="font-black text-neutral-900 mb-1 italic">notes</p>
              <p className="leading-snug text-[9px]">payment due within 15 days of issue. thanks for the trust.</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black uppercase text-neutral-300 tracking-[0.3em]">tax_amount</p>
              <p className="text-base font-bold text-neutral-400 tracking-tighter tabular-nums">₹{formatCurr(summary.taxTotal)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-black uppercase text-neutral-300 tracking-[0.3em]">total_due</p>
              <p className="text-4xl font-black text-neutral-950 tracking-tighter tabular-nums decoration-black/10 decoration-8 underline underline-offset-[-5px]">₹{formatCurr(summary.grandTotal)}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 flex justify-between items-center text-[7px] font-bold text-neutral-300 uppercase tracking-[0.2em] italic">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale opacity-30" />
            <span>billsoft • powered by agb technologies</span>
          </div>
          <span className="tracking-[0.4em]">less is more / a minimal service format v.2.0</span>
        </div>
      </div>
    </div>
  );
}

