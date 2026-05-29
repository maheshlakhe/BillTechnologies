import React from 'react';

/**
 * StandardInvoiceA4.tsx
 * Professional corporate billing layout.
 * Focuses on clarity, corporate branding, and structured data representation.
 */
export function StandardInvoiceA4({ saleData, activeColumns }: { saleData: any; activeColumns?: string[] }) {
  if (!saleData) return null;

  const {
    storeName = 'Company Name',
    storeAddress = 'Full Business Address Details',
    storePhone = '+91-XXXXXXXXXX',
    storeEmail = 'your@email.com',
    businessLogo,

    billNo = 'INV-001',
    billDate = '10/04/2026',
    dueDate = '25/04/2026',
    
    customerName = 'Client Name',
    customerAddress = 'Client Address Line 1, City, State, ZIP',
    shippingName = 'Recipient Name',
    shippingAddress = 'Shipping Address Details',
    
    items = [],
    summary = {},
    bankName = 'HDFC BANK',
    accountNumber = 'XXXXXXXXXXXXXX',
    ifscCode = 'XXXXXXXXXXX',
    billType = 'Standard Invoice'
  } = saleData;

  const formatCurr = (val: number | string) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden mx-auto" style={{ width: '210mm', minWidth: '210mm', maxWidth: '210mm', minHeight: '297mm', color: '#1a1a1a' }}>
      <div className="p-[12mm] text-black bg-white flex flex-col font-serif" style={{ fontSize: '11px', height: '100%' }}>

        <div className="flex justify-between items-start mb-5">
          <div>
            {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="h-12 w-auto object-contain mb-1" />
            ) : (
                <h1 className="text-2xl font-bold tracking-tighter text-blue-900 mb-1">{storeName}</h1>
            )}
            <div className="text-gray-600 space-y-0 not-italic text-[10px]">
              <p>{storeAddress}</p>
              <p>Phone: {storePhone}</p>
              <p>Email: {storeEmail}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-blue-900/10 uppercase tracking-widest leading-none mb-2">{billType || 'Invoice'}</h2>
            <div className="space-y-0.5 text-[10px]">
              <p><span className="font-bold">Invoice No:</span> <span className="text-gray-700">{billNo}</span></p>
              <p><span className="font-bold">Date:</span> <span className="text-gray-700">{billDate}</span></p>
              <p><span className="font-bold">Due Date:</span> <span className="text-gray-700">{dueDate || '-'}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="font-bold text-blue-900 uppercase border-b border-blue-900/20 pb-0.5 mb-1.5 text-[9px] tracking-wider">Bill To</h3>
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-sm text-black">{customerName}</p>
              <p className="text-gray-600 whitespace-pre-wrap">{customerAddress}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 uppercase border-b border-blue-900/20 pb-0.5 mb-1.5 text-[9px] tracking-wider">Ship To</h3>
            <div className="text-[11px] leading-snug">
              <p className="font-bold">{shippingName || customerName}</p>
              <p className="text-gray-600 whitespace-pre-wrap">{shippingAddress || customerAddress}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-3 flex-1">
          <thead>
            <tr className="bg-blue-900 text-white text-[10px] uppercase tracking-wider font-bold">
              <th className="py-2 px-3 text-left rounded-tl">Description of Goods / Services</th>
              <th className="py-2 px-3 text-center">Unit / Qty</th>
              <th className="py-2 px-3 text-right">Unit Price (₹)</th>
              <th className="py-2 px-3 text-right rounded-tr">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-x border-b">
            {items.map((item: any, i: number) => (
              <tr key={i}>
                <td className="py-2 px-3 font-medium text-gray-800">{item.name}</td>
                <td className="py-2 px-3 text-center text-gray-600">{item.qty} {item.unit || ''}</td>
                <td className="py-2 px-3 text-right text-gray-600">{formatCurr(item.rate)}</td>
                <td className="py-2 px-3 text-right font-bold text-gray-900">{formatCurr(item.total)}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-8">
                <td className="py-1 px-3"></td>
                <td className="py-1 px-3 text-center text-gray-400"></td>
                <td className="py-1 px-3 text-right"></td>
                <td className="py-1 px-3 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start">
          <div className="w-1/2">
            <h3 className="font-bold text-blue-900 uppercase border-b border-blue-900/20 pb-0.5 mb-1.5 text-[9px] tracking-wider">Payment Details</h3>
            <div className="text-[10px] space-y-0.5 text-gray-600">
              <p><span className="font-bold text-black uppercase">Method:</span> Bank Transfer / UPI</p>
              <p><span className="font-bold text-black uppercase">Bank:</span> {bankName}</p>
              <p><span className="font-bold text-black uppercase">Account #:</span> {accountNumber}</p>
              <p><span className="font-bold text-black uppercase">IFSC Code:</span> {ifscCode}</p>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-blue-900 uppercase border-b border-blue-900/20 pb-0.5 mb-1 text-[9px] tracking-wider">Terms & Conditions</h3>
              <ul className="text-[9px] list-disc list-inside text-gray-500 space-y-0 font-sans">
                <li>Payment due within 15 days</li>
                <li>Goods once sold are not returnable</li>
                <li>Subject to local jurisdiction</li>
              </ul>
            </div>
          </div>
          <div className="w-1/3">
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-gray-600 text-[12px]">
                <span>Subtotal</span>
                <span>₹{formatCurr(summary.basicTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[12px]">
                <span>Tax Amount</span>
                <span>₹{formatCurr(summary.taxTotal)}</span>
              </div>
              <div className="border-t-2 border-blue-900 pt-2 flex justify-between text-blue-900 font-bold text-base">
                <span>Total Amount</span>
                <span>₹{formatCurr(summary.grandTotal)}</span>
              </div>
            </div>
            <div className="mt-6 text-center pt-4 border-t border-gray-200">
              <div className="h-8 flex items-center justify-center italic text-gray-400 text-xs mb-0.5 underline decoration-dotted underline-offset-4">
                [Signature Placeholder]
              </div>
              <p className="text-[9px] font-bold text-gray-800 uppercase italic">Authorized Signatory</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-[8px] font-sans font-bold text-gray-400 italic">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BillSoft" className="h-3 w-auto opacity-70 grayscale" />
            <span>BillSoft • Powered by AGB Technologies</span>
          </div>
          <p>Page 01 of 01</p>
          <p>Professional Invoice Format</p>
        </div>
      </div>
    </div>
  );
}

