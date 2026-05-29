import React from 'react';
import { Globe, Ship, Anchor, ShieldCheck } from 'lucide-react';

/**
 * ProformaExportInvoiceA4.tsx
 * High-fidelity Proforma Export Invoice Layout.
 * Supports IEC Code, Incoterms, and Port Details.
 */
export function ProformaExportInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'GTS_GLOBAL',
    storeAddress = 'Full Address Line 01, City, State, India',
    storePhone = '+91-XXXXXXXXXX',
    storeEmail = 'global@trade.com',
    storeGSTIN = '27AABCA1234B1Z5',
    iecCode = '0714099220',
    businessLogo,

    billNo = 'PF-2026-0042',
    billDate = '10-APR-2026',
    validityDate = '25-APR-2026',
    currency = 'USD',
    
    customerName = 'Mid-East Construction LLC',
    customerAddress = 'Full Importer Address - Port City, UAE',
    
    items = [],
    summary = {},
    
    origin = 'INDIA',
    loadingPort = 'NHAVA SHEVA',
    dischargePort = 'JEBEL ALI',
    incoterms = 'CIF - DUBAI PORT',
    
    bankName = 'HDFC BANK LTD - BANGALORE HUB',
    swiftCode = 'HDFCINBBXXX',
    
    freight = 2500,
    billType = 'Proforma Export Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatUSD = (val: number | string) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const estimatedTotal = (summary.grandTotal || 0) + (freight || 0);

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm border-t-[12px] border-slate-900 shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#0f172a' }}>
      <div className="p-[10mm] flex flex-col text-[8px] uppercase font-bold tracking-tight" style={{ height: 'calc(100% - 12px)' }}>

        {/* Export Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
          <div className="space-y-2">
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
                <div className="h-10 w-32 border-4 border-slate-900 flex items-center justify-center italic text-lg font-black bg-slate-50">
                  {storeName}
                </div>
            )}
            <div className="space-y-0.5">
              <h1 className="text-sm font-black tracking-tighter leading-none text-slate-900">{storeName}</h1>
              <div className="text-slate-400 space-y-0 font-bold italic text-[8px]">
                <p>{storeAddress}</p>
                <p>IEC Code: {iecCode} | GSTIN: {storeGSTIN}</p>
                <p>Contact: {storePhone} | email: {storeEmail}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-slate-900 text-white p-2 mb-2 w-40 text-center">
              <h2 className="text-[10px] font-black tracking-[0.3em] mb-0.5">Proforma</h2>
              <h2 className="text-lg font-black italic text-blue-400">{billType.replace('Proforma ', '')}</h2>
            </div>
            <div className="space-y-1 font-black text-slate-900 text-[8px]">
              <p className="flex justify-between w-40 border-b border-slate-100 pb-0.5"><span>Invoice No:</span> <span className="text-blue-600 tracking-widest">{billNo}</span></p>
              <p className="flex justify-between w-40 border-b border-slate-100 pb-0.5"><span>Document Date:</span> <span>{billDate}</span></p>
              <p className="flex justify-between w-40 font-black text-red-600"><span>Validity:</span> <span>{validityDate || '-'}</span></p>
            </div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-2 border-2 border-slate-900 mb-3 divide-x-2 divide-slate-900">
          <div className="p-2.5 bg-slate-50/50">
            <h3 className="bg-slate-900 text-white px-2 py-0.5 inline-block mb-2 italic text-[7px] tracking-[0.2em] rounded-sm">Exporter (Seller)</h3>
            <div className="space-y-0.5 text-slate-900 text-[8px]">
              <p className="text-[10px] font-black">{storeName}</p>
              <p className="text-slate-500 italic">{storeAddress}</p>
            </div>
          </div>
          <div className="p-2.5">
            <h3 className="bg-blue-100 text-blue-800 px-2 py-0.5 inline-block mb-2 italic text-[7px] tracking-[0.2em] rounded-sm border border-blue-200">Consignee (Buyer)</h3>
            <div className="space-y-0.5 text-slate-900 text-[8px]">
              <p className="text-[10px] font-black underline decoration-blue-500 decoration-4 underline-offset-4 italic">{customerName}</p>
              <p className="text-slate-500 leading-snug font-black whitespace-pre-wrap">{customerAddress}</p>
              <p className="text-blue-600 pt-1 flex items-center gap-1 font-black"><Globe className="h-2.5 w-2.5" /> INTERNATIONAL REGION</p>
            </div>
          </div>
        </div>

        {/* Shipment Summary */}
        <div className="mb-3 grid grid-cols-4 gap-0 border-x-2 border-b-2 border-slate-900 bg-slate-50 divide-x divide-slate-200 overflow-hidden shadow-sm">
          {[
            { l: 'Origin', v: origin, i: Globe },
            { l: 'Loading', v: loadingPort, i: Anchor },
            { l: 'Discharge', v: dischargePort, i: Ship },
            { l: 'Transport', v: 'AIR / SEA', i: Ship },
          ].map((item, i) => (
            <div key={i} className="p-2 text-center">
              <p className="text-[6px] text-slate-400 mb-0.5 uppercase font-black">{item.l}</p>
              <p className="text-[8px] font-black text-slate-900 flex items-center justify-center gap-1">
                <item.i className="h-2.5 w-2.5 text-slate-300" /> {item.v}
              </p>
            </div>
          ))}
          <div className="col-span-2 p-2 bg-slate-900 text-white font-black flex justify-between items-center px-4">
            <span className="text-[7px] tracking-[0.3em] opacity-60 italic">Incoterms</span>
            <span className="text-blue-400 text-[9px] tracking-widest italic">{incoterms}</span>
          </div>
          <div className="col-span-2 p-2 bg-blue-600 text-white font-black flex justify-between items-center px-4">
            <span className="text-[7px] tracking-[0.3em] opacity-60 italic">Currency</span>
            <span className="text-[9px] tracking-widest italic">{currency} ($)</span>
          </div>
        </div>

        {/* Main Export Items Table */}
        <div className="flex-1">
          <table className="w-full border-collapse border-b-2 border-slate-900">
            <thead>
              <tr className="bg-slate-100 font-black text-[8px] text-slate-900 border-y-2 border-slate-900">
                <th className="p-2 text-left w-8">#</th>
                <th className="p-2 text-left">Description of Goods</th>
                <th className="p-2 text-center w-20">HS Code</th>
                <th className="p-2 text-center w-12">Qty</th>
                <th className="p-2 text-right w-24">Unit Price ({currency})</th>
                <th className="p-2 text-right w-24">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-black border-x-2 border-slate-900">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                  <td className="p-2 text-slate-300 italic">{i + 1}</td>
                  <td className="p-2 text-slate-900 text-[9px] tracking-tight">{item.name}</td>
                  <td className="p-2 text-center font-mono text-blue-600 tracking-widest text-[7px]">{item.hsn || '-'}</td>
                  <td className="p-2 text-center">{item.qty} {item.unit}</td>
                  <td className="p-2 text-right tabular-nums">{formatUSD(item.rate)}</td>
                  <td className="p-2 text-right text-slate-900 tabular-nums font-black italic">{formatUSD(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i: number) => (
                <tr key={`empty-${i}`} className="h-4 border-t border-slate-50 opacity-10">
                  <td colSpan={6} className="px-3 text-[6px]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Declaration & Summary */}
        <div className="mt-3 flex gap-4">
          <div className="flex-1 space-y-3">
            <div className="p-2.5 bg-slate-50 border-l-4 border-slate-900">
              <h4 className="font-black text-slate-900 uppercase text-[7px] tracking-[0.3em] mb-1 flex items-center gap-2 italic">
                <ShieldCheck className="h-2.5 w-2.5 text-blue-600" /> Certifications & Declaration
              </h4>
              <p className="text-[7px] text-slate-500 font-bold leading-snug italic uppercase">
                WE DECLARE THAT THE ABOVE INFORMATION IS TRUE AND CORRECT AND THE GOODS DESCRIBED ARE OF INDIAN ORIGIN.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-1 text-[8px]">
              <div className="space-y-0.5">
                <p className="font-black text-slate-900 text-[7px] uppercase tracking-widest italic border-b border-slate-100 pb-0.5 mb-0.5">Bank Information</p>
                <p className="text-slate-400 font-black leading-tight italic">{bankName}</p>
                <p className="text-blue-600 font-black italic underline">SWIFT: {swiftCode}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-slate-900 text-[7px] uppercase tracking-widest italic border-b border-slate-100 pb-0.5 mb-0.5">Notify Party</p>
                <p className="text-slate-400 font-black leading-tight italic">Same as Consignee / As per L/C</p>
                <p className="text-slate-900 font-black italic">Notify via Logistics Hub</p>
              </div>
            </div>
          </div>
          <div className="w-[180px] flex flex-col items-end">
            <div className="w-full space-y-1 mb-2 font-black italic text-slate-500 text-[9px]">
              <div className="flex justify-between border-b-2 border-slate-100 pb-0.5"><span>Proforma Subtotal</span><span>{formatUSD(summary.basicTotal)}</span></div>
              <div className="flex justify-between text-blue-600"><span>Freight ({incoterms})</span><span>+ {formatUSD(freight)}</span></div>
            </div>
            <div className="bg-slate-900 w-full p-4 text-white rotate-[-1deg] shadow-xl shadow-slate-200">
              <p className="font-black uppercase text-[7px] tracking-[0.4em] mb-1 opacity-50 italic">Estimated Total ({currency})</p>
              <p className="text-3xl font-black italic tracking-tighter tabular-nums leading-none text-blue-400">{currency === 'USD' ? '$' : ''}{formatUSD(estimatedTotal)}</p>
            </div>
            <div className="mt-4 text-center w-full">
              <div className="h-px bg-slate-900 w-full mb-1.5" />
              <p className="font-black uppercase text-slate-950 italic text-[9px]">Authorized Export Officer</p>
              <p className="text-[6px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none mt-0.5">{storeName} - International Division</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-[6px] font-black uppercase tracking-[0.5em] text-slate-200">
          <span>International Trade Proforma Format v.1.0</span>
          <span>Page 01 of 01</span>
          <span>In Compliance with incoterms 2020</span>
        </div>
      </div>
    </div>
  );
}

