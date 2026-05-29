export interface InvoiceColumn {
  id: string;
  label: string;
  section: 'product' | 'inventory' | 'taxation';
  enabled: boolean;
  width?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'commercial' | 'proforma' | 'tax' | 'retail' | 'service';
  thumbnail: string;
  isFavorite: boolean;
  columns: InvoiceColumn[];
  layout: 'classic' | 'modern' | 'minimal' | 'detailed' | 'gst-full' | 'bordered' | 'compact' | 'premium-a4';
  colorScheme: string;
}

export const DEFAULT_PRODUCT_COLUMNS: InvoiceColumn[] = [
  { id: 'item_name', label: 'Item Name', section: 'product', enabled: true },
  { id: 'description', label: 'Description', section: 'product', enabled: true },
  { id: 'hsn_code', label: 'HSN/SAC Code', section: 'product', enabled: false },
  { id: 'unit_price', label: 'Unit Price', section: 'product', enabled: true },
  { id: 'quantity', label: 'Quantity', section: 'product', enabled: true },
  { id: 'uom', label: 'Unit of Measure', section: 'product', enabled: false },
  { id: 'discount', label: 'Discount', section: 'product', enabled: true },
  { id: 'total', label: 'Total', section: 'product', enabled: true },
];

export const DEFAULT_INVENTORY_COLUMNS: InvoiceColumn[] = [
  { id: 'sku', label: 'SKU', section: 'inventory', enabled: true },
  { id: 'batch_no', label: 'Batch No.', section: 'inventory', enabled: false },
  { id: 'serial_no', label: 'Serial No.', section: 'inventory', enabled: false },
  { id: 'warehouse', label: 'Warehouse', section: 'inventory', enabled: false },
  { id: 'stock_qty', label: 'Stock Qty', section: 'inventory', enabled: true },
  { id: 'reorder_level', label: 'Reorder Level', section: 'inventory', enabled: false },
];

export const DEFAULT_TAXATION_COLUMNS: InvoiceColumn[] = [
  { id: 'tax_rate', label: 'Tax Rate (%)', section: 'taxation', enabled: true },
  { id: 'cgst', label: 'CGST', section: 'taxation', enabled: true },
  { id: 'sgst', label: 'SGST', section: 'taxation', enabled: true },
  { id: 'igst', label: 'IGST', section: 'taxation', enabled: false },
  { id: 'cess', label: 'Cess', section: 'taxation', enabled: false },
  { id: 'tax_amount', label: 'Tax Amount', section: 'taxation', enabled: true },
];

export const SAMPLE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'standard_a4',
    name: 'Standard Business Invoice',
    description: 'Traditional heavy-fidelity A4 layout for general business billing.',
    category: 'standard',
    thumbnail: 'classic',
    isFavorite: true,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'blue',
  },
  {
    id: 'commercial_a4',
    name: 'Commercial B2B Invoice',
    description: 'Professional high-fidelity A4 commercial invoice for bulk B2B transactions.',
    category: 'commercial',
    thumbnail: 'modern',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_INVENTORY_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'teal',
  },
  {
    id: 'consulting_a4',
    name: 'Consulting Professional Invoice',
    description: 'High-fidelity A4 consulting invoice with role-based rates and timesheet summary.',
    category: 'service',
    thumbnail: 'minimal',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'indigo',
  },
  {
    id: 'freelance_a4',
    name: 'Creative Freelance Invoice',
    description: 'High-fidelity A4 freelance layout with artistic branding and project focus.',
    category: 'service',
    thumbnail: 'minimal',
    isFavorite: true,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'rose',
  },
  {
    id: 'inventory_a4',
    name: 'Inventory Warehouse Invoice',
    description: 'High-fidelity A4 invoice with batch/serial tracking and warehouse details.',
    category: 'commercial',
    thumbnail: 'detailed',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_INVENTORY_COLUMNS.map(c => ({...c, enabled: true}))],
    layout: 'premium-a4',
    colorScheme: 'orange',
  },
  {
    id: 'minimal_service_a4',
    name: 'Minimal High-Fidelity Invoice',
    description: 'Clean, minimalist A4 service invoice with modern typography.',
    category: 'service',
    thumbnail: 'minimal',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'black',
  },
  {
    id: 'export_proforma_a4',
    name: 'Proforma Export Document',
    description: 'High-fidelity A4 proforma invoice with notify party and port details.',
    category: 'proforma',
    thumbnail: 'modern',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'blue',
  },
  {
    id: 'proforma_quotation_a4',
    name: 'Professional Proforma Quotation',
    description: 'High-fidelity A4 quotation format with sign-off and scope of work.',
    category: 'proforma',
    thumbnail: 'modern',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'blue',
  },
  {
    id: 'export_commercial_a4',
    name: 'Commercial Export Invoice',
    description: 'Full-fidelity A4 export invoice with HS codes and customs declarations.',
    category: 'commercial',
    thumbnail: 'bordered',
    isFavorite: true,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'premium-a4',
    colorScheme: 'black',
  },
  {
    id: 'gst_full_a4',
    name: 'GST Tax Invoice (Full)',
    description: 'Complete GST-compliant invoice with CGST/SGST/IGST breakdown.',
    category: 'tax',
    thumbnail: 'gst-full',
    isFavorite: false,
    columns: [...DEFAULT_PRODUCT_COLUMNS, ...DEFAULT_TAXATION_COLUMNS],
    layout: 'gst-full',
    colorScheme: 'black',
  },
];
