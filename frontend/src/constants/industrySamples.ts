import { Product } from '../types/product';

export const INDUSTRY_SAMPLES: Record<string, Partial<Product>> = {
  restaurant: {
    name: 'Butter Chicken Full',
    description: 'Creamy tomato-based chicken curry. Serves 2-3.',
    price: 450 as any,
    sku: 'REST-BC-01',
    customFields: { food_type: 'Non-Veg', spice_level: 'Medium', preparation_time: '20 mins', serving_size: 'Full' }
  },
  pharmacy: {
    name: 'Amoxicillin 500mg',
    description: 'Antibiotic for bacterial infections.',
    price: 120 as any,
    sku: 'PHAR-AMX-500',
    customFields: { medicine_type: 'Tablet', batch_number: 'B-2024-99', prescription_required: 'true', dosage: '500mg', manufacturer: 'Cipla' }
  },
  automobile: {
    name: 'Brake Pad Set - Front',
    description: 'High-performance ceramic brake pads.',
    price: 3500 as any,
    sku: 'AUTO-BP-FR',
    customFields: { engine_number: 'E12345', chassis_number: 'CH9988', fuel_type: 'Petrol', vehicle_color: 'Standard' }
  },
  retail: {
    name: 'Premium Leather Wallet',
    description: 'Genuine leather bifold wallet with RFID protection.',
    price: 1200 as any,
    sku: 'RET-WAL-01',
    customFields: { material: 'Leather', color: 'Brown', brand: 'BillSoft Originals' }
  },
  electronics: {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones.',
    price: 24990 as any,
    sku: 'ELEC-SONY-M5',
    customFields: { serial_number: 'SN-778899', imei_number: 'N/A', model_number: 'WH-1000XM5', warranty_period: '1 Year' }
  },
  healthcare: {
    name: 'Health Checkup Package',
    description: 'Complete blood count, sugar, and lipid profile.',
    price: 1500 as any,
    sku: 'HC-PACK-BASIC',
    customFields: { service_type: 'Diagnostic', duration: '30 mins', lab_required: 'true' }
  },
  education: {
    name: 'Full Stack Dev Course',
    description: '6-month comprehensive coding bootcamp.',
    price: 45000 as any,
    sku: 'EDU-FSD-06',
    customFields: { course_duration: '6 Months', trainer_name: 'Dr. Shubham', batch_timing: 'Evening', certificate_included: 'true' }
  },
  'real-estate': {
    name: '2BHK Luxury Apartment',
    description: 'Spacious apartment with park view.',
    price: 7500000 as any,
    sku: 'RE-APT-2BHK',
    customFields: { property_type: 'Residential', property_size: '1200 sqft', floor_number: '5', parking_available: 'true' }
  },
  logistics: {
    name: 'Express Shipping - Int',
    description: 'International priority shipping service.',
    price: 5000 as any,
    sku: 'LOG-EXP-INT',
    customFields: { travel_type: 'Air', departure_location: 'Mumbai', arrival_location: 'London' }
  },
  manufacturing: {
    name: 'Steel Rods 12mm',
    description: 'High tensile strength steel rods for construction.',
    price: 55000 as any,
    sku: 'MFG-ST-12',
    customFields: { quality_grade: 'FE500', production_batch: 'BATCH-404', industrial_standard: 'IS 1786' }
  },
  hospitality: {
    name: 'Deluxe Room Stay',
    description: 'One night stay with breakfast and WiFi.',
    price: 5500 as any,
    sku: 'HOSP-ROOM-DLX',
    customFields: { room_type: 'Deluxe', check_in_time: '12:00 PM', breakfast_included: 'true' }
  },
  textile: {
    name: 'Cotton Polo T-Shirt',
    description: '100% organic cotton polo t-shirt.',
    price: 850 as any,
    sku: 'TEX-POLO-CTN',
    customFields: { size: 'Large', color: 'Navy Blue', fabric_type: 'Cotton', pattern: 'Solid' }
  },
  fmcg: {
    name: 'Organic Wheat Flour 5kg',
    description: 'Stone-ground organic whole wheat flour.',
    price: 350 as any,
    sku: 'FMCG-WHT-5',
    customFields: { weight: '5kg', expiry_date: '2024-12-31', batch_number: 'B-FMCG-01', fssai_number: '1234567890' }
  },
  jewellery: {
    name: 'Diamond Engagement Ring',
    description: '18K White Gold with 0.5 carat diamond.',
    price: 85000 as any,
    sku: 'JW-RING-DIM',
    customFields: { purity: '18K', gross_weight: '4g', hallmark_number: 'HM-112233', stone_certificate: 'GIA' }
  },
  services: {
    name: 'AC Service & Repair',
    description: 'Complete cleaning and gas refill for Split AC.',
    price: 1500 as any,
    sku: 'SERV-AC-01',
    customFields: { service_duration: '2 Hours', assigned_employee: 'Technician A', service_type: 'Maintenance' }
  },
  grocery: {
    name: 'Basmati Rice 10kg',
    description: 'Long grain aged basmati rice.',
    price: 1100 as any,
    sku: 'GROC-RICE-10',
    customFields: { weight: '10kg', packing_type: 'Bag', batch_number: 'BR-2024', expiry_date: '2025-06-01' }
  },
  gym: {
    name: 'Annual Gold Membership',
    description: 'Unlimited gym access with personal trainer.',
    price: 18000 as any,
    sku: 'GYM-GOLD-ANN',
    customFields: { membership_duration: '1 Year', trainer_assigned: 'Yes', diet_plan: 'Included' }
  },
  salon: {
    name: 'Bridal Makeup Package',
    description: 'HD makeup with hair styling and draping.',
    price: 15000 as any,
    sku: 'SAL-BRIDE-01',
    customFields: { service_duration: '4 Hours', stylist_name: 'Lead Stylist', appointment_type: 'Bridal' }
  },
  hardware: {
    name: 'Electric Drill Machine',
    description: '750W impact drill with variable speed.',
    price: 4500 as any,
    sku: 'HW-DRILL-750',
    customFields: { tool_type: 'Power Tool', voltage_rating: '230V', safety_certification: 'CE' }
  },
  furniture: {
    name: 'King Size Teak Bed',
    description: 'Handcrafted teak wood bed with storage.',
    price: 45000 as any,
    sku: 'FURN-BED-KING',
    customFields: { material: 'Teak Wood', size: 'King', color: 'Natural Finish' }
  },
  'mobile-shop': {
    name: 'Galaxy S24 Ultra',
    description: 'AI-powered flagship smartphone.',
    price: 129999 as any,
    sku: 'MOB-SAM-S24U',
    customFields: { imei_number: '351234567890123', serial_number: 'SAM-S24U-01', warranty_period: '1 Year' }
  }
};
