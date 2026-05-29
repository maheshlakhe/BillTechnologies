import React from 'react';

export interface ColumnData {
  id: string;
  label: string;
  enabled: boolean;
  visible?: boolean;
  section: string;
}

export const DEFAULT_COLS: ColumnData[] = [
  { id: 'sr_no', label: 'Sr. No', enabled: true, section: 'standard' },
  { id: 'item_name', label: 'Item Description', enabled: true, section: 'standard' },
  { id: 'hsn_code', label: 'HSN', enabled: true, section: 'standard' },
  { id: 'quantity', label: 'Qty', enabled: true, section: 'standard' },
  { id: 'unit_price', label: 'Rate', enabled: true, section: 'standard' },
  { id: 'total', label: 'Amount', enabled: true, section: 'standard' }
];

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
  slate: { primary: '#334155', light: '#F8FAFC', accent: '#0F172A' },
  emerald: { primary: '#059669', light: '#ECFDF5', accent: '#064E3B' },
  violet: { primary: '#7C3AED', light: '#F5F3FF', accent: '#4C1D95' },
};

const sampleItemsData = [
  { id: '1', item_name: 'High Performance Laptop', description: '32GB RAM, 1TB SSD', hsn_code: '8471', quantity: 2, unit_price: 120000, total: 240000 },
  { id: '2', item_name: 'Wireless Mechanical Keyboard', description: 'RGB, Blue Switches', hsn_code: '8471', quantity: 5, unit_price: 3500, total: 17500 },
  { id: '3', item_name: 'LG 27" 4K Monitor', description: 'IPS, USB-C Power Delivery', hsn_code: '8528', quantity: 3, unit_price: 32000, total: 96000 },
];

interface LayoutProps {
  colorScheme: string;
  columns: ColumnData[];
}

const getCellValue = (colId: string, item: any) => {
  if (colId === 'unit_price' || colId === 'total' || colId === 'price' || colId === 'amount' || colId === 'taxAmount') {
    return `₹${item[colId]?.toLocaleString() || '0'}`;
  }
  if (colId === 'taxRate') return `${item[colId] || 0}%`;
  return item[colId] || '-';
};

