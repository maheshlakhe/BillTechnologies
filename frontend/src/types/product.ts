
export interface Product {
    id: string;
    name: string;
    productCode?: string | null;
    barcode?: string | null;
    sku?: string | null;
    description?: string | null;
    category?: string | null;
    brand?: string | null;
    quantity?: number;
    unit?: string | null;
    
    // Pricing
    purchasePrice?: number;
    price: number; // selling_price
    mrp?: number;
    discount?: number;
    taxRate?: number; // tax_percent
    
    // Inventory
    stock?: number; // stock_quantity
    minStockLevel?: number; // minimum_stock
    warehouse?: string | null;
    supplierId?: string | null;
    
    // Status & Image
    status?: 'Active' | 'Inactive' | 'Draft' | 'Out Of Stock';
    imageUrl?: string | null;
    notes?: string | null;

    // Metadata
    customFields?: Record<string, any> | null;
    userId?: string;
    isLowStock?: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Legacy/Internal compatibility
    tax?: number;
    hsnCode?: string | null;
    expiryDate?: string | null;
    batchNumber?: string | null;
}
