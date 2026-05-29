import { X, Download, Printer, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { InvoiceTemplate } from '../../../types/invoice';
import { cn } from '../../../lib/utils';
import type { InvoiceColumn } from '../../../types/invoice';

interface InvoicePreviewProps {
  template: InvoiceTemplate;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

const sampleItems = [
  { name: 'Web Development Service', desc: 'Frontend development - React', hsn: '998314', qty: 1, price: 45000, discount: 0 },
  { name: 'UI/UX Design', desc: 'Dashboard design & prototyping', hsn: '998397', qty: 1, price: 25000, discount: 2000 },
  { name: 'Cloud Hosting', desc: 'AWS hosting - 12 months', hsn: '998315', qty: 12, price: 1500, discount: 0 },
  { name: 'SSL Certificate', desc: 'Wildcard SSL - 1 year', hsn: '998316', qty: 1, price: 5000, discount: 500 },
];

export function InvoicePreview({ template, onClose, onToggleFavorite }: InvoicePreviewProps) {
  const enabledCols = template.columns.filter(c => c.enabled);
  const productCols = enabledCols.filter(c => c.section === 'product');
  const taxCols = enabledCols.filter(c => c.section === 'taxation');
  const invCols = enabledCols.filter(c => c.section === 'inventory');

  const subtotal = sampleItems.reduce((s, i) => s + i.qty * i.price - i.discount, 0);
  const taxRate = 18;
  const taxAmt = Math.round(subtotal * taxRate / 100);
  const total = subtotal + taxAmt;

  const renderInvoice = () => {
    switch (template.layout) {
      case 'modern': return <ModernLayout productCols={productCols} taxCols={taxCols} invCols={invCols} subtotal={subtotal} taxAmt={taxAmt} total={total} taxRate={taxRate} colorScheme={template.colorScheme} />;
      case 'minimal': return <MinimalLayout productCols={productCols} taxCols={taxCols} invCols={invCols} subtotal={subtotal} taxAmt={taxAmt} total={total} taxRate={taxRate} colorScheme={template.colorScheme} />;
      case 'detailed': return <DetailedLayout productCols={productCols} taxCols={taxCols} invCols={invCols} subtotal={subtotal} taxAmt={taxAmt} total={total} taxRate={taxRate} colorScheme={template.colorScheme} />;
      default: return <ClassicLayout productCols={productCols} taxCols={taxCols} invCols={invCols} subtotal={subtotal} taxAmt={taxAmt} total={total} taxRate={taxRate} colorScheme={template.colorScheme} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-foreground/30 backdrop-blur-sm overflow-auto py-10 no-print-container">
      <div className="w-full max-w-3xl mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
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

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden min-h-[1000px]">
          {renderInvoice()}
        </div>
      </div>
    </div>
  );
}

// ── Shared types ──
interface LayoutProps {
  productCols: InvoiceColumn[];
  taxCols: InvoiceColumn[];
  invCols: InvoiceColumn[];
  subtotal: number;
  taxAmt: number;
  total: number;
  taxRate: number;
  colorScheme: string;
}

const schemeColors: Record<string, { primary: string; light: string; accent: string }> = {
  blue: { primary: '#2563EB', light: '#EFF6FF', accent: '#1E40AF' },
  teal: { primary: '#0D9488', light: '#F0FDFA', accent: '#115E59' },
  gray: { primary: '#4B5563', light: '#F9FAFB', accent: '#1F2937' },
  indigo: { primary: '#6366F1', light: '#EEF2FF', accent: '#4338CA' },
  orange: { primary: '#EA580C', light: '#FFF7ED', accent: '#C2410C' },
  green: { primary: '#16A34A', light: '#F0FDF4', accent: '#15803D' },
  purple: { primary: '#9333EA', light: '#FAF5FF', accent: '#7E22CE' },
  rose: { primary: '#E11D48', light: '#FFF1F2', accent: '#BE123C' },
  black: { primary: '#1a1a1a', light: '#F5F5F5', accent: '#000' },
};

function getCellValue(c: InvoiceColumn, item: typeof sampleItems[0], taxRate: number) {
  const lineTotal = item.qty * item.price - item.discount;
  const lineTax = Math.round(lineTotal * taxRate / 100);
  switch (c.id) {
    case 'item_name': return item.name;
    case 'description': return item.desc;
    case 'hsn_code': return item.hsn;
    case 'unit_price': return `₹${item.price.toLocaleString()}`;
    case 'quantity': return item.qty;
    case 'discount': return item.discount ? `₹${item.discount.toLocaleString()}` : '-';
    case 'total': return `₹${lineTotal.toLocaleString()}`;
    case 'tax_rate': return `${taxRate}%`;
    case 'cgst': return `₹${Math.round(lineTax / 2).toLocaleString()}`;
    case 'sgst': return `₹${Math.round(lineTax / 2).toLocaleString()}`;
    case 'igst': return '-';
    case 'tax_amount': return `₹${lineTax.toLocaleString()}`;
    case 'sku': return `SKU-${1000 + sampleItems.indexOf(item)}`;
    case 'stock_qty': return 50 - sampleItems.indexOf(item) * 10;
    default: return '-';
  }
}

// ── CLASSIC LAYOUT ──
function ClassicLayout({ productCols, taxCols, invCols, subtotal, taxAmt, total, taxRate, colorScheme }: LayoutProps) {
  const s = schemeColors[colorScheme] || schemeColors.blue;
  return (
    <div className="p-8 h-full flex flex-col text-xs" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#1a1a1a' }}>
      {/* Header with color bar */}
      <div style={{ background: s.primary }} className="h-2 -mx-8 -mt-8 mb-6" />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: s.primary }}>INVOICE</h1>
          <p className="text-gray-500 mt-1">INV-2026-0042</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Acme Corp Pvt. Ltd.</p>
          <p className="text-gray-500">123 Business Park, Mumbai</p>
          <p className="text-gray-500">GSTIN: 27AABCA1234B1Z5</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-200">
        <div>
          <p className="font-semibold text-gray-400 mb-1 text-[10px] uppercase tracking-wider">Bill To</p>
          <p className="font-medium">TechStart Solutions</p>
          <p className="text-gray-500">456 Innovation Hub, Bengaluru</p>
          <p className="text-gray-500">GSTIN: 29AADCT5678C1Z3</p>
        </div>
        <div>
          <p className="font-semibold text-gray-400 mb-1 text-[10px] uppercase tracking-wider">Details</p>
          <p className="text-gray-500">Date: <span className="text-gray-800">April 10, 2026</span></p>
          <p className="text-gray-500">Due: <span className="text-gray-800">April 25, 2026</span></p>
          <p className="text-gray-500">Terms: <span className="text-gray-800">Net 15</span></p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: s.light }}>
              <th className="text-left py-2 px-2 font-semibold" style={{ color: s.primary }}>#</th>
              {productCols.map(c => <th key={c.id} className="text-left py-2 px-2 font-semibold" style={{ color: s.primary }}>{c.label}</th>)}
              {invCols.map(c => <th key={c.id} className="text-left py-2 px-2 font-semibold text-amber-700">{c.label}</th>)}
              {taxCols.map(c => <th key={c.id} className="text-right py-2 px-2 font-semibold text-emerald-700">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {sampleItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                {productCols.map(c => <td key={c.id} className="py-2 px-2">{getCellValue(c, item, taxRate)}</td>)}
                {invCols.map(c => <td key={c.id} className="py-2 px-2 text-gray-500">{getCellValue(c, item, taxRate)}</td>)}
                {taxCols.map(c => <td key={c.id} className="py-2 px-2 text-right">{getCellValue(c, item, taxRate)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-gray-800">₹{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>CGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>SGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-sm pt-2 border-t" style={{ color: s.primary }}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-400">
        <p>Bank: HDFC Bank | A/C: 50100123456789 | IFSC: HDFC0001234</p>
        <p className="mt-1">Thank you for your business!</p>
      </div>
    </div>
  );
}

// ── MODERN LAYOUT ──
function ModernLayout({ productCols, taxCols, invCols, subtotal, taxAmt, total, taxRate, colorScheme }: LayoutProps) {
  const s = schemeColors[colorScheme] || schemeColors.teal;
  return (
    <div className="h-full flex flex-col text-xs" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#1a1a1a' }}>
      {/* Colored header block */}
      <div style={{ background: s.primary }} className="px-8 py-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-80">Invoice</p>
            <h1 className="text-2xl font-bold mt-1">INV-2026-0042</h1>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Acme Corp</p>
            <p className="opacity-80 text-[10px]">123 Business Park, Mumbai</p>
            <p className="opacity-80 text-[10px]">GSTIN: 27AABCA1234B1Z5</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex-1 flex flex-col">
        {/* Two-column info with accent left border */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="pl-3" style={{ borderLeft: `3px solid ${s.primary}` }}>
            <p className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: s.primary }}>Billed To</p>
            <p className="font-medium mt-1">TechStart Solutions Pvt. Ltd.</p>
            <p className="text-gray-500">456 Innovation Hub, Bengaluru</p>
            <p className="text-gray-500">GSTIN: 29AADCT5678C1Z3</p>
          </div>
          <div className="pl-3" style={{ borderLeft: `3px solid ${s.primary}` }}>
            <p className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: s.primary }}>Invoice Details</p>
            <div className="mt-1 space-y-0.5">
              <p className="text-gray-500">Date: <span className="text-gray-800 font-medium">10 Apr 2026</span></p>
              <p className="text-gray-500">Due: <span className="text-gray-800 font-medium">25 Apr 2026</span></p>
              <p className="text-gray-500">PO No: <span className="text-gray-800 font-medium">PO-7890</span></p>
            </div>
          </div>
        </div>

        {/* Table with rounded header */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2.5 px-3 font-semibold text-white rounded-l-md" style={{ background: s.primary }}>#</th>
                {productCols.map((c, i) => <th key={c.id} className="text-left py-2.5 px-3 font-semibold text-white" style={{ background: s.primary }}>{c.label}</th>)}
                {invCols.map(c => <th key={c.id} className="text-left py-2.5 px-3 font-semibold text-white" style={{ background: s.primary }}>{c.label}</th>)}
                {taxCols.map((c, i) => <th key={c.id} className={cn("text-right py-2.5 px-3 font-semibold text-white", i === taxCols.length - 1 && 'rounded-r-md')} style={{ background: s.primary }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : s.light }}>
                  <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                  {productCols.map(c => <td key={c.id} className="py-2 px-3">{getCellValue(c, item, taxRate)}</td>)}
                  {invCols.map(c => <td key={c.id} className="py-2 px-3 text-gray-500">{getCellValue(c, item, taxRate)}</td>)}
                  {taxCols.map(c => <td key={c.id} className="py-2 px-3 text-right">{getCellValue(c, item, taxRate)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary on right with colored box */}
        <div className="flex justify-between items-end mt-6">
          <div className="text-[10px] text-gray-400 max-w-[50%]">
            <p className="font-semibold text-gray-600 mb-1">Notes</p>
            <p>Payment via NEFT/RTGS to HDFC Bank A/C: 50100123456789, IFSC: HDFC0001234</p>
          </div>
          <div className="w-52 rounded-lg overflow-hidden border" style={{ borderColor: s.primary + '30' }}>
            <div className="space-y-1 p-3">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-gray-800">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>CGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>SGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between font-bold text-sm px-3 py-2 text-white" style={{ background: s.primary }}>
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MINIMAL LAYOUT ──
function MinimalLayout({ productCols, taxCols, invCols, subtotal, taxAmt, total, taxRate, colorScheme }: LayoutProps) {
  const s = schemeColors[colorScheme] || schemeColors.gray;
  return (
    <div className="p-10 h-full flex flex-col text-xs" style={{ fontFamily: "'Georgia', serif", color: '#333' }}>
      {/* Minimal header - centered */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase" style={{ color: s.primary }}>Invoice</h1>
        <p className="text-gray-400 mt-2 text-[10px] tracking-wider">INV-2026-0042 • April 10, 2026</p>
      </div>

      <div className="flex justify-between mb-8 text-[10px]">
        <div>
          <p className="uppercase tracking-wider text-gray-400 mb-2 text-[9px]">From</p>
          <p className="font-semibold">Acme Corp Pvt. Ltd.</p>
          <p className="text-gray-500">123 Business Park</p>
          <p className="text-gray-500">Mumbai, Maharashtra</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-wider text-gray-400 mb-2 text-[9px]">To</p>
          <p className="font-semibold">TechStart Solutions</p>
          <p className="text-gray-500">456 Innovation Hub</p>
          <p className="text-gray-500">Bengaluru, Karnataka</p>
        </div>
      </div>

      <div className="w-12 h-px mx-auto mb-6" style={{ background: s.primary }} />

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2" style={{ borderColor: s.primary }}>
              <th className="text-left py-3 font-normal uppercase tracking-wider text-[9px] text-gray-400">#</th>
              {productCols.map(c => <th key={c.id} className="text-left py-3 font-normal uppercase tracking-wider text-[9px] text-gray-400">{c.label}</th>)}
              {invCols.map(c => <th key={c.id} className="text-left py-3 font-normal uppercase tracking-wider text-[9px] text-gray-400">{c.label}</th>)}
              {taxCols.map(c => <th key={c.id} className="text-right py-3 font-normal uppercase tracking-wider text-[9px] text-gray-400">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {sampleItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-gray-300">{i + 1}</td>
                {productCols.map(c => <td key={c.id} className="py-3">{getCellValue(c, item, taxRate)}</td>)}
                {invCols.map(c => <td key={c.id} className="py-3 text-gray-400">{getCellValue(c, item, taxRate)}</td>)}
                {taxCols.map(c => <td key={c.id} className="py-3 text-right">{getCellValue(c, item, taxRate)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4" style={{ borderTop: `2px solid ${s.primary}` }}>
        <div className="flex justify-end">
          <div className="w-48 space-y-2 text-[11px]">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-gray-700">₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-400"><span>Tax (18%)</span><span className="text-gray-700">₹{taxAmt.toLocaleString()}</span></div>
            <div className="w-full h-px bg-gray-200 my-1" />
            <div className="flex justify-between font-semibold text-sm" style={{ color: s.primary }}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 text-center text-[9px] text-gray-300 tracking-wider">
        Thank you for your business
      </div>
    </div>
  );
}

// ── DETAILED LAYOUT ──
function DetailedLayout({ productCols, taxCols, invCols, subtotal, taxAmt, total, taxRate, colorScheme }: LayoutProps) {
  const s = schemeColors[colorScheme] || schemeColors.indigo;
  return (
    <div className="h-full flex flex-col text-xs" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#1a1a1a' }}>
      {/* Dual-tone header */}
      <div className="flex">
        <div style={{ background: s.primary }} className="w-1/2 px-6 py-5 text-white">
          <p className="text-[10px] uppercase tracking-widest opacity-70">Tax Invoice</p>
          <h1 className="text-lg font-bold mt-1">INV-2026-0042</h1>
          <p className="text-[10px] opacity-70 mt-1">Date: 10 Apr 2026</p>
        </div>
        <div style={{ background: s.accent }} className="w-1/2 px-6 py-5 text-white">
          <p className="font-bold">Acme Corp Pvt. Ltd.</p>
          <p className="text-[10px] opacity-80">123 Business Park, Mumbai</p>
          <p className="text-[10px] opacity-80">GSTIN: 27AABCA1234B1Z5</p>
          <p className="text-[10px] opacity-80">PAN: AABCA1234B</p>
        </div>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col">
        {/* Three-column info */}
        <div className="grid grid-cols-3 gap-4 mb-5 p-3 rounded-lg" style={{ background: s.light }}>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: s.primary }}>Bill To</p>
            <p className="font-medium">TechStart Solutions</p>
            <p className="text-gray-500">456 Innovation Hub</p>
            <p className="text-gray-500">Bengaluru - 560034</p>
            <p className="text-gray-500">GSTIN: 29AADCT5678C1Z3</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: s.primary }}>Ship To</p>
            <p className="font-medium">TechStart Solutions</p>
            <p className="text-gray-500">789 Tech Park, Whitefield</p>
            <p className="text-gray-500">Bengaluru - 560066</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: s.primary }}>Payment</p>
            <p className="text-gray-500">Due: <span className="text-gray-800">25 Apr 2026</span></p>
            <p className="text-gray-500">Terms: <span className="text-gray-800">Net 15</span></p>
            <p className="text-gray-500">Mode: <span className="text-gray-800">NEFT</span></p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `2px solid ${s.primary}` }}>
                <th className="text-left py-2 px-2 font-bold text-[10px]" style={{ color: s.primary }}>#</th>
                {productCols.map(c => <th key={c.id} className="text-left py-2 px-2 font-bold text-[10px]" style={{ color: s.primary }}>{c.label}</th>)}
                {invCols.map(c => <th key={c.id} className="text-left py-2 px-2 font-bold text-[10px]" style={{ color: s.primary }}>{c.label}</th>)}
                {taxCols.map(c => <th key={c.id} className="text-right py-2 px-2 font-bold text-[10px]" style={{ color: s.primary }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : s.light, borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                  {productCols.map(c => <td key={c.id} className="py-2 px-2">{getCellValue(c, item, taxRate)}</td>)}
                  {invCols.map(c => <td key={c.id} className="py-2 px-2 text-gray-500">{getCellValue(c, item, taxRate)}</td>)}
                  {taxCols.map(c => <td key={c.id} className="py-2 px-2 text-right">{getCellValue(c, item, taxRate)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom: Bank details left, Totals right */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex-1 text-[10px]">
            <p className="font-bold text-[9px] uppercase tracking-wider mb-1" style={{ color: s.primary }}>Bank Details</p>
            <p className="text-gray-500">Bank: HDFC Bank | Branch: Rajajinagar</p>
            <p className="text-gray-500">A/C: 50100123456789 | IFSC: HDFC0001234</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="font-bold text-[9px] uppercase tracking-wider mb-0.5" style={{ color: s.primary }}>Terms</p>
              <p className="text-gray-400 text-[9px]">1. Payment due within 15 days</p>
              <p className="text-gray-400 text-[9px]">2. Interest @18% p.a. on delayed payments</p>
            </div>
          </div>
          <div className="w-52 rounded-lg p-3" style={{ background: s.light }}>
            <div className="space-y-1.5">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-gray-800">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>CGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>SGST (9%)</span><span className="text-gray-800">₹{Math.round(taxAmt / 2).toLocaleString()}</span></div>
              <div className="h-px w-full bg-gray-200" />
              <div className="flex justify-between font-bold text-sm" style={{ color: s.primary }}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100">
          <p className="text-[9px] text-gray-400">E. & O.E.</p>
          <div className="text-right">
            <p className="text-[10px] font-semibold">For Acme Corp Pvt. Ltd.</p>
            <div className="h-8" />
            <p className="text-[9px] text-gray-400 border-t border-gray-300 pt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