// --- UNIVERSAL DYNAMIC TABLE COMPONENT ---
export const UniversalPOTable: React.FC<{ columns: any[], data: any[], s?: any }> = ({ columns = [], data = [], s = {} }) => {
  const activeCols = (columns || [])
    .map(c => typeof c === 'string' ? { id: c, label: c, enabled: true, visible: true } : c)
    .filter(c => (c && c.enabled !== false && c.visible !== false));
  const themePrimary = s.primary || '#1a1a1a';

  const getColWidth = (id: string) => {
    if (id === 'sr_no') return '60px';
    if (id === 'quantity' || id === 'qty') return '70px';
    if (id === 'unit_price' || id === 'rate' || id === 'taxRate') return '95px';
    if (id === 'total' || id === 'amount') return '115px';
    return 'auto';
  };

  const getColAlign = (id: string) => {
    if (!id) return 'center';
    const lowerId = id.toLowerCase();
    if (lowerId === 'sr_no') return 'center';
    if (lowerId.includes('item') || lowerId.includes('name') || lowerId.includes('description')) return 'left';
    if (lowerId === 'total' || lowerId === 'amount') return 'right';
    return 'center';
  };
  
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: 'auto',
        minWidth: '100%', 
        borderCollapse: 'collapse', 
        tableLayout: 'auto', 
        border: `1px solid ${s.borderColor || '#000'}`,
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <thead>
          <tr style={{ background: s.headerBg || '#f8fafc' }}>
            {activeCols.map(col => {
              const w = getColWidth(col.id);
              return (
                <th key={col.id} style={{ 
                  width: w,
                  minWidth: w,
                  maxWidth: w,
                  padding: '12px 4px', 
                  color: s.headerColor || themePrimary, 
                  textAlign: 'center', 
                  border: `1px solid ${s.borderColor || '#000'}`,
                  fontWeight: '900',
                  fontSize: '8pt',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  boxSizing: 'border-box'
                }}>
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {activeCols.map(col => {
                let val = '';
                if (col.id === 'sr_no') val = (idx + 1).toString();
                else val = getCellValue(col.id, item);

                const w = getColWidth(col.id);
                return (
                  <td key={col.id} style={{ 
                    width: w,
                    minWidth: w,
                    maxWidth: w,
                    padding: '10px 4px', 
                    textAlign: getColAlign(col.id) as any, 
                    border: `1px solid ${s.borderColor || '#000'}`,
                    fontSize: '9pt',
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    color: '#000',
                    fontWeight: (col.id === 'total' || col.id === 'item_name') ? '700' : '500',
                    boxSizing: 'border-box'
                  }}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
          {[...Array(Math.max(0, 8 - data.length))].map((_, i) => (
            <tr key={`fill-${i}`}>
              {activeCols.map(col => {
                const w = getColWidth(col.id);
                return (
                  <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w, padding: '10px 4px', border: `1px solid ${s.borderColor || '#000'}`, height: '32px', boxSizing: 'border-box' }}>&nbsp;</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- BASE LAYOUT COMPONENTS ---

export const ClassicLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.blue;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', fontSize: '11px', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fff' }}>
      <div style={{ background: s.primary, height: '4px', margin: '-32px -32px 20px -32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: s.primary, margin: 0, fontWeight: 900, fontSize: '20px' }}>PURCHASE ORDER</h1>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 'bold', margin: '0' }}>Acme Corp</p>
          <p style={{ opacity: 0.6, margin: 0 }}>PO-2026-X1</p>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
      <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: s.light, borderBottom: `2px solid ${s.primary}` }}>
              {activeCols.map(col => (
                <th key={col.id} style={{ padding: '8px 4px', color: s.primary, textAlign: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleItemsData.map(item => (
              <tr key={item.id}>
                {activeCols.map(col => (
                  <td key={col.id} style={{ padding: '8px 4px', textAlign: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getCellValue(col.id, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ModernLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.teal;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontSize: '11px', fontFamily: 'Outfit, sans-serif', backgroundColor: '#fff' }}>
      <div style={{ background: s.primary, padding: '20px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>OFFICIAL PO</span>
        <span style={{ opacity: 0.8 }}>#PO-2026-MODERN</span>
      </div>
      <div style={{ padding: '24px', flex: 1 }}>
        <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', tableLayout: 'auto' }}>
          <thead>
            <tr>
              {activeCols.map(col => (
                <th key={col.id} style={{ padding: '10px', color: s.primary, textAlign: 'center', backgroundColor: s.light, border: `1px solid ${s.primary}20` }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleItemsData.map(item => (
              <tr key={item.id}>
                {activeCols.map(col => (
                  <td key={col.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    {getCellValue(col.id, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MinimalLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.gray;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ padding: '40px', height: '100%', fontSize: '11px', fontFamily: 'Inter, sans-serif', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 200, letterSpacing: '4px', margin: '0 0 40px 0' }}>PURCHASE ORDER</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${s.primary}` }}>
            {activeCols.map(col => (
              <th key={col.id} style={{ padding: '12px 0', textAlign: 'center', fontWeight: 'bold' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleItemsData.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              {activeCols.map(col => (
                <td key={col.id} style={{ padding: '12px 0', textAlign: 'center' }}>
                  {getCellValue(col.id, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const IndustrialLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.slate;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ padding: '24px', height: '100%', fontSize: '10px', fontFamily: 'monospace', color: '#1e293b', border: '10px solid #f1f5f9' }}>
      <div style={{ display: 'flex', borderBottom: `2px dashed ${s.primary}`, paddingBottom: '12px', marginBottom: '12px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>INDUSTRIAL SPEC PO // {colorScheme.toUpperCase()}</p>
      </div>
      <table style={{ width: 'auto', minWidth: '100%', border: '2px solid #334155', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            {activeCols.map(col => (
              <th key={col.id} style={{ border: '2px solid #334155', padding: '6px', textAlign: 'center', textTransform: 'uppercase' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleItemsData.map(item => (
            <tr key={item.id}>
              {activeCols.map(col => (
                <td key={col.id} style={{ border: '1px solid #334155', padding: '6px', textAlign: 'center' }}>
                  {getCellValue(col.id, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CreativeLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.violet;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontSize: '11px', fontFamily: 'Quicksand, sans-serif' }}>
      <div style={{ height: '80px', background: `linear-gradient(90deg, ${s.primary}, ${s.accent})`, padding: '20px', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>CREATIVE LABS PROCUREMENT</h2>
      </div>
      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${s.primary}20` }}>
          <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead style={{ background: s.light }}>
              <tr>
                {activeCols.map(col => (
                  <th key={col.id} style={{ padding: '12px', color: s.primary, textAlign: 'center', fontWeight: 'bold' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleItemsData.map(item => (
                <tr key={item.id}>
                  {activeCols.map(col => (
                    <td key={col.id} style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      {getCellValue(col.id, item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CompactLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.emerald;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ padding: '16px', height: '100%', fontSize: '10px', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'right', borderBottom: `4px solid ${s.primary}`, paddingBottom: '8px', marginBottom: '16px' }}>
        <span style={{ fontWeight: 'bold', color: s.primary }}>COMPACT PO // 2026</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {activeCols.map(col => (
              <th key={col.id} style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleItemsData.map(item => (
            <tr key={item.id}>
              {activeCols.map(col => (
                <td key={col.id} style={{ border: '1px solid #eee', padding: '4px', textAlign: 'center' }}>
                  {getCellValue(col.id, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DetailedLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.indigo;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontSize: '11px', backgroundColor: '#fff' }}>
       <div style={{ display: 'flex', background: s.primary, color: '#fff', padding: '12px 24px' }}>
         <div style={{ flex: 1, fontWeight: 'bold' }}>DETAILED SPECIFICATION</div>
         <div style={{ opacity: 0.8 }}>TRX-2026-X8</div>
       </div>
       <div style={{ padding: '16px', flex: 1 }}>
         <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '1px solid #eee' }}>
            <thead style={{ background: s.light }}>
              <tr>
                {activeCols.map(col => (
                  <th key={col.id} style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: s.primary }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleItemsData.map(item => (
                <tr key={item.id}>
                  {activeCols.map(col => (
                    <td key={col.id} style={{ padding: '8px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      {getCellValue(col.id, item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export const GSTFullLayout: React.FC<LayoutProps> = ({ colorScheme, columns }) => {
  const s = schemeColors[colorScheme] || schemeColors.black;
  const activeCols = columns.filter(c => c.enabled);
  return (
    <div style={{ padding: '20px', height: '100%', fontSize: '10px', backgroundColor: '#fff', border: '1px solid #000' }}>
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
      </div>
      <table style={{ width: 'auto', minWidth: '100%', borderCollapse: 'collapse', border: '1px solid #000', tableLayout: 'auto' }}>
        <thead style={{ backgroundColor: `${s.primary}15`, color: s.primary }}>
          <tr>
            {activeCols.map(col => (
              <th key={col.id} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sampleItemsData.map(item => (
            <tr key={item.id}>
              {activeCols.map(col => (
                <td key={col.id} style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                  {getCellValue(col.id, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
