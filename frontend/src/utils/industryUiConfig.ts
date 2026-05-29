// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY IDENTITY FLAGS
// Each flag is true ONLY for that specific industry.
// Use these to gate industry-specific features in any component.
//
// Example usage in a component:
//   const { layout } = useIndustryLayout();
//   if (!layout.isPharmacy) return null;  // ← pharmacy-only feature
//
// Never add restaurant features without && industryConf.isRestaurant
// Never add pharmacy features without && industryConf.isPharmacy
// ─────────────────────────────────────────────────────────────────────────────
export interface IndustryIdentity {
  isRestaurant:    boolean; // QR Menu, Kitchen, Waiter, Delivery Hub
  isPharmacy:      boolean; // Expiry dates, Batch numbers, Prescriptions, Drug invoices
  isHealthcare:    boolean; // Clinical records, Patient triage, Procedures
  isEducation:     boolean; // Courses, Student enrollment, Tuition receipts
  isRealEstate:    boolean; // Property listings, Booking receipts
  isLogistics:     boolean; // Freight invoices, Consignment tracking
  isManufacturing: boolean; // Production batches, Excise invoices, BOM
  isHospitality:   boolean; // Hotel room check-in, Suite folios (non-restaurant)
  isTextile:       boolean; // Fabric, Garment sizing, Colour variants
  isFmcg:          boolean; // Consumer goods, Wholesale invoices, Expiry
  isJewellery:     boolean; // Gold/Silver purity, HUID hallmark, Weight
  isServices:      boolean; // Professional service billing, Retainer invoices
  isGrocery:       boolean; // Fresh produce, POS scan, Storage temp
  isGym:           boolean; // Memberships, Trainer assignment, Session tracking
  isSalon:         boolean; // Appointments, Treatments, Stylist assignment
  isAutomobile:    boolean; // Job cards, Spare parts, Vehicle owner tracking
  isElectronics:   boolean; // IMEI, Serial number, Warranty tracking
  isHardware:      boolean; // Tool categories, Safety certs, Contractor billing
  isFurniture:     boolean; // Wood grade, Dimension variants, Polish shade
  isMobileShop:    boolean; // IMEI, Smartphones, Brand warranty
  isRetail:        boolean; // General retail (default catch-all for retail shops)
}

export interface IndustryUiConfig extends IndustryIdentity {
  productsLabel: string;
  billsLabel: string;
  customersLabel: string;
  isDetailedInventory: boolean; // Show Warehouses, Purchase Orders, Suppliers
  hideWarehouses?: boolean; // Optionally hide warehouses even if detailed inventory is true
  isServiceOriented: boolean;    // Show Services, Service Tickets
  quickActionLabel: string;
  iconName: string;
  customColumns: Array<{ name: string; label: string; type: string }>;
  
  // Premium Dynamic Layout & UI Styling parameters
  themeStyle: {
    primaryAccent: string;       // Primary theme color
    accentHover: string;         // Hover state color
    borderRadius: number;        // Border radius in px (Shape definition)
    componentShape: 'square' | 'rounded' | 'pill' | 'molded'; // Shape archetype
    cardSpacing: number;         // Layout spacing / padding scale
    formLayout: 'standard' | 'dense-grid' | 'spacious-split'; // Layout structure
    glassmorphism: boolean;      // Premium glass blur style
    shadowDepth: 'none' | 'subtle' | 'elevated' | 'glass'; // Elevation styles
    tableHeaderAlign: 'left' | 'center' | 'right'; // Header alignment
    primaryAlignment: 'left' | 'center'; // Page title alignments
  };
  
  // Tailored Business Dashboard Widget Setup
  dashboardWidgets: {
    primaryMetricCardSize: { xs: number; sm: number; md: number }; // Responsive Grid sizing
    specialtyWidget: 'table-occupancy' | 'patient-triage' | 'member-activity' | 'production-run' | 'student-intake' | 'standard-feed';
    quickActionShape: 'pill' | 'square' | 'circle';
    showQuickStats: boolean;
  };
}

// Base identity — all flags false (default for any unrecognized industry)
const NO_INDUSTRY: IndustryIdentity = {
  isRestaurant:    false,
  isPharmacy:      false,
  isHealthcare:    false,
  isEducation:     false,
  isRealEstate:    false,
  isLogistics:     false,
  isManufacturing: false,
  isHospitality:   false,
  isTextile:       false,
  isFmcg:          false,
  isJewellery:     false,
  isServices:      false,
  isGrocery:       false,
  isGym:           false,
  isSalon:         false,
  isAutomobile:    false,
  isElectronics:   false,
  isHardware:      false,
  isFurniture:     false,
  isMobileShop:    false,
  isRetail:        false,
};


