import React from 'react';

/**
 * InventoryInvoiceA4.tsx
 * Advanced Inventory & Stock Management Layout
 * Focuses on traceability with Batch, SKU, and Warehouse tracking.
 */
export function InventoryInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Company Name',
    storeAddress = 'Full Business Address Details',
    storeGSTIN = '27AABCA1234B1Z5',
    storePhone = '+91-XXXXXXXXXX',
    businessLogo,

    billNo = 'IV-2026-8821',
    billDate = '10-Apr-2026',
    warehouseId = 'WH-01-NORTH',
    
    customerName = 'Customer Name / Company',
    customerAddress = 'Full Shipping Address',
    customerGSTIN = 'N/A',
    
    items = [],
    summary = {},
    billType = 'Inventory Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm border-t-8 border-amber-600 shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#1e293b' }}>
      <div className="p-[10mm] flex flex-col font-mono text-[9px]" style={{ height: '100%' }}>

        {/* Header / Company Info */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
          <div className="flex gap-3">
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-12 w-auto object-contain bg-slate-900 p-1" />
            ) : (
                <div className="h-12 w-12 bg-slate-900 flex items-center justify-center rounded-sm">
                  <span className="text-amber-500 font-black text-2xl">{storeName.charAt(0)}</span>
                </div>
            )}
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none mb-0.5 text-slate-900">{storeName}</h1>
              <p className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 inline-block rounded-sm mb-1 text-[8px]">Inventory-Enabled Billing System</p>
              <div className="text-slate-500 font-bold space-y-0 uppercase text-[8px]">
                <p>{storeAddress}</p>
                <p>Phone: {storePhone} | GSTIN: {storeGSTIN}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="border-4 border-slate-900 p-1.5 font-black mb-2">
              <p className="text-sm uppercase leading-none">Inventory</p>
              <p className="text-xl uppercase leading-none text-amber-600">{billType || 'Invoice'}</p>
            </div>
            <div className="font-bold leading-tight text-[8px]">
              <p>Doc No: <span className="text-[10px]">{billNo}</span></p>
              <p>Warehouse ID: {warehouseId}</p>
              <p>Date: {billDate}</p>
            </div>
          </div>
        </div>

        {/* Parties Info Grid */}
        <div className="grid grid-cols-1 border border-slate-900 mb-3 font-bold uppercase overflow-hidden">
          <div className="p-2.5">
            <h3 className="text-amber-600 mb-1.5 border-b border-amber-600 inline-block text-[8px]">Customer / Bill To</h3>
            <div className="space-y-0.5 text-[8px]">
              <p className="text-slate-900 font-black italic underline decoration-slate-200 decoration-4">{customerName}</p>
              <p className="text-slate-500 whitespace-pre-wrap">{customerAddress}</p>
              <p className="text-slate-500 font-black mt-1">GSTIN: {customerGSTIN}</p>
            </div>
          </div>
        </div>

        {/* Inventory Specialized Table */}
        <div className="flex-1">
          <table className="w-full border-collapse border-b-2 border-slate-900">
            <thead>
              <tr className="bg-slate-100 font-black uppercase text-[8px] text-slate-700">
                <th className="p-1.5 text-center border border-slate-900 w-8">#</th>
                <th className="p-1.5 text-left border border-slate-900">Item Name</th>
                <th className="p-1.5 text-center border border-slate-900 w-16">HSN/SKU</th>
                <th className="p-1.5 text-center border border-slate-900 w-20">Batch / Details</th>
                <th className="p-1.5 text-center border border-slate-900 w-10">Qty</th>
                <th className="p-1.5 text-right border border-slate-900 w-20">Rate</th>
                <th className="p-1.5 text-right border border-slate-900 w-20">Total Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold border-x border-slate-900">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-1.5 text-center border-l border-r border-slate-200">{i + 1}</td>
                  <td className="p-1.5 border-r border-slate-200 font-black italic">{item.name}</td>
                  <td className="p-1.5 text-center border-r border-slate-200 text-slate-500 text-[7px]">{item.hsn || item.sku || '-'}</td>
                  <td className="p-1.5 text-center border-r border-slate-200 text-amber-700 leading-tight text-[7px]">
                    <p className="bg-amber-100/50 rounded-sm inline-block px-1">{item.batch || 'GENERAL'}</p>
                    <p className="text-slate-400 text-[7px] font-normal">{item.serial || item.exp || ''}</p>
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-200">{item.qty} {item.unit}</td>
                  <td className="p-1.5 text-right border-r border-slate-200">{formatCurr(item.rate)}</td>
                  <td className="p-1.5 text-right font-black italic">{formatCurr(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-5 border-t border-slate-50 opacity-10">
                  <td colSpan={7} className="px-3 text-[6px]"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-black uppercase text-right text-[9px]">
                <td colSpan={4} className="p-2 border-r border-slate-800">Total Quantities Billed</td>
                <td className="p-2 text-center border-r border-slate-800 w-10 underline decoration-amber-500">
                    {items.reduce((sum: number, item: any) => sum + Number(item.qty), 0)} units
                </td>
                <td className="p-2 border-r border-slate-800">Gross Sub-Total (₹)</td>
                <td className="p-2 bg-amber-600 font-black italic text-base">{formatCurr(summary.basicTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* STOCK MOVEMENT SUMMARY (Contextual Placeholders) */}
        <div className="mt-3 mb-3 p-2.5 border border-slate-200 rounded-md bg-slate-50 relative overflow-hidden">
          <h3 className="font-black text-slate-900 uppercase italic text-[8px] mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" /> Post-Sale Inventory Reconcile Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-bold border-l-2 border-slate-900 pl-2 text-[8px]">
              <p className="text-[7px] text-slate-400 uppercase">Current Warehouse Hub</p>
              <p className="text-slate-900 tracking-tighter">{warehouseId} <span className="text-[7px] text-emerald-600 font-black">(ACTIVE)</span></p>
            </div>
            <div className="font-bold border-l-2 border-slate-900 pl-2 text-[8px]">
              <p className="text-[7px] text-slate-400 uppercase">Items Despatched</p>
              <p className="text-slate-900 tracking-tighter">{items.length} Lines</p>
            </div>
            <div className="font-bold border-l-2 border-slate-900 pl-2 text-[8px]">
              <p className="text-[7px] text-slate-400 uppercase">Reorder Level Alert</p>
              <p className="text-slate-900 tracking-tighter">OK <span className="text-[7px] text-slate-400 font-black italic">(LEVEL_SAFE)</span></p>
            </div>
          </div>
        </div>

        {/* Bottom Logistics & Payment */}
        <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900 pt-3">
          <div className="space-y-2">
            <div>
              <h4 className="font-black uppercase italic text-amber-600 mb-1 text-[8px]">Logistics Tracking Info</h4>
              <div className="grid grid-cols-2 gap-1 font-bold text-[8px] text-slate-500 uppercase leading-none">
                <p>Dispatch Date: <span className="text-slate-900 font-black italic underline">{billDate}</span></p>
                <p>Method: <span className="text-slate-900 font-black italic">Air Freight / Road</span></p>
                <p>Tracking ID: <span className="text-slate-900 font-black italic">IV-{billNo}</span></p>
                <p>Status: <span className="text-emerald-600 font-black italic">PREVIEW_MODE</span></p>
              </div>
            </div>
            <div>
              <h4 className="font-black uppercase italic text-amber-600 mb-0.5 text-[8px]">Terms & Traceability</h4>
              <p className="text-[7px] leading-snug text-slate-400 font-bold uppercase italic">Batch & Serial numbers are recorded for warranty and traceability purposes. Inventory records updated in real-time.</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-full space-y-1 border border-slate-200 p-2.5 rounded-md text-[9px]">
              <div className="flex justify-between font-bold text-slate-400 italic"><span>Taxable Amount</span><span>₹{formatCurr(summary.basicTotal)}</span></div>
              <div className="flex justify-between font-bold text-slate-400 italic"><span>Tax (GST)</span><span>₹{formatCurr(summary.taxTotal)}</span></div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between font-black text-lg text-slate-900 tracking-tighter">
                <span>Grand Total</span>
                <span className="text-amber-600">₹{formatCurr(summary.grandTotal)}</span>
              </div>
            </div>
            <div className="text-center w-full mt-1">
              <div className="h-0.5 bg-amber-600 w-20 mx-auto mb-1.5" />
              <p className="font-black uppercase text-slate-900 underline decoration-slate-200 underline-offset-4 decoration-4 text-[8px]">Warehouse Supervisor Approval</p>
              <p className="text-[6px] text-slate-400 font-bold uppercase italic leading-none mt-0.5">Verified against System Records</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2 border-t-4 border-slate-900 flex justify-between items-center text-[6px] font-black uppercase italic">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale invert" />
            <span className="tracking-[0.2em] text-slate-500">BillSoft • Powered by AGB Technologies</span>
          </div>
          <span className="tracking-[0.6em] text-slate-300">Inventory Control Copy • Audit Ready Format v1.02</span>
        </div>
      </div>
    </div>
  );
}

