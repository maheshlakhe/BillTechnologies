export interface IndustryConfig {
    name: string;
    slug: string;
    icon: string;
    themeColor: string;
    description: string;
    features: string[];
    billSize: 'Thermal' | 'A5' | 'A4';
    dynamicFields?: {
        entity: string;
        name: string;
        label: string;
        dataType: string;
        required: boolean;
        options?: string[];
    }[];
}

export const INDUSTRIES: IndustryConfig[] = [
    {
        name: 'Restaurant',
        slug: 'restaurant',
        icon: 'Restaurant',
        themeColor: '#ff4757',
        description: 'Comprehensive restaurant management with table booking, KOT, and recipe management.',
        features: ['Table Management', 'KOT Printing', 'Menu Management', 'Inventory Tracking'],
        billSize: 'Thermal',
        dynamicFields: [
            { entity: 'bill', name: 'table_no', label: 'Table Number', dataType: 'text', required: true },
            { entity: 'bill', name: 'waiter_name', label: 'Waiter Name', dataType: 'text', required: false }
        ]
    },
    {
        name: 'Pharmacy',
        slug: 'pharmacy',
        icon: 'LocalPharmacy',
        themeColor: '#2ed573',
        description: 'Advanced pharmacy management with expiry tracking, drug license compliance, and batch management.',
        features: ['Expiry Tracking', 'Drug License Compliance', 'Batch Management', 'Prescription Management'],
        billSize: 'A5',
        dynamicFields: [
            { entity: 'product', name: 'prescription_required', label: 'Prescription Required', dataType: 'boolean', required: false },
            { entity: 'product', name: 'drug_license_no', label: 'Drug License No.', dataType: 'text', required: false }
        ]
    },
    {
        name: 'Automobile',
        slug: 'automobile',
        icon: 'DirectionsCar',
        themeColor: '#ffa502',
        description: 'Streamlined automobile service and parts management with vehicle tracking.',
        features: ['Vehicle Tracking', 'Service History', 'Spare Parts Inventory', 'Job Cards'],
        billSize: 'A4',
        dynamicFields: [
            { entity: 'product', name: 'engine_no', label: 'Engine Number', dataType: 'text', required: true },
            { entity: 'product', name: 'chassis_no', label: 'Chassis Number', dataType: 'text', required: true }
        ]
    },
    {
        name: 'Retail',
        slug: 'retail',
        icon: 'Storefront',
        themeColor: '#3742fa',
        description: 'All-in-one retail management for general stores, boutiques, and supermarkets.',
        features: ['POS Billing', 'Inventory Control', 'Customer Loyalty', 'GST Compliance'],
        billSize: 'Thermal'
    },
    {
        name: 'Electronics',
        slug: 'electronics',
        icon: 'Devices',
        themeColor: '#70a1ff',
        description: 'Tech-focused inventory management with IMEI/Serial number tracking.',
        features: ['IMEI Tracking', 'Warranty Management', 'Serial Number Tracking', 'Service Support'],
        billSize: 'A5'
    },
    {
        name: 'Healthcare',
        slug: 'healthcare',
        icon: 'HealthAndSafety',
        themeColor: '#ff6b81',
        description: 'Patient records, appointment scheduling, and clinic billing.',
        features: ['Patient Records', 'Appointment Booking', 'Prescription Billing', 'Lab Integration'],
        billSize: 'A4'
    },
    {
        name: 'Education',
        slug: 'education',
        icon: 'School',
        themeColor: '#5352ed',
        description: 'Fee management, student records, and library tracking.',
        features: ['Fee Management', 'Student Records', 'Exam Management', 'Attendance Tracking'],
        billSize: 'A4'
    },
    {
        name: 'Real Estate',
        slug: 'real-estate',
        icon: 'HomeWork',
        themeColor: '#2f3542',
        description: 'Property listings, lead management, and installment tracking.',
        features: ['Property Listings', 'Lead Tracking', 'Payment Schedules', 'Agent Management'],
        billSize: 'A4'
    },
    {
        name: 'Logistics',
        slug: 'logistics',
        icon: 'LocalShipping',
        themeColor: '#ffa502',
        description: 'Fleet management, shipment tracking, and delivery optimization.',
        features: ['Fleet Management', 'Shipment Tracking', 'Route Optimization', 'Vendor Billing'],
        billSize: 'A4'
    },
    {
        name: 'Manufacturing',
        slug: 'manufacturing',
        icon: 'PrecisionManufacturing',
        themeColor: '#57606f',
        description: 'Production planning, raw material tracking, and quality control.',
        features: ['Production Planning', 'Raw Material Tracking', 'BOM Management', 'Quality Control'],
        billSize: 'A4'
    },
    {
        name: 'Hospitality',
        slug: 'hospitality',
        icon: 'Hotel',
        themeColor: '#e67e22',
        description: 'Room booking, guest management, and facility billing.',
        features: ['Room Booking', 'Guest Management', 'Service Billing', 'Check-in/Out'],
        billSize: 'A4'
    },
    {
        name: 'Textile',
        slug: 'textile',
        icon: 'Checkroom',
        themeColor: '#9b59b6',
        description: 'Apparel management with size/color variants and fabric tracking.',
        features: ['Variant Management', 'Fabric Tracking', 'Designer Workflow', 'Wholesale Billing'],
        billSize: 'A5',
        dynamicFields: [
            { entity: 'product', name: 'fabric_type', label: 'Fabric Type', dataType: 'select', required: false, options: ['Cotton', 'Silk', 'Polyester', 'Wool', 'Linen'] },
            { entity: 'product', name: 'size_chart', label: 'Size Chart', dataType: 'text', required: false }
        ]
    },
    {
        name: 'FMCG',
        slug: 'fmcg',
        icon: 'ShoppingBasket',
        themeColor: '#27ae60',
        description: 'Fast-moving consumer goods distribution and retail management.',
        features: ['Distribution Network', 'Batch Tracking', 'Sales Route Management', 'Scheme Management'],
        billSize: 'A4'
    },
    {
        name: 'Jewellery',
        slug: 'jewellery',
        icon: 'Diamond',
        themeColor: '#f1c40f',
        description: 'Jewellery shop management with gold rates, purity tracking, and hallmark compliance.',
        features: ['Live Gold Rates', 'Purity Tracking', 'Hallmark Compliance', 'Weight-based Pricing'],
        billSize: 'A5'
    },
    {
        name: 'Services',
        slug: 'services',
        icon: 'Engineering',
        themeColor: '#34495e',
        description: 'Service-based business management with job cards and technician tracking.',
        features: ['Job Card System', 'Technician Tracking', 'Service Contracts', 'AMC Management'],
        billSize: 'A4'
    },
    {
        name: 'Grocery',
        slug: 'grocery',
        icon: 'LocalGroceryStore',
        themeColor: '#2ecc71',
        description: 'Fast-paced grocery billing with barcode scanning and stock alerts.',
        features: ['Barcode Billing', 'Low Stock Alerts', 'Home Delivery', 'Vendor Management'],
        billSize: 'Thermal'
    },
    {
        name: 'Gym & Fitness',
        slug: 'gym',
        icon: 'FitnessCenter',
        themeColor: '#c0392b',
        description: 'Member management, subscription tracking, and attendance.',
        features: ['Member Management', 'Subscription Tracking', 'Attendance System', 'Trainer Management'],
        billSize: 'A5'
    },
    {
        name: 'Salon & Spa',
        slug: 'salon',
        icon: 'ContentCut',
        themeColor: '#d35400',
        description: 'Appointment booking, stylist management, and service billing.',
        features: ['Appointment Booking', 'Stylist Management', 'Service Packages', 'Product Sales'],
        billSize: 'Thermal'
    },
    {
        name: 'Hardware',
        slug: 'hardware',
        icon: 'Handyman',
        themeColor: '#7f8c8d',
        description: 'Hardware store management with multi-unit tracking and project billing.',
        features: ['Multi-unit Tracking', 'Project Billing', 'Supplier Management', 'Inventory Control'],
        billSize: 'A5'
    },
    {
        name: 'Furniture',
        slug: 'furniture',
        icon: 'Chair',
        themeColor: '#8e44ad',
        description: 'Furniture showroom management with custom orders and delivery tracking.',
        features: ['Custom Orders', 'Delivery Tracking', 'Showroom Inventory', 'Installment Plans'],
        billSize: 'A4'
    },
    {
        name: 'Mobile Shop',
        slug: 'mobile-shop',
        icon: 'Smartphone',
        themeColor: '#2980b9',
        description: 'Specialized mobile shop management with IMEI tracking and accessory inventory.',
        features: ['IMEI/Serial Tracking', 'Accessory Management', 'Repair Service', 'Warranty Support'],
        billSize: 'Thermal'
    }
];