export const getIndustryUiConfig = (slug?: string): IndustryUiConfig => {
  const defaultConf: IndustryUiConfig = {
    productsLabel: 'Products',
    billsLabel: 'Bills & Invoices',
    customersLabel: 'Customers',
    isDetailedInventory: true,
    isServiceOriented: false,
    ...NO_INDUSTRY,            // All industry flags default to false
    quickActionLabel: 'Create Invoice',
    iconName: 'store',
    customColumns: [],
    themeStyle: {
      primaryAccent: '#3b82f6',
      accentHover: '#2563eb',
      borderRadius: 12,
      componentShape: 'rounded',
      cardSpacing: 2,
      formLayout: 'standard',
      glassmorphism: false,
      shadowDepth: 'subtle',
      tableHeaderAlign: 'left',
      primaryAlignment: 'left'
    },
    dashboardWidgets: {
      primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
      specialtyWidget: 'standard-feed',
      quickActionShape: 'square',
      showQuickStats: true
    }
  };

  if (!slug) return defaultConf;

  switch (slug.toLowerCase()) {
    case 'restaurant':
      return {
        productsLabel: 'Menu Items',
        billsLabel: 'KOT & Tables',
        customersLabel: 'Guests',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isRestaurant: true,          // ← RESTAURANT ONLY
        quickActionLabel: 'New Dine-In Order',
        iconName: 'restaurant',
        customColumns: [
          { name: 'category', label: 'Dish Category', type: 'select' },
          { name: 'preparation_time', label: 'Prep Time (mins)', type: 'number' },
          { name: 'is_vegetarian', label: 'Vegetarian', type: 'boolean' }
        ],
        themeStyle: {
          primaryAccent: '#f59e0b',
          accentHover: '#d97706',
          borderRadius: 16,
          componentShape: 'rounded',
          cardSpacing: 3,
          formLayout: 'dense-grid',
          glassmorphism: true,
          shadowDepth: 'elevated',
          tableHeaderAlign: 'center',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'table-occupancy',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'pharmacy':
      return {
        productsLabel: 'Medicines & Drugs',
        billsLabel: 'Drug Invoices',
        customersLabel: 'Patients',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isPharmacy: true,            // ← PHARMACY ONLY
        quickActionLabel: 'Dispense Medicine',
        iconName: 'medical_services',
        customColumns: [
          { name: 'batch_number', label: 'Batch No.', type: 'text' },
          { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
          { name: 'generic_name', label: 'Generic Composition', type: 'text' },
          { name: 'requires_prescription', label: 'Rx Prescription Req.', type: 'boolean' }
        ],
        themeStyle: {
          primaryAccent: '#10b981',
          accentHover: '#059669',
          borderRadius: 8,
          componentShape: 'rounded',
          cardSpacing: 2,
          formLayout: 'spacious-split',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'patient-triage',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'healthcare':
      return {
        productsLabel: 'Packages & Procedures',
        billsLabel: 'Clinical Receipts',
        customersLabel: 'Patients',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isHealthcare: true,          // ← HEALTHCARE ONLY
        quickActionLabel: 'Record Consultation',
        iconName: 'healing',
        customColumns: [
          { name: 'service_type', label: 'Procedure Class', type: 'select' },
          { name: 'duration', label: 'Session Duration', type: 'text' },
          { name: 'lab_required', label: 'Lab Setup Required', type: 'boolean' }
        ],
        themeStyle: {
          primaryAccent: '#0d9488',
          accentHover: '#0f766e',
          borderRadius: 10,
          componentShape: 'rounded',
          cardSpacing: 2.5,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'elevated',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'patient-triage',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'education':
      return {
        productsLabel: 'Courses & Programs',
        billsLabel: 'Tuition Receipts',
        customersLabel: 'Students',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isEducation: true,           // ← EDUCATION ONLY
        quickActionLabel: 'Enroll Student',
        iconName: 'school',
        customColumns: [
          { name: 'course_duration', label: 'Duration', type: 'select' },
          { name: 'trainer_name', label: 'Instructor Name', type: 'text' },
          { name: 'batch_timing', label: 'Batch Timing', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#6366f1',
          accentHover: '#4f46e5',
          borderRadius: 10,
          componentShape: 'rounded',
          cardSpacing: 2,
          formLayout: 'standard',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'student-intake',
          quickActionShape: 'pill',
          showQuickStats: true
        }
      };
    case 'real-estate':
      return {
        productsLabel: 'Properties & Plots',
        billsLabel: 'Booking Receipts',
        customersLabel: 'Buyers & Tenants',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isRealEstate: true,          // ← REAL ESTATE ONLY
        quickActionLabel: 'New Property Booking',
        iconName: 'domain',
        customColumns: [
          { name: 'property_type', label: 'Property Class', type: 'select' },
          { name: 'property_size', label: 'Super Built Area (sqft)', type: 'text' },
          { name: 'floor_number', label: 'Floor Level', type: 'number' },
          { name: 'parking_available', label: 'Dedicated Parking', type: 'boolean' }
        ],
        themeStyle: {
          primaryAccent: '#7c2d12',
          accentHover: '#9a3412',
          borderRadius: 6,
          componentShape: 'square',
          cardSpacing: 3,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 12, md: 6 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'logistics':
      return {
        productsLabel: 'Shipping Routes',
        billsLabel: 'Freight Invoices',
        customersLabel: 'Consignors',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isLogistics: true,           // ← LOGISTICS ONLY
        quickActionLabel: 'Dispatch Consignment',
        iconName: 'local_shipping',
        customColumns: [
          { name: 'travel_type', label: 'Transport Mode', type: 'select' },
          { name: 'departure_location', label: 'Departure Port', type: 'text' },
          { name: 'arrival_location', label: 'Destination Port', type: 'text' }
        ],
        themeStyle: {
          primaryAccent: '#0284c7',
          accentHover: '#0369a1',
          borderRadius: 6,
          componentShape: 'square',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'center',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'manufacturing':
      return {
        productsLabel: 'Manufactured Parts',
        billsLabel: 'Excise Invoices',
        customersLabel: 'Distributors',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isManufacturing: true,       // ← MANUFACTURING ONLY
        quickActionLabel: 'Record Production Batch',
        iconName: 'precision_manufacturing',
        customColumns: [
          { name: 'quality_grade', label: 'Steel/Quality Grade', type: 'select' },
          { name: 'production_batch', label: 'Batch Code', type: 'text' },
          { name: 'industrial_standard', label: 'IS/EN Standard', type: 'text' }
        ],
        themeStyle: {
          primaryAccent: '#475569',
          accentHover: '#334155',
          borderRadius: 4,
          componentShape: 'square',
          cardSpacing: 1.5,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'none',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'production-run',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'hospitality':
      return {
        productsLabel: 'Stay Suites & Rooms',
        billsLabel: 'Suite Folios',
        customersLabel: 'Guests',
        isDetailedInventory: false,
        isServiceOriented: false,
        ...NO_INDUSTRY, isHospitality: true,         // ← HOSPITALITY (HOTEL) ONLY
        quickActionLabel: 'Check-In Guest',
        iconName: 'hotel',
        customColumns: [
          { name: 'room_type', label: 'Suite Type Class', type: 'select' },
          { name: 'check_in_time', label: 'Check-In Time', type: 'text' },
          { name: 'breakfast_included', label: 'Breakfast Included', type: 'boolean' }
        ],
        themeStyle: {
          primaryAccent: '#8b5cf6',
          accentHover: '#7c3aed',
          borderRadius: 24,
          componentShape: 'molded',
          cardSpacing: 4,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'center',
          primaryAlignment: 'center'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'table-occupancy',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'textile':
      return {
        productsLabel: 'Fabrics & Garments',
        billsLabel: 'Garment Invoices',
        customersLabel: 'Retail Buyers',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isTextile: true,             // ← TEXTILE ONLY
        quickActionLabel: 'Generate Sale Bill',
        iconName: 'checkroom',
        customColumns: [
          { name: 'size', label: 'Garment Size', type: 'select' },
          { name: 'color', label: 'Color Shade Code', type: 'text' },
          { name: 'fabric_type', label: 'Fabric Composition', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#db2777',
          accentHover: '#be185d',
          borderRadius: 14,
          componentShape: 'rounded',
          cardSpacing: 2.5,
          formLayout: 'dense-grid',
          glassmorphism: true,
          shadowDepth: 'elevated',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'fmcg':
      return {
        productsLabel: 'Consumer Goods',
        billsLabel: 'Wholesale Invoices',
        customersLabel: 'Retail Outlets',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isFmcg: true,               // ← FMCG ONLY
        quickActionLabel: 'Create FMCG Bill',
        iconName: 'fastfood',
        customColumns: [
          { name: 'weight', label: 'Net Weight', type: 'text' },
          { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
          { name: 'batch_number', label: 'Factory Batch No.', type: 'text' }
        ],
        themeStyle: {
          primaryAccent: '#059669',
          accentHover: '#047857',
          borderRadius: 8,
          componentShape: 'rounded',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'jewellery':
      return {
        productsLabel: 'Ornaments & Jewels',
        billsLabel: 'Metal Valuation Bills',
        customersLabel: 'Patrons',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isJewellery: true,           // ← JEWELLERY ONLY
        quickActionLabel: 'Generate Gold Invoice',
        iconName: 'workspace_premium',
        customColumns: [
          { name: 'purity', label: 'Gold Purity Karat', type: 'select' },
          { name: 'gross_weight', label: 'Gross Weight (Grams)', type: 'text' },
          { name: 'hallmark_number', label: 'HUID Hallmark No', type: 'text' }
        ],
        themeStyle: {
          primaryAccent: '#b45309',
          accentHover: '#92400e',
          borderRadius: 20,
          componentShape: 'rounded',
          cardSpacing: 3.5,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'center',
          primaryAlignment: 'center'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 12, md: 6 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'pill',
          showQuickStats: true
        }
      };
    case 'services':
      return {
        productsLabel: 'Professional Services',
        billsLabel: 'Service Invoices',
        customersLabel: 'Clients',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isServices: true,            // ← SERVICES ONLY
        quickActionLabel: 'Log Billing Service',
        iconName: 'business_center',
        customColumns: [
          { name: 'service_duration', label: 'Session Duration', type: 'text' },
          { name: 'service_type', label: 'Service Class', type: 'select' },
          { name: 'billing_type', label: 'Billing Frequency', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#2563eb',
          accentHover: '#1d4ed8',
          borderRadius: 10,
          componentShape: 'rounded',
          cardSpacing: 2.5,
          formLayout: 'standard',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'grocery':
      return {
        productsLabel: 'Produce & Provisions',
        billsLabel: 'Grocery Tickets',
        customersLabel: 'Shoppers',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isGrocery: true,             // ← GROCERY ONLY
        quickActionLabel: 'Scan Grocery Cart',
        iconName: 'local_grocery_store',
        customColumns: [
          { name: 'weight', label: 'Net Weight', type: 'text' },
          { name: 'packing_type', label: 'Packaging Type', type: 'select' },
          { name: 'storage_type', label: 'Storage Temperature', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#16a34a',
          accentHover: '#15803d',
          borderRadius: 12,
          componentShape: 'rounded',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'gym':
      return {
        productsLabel: 'Gym Memberships',
        billsLabel: 'Membership Receipts',
        customersLabel: 'Members',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isGym: true,                 // ← GYM ONLY
        quickActionLabel: 'Add Membership',
        iconName: 'fitness_center',
        customColumns: [
          { name: 'membership_duration', label: 'Subscription Plan', type: 'select' },
          { name: 'trainer_assigned', label: 'Personal Trainer Required', type: 'boolean' },
          { name: 'workout_type', label: 'Specialty Routine', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#dc2626',
          accentHover: '#b91c1c',
          borderRadius: 8,
          componentShape: 'pill',
          cardSpacing: 3,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'elevated',
          tableHeaderAlign: 'center',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'member-activity',
          quickActionShape: 'pill',
          showQuickStats: true
        }
      };
    case 'salon':
      return {
        productsLabel: 'Beauty Treatments',
        billsLabel: 'Stylist Receipts',
        customersLabel: 'Guests',
        isDetailedInventory: false,
        isServiceOriented: true,
        ...NO_INDUSTRY, isSalon: true,               // ← SALON ONLY
        quickActionLabel: 'Book Treatment',
        iconName: 'face',
        customColumns: [
          { name: 'service_duration', label: 'Session Duration', type: 'text' },
          { name: 'stylist_name', label: 'Hair Specialist', type: 'text' },
          { name: 'appointment_type', label: 'Specialty Class', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#ec4899',
          accentHover: '#db2777',
          borderRadius: 18,
          componentShape: 'rounded',
          cardSpacing: 3,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'center',
          primaryAlignment: 'center'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'member-activity',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'automobile':
      return {
        productsLabel: 'Automotive Spares',
        billsLabel: 'Job Cards & Invoices',
        customersLabel: 'Vehicle Owners',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isAutomobile: true,          // ← AUTOMOBILE ONLY
        quickActionLabel: 'Create Spares Invoice',
        iconName: 'directions_car',
        customColumns: [
          { name: 'serial_number', label: 'Manufacturer Part S/N', type: 'text' },
          { name: 'compatibility', label: 'Engine/Model Match', type: 'text' },
          { name: 'warranty_period', label: 'Warranty Period', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#e11d48',
          accentHover: '#be123c',
          borderRadius: 6,
          componentShape: 'square',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'production-run',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'electronics':
      return {
        productsLabel: 'Devices & Gadgets',
        billsLabel: 'Warranty Invoices',
        customersLabel: 'Buyers',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isElectronics: true,         // ← ELECTRONICS ONLY
        quickActionLabel: 'Dispense Device',
        iconName: 'devices',
        customColumns: [
          { name: 'serial_number', label: 'Unit Serial No. (S/N)', type: 'text' },
          { name: 'imei_number', label: 'Device IMEI (Sim Slot)', type: 'text' },
          { name: 'warranty_period', label: 'Warranty Period', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#0f172a',
          accentHover: '#1e293b',
          borderRadius: 12,
          componentShape: 'rounded',
          cardSpacing: 2.5,
          formLayout: 'spacious-split',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'production-run',
          quickActionShape: 'circle',
          showQuickStats: true
        }
      };
    case 'hardware':
      return {
        productsLabel: 'Hardware & Tools',
        billsLabel: 'Retail Receipts',
        customersLabel: 'Contractors',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isHardware: true,            // ← HARDWARE ONLY
        quickActionLabel: 'Log Tool Sale',
        iconName: 'construction',
        customColumns: [
          { name: 'tool_type', label: 'Tool Class Category', type: 'select' },
          { name: 'voltage_rating', label: 'Power Voltage (V)', type: 'select' },
          { name: 'safety_certification', label: 'Safety standard', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#ea580c',
          accentHover: '#c2410c',
          borderRadius: 4,
          componentShape: 'square',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: false,
          shadowDepth: 'subtle',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'furniture':
      return {
        productsLabel: 'Wood Furniture',
        billsLabel: 'Furniture Invoices',
        customersLabel: 'Patrons',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isFurniture: true,           // ← FURNITURE ONLY
        quickActionLabel: 'Log Suite Order',
        iconName: 'weekend',
        customColumns: [
          { name: 'material', label: 'Wood Grade/Material', type: 'select' },
          { name: 'size', label: 'Dimension Variant', type: 'select' },
          { name: 'color', label: 'Polish Shade Finish', type: 'text' }
        ],
        themeStyle: {
          primaryAccent: '#78350f',
          accentHover: '#451a03',
          borderRadius: 16,
          componentShape: 'rounded',
          cardSpacing: 3,
          formLayout: 'spacious-split',
          glassmorphism: false,
          shadowDepth: 'elevated',
          tableHeaderAlign: 'center',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'standard-feed',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    case 'mobile-shop':
      return {
        productsLabel: 'Smartphones & Access.',
        billsLabel: 'Smart Invoices',
        customersLabel: 'Buyers',
        isDetailedInventory: true,
        isServiceOriented: false,
        ...NO_INDUSTRY, isMobileShop: true,          // ← MOBILE SHOP ONLY
        quickActionLabel: 'Dispense Smartphone',
        iconName: 'phone_android',
        customColumns: [
          { name: 'imei_number', label: 'Primary IMEI Code', type: 'text' },
          { name: 'serial_number', label: 'Unit Serial No. (S/N)', type: 'text' },
          { name: 'warranty_period', label: 'Brand Warranty period', type: 'select' }
        ],
        themeStyle: {
          primaryAccent: '#06b6d4',
          accentHover: '#0891b2',
          borderRadius: 16,
          componentShape: 'rounded',
          cardSpacing: 2,
          formLayout: 'dense-grid',
          glassmorphism: true,
          shadowDepth: 'glass',
          tableHeaderAlign: 'left',
          primaryAlignment: 'left'
        },
        dashboardWidgets: {
          primaryMetricCardSize: { xs: 12, sm: 6, md: 4 },
          specialtyWidget: 'production-run',
          quickActionShape: 'square',
          showQuickStats: true
        }
      };
    default:
      return { ...defaultConf, isRetail: true };
  }
};


