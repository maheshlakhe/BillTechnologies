import React from 'react';
import { Ship, Globe, Anchor, Scale, Landmark } from 'lucide-react';

/**
 * CommercialExportInvoiceA4.tsx
 * High-fidelity Export Invoice Layout.
 * Supports IEC Code, Incoterms (CIF/FOB), SWIFT, and Exchange Rates.
 */
export function CommercialExportInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Your Company Name',
    storeAddress = 'Industrial Estate, Phase IV, City, State, India',
    storePhone = '+91 80 4455 6677',
    storeEmail = 'global.export@email.com',
    storeGSTIN = '27AABCA1234F1Z1',
    iecCode = '0714044556',
    businessLogo,

    billNo = 'EXP-2026-8801',
    billDate = '10-APR-2026',
    exchangeRate = '1 USD = 83.45 INR',
    currency = 'USD',
    
    customerName = 'Emirates Logistics LLC',
    customerAddress = 'Port Industrial Zone, Block B, UAE',
    
    items = [],
    summary = {},
    
    loadingPort = 'Nhava Sheva (IN)',
    destinationPort = 'Jebel Ali (UAE)',
    incoterms = 'CIF - DUBAI',
    vesselName = 'MAERSK LINE / VSL 220X',
    shippingMarks = 'GTS/UAE/2026/01 — 22 | MADE IN INDIA / FRAGILE',
    packageCount = '42 Units LCL',
    
    bankName = 'HDFC LTD INDIA',
    accountNumber = 'XXXX XXXX XXXX',
    ifscCode = 'HDFC0001234',
    swiftCode = 'HDFCINBBXXX',
    bankReference = 'INV-8801-EXP',
    
    freight = 1500,
    insurance = 105,
    billType = 'Commercial Export Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatUSD = (val: number | string) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalUSD = (summary.grandTotal || 0) + (freight || 0) + (insurance || 0);
  const totalINR = totalUSD * 83.45; // Based on exchange rate placeholder

  return (
    <div className="bg-white mx-auto overflow-hidden rounded-sm shadow-sm" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#000' }}>
      <div className="p-[8mm] flex flex-col text-[8px] font-bold uppercase tracking-tight divide-y-2 divide-black border-4 border-black m-[3mm]" style={{ height: 'calc(100% - 6mm)' }}>

        {/* Top Row: Title & Company */}
        <div className="grid grid-cols-2 divide-x-2 divide-black">
          <div className="p-3 space-y-2">
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
                <div className="h-12 w-12 bg-black flex items-center justify-center text-white text-2xl font-black italic rounded-sm">
                  EXP
                </div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none mb-1">{storeName}</h1>
              <div className="space-y-0 font-black text-zinc-500 italic uppercase text-[7px]">
                <p>{storeAddress}</p>
                <p>IEC CODE: {iecCode} | GSTIN: {storeGSTIN}</p>
                <p>PHONE: {storePhone} | {storeEmail}</p>
              </div>
            </div>
          </div>
          <div className="p-3 flex flex-col justify-between text-right">
            <div className="bg-black text-white p-3 inline-block ml-auto w-full relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-2 bg-emerald-400" />
              <h2 className="text-[9px] font-black tracking-[0.4em] mb-0.5 italic">Commercial Export</h2>
              <h2 className="text-2xl font-black italic tracking-tighter text-emerald-400">{billType.replace('Invoice', '')}</h2>
            </div>
            <div className="space-y-0.5 font-black text-zinc-900 border-t-2 border-zinc-100 pt-2 mt-2 text-[8px]">
              <p className="flex justify-between"><span>Invoice No:</span> <span className="text-base">{billNo}</span></p>
              <p className="flex justify-between italic"><span>Date:</span> <span>{billDate}</span></p>
              <p className="flex justify-between text-emerald-600"><span>Exchange Rate:</span> <span>{exchangeRate}</span></p>
            </div>
          </div>
        </div>

        {/* Parties & Logistic Grid */}
        <div className="grid grid-cols-2 divide-x-2 divide-black">
          <div className="divide-y-2 divide-black">
            <div className="p-2.5">
              <h3 className="text-[7px] font-black text-zinc-400 mb-1 border-b-2 border-emerald-500 inline-block">Importer (Buyer)</h3>
              <div className="space-y-0 text-zinc-950 font-black text-[8px]">
                <p className="text-[10px] italic tracking-tighter underline decoration-emerald-100 decoration-4 underline-offset-4">{customerName}</p>
                <p className="whitespace-pre-wrap">{customerAddress}</p>
              </div>
            </div>
          </div>
          <div className="divide-y-2 divide-black h-full">
            <div className="p-0 grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-2.5 space-y-2">
                <div>
                  <p className="text-[6px] font-black text-zinc-300 flex items-center gap-1 uppercase tracking-widest"><Anchor className="h-2.5 w-2.5 text-emerald-500" /> Loading</p>
                  <p className="text-[9px] font-black italic">{loadingPort}</p>
                </div>
                <div>
                  <p className="text-[6px] font-black text-zinc-300 flex items-center gap-1 uppercase tracking-widest"><Ship className="h-2.5 w-2.5 text-emerald-500" /> Destination</p>
                  <p className="text-[9px] font-black italic">{destinationPort}</p>
                </div>
              </div>
              <div className="p-2.5 space-y-2">
                <div>
                  <p className="text-[6px] font-black text-zinc-300 flex items-center gap-1 uppercase tracking-widest"><Scale className="h-2.5 w-2.5 text-emerald-500" /> Incoterms</p>
                  <p className="text-[10px] font-black italic text-emerald-600 underline">{incoterms}</p>
                </div>
                <div>
                  <p className="text-[6px] font-black text-zinc-300 flex items-center gap-1 uppercase tracking-widest"><Globe className="h-2.5 w-2.5 text-emerald-500" /> Carrier</p>
                  <p className="text-[9px] font-black italic leading-none">{vesselName}</p>
                </div>
              </div>
            </div>
            <div className="p-2.5 bg-zinc-900 text-white flex flex-col justify-center gap-1">
              <p className="text-[6px] font-black uppercase tracking-[0.4em] opacity-40 italic">Shipping Marks & Packaging</p>
              <p className="text-[9px] font-black bg-emerald-500 text-black px-1.5 py-0.5 inline-block w-fit italic tracking-tighter">Box Count: {packageCount}</p>
              <p className="text-[8px] font-black border-l-2 border-emerald-500 pl-2">{shippingMarks}</p>
            </div>
          </div>
        </div>

        {/* Description Table */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-100 font-black text-[8px] text-zinc-900 border-b-2 border-black italic">
                <th className="p-2 text-left w-8">No.</th>
                <th className="p-2 text-left">Description of Export Goods</th>
                <th className="p-2 text-center w-20">HS Code</th>
                <th className="p-2 text-center w-14">Qty</th>
                <th className="p-2 text-right w-24 border-l border-zinc-200">Price ({currency})</th>
                <th className="p-2 text-right w-24 border-l border-zinc-200">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-black">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-2 text-zinc-300 italic">{i + 1}</td>
                  <td className="p-2 text-black tracking-tighter text-[9px] font-black">{item.name}</td>
                  <td className="p-2 text-center text-zinc-400 font-mono tracking-widest text-[7px]">{item.hsn || '-'}</td>
                  <td className="p-2 text-center">{item.qty} {item.unit}</td>
                  <td className="p-2 text-right border-l border-zinc-200">{formatUSD(item.rate)}</td>
                  <td className="p-2 text-right border-l border-zinc-200 font-black italic">{formatUSD(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i: number) => (
                <tr key={`empty-${i}`} className="h-4 opacity-10">
                  <td colSpan={6} className="px-3 text-[6px]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom: Custom Declaration & Total */}
        <div className="grid grid-cols-2 divide-x-2 divide-black">
          <div className="divide-y-2 divide-black">
            <div className="p-3 space-y-2">
              <div>
                <h4 className="font-black text-black uppercase text-[8px] tracking-widest mb-1 flex items-center gap-2 italic">
                  <Landmark className="h-2.5 w-2.5 text-emerald-600" /> Banking (SWIFT)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[8px] font-black text-zinc-400">
                  <p className="leading-tight">BANK: {bankName}<br />A/C: {accountNumber}<br />IFSC: {ifscCode}</p>
                  <p className="leading-tight text-emerald-600">SWIFT: {swiftCode}<br />REF: {bankReference}<br />CURRENCY: {currency}</p>
                </div>
              </div>
              <div>
                <p className="font-black text-black uppercase text-[7px] tracking-widest mb-0.5 italic">Exporter declaration</p>
                <p className="text-[7px] text-zinc-400 leading-tight italic uppercase font-black font-mono">
                  THE GOODS ARE OF INDIAN ORIGIN & MANUFACTURED IN INDIA. ALL PARTICULARS DECLARED ARE TRUE AND CORRECT.
                </p>
              </div>
            </div>
            <div className="p-3 font-black text-center pt-4">
              <div className="border-b-2 border-black w-28 mx-auto mb-1" />
              <p className="text-zinc-900 tracking-tighter italic text-[8px]">Authorized Signatory / Seal</p>
              <p className="text-[6px] text-zinc-300 mt-1 font-bold uppercase tracking-[0.4em]">Proprietary Export format v.42</p>
            </div>
          </div>
          <div className="p-0 divide-y-2 divide-black">
            <div className="p-3 space-y-1.5 font-black text-zinc-400 italic text-[8px]">
              <div className="flex justify-between"><span>Subtotal ({currency})</span><span className="text-black inline-block px-1 bg-zinc-100 tabular-nums">{formatUSD(summary.basicTotal)}</span></div>
              <div className="flex justify-between border-b-2 border-zinc-50 pb-0.5"><span>Ocean Freight ({incoterms})</span><span className="text-emerald-600 tracking-widest">+ {formatUSD(freight)}</span></div>
              <div className="flex justify-between"><span>Marine Insurance</span><span className="text-emerald-600 tracking-widest">+ {formatUSD(insurance)}</span></div>
            </div>
            <div className="p-4 bg-black text-white flex flex-col items-end gap-1 justify-center">
              <div className="text-[8px] font-black text-emerald-400 tracking-[0.5em] mb-1 uppercase opacity-40 italic">Final CIF_VALUE_{currency}</div>
              <div className="text-4xl font-black italic tracking-tighter tabular-nums leading-none text-white">
                {currency === 'USD' ? '$' : ''}{formatUSD(totalUSD)}
              </div>
              <div className="w-full h-px bg-white/20 my-2" />
              <p className="text-[7px] font-black italic text-zinc-500 max-w-[180px] text-right leading-snug">
                Equivalent Value in INR: ₹{formatCurr(totalINR)} as per customs declaration.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 bg-zinc-50 flex justify-between items-center text-[6px] font-black uppercase tracking-[0.2em] text-zinc-300 border-none mt-auto italic">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto grayscale opacity-40" />
            <span>BillSoft • Powered by AGB Technologies</span>
          </div>
          <span className="tracking-[0.4em]">Customs Declaration Document • International Trade Division • Page 01 of 01</span>
        </div>
      </div>
    </div>
  );
}

