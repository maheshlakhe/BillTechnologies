import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

/**
 * ProformaQuotationA4.tsx
 * High-fidelity Proforma Quotation Proposal Layout.
 * Features sign-off area, lead time tracking, and professional scope summaries.
 */
export function ProformaQuotationA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Company / Name',
    storeAddress = 'City, State, Country, ZIP',
    storePhone = '+91 9988 7766 55',
    storeEmail = 'quotation@email.com',
    businessLogo,

    billNo = 'pq_001_88',
    billDate = '10 APR 2026',
    validityDate = '25-APR-2026',
    
    customerName = 'Client Name / Entity',
    customerAddress = 'Business Contact / Entity Address Details Here',
    
    items = [],
    summary = {},
    
    advancePct = 40,
    leadTime = '15 Days',
    billType = 'Proforma Quotation'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const advanceAmount = (summary.grandTotal || 0) * (advancePct / 100);

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm border-t-[16px] border-blue-600 shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#0f172a' }}>
      <div className="p-[12mm] flex flex-col text-xs leading-relaxed lowercase tracking-tight" style={{ height: 'calc(100% - 16px)' }}>

        {/* Branding Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3 items-center">
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl italic">{storeName.charAt(0)}</div>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">{storeName}</h1>
              <p className="font-bold text-blue-600 uppercase tracking-[0.2em] text-[7px] italic leading-none mt-0.5">Estimations • Quotations • Tenders</p>
              <div className="text-slate-400 font-medium mt-2 space-y-0 italic text-[9px]">
                <p>{storeAddress}</p>
                <p>{storePhone} / {storeEmail}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 leading-none">Estimation Ref</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{billNo}</p>
            <div className="flex gap-3 justify-end mt-2 font-bold text-slate-500 text-[10px]">
              <p className="border-r-2 border-slate-100 pr-3">{billDate}</p>
              <p className="text-blue-600 italic underline decoration-blue-100 decoration-4 underline-offset-4">Validity: {validityDate || '-'}</p>
            </div>
          </div>
        </div>

        {/* Scope of Work Section */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-3 border-b-2 border-slate-100 pb-2">
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 leading-none">prepared_for</p>
              <p className="text-base font-black text-slate-900 italic tracking-tighter underline decoration-blue-500 decoration-8 underline-offset-[-2px]">{customerName}</p>
              <p className="text-slate-500 font-bold mt-1 text-[10px] whitespace-pre-wrap">{customerAddress}</p>
            </div>
            <div className="text-right max-w-xs bg-slate-50 p-2.5 border border-slate-100 rounded-xl font-bold italic text-slate-400 leading-snug text-[9px]">
              <CheckCircle2 className="h-3 w-3 text-blue-500 mb-1 ml-auto" />
              Professional Proposal for Service Delivery & Project Phase. Scope defined as per initial meeting.
            </div>
          </div>

          <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 leading-none">scope_of_work</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] border-b-2 border-slate-100">
                <th className="pb-2 font-black">description</th>
                <th className="pb-2 text-center w-20">qty</th>
                <th className="pb-2 text-center w-24">unit_price</th>
                <th className="pb-2 text-right w-24">amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 font-black italic text-[11px] tracking-tighter divide-y divide-slate-50 overflow-hidden">
              {items.map((item: any, i: number) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-black">{item.name}</td>
                  <td className="py-3 text-center text-slate-300 tabular-nums text-[10px]">{item.qty} {item.unit || 'unit'}</td>
                  <td className="py-3 text-center text-blue-600 font-bold tracking-tight text-[10px]">₹{formatCurr(item.rate)}</td>
                  <td className="py-3 text-right tabular-nums font-black text-[10px]">₹{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i: number) => (
                <tr key={`empty-${i}`} className="h-5 opacity-10">
                  <td className="py-1 font-black text-slate-200"></td>
                  <td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms & Acceptance */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-black text-slate-300 uppercase text-[8px] tracking-[0.3em] italic mb-2">Payment & Timeline</p>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-slate-300 mb-0.5 text-[8px]">Advance Required</p>
                  <p className="text-slate-900 italic font-black text-[11px]">{advancePct}% / ₹{formatCurr(advanceAmount)}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-slate-300 mb-0.5 text-[8px]">Estimated Lead</p>
                  <p className="text-slate-900 italic font-black text-[11px] text-blue-600 flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {leadTime}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-1 italic text-[10px] underline decoration-blue-200 decoration-2 underline-offset-4">Terms of Quotation</h4>
              <ul className="text-[9px] text-slate-400 font-medium space-y-0.5 italic leading-snug">
                <li>Prices valid only until valid through date.</li>
                <li>Final invoice subject to scope adjustments.</li>
                <li>Work commences only after {advancePct}% advance & sign-off.</li>
                <li>Acceptance signifies agreement to professional terms.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.3em] mb-0.5">Quoted Estimation</p>
              <div className="text-4xl font-black text-slate-950 tracking-tighter tabular-nums italic underline decoration-blue-600 decoration-8 underline-offset-[-5px]">
                ₹{formatCurr(summary.grandTotal)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border-dashed border-2 border-slate-200 text-center space-y-2">
              <p className="font-black text-[8px] uppercase tracking-widest text-slate-300">formal_acceptance_sign_off</p>
              <div className="h-8 border-b border-slate-300 w-full" />
              <p className="text-[9px] text-slate-400 font-bold italic">Authorized Signatory / Date</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[6px] font-black uppercase tracking-[0.2em] text-slate-300 italic">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale opacity-50" />
            <span>BillSoft • Powered by AGB Technologies</span>
          </div>
          <span>{billType.replace(/\s+/g, '_').toLowerCase()}_proposal_format_v.1.2 / legal_document</span>
        </div>
      </div>
    </div>
  );
}

