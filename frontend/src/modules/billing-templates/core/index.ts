export type BillSize = 'A4' | 'A5' | '58mm' | '80mm' | '1/4' | '1/5' | '1/6' | '1/7' | '1/8';

export interface TemplateField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'currency';
    required: boolean;
    visible: boolean;
    position: number;
    label?: string;
}

export interface CustomColumn {
    id: string;
    label: string;
    type: 'integer' | 'date' | 'text';
    required: boolean;
    capitalize?: boolean;
}

export interface TemplateSettings {
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    colorScheme: string;
    fontFamily: string;
    fontSize: number;
    titleFontSize?: number;
    showBorder: boolean;
    billSize: BillSize;
    billType?: string;
    headerHeight: number;
    footerHeight: number;
    logoUrl?: string;
    activeColumns: string[];
    requiredColumns?: string[];
    customColumns?: CustomColumn[];
    dynamicColumns?: any[]; // For data layer mapping
    columnLabels?: Record<string, string>;
    columnDataTypes?: Record<string, 'TEXT' | 'INTEGER' | 'DATE'>;
    columnCapitalized?: Record<string, boolean>;
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export interface InvoiceTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    billType?: string;
    complexity: 'basic' | 'standard' | 'advanced';
    preview?: string;
    isDefault?: boolean;
    isFavorite?: boolean;
    tags: string[];
    fields: TemplateField[];
    settings: TemplateSettings;
    folder?: string;
    subfolder?: string;
    createdAt: string;
    updatedAt: string;
}

