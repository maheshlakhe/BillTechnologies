import UniversalBillEngine from './UniversalBillEngine';
import ModernBlue from './ModernBlue';
import ClassicSharp from './ClassicSharp';
import CompactFoodie from './CompactFoodie';
import EducationStandard from './EducationStandard';
import TextileProA4 from './TextileProA4';
import MedicalPro from './MedicalPro';
import ConsultingPro from './ConsultingPro';
import FashionStyle from './FashionStyle';
import TechWarranty from './TechWarranty';
import FoodDineIn from './FoodDineIn';
import FastRetail from './FastRetail';
import KiranaThermal from './KiranaThermal';
import BoutiquePro from './BoutiquePro';
import A4Invoice from './A4Invoice';
import ProfessionalRed from './ProfessionalRed';

// New High-Fidelity A4 Templates
import { CommercialInvoiceA4 } from './templates/a4/CommercialInvoiceA4';
import { InventoryInvoiceA4 } from './templates/a4/InventoryInvoiceA4';
import { ConsultingInvoiceA4 } from './templates/a4/ConsultingInvoiceA4';
import { FreelanceInvoiceA4 } from './templates/a4/FreelanceInvoiceA4';
import { StandardInvoiceA4 } from './templates/a4/StandardInvoiceA4';
import { MinimalServiceInvoiceA4 } from './templates/a4/MinimalServiceInvoiceA4';
import { GSTFullInvoiceA4 } from './templates/dynamic/GSTFullInvoiceA4';
import { CommercialExportInvoiceA4 } from './templates/a4/CommercialExportInvoiceA4';
import { ProformaExportInvoiceA4 } from './templates/a4/ProformaExportInvoiceA4';
import { ProformaQuotationA4 } from './templates/a4/ProformaQuotationA4';

// Purchase Order Templates
import A4PurchaseOrderClassic from './A4PurchaseOrderClassic';
import A4PurchaseOrderModern from './A4PurchaseOrderModern';
import A4PurchaseOrderMinimal from './A4PurchaseOrderMinimal';
import POProfessionalA4 from './POProfessionalA4';
import POProfessionalRedA4 from './POProfessionalRedA4';
import POConsultingA4 from './POConsultingA4';
import POPharmacyA4 from './POPharmacyA4';
import EliteSignaturePO from './EliteSignaturePO';
import GradientFlowPO from './GradientFlowPO';
import IndustrialShadowPO from './IndustrialShadowPO';

import './InvoiceTemplates.css';

/**
 * Advanced Template Resolver
 */
export const getBillingTemplate = (id, sizeHint) => {
    const directMap = {
        // Core A4 Collection (Unique Designs)
        'gst_full_a4': GSTFullInvoiceA4,
        'commercial_a4': CommercialInvoiceA4,
        'inventory_a4': InventoryInvoiceA4,
        'consulting_a4': ConsultingInvoiceA4,
        'freelance_a4': FreelanceInvoiceA4,
        'minimal_service_a4': MinimalServiceInvoiceA4,
        'standard_a4': StandardInvoiceA4,
        'classic_tally_a4': A4Invoice,
        'professional_red_a4': ProfessionalRed,
        'export_commercial_a4': CommercialExportInvoiceA4,
        'export_proforma_a4': ProformaExportInvoiceA4,
        'proforma_quotation_a4': ProformaQuotationA4,
        
        // Size-Specific Styles
        'modern_blue_a5': ModernBlue,
        'classic_sharp_tax': ClassicSharp,
        'textile_pro': TextileProA4,
        'medical_pro': MedicalPro,
        
        // Thermal / Small Format
        'thermal_80mm': FastRetail,
        'thermal_58mm': KiranaThermal,
        
        // Purchase Orders (9 Premium Designs)
        'po_classic_pro': POProfessionalA4,
        'po_modern_exec': A4PurchaseOrderModern,
        'po_minimal_georgia': A4PurchaseOrderMinimal,
        'po_elite_signature': EliteSignaturePO,
        'po_gradient_flow': GradientFlowPO,
        'po_industrial_shadow': IndustrialShadowPO,
        'po_consulting_pro': POConsultingA4,
        'po_pharmacy_standard': POPharmacyA4,
        'po_professional_blue': POProfessionalA4, 
    };

    return directMap[id] || (id === 'default' ? directMap['thermal_58mm'] : UniversalBillEngine);
};

const FULL_COLS = ['S.No', 'Item Name', 'HSN', 'Qty', 'Unit', 'Rate', 'Tax', 'Discount', 'Amount'];
const TAX_COLS = ['S.No', 'Item Name', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount'];
const BASIC_COLS = ['S.No', 'Item Name', 'Qty', 'Rate', 'Amount'];
const THERMAL_COLS = ['Item Name', 'Qty', 'Rate', 'Amount'];

export const SUPPORTED_BILLING_FORMATS = [
    // SALES INVOICES (4 templates)
    { id: 'gst_full_a4', label: 'GST Master Invoice', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'Bill', subfolder: 'A4' },
    { id: 'standard_a4', label: 'Standard Business A4', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'Bill', subfolder: 'A4' },
    { id: 'commercial_a4', label: 'Commercial Business', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'Bill', subfolder: 'A4' },
    { id: 'classic_tally_a4', label: 'Classic Tally Style', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'Bill', subfolder: 'A4' },

    // PURCHASE ORDERS (4 templates)
    { id: 'po_classic_pro', label: 'Classic Professional PO', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'PO', subfolder: 'A4', description: 'Professional blue theme for elegant POs.' },
    { id: 'po_modern_exec', label: 'Modern Executive PO', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'PO', subfolder: 'A4', description: 'Professional teal theme for elegant POs.' },
    { id: 'po_minimal_georgia', label: 'Minimal Georgia PO', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'PO', subfolder: 'A4', description: 'Professional gray theme for elegant POs.' },
    { id: 'po_professional_blue', label: 'Professional Blue PO', size: 'A4', device: 'standard', supportedColumns: FULL_COLS, folder: 'PO', subfolder: 'A4', description: 'Professional blue theme for elegant POs.' },

    // RESTAURANT FORMATS (2 templates)
    { id: 'thermal_80mm', label: 'Restaurant Receipt (80mm)', size: '80mm', device: 'thermal', supportedColumns: THERMAL_COLS, folder: 'Bill', subfolder: '80mm' },
    { id: 'thermal_58mm', label: 'Restaurant Mini Receipt (58mm)', size: '58mm', device: 'thermal', supportedColumns: THERMAL_COLS, folder: 'Bill', subfolder: '58mm' },
];

export { UniversalBillEngine };
