import { X, Download, Printer, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { InvoiceTemplate } from '../../../types/invoice';
import { cn } from '../../../lib/utils';

interface GSTInvoicePreviewProps {
  template: InvoiceTemplate;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

const sampleItems = [
  { name: 'Laptop Dell Inspiron 15', hsn: '8471', qty: 2, unit: 'Nos', rate: 45000, amount: 90000, discount: 2000, taxable: 88000 },
  { name: 'Wireless Mouse Logitech', hsn: '8471', qty: 5, unit: 'Nos', rate: 800, amount: 4000, discount: 0, taxable: 4000 },
  { name: 'USB-C Hub Adapter', hsn: '8473', qty: 3, unit: 'Nos', rate: 2500, amount: 7500, discount: 500, taxable: 7000 },
  { name: 'Monitor Stand Adjustable', hsn: '9403', qty: 2, unit: 'Nos', rate: 3200, amount: 6400, discount: 0, taxable: 6400 },
];

export function GSTInvoicePreview({ template, onClose, onToggleFavorite }: GSTInvoicePreviewProps) {
  const totalQty = sampleItems.reduce((s, i) => s + i.qty, 0);
  const totalAmount = sampleItems.reduce((s, i) => s + i.amount, 0);
  const totalDiscount = sampleItems.reduce((s, i) => s + i.discount, 0);
  const totalTaxable = sampleItems.reduce((s, i) => s + i.taxable, 0);
  const cgst = Math.round(totalTaxable * 0.09);
  const sgst = Math.round(totalTaxable * 0.09);
  const grandTotal = totalTaxable + cgst + sgst;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-foreground/30 backdrop-blur-sm overflow-auto py-10 no-print-container">
      <div className="w-full max-w-4xl mx-4 animate-fade-in-up">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">{template.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onToggleFavorite(template.id)}>
              <Heart className={cn('h-3.5 w-3.5', template.isFavorite ? 'fill-destructive text-destructive' : '')} />
              {template.isFavorite ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
            <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* A4 Invoice */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden min-h-[1123px]">
          <div className="p-8 text-[10px] text-black leading-tight" style={{ fontFamily: 'Arial, sans-serif', width: '100%' }}>
            
            {/* Top Title */}
            <div className="text-center font-bold text-sm border-b-2 border-black pb-1 mb-0">
            </div>

            {/* Header with Company + Copy Type */}
            <div className="border border-black border-t-0">
              <div className="flex">
                {/* Logo + Company */}
                <div className="flex-1 p-2 border-r border-black">
                  <div className="flex gap-2">
                    <div className="w-16 h-16 border border-gray-100 flex items-center justify-center shrink-0">
                      <img src="/logo.svg" alt="Company Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">XYZ CO</p>
                      <p>No. 123, Rajajinagar, 2nd Block</p>
                      <p>Bangalore - 560010, Karnataka</p>
                      <p>Phone: +91 80 2345 6789</p>
                      <p>GSTIN: 29AABCX1234D1Z5</p>
                    </div>
                  </div>
                </div>
                {/* Copy type */}
                <div className="w-28 p-2 text-[9px]">
                  <div className="space-y-0.5">
                    {['Original', 'Duplicate', 'Triplicate', 'Extra Copy'].map(type => (
                      <label key={type} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 border border-black inline-block" />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Invoice Title */}
            <div className="border border-black border-t-0 text-center py-1 font-bold text-xs bg-gray-50">
              Tax Invoice
            </div>

            {/* Invoice Details Row */}
            <div className="border border-black border-t-0">
              <div className="grid grid-cols-4">
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Invoice No:</span>
                  <br /><span className="font-semibold">INV/2026/04/0042</span>
                </div>
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Invoice Date:</span>
                  <br /><span className="font-semibold">10-Apr-2026</span>
                </div>
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Reverse Charge:</span>
                  <br /><span className="font-semibold">No</span>
                </div>
                <div className="p-1.5">
                  <span className="text-gray-500">State:</span>
                  <br /><span className="font-semibold">Karnataka (29)</span>
                </div>
              </div>
              <div className="grid grid-cols-4 border-t border-black">
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Transport Mode:</span>
                  <br /><span className="font-semibold">Road</span>
                </div>
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Vehicle No:</span>
                  <br /><span className="font-semibold">KA-01-AB-1234</span>
                </div>
                <div className="p-1.5 border-r border-black">
                  <span className="text-gray-500">Date of Supply:</span>
                  <br /><span className="font-semibold">10-Apr-2026</span>
                </div>
                <div className="p-1.5">
                  <span className="text-gray-500">Place of Supply:</span>
                  <br /><span className="font-semibold">Karnataka</span>
                </div>
              </div>
            </div>

            {/* Buyer + Consignee */}
            <div className="border border-black border-t-0 flex">
              <div className="flex-1 p-2 border-r border-black">
                <p className="font-bold text-[9px] mb-1 bg-gray-100 -mx-2 -mt-2 px-2 py-0.5 border-b border-black">Billed By:</p>
                <p className="font-semibold">XYZ CO</p>
                <p>No. 123, Rajajinagar, 2nd Block</p>
                <p>Bangalore - 560010, Karnataka</p>
                <p>GSTIN: 29AABCX1234D1Z5</p>
                <p>State: Karnataka (29)</p>
              </div>
              <div className="flex-1 p-2">
                <p className="font-bold text-[9px] mb-1 bg-gray-100 -mx-2 -mt-2 px-2 py-0.5 border-b border-black">Billed To:</p>
                <p className="font-semibold">TechStart Solutions Pvt. Ltd.</p>
                <p>456 Innovation Hub, Koramangala</p>
                <p>Bengaluru - 560034, Karnataka</p>
                <p>GSTIN: 29AADCT5678C1Z3</p>
                <p>State: Karnataka (29)</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse border border-black border-t-0">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1 text-center w-8">Sr.</th>
                  <th className="border border-black p-1 text-left">Product Description</th>
                  <th className="border border-black p-1 text-center w-14">HSN</th>
                  <th className="border border-black p-1 text-center w-10">Qty</th>
                  <th className="border border-black p-1 text-center w-10">Unit</th>
                  <th className="border border-black p-1 text-right w-14">Rate</th>
                  <th className="border border-black p-1 text-right w-16">Amount</th>
                  <th className="border border-black p-1 text-right w-14">Disc.</th>
                  <th className="border border-black p-1 text-right w-16">Taxable</th>
                  <th className="border border-black p-1 text-center" colSpan={2}>CGST</th>
                  <th className="border border-black p-1 text-center" colSpan={2}>SGST</th>
                  <th className="border border-black p-1 text-right w-16">Total</th>
                </tr>
                <tr className="bg-gray-50 text-[8px]">
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5"></th>
                  <th className="border border-black p-0.5">Value</th>
                  <th className="border border-black p-0.5 w-8">%</th>
                  <th className="border border-black p-0.5 w-14">Amt</th>
                  <th className="border border-black p-0.5 w-8">%</th>
                  <th className="border border-black p-0.5 w-14">Amt</th>
                  <th className="border border-black p-0.5"></th>
                </tr>
              </thead>
              <tbody>
                {sampleItems.map((item, i) => {
                  const lineCgst = Math.round(item.taxable * 0.09);
                  const lineSgst = Math.round(item.taxable * 0.09);
                  const lineTotal = item.taxable + lineCgst + lineSgst;
                  return (
                    <tr key={i}>
                      <td className="border border-black p-1 text-center">{i + 1}</td>
                      <td className="border border-black p-1">{item.name}</td>
                      <td className="border border-black p-1 text-center">{item.hsn}</td>
                      <td className="border border-black p-1 text-center">{item.qty}</td>
                      <td className="border border-black p-1 text-center">{item.unit}</td>
                      <td className="border border-black p-1 text-right">₹{item.rate.toLocaleString()}</td>
                      <td className="border border-black p-1 text-right">₹{item.amount.toLocaleString()}</td>
                      <td className="border border-black p-1 text-right">{item.discount ? `₹${item.discount.toLocaleString()}` : '-'}</td>
                      <td className="border border-black p-1 text-right">₹{item.taxable.toLocaleString()}</td>
                      <td className="border border-black p-1 text-center">9%</td>
                      <td className="border border-black p-1 text-right">₹{lineCgst.toLocaleString()}</td>
                      <td className="border border-black p-1 text-center">9%</td>
                      <td className="border border-black p-1 text-right">₹{lineSgst.toLocaleString()}</td>
                      <td className="border border-black p-1 text-right font-semibold">₹{lineTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {/* Empty rows */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    {Array.from({ length: 14 }).map((_, j) => (
                      <td key={j} className="border border-black p-1">&nbsp;</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Freight/Insurance/Packing row */}
            <div className="border border-black border-t-0 flex text-[9px]">
              <div className="flex-1 p-1 border-r border-black">
                <span className="text-gray-500">Freight:</span> ₹1,500
              </div>
              <div className="flex-1 p-1 border-r border-black">
                <span className="text-gray-500">Insurance:</span> ₹500
              </div>
              <div className="flex-1 p-1">
                <span className="text-gray-500">Packing & Forwarding:</span> ₹800
              </div>
            </div>

            {/* Total Row */}
            <div className="border border-black border-t-0 flex bg-gray-100 font-bold">
              <div className="flex-1 p-1.5">
                Total Qty: {totalQty} | Total Amount: ₹{totalAmount.toLocaleString()} | Total Discount: ₹{totalDiscount.toLocaleString()}
              </div>
            </div>

            {/* Bottom: Bank Details + Tax Summary */}
            <div className="border border-black border-t-0 flex">
              {/* Bank Details */}
              <div className="flex-1 p-2 border-r border-black">
                <p className="font-bold text-[9px] mb-1">Bank Details:</p>
                <p>Bank Name: HDFC Bank</p>
                <p>A/C No: 50100123456789</p>
                <p>IFSC: HDFC0001234</p>
                <p>Branch: Rajajinagar, Bangalore</p>
                <div className="mt-2 pt-1 border-t border-gray-300">
                  <p className="font-bold text-[9px] mb-0.5">Terms & Conditions:</p>
                  <p className="text-[8px] text-gray-600">1. Payment due within 15 days</p>
                  <p className="text-[8px] text-gray-600">2. Interest @18% p.a. on delayed payments</p>
                  <p className="text-[8px] text-gray-600">3. Subject to Bangalore jurisdiction</p>
                </div>
              </div>
              {/* Tax Summary */}
              <div className="w-56 p-2">
                <p className="font-bold text-[9px] mb-1">Tax Summary:</p>
                <div className="space-y-0.5">
                  <div className="flex justify-between"><span>Total Before Tax:</span><span>₹{totalTaxable.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add: CGST (9%):</span><span>₹{cgst.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add: SGST (9%):</span><span>₹{sgst.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Add: IGST:</span><span>-</span></div>
                  <div className="flex justify-between border-t border-black pt-0.5 mt-0.5"><span>Total Tax:</span><span>₹{(cgst + sgst).toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-[11px] border-t border-black pt-1 mt-1">
                    <span>Grand Total:</span><span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between"><span>Freight + Insurance + Packing:</span><span>₹2,800</span></div>
                  <div className="flex justify-between font-bold text-xs border-t-2 border-black pt-1 mt-1">
                    <span>Invoice Total:</span><span>₹{(grandTotal + 2800).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration + Signature */}
            <div className="border border-black border-t-0 flex">
              <div className="flex-1 p-2 border-r border-black text-[8px] text-gray-600">
                <p className="font-bold text-[9px] text-black mb-0.5">Declaration:</p>
                <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              </div>
              <div className="w-48 p-2 text-right">
                <p className="font-bold">For XYZ & Co</p>
                <div className="h-10" />
                <p className="border-t border-black pt-0.5">Authorized Signatory</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border border-black border-t-0 p-1.5 text-center text-[8px] text-gray-500 bg-gray-50">
              Head Office: No. 123, Rajajinagar, 2nd Block, Bangalore - 560010, Karnataka | Email: info@xyzco.in | www.xyzco.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