// --- STRICT MASTER TEMPLATE CONFIG (PHASE 2) ---
export const SIZE_CONFIG: Record<BillSize, {
    templateId: string;
    minCols: number;
    maxCols: number;
    defaultCols: string[];
    recommendedTypes: string[];
    fontSize: string;
    titleSize: string;
    commonUses: string;
    widths: Record<string, string>;
}> = {
    'A4': {
        templateId: '1',
        minCols: 6,
        maxCols: 12,
        defaultCols: ["SR","Item Name","HSN","Qty","Rate","Unit","Disc","Tax","Amount"],
        recommendedTypes: ["Full-Format Invoice", "Utility Bills", "Tax Invoice", "Payroll Slip", "Insurance Statement", "Government Forms"],
        fontSize: '11px', titleSize: '28px',
        commonUses: 'Full-Format Invoice, Utility Bills, Tax Invoice',
        widths: { 'SR': '5%', 'Item Name': '25%', 'HSN': '10%', 'Qty': '8%', 'Rate': '10%', 'Unit': '8%', 'Disc': '8%', 'Tax': '10%', 'Amount': '15%' }
    },
    'A5': {
        templateId: '2',
        minCols: 6,
        maxCols: 8,
        defaultCols: ["SR","Item Name","Qty","Rate","Tax","Amount"],
        recommendedTypes: ["Half-Page Invoice", "Service & Repair Receipt", "Clinic Receipt", "Rental Billing", "Delivery Receipt", "Work Order Form"],
        fontSize: '10px', titleSize: '22px',
        commonUses: 'Half-Page Invoice, Clinic Receipt',
        widths: { 'SR': '8%', 'Item Name': '40%', 'Qty': '10%', 'Rate': '15%', 'Tax': '12%', 'Amount': '15%' }
    },
    '58mm': {
        templateId: '3',
        minCols: 3,
        maxCols: 4,
        defaultCols: ["Item","Qty","Rate","Total"],
        recommendedTypes: ["Mini Sales Receipt", "Mobile Delivery Receipt", "Courier Slip", "Taxi Fare Receipt", "Service Receipt", "ATM Mini Slip"],
        fontSize: '8.5px', titleSize: '12px',
        commonUses: 'Mobile thermal printers',
        widths: { 'Item': '45%', 'Qty': '15%', 'Rate': '20%', 'Total': '20%' }
    },
    '80mm': {
        templateId: '4',
        minCols: 4,
        maxCols: 5,
        defaultCols: ["Item","Qty","Rate","Tax","Total"],
        recommendedTypes: ["Sales Receipt", "Restaurant Order Receipt", "Delivery Receipt", "Parking Receipt", "Queue Ticket", "Refund Voucher"],
        fontSize: '10px', titleSize: '14px',
        commonUses: 'Standard thermal printers',
        widths: { 'Item': '40%', 'Qty': '12%', 'Rate': '18%', 'Tax': '12%', 'Total': '18%' }
    },
    '1/4': {
        templateId: '5',
        minCols: 1,
        maxCols: 3,
        defaultCols: ["Description","Qty","Total"],
        recommendedTypes: ["Standard Invoice (Medium)", "Service Invoice", "Medical Billing Statement", "Tuition Fee Statement", "Purchase Order", "Hotel Guest Statement"],
        fontSize: '10px', titleSize: '14px',
        commonUses: 'Medium slip formats',
        widths: { 'Description': '60%', 'Qty': '15%', 'Total': '25%' }
    },
    '1/5': {
        templateId: '6',
        minCols: 2,
        maxCols: 3,
        defaultCols: ["Description","Rate","Total"],
        recommendedTypes: ["Official Business Invoice", "Billing Statement", "Delivery Note", "Subscription Billing", "Government Fee Invoice", "Membership Form"],
        fontSize: '10px', titleSize: '14px',
        commonUses: 'Business billing forms',
        widths: { 'Description': '55%', 'Rate': '20%', 'Total': '25%' }
    },
    '1/6': {
        templateId: '7',
        minCols: 1,
        maxCols: 2,
        defaultCols: ["Item Name","Amount"],
        recommendedTypes: ["Compact Invoice", "Credit/Debit Memo", "Supplier Billing Sheet", "Booking Invoice", "Event Ticket Invoice", "Internal Billing Slip"],
        fontSize: '10px', titleSize: '13px',
        commonUses: 'Internal billing slips',
        widths: { 'Item Name': '65%', 'Amount': '35%' }
    },
    '1/7': {
        templateId: '8',
        minCols: 1,
        maxCols: 3,
        defaultCols: ["Details","Qty","Price"],
        recommendedTypes: ["Proforma Invoice", "Quotation Bill", "Estimate Sheet", "Progress Billing (milestone-wise)", "Subscription Plan Breakdown Invoice"],
        fontSize: '9px', titleSize: '12px',
        commonUses: 'Estimates & quotations',
        widths: { 'Details': '55%', 'Qty': '15%', 'Price': '30%' }
    },
    '1/8': {
        templateId: '9',
        minCols: 2,
        maxCols: 3,
        defaultCols: ["Description","Unit","Amount"],
        recommendedTypes: ["Payment Voucher", "Cash Voucher", "Delivery Stub", "Gate Pass Ticket", "Raffle Ticket", "Meal Coupon"],
        fontSize: '9px', titleSize: '11px',
        commonUses: 'Voucher & ticket stubs',
        widths: { 'Description': '55%', 'Unit': '20%', 'Amount': '25%' }
    }
};

export const BILL_SIZE_DIMENSIONS: Record<BillSize, { width: string; height: string }> = {
    'A4': { width: '210mm', height: '297mm' },
    'A5': { width: '148mm', height: '210mm' },
    '58mm': { width: '58mm', height: 'auto' },
    '80mm': { width: '80mm', height: 'auto' },
    '1/4': { width: '105mm', height: '148mm' },
    '1/5': { width: '105mm', height: '118mm' },
    '1/6': { width: '105mm', height: '99mm' },
    '1/7': { width: '80mm', height: '110mm' },
    '1/8': { width: '74mm', height: '105mm' }
};

export const BILL_SIZE_COLUMN_LIMITS: Record<BillSize, { default: number; max: number; min: number }> = Object.keys(SIZE_CONFIG).reduce((acc, key) => {
    acc[key as BillSize] = {
        min: SIZE_CONFIG[key as BillSize].minCols,
        max: SIZE_CONFIG[key as BillSize].maxCols,
        default: SIZE_CONFIG[key as BillSize].defaultCols.length
    };
    return acc;
}, {} as any);

export const BILL_SIZE_FONT_SIZES: Record<BillSize, { base: string; title: string }> = Object.keys(SIZE_CONFIG).reduce((acc, key) => {
    acc[key as BillSize] = { base: SIZE_CONFIG[key as BillSize].fontSize, title: SIZE_CONFIG[key as BillSize].titleSize };
    return acc;
}, {} as any);

export * from './mockData';
