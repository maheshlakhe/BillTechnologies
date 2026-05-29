
export enum InvoiceType {
  B2B = 'B2B',
  B2C_SMALL = 'B2C_SMALL',
  B2C_LARGE = 'B2C_LARGE',
  EXPORT = 'EXPORT',
  SEZ = 'SEZ'
}

export interface TaxItem {
  productId?: string;
  serviceId?: string;
  isService: boolean;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPerItem: number;
  gstRate: number;
  hsnCode?: string;
  isExempt?: boolean;
}

export interface TaxEngineInput {
  supplierStateCode?: string;
  customerGstin?: string;
  placeOfSupplyStateCode?: string;
  isExport?: boolean;
  isSez?: boolean;
  isReverseCharge?: boolean;
  isLutExport?: boolean;
  items: TaxItem[];
}

export interface CalculatedItem {
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface TaxEngineResult {
  invoiceType: InvoiceType;
  isInterstate: boolean;
  isReverseCharge: boolean;
  placeOfSupply: string;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  invoiceValue: number;
  calculatedItems: CalculatedItem[];
}

export class TaxEngine {
  static calculate(input: TaxEngineInput): TaxEngineResult {
    const {
      supplierStateCode,
      customerGstin,
      placeOfSupplyStateCode,
      isExport,
      isSez,
      isReverseCharge,
      isLutExport,
      items
    } = input;

    // Step 1: Determine Nature of Supply
    const isInterstate = isExport || isSez || (supplierStateCode !== placeOfSupplyStateCode);

    // Step 2: Determine Customer Type
    let invoiceType: InvoiceType = customerGstin ? InvoiceType.B2B : InvoiceType.B2C_SMALL;
    const totalTaxablePreliminary = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discountPerItem * item.quantity), 0);
    
    // Note: invoiceValue is needed for B2C Large but we don't have tax yet.
    // However, the rule says invoice_value > 250,000.
    // We'll calculate tax first and then re-evaluate type if needed, or use a threshold on taxable.
    // Actually, document says "if is_interstate AND invoice_value > 250000 -> B2C Large".

    // Step 3 & 4 & 5 & 6: Item Level Calculation
    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const calculatedItems: CalculatedItem[] = items.map(item => {
      const taxableValue = Math.round((item.quantity * item.unitPrice - (item.discountPerItem * item.quantity)) * 100) / 100;
      
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isReverseCharge || item.isExempt) {
        // Tax 0 on invoice
      } else if (isLutExport) {
        // Zero-rated
      } else if (isInterstate) {
        igst = Math.round((taxableValue * item.gstRate / 100) * 100) / 100;
      } else {
        cgst = Math.round((taxableValue * (item.gstRate / 2) / 100) * 100) / 100;
        sgst = Math.round((taxableValue * (item.gstRate / 2) / 100) * 100) / 100;
      }

      totalTaxableValue += taxableValue;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;

      return {
        taxableValue,
        gstRate: item.gstRate,
        cgst,
        sgst,
        igst
      };
    });

    // Step 7 & 8: Totals
    const totalTax = totalCgst + totalSgst + totalIgst;
    const invoiceValue = totalTaxableValue + totalTax;

    // Re-evaluate Invoice Type for B2C cases
    if (!customerGstin) {
      if (isInterstate && invoiceValue > 250000) {
        invoiceType = InvoiceType.B2C_LARGE;
      } else {
        invoiceType = InvoiceType.B2C_SMALL;
      }
    }
    
    if (isExport) invoiceType = InvoiceType.EXPORT;
    if (isSez) invoiceType = InvoiceType.SEZ;

    return {
      invoiceType,
      isInterstate,
      isReverseCharge: !!isReverseCharge,
      placeOfSupply: placeOfSupplyStateCode || '',
      totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalIgst: Math.round(totalIgst * 100) / 100,
      totalCess: 0, // Cess logic can be added if needed
      invoiceValue: Math.round(invoiceValue * 100) / 100,
      calculatedItems
    };
  }
}
