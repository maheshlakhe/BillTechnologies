import { InvoiceTemplate } from './index';

// Purged all legacy defaults as per Phase 1
// Restored default template to prevent crashes
// Master registry for mock templates - synchronized with SUPPORTED_BILLING_FORMATS
export const MOCK_TEMPLATES: InvoiceTemplate[] = [
    // SALES INVOICES (4 templates)
    {
      id: 'gst_full_a4', name: 'GST Master Invoice', description: 'Complete GST-compliant invoice with CGST/SGST/IGST breakdown.', category: 'Business', complexity: 'advanced', tags: ['GST', 'A4', 'Full'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#000000', fontFamily: 'Inter', fontSize: 10, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['Sr.', 'Product Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Amount', 'Disc.', 'Taxable', 'CGST', 'SGST', 'Total'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'standard_a4', name: 'Standard Business A4', description: 'The standard business invoice format.', category: 'Business', complexity: 'standard', tags: ['Standard', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#3b82f6', fontFamily: 'Inter', fontSize: 11, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'commercial_a4', name: 'Commercial Business', description: 'Clean, modern professional layout for standard business billing.', category: 'Business', complexity: 'standard', tags: ['Commercial', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#1e40af', fontFamily: 'Inter', fontSize: 11, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount'], margins: { top: 15, bottom: 15, left: 15, right: 15 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'classic_tally_a4', name: 'Classic Tally Style', description: 'Traditional Tally-like layout with boxed structures.', category: 'Business', complexity: 'advanced', tags: ['Classic', 'Tally', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#000000', fontFamily: 'Segoe UI', fontSize: 9, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount'], margins: { top: 5, bottom: 5, left: 5, right: 5 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // PURCHASE ORDERS (4 templates)
    {
      id: 'po_classic_pro', name: 'Classic Professional PO', description: 'Professional blue theme for elegant POs.', category: 'Purchase Order', complexity: 'standard', tags: ['PO', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#2563eb', fontFamily: 'Inter', fontSize: 11, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'po_modern_exec', name: 'Modern Executive PO', description: 'Professional teal theme for elegant POs.', category: 'Purchase Order', complexity: 'standard', tags: ['PO', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#0d9488', fontFamily: 'Inter', fontSize: 11, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'po_minimal_georgia', name: 'Minimal Georgia PO', description: 'Professional gray theme for elegant POs.', category: 'Purchase Order', complexity: 'standard', tags: ['PO', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#4b5563', fontFamily: 'Georgia', fontSize: 11, showBorder: false, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'po_professional_blue', name: 'Professional Blue PO', description: 'Professional blue theme for elegant POs.', category: 'Purchase Order', complexity: 'standard', tags: ['PO', 'A4'], fields: [],
      settings: { logoPosition: 'top-left', colorScheme: '#1e3a8a', fontFamily: 'Inter', fontSize: 11, showBorder: true, billSize: 'A4', headerHeight: 150, footerHeight: 100, activeColumns: ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'], margins: { top: 10, bottom: 10, left: 10, right: 10 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // RESTAURANT (2 templates)
    {
      id: 'thermal_80mm', name: 'Restaurant Receipt (80mm)', description: 'Standard POS receipt for 80mm thermal printers.', category: 'Restaurant', complexity: 'basic', tags: ['Thermal', '80mm', 'POS', 'Restaurant'], fields: [],
      settings: { logoPosition: 'top-center', colorScheme: '#000000', fontFamily: 'Monospace', fontSize: 10, showBorder: false, billSize: '80mm', headerHeight: 50, footerHeight: 50, activeColumns: ['Item Name', 'Qty', 'Amount'], margins: { top: 5, bottom: 5, left: 2, right: 2 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: 'thermal_58mm', name: 'Restaurant Mini Receipt (58mm)', description: 'Compact POS receipt for 58mm thermal printers.', category: 'Restaurant', complexity: 'basic', tags: ['Thermal', '58mm', 'POS', 'Restaurant'], fields: [],
      settings: { logoPosition: 'top-center', colorScheme: '#000000', fontFamily: 'Monospace', fontSize: 10, showBorder: false, billSize: '58mm', headerHeight: 50, footerHeight: 50, activeColumns: ['Item Name', 'Qty', 'Amount'], margins: { top: 5, bottom: 5, left: 2, right: 2 } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }
];

export const MOCK_BILL = {
  id: 'preview-123',
  billNumber: 'INV/2026/001',
  customerName: 'Sample Customer',
  createdAt: new Date().toISOString(),
  paymentMode: 'UPI',
  subtotal: 8150,
  taxAmount: 1467,
  totalAmount: 9617,
  items: [
    { productName: 'Professional Service', quantity: 1, price: 4500, taxRate: 18, total: 4500 },
    { productName: 'Consulting Fee', quantity: 2, price: 1200, taxRate: 18, total: 2400 },
    { productName: 'Technical Support', quantity: 5, price: 250, taxRate: 5, total: 1250 }
  ],
  user: {
    companyName: 'Your Business Name',
    address: 'Full Business Address, City, State, ZIP',
    gstNumber: '27AAAAA0000A1Z5',
    phone: '+91 00000 00000',
    bankName: 'YOUR BANK NAME',
    accountNumber: 'XXXXXXXXXXXXXX',
    ifscCode: 'IFSC0000000',
    upiId: 'business@upi'
  }
} as any;

export const MOCK_PO = {
    // Buyer (Bill From)
    storeName: 'Elite Solutions Pvt Ltd',
    storeAddress: '123 Techno Park, Sector 5, Bangalore - 560001',
    storeGSTIN: '29ABCDE1234F1Z5',
    storeEmail: 'billing@elitesolutions.com',
    storePhone: '+91 98765 43210',

    // PO Details
    billNo: 'PO/2026/1024',
    billDate: '13-Apr-2026',
    deliveryPeriod: '15 Days',
    placeOfSupply: 'Karnataka',
    paymentTerms: '30 Days from Invoice Date',
    paymentMode: 'Bank Transfer',

    // Project info
    projectName: 'Datacenter Expansion',
    scopeOfWork: 'AWS infrastructure setup, CI/CD pipeline configuration, and performance optimization',
    engagementType: 'Time & Material (Hourly Billing)',

    // Supplier (Vendor)
    customerName: 'Global Nexus Corp',
    customerAddress: '456 Business Square, Mumbai - 400001',
    customerGSTIN: '27XYZAB5678K1Z2',
    customerEmail: 'procurement@globalnexus.com',
    customerPhone: '+91 91234 56780',

    // Bank Details (Supplier side for PO)
    bankName: 'HDFC Bank',
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    branchName: 'Mumbai',
    accountName: 'XYZ Consulting Services LLP',

    // Items
    items: [
        { name: 'Industrial Server Rack', qty: 2, rate: 45000, total: 90000, taxRate: 18, unit: 'PCS' },
        { name: 'Cat6 Enterprise Cable (300m)', qty: 5, rate: 8500, total: 42500, taxRate: 18, unit: 'Rolls' },
        { name: 'L3 Managed Switch', qty: 3, rate: 12000, total: 36000, taxRate: 18, unit: 'PCS' }
    ],
    subtotal: 168500,
    taxAmount: 30330,
    totalAmount: 198830,
    
    // Summary breakdown
    summary: {
        basicTotal: 168500,
        cgst: 15165,
        sgst: 15165,
        grandTotal: 198830
    },

    // Terms
    terms: [
        'All services will be delivered as per agreed scope and timelines.',
        'Invoice must reference this Purchase Order Number.',
        'Any additional work outside scope will require written approval.',
        'Payment will be released within 30 days of invoice submission.',
        'Applicable taxes will be charged as per GST regulations.',
    ],
} as any;
