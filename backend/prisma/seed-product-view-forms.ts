import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formsData = [
  {
    slug: 'restaurant',
    sections: [
      {
        id: 'general',
        title: 'General Information',
        fields: [
          { name: 'name', label: 'Dish / Item Name', dataType: 'text', required: true },
          { name: 'sku', label: 'Item Code', dataType: 'text' },
          { name: 'category', label: 'Category', dataType: 'select', options: ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Uncategorized'] },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Dish Description', dataType: 'textarea' },
          { name: 'imageUrl', label: 'Dish Image URL', dataType: 'image' }
        ]
      },
      {
        id: 'price',
        title: 'Pricing & Taxes',
        fields: [
          { name: 'price', label: 'Selling Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'MRP (Inclusive)', dataType: 'number' },
          { name: 'discount', label: 'Item Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'GST Rate (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Kitchen & Portion Details',
        fields: [
          { name: 'stock', label: 'Available Portions', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Low Portion Threshold', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Restaurant & Recipe Controls',
        fields: [
          { name: 'food_type', label: 'Food Type', dataType: 'select', options: ['Veg', 'Non Veg', 'Vegan', 'Jain'] },
          { name: 'spice_level', label: 'Spice Level', dataType: 'select', options: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'] },
          { name: 'preparation_time', label: 'Preparation Time (e.g. 15 mins)', dataType: 'text' },
          { name: 'serving_size', label: 'Serving Size', dataType: 'select', options: ['Half', 'Full', 'Family Pack'] },
          { name: 'order_type', label: 'Order Support', dataType: 'select', options: ['Dine In', 'Takeaway', 'Delivery'] }
        ]
      }
    ]
  },
  {
    slug: 'pharmacy',
    sections: [
      {
        id: 'general',
        title: 'Medical Registry',
        fields: [
          { name: 'name', label: 'Medicine Brand Name', dataType: 'text', required: true },
          { name: 'sku', label: 'SKU / Barcode', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Medical Composition / Salt Name', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Commercial Details',
        fields: [
          { name: 'price', label: 'Retail Price (Strip)', dataType: 'number', required: true },
          { name: 'mrp', label: 'Max Retail Price (MRP)', dataType: 'number' },
          { name: 'discount', label: 'Patient Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'GST Tax (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Drug Safety Batch & Expiry',
        fields: [
          { name: 'stock', label: 'Available Strip Count', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Alert Level', dataType: 'number' },
          { name: 'batch_number', label: 'Manufacturing Batch Code', dataType: 'text' },
          { name: 'expiryDate', label: 'Expiry Date', dataType: 'date' }
        ]
      },
      {
        id: 'custom',
        title: 'Healthcare & Regulatory Controls',
        fields: [
          { name: 'medicine_type', label: 'Formulation Form', dataType: 'select', options: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Powder'] },
          { name: 'schedule_type', label: 'Schedule Category', dataType: 'select', options: ['OTC', 'Schedule H', 'Schedule X'] },
          { name: 'prescription_required', label: 'Prescription Required (Rx)', dataType: 'boolean' },
          { name: 'dosage', label: 'Dosage Concentration (e.g. 500mg)', dataType: 'text' },
          { name: 'manufacturer', label: 'Pharmaceutical Manufacturer', dataType: 'text' },
          { name: 'storage', label: 'Storage Precaution', dataType: 'select', options: ['Cool Place', 'Refrigerated', 'Avoid Sunlight'] }
        ]
      }
    ]
  },
  {
    slug: 'automobile',
    sections: [
      {
        id: 'general',
        title: 'Spares & Vehicle Registry',
        fields: [
          { name: 'name', label: 'Part / Vehicle Model Name', dataType: 'text', required: true },
          { name: 'sku', label: 'OEM Part / Catalog Number', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Technical Specifications', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Pricing Matrix',
        fields: [
          { name: 'price', label: 'Selling Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'MRP List Price', dataType: 'number' },
          { name: 'discount', label: 'Dealer Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Auto Parts GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Warehouse Rack Control',
        fields: [
          { name: 'stock', label: 'Units On Hand', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Reorder Point', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Automobile Engine & Spec Fields',
        fields: [
          { name: 'engine_number', label: 'Engine Number', dataType: 'text' },
          { name: 'chassis_number', label: 'Chassis Number (VIN)', dataType: 'text' },
          { name: 'fuel_type', label: 'Fuel Intake', dataType: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'] },
          { name: 'vehicle_color', label: 'Paint/Color Finish', dataType: 'text' },
          { name: 'vehicle_type', label: 'Body Style', dataType: 'select', options: ['Bike', 'Car', 'Truck', 'Bus'] },
          { name: 'transmission', label: 'Transmission System', dataType: 'select', options: ['Manual', 'Automatic'] },
          { name: 'ownership', label: 'Previous Ownership', dataType: 'select', options: ['First Owner', 'Second Owner', 'Third Owner'] }
        ]
      }
    ]
  },
  {
    slug: 'retail',
    sections: [
      {
        id: 'general',
        title: 'Apparel & Product Catalog',
        fields: [
          { name: 'name', label: 'Apparel Name', dataType: 'text', required: true },
          { name: 'sku', label: 'UPC Barcode / SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Product Narrative', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Billing Parameters',
        fields: [
          { name: 'price', label: 'Retail price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Tag MRP', dataType: 'number' },
          { name: 'discount', label: 'Promo Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'GST Code (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Retail Store Stock',
        fields: [
          { name: 'stock', label: 'Pcs in Stock', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Safety Margin Pcs', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Fashion Garment Variants',
        fields: [
          { name: 'size', label: 'Garment Size', dataType: 'select', options: ['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL'] },
          { name: 'color', label: 'Color Shade', dataType: 'text' },
          { name: 'material', label: 'Fabric Composition (e.g. Leather)', dataType: 'text' },
          { name: 'brand', label: 'Brand Label', dataType: 'text' },
          { name: 'gender', label: 'Target Category', dataType: 'select', options: ['Men', 'Women', 'Kids', 'Unisex'] },
          { name: 'fabric', label: 'Fabric Weave', dataType: 'select', options: ['Cotton', 'Silk', 'Denim', 'Polyester', 'Wool', 'Linen'] },
          { name: 'fit_type', label: 'Fit Type', dataType: 'select', options: ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed Fit'] }
        ]
      }
    ]
  },
  {
    slug: 'electronics',
    sections: [
      {
        id: 'general',
        title: 'Hardware Registry',
        fields: [
          { name: 'name', label: 'Device Model Title', dataType: 'text', required: true },
          { name: 'sku', label: 'SKU / Barcode', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Technical Specs Summary', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Invoice Details',
        fields: [
          { name: 'price', label: 'Offer Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'List MRP', dataType: 'number' },
          { name: 'discount', label: 'Flat Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Electronics GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Serial Control & Stock',
        fields: [
          { name: 'stock', label: 'Units Stock', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Threshold Stock', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'IMEI, Serial & Appliance Specs',
        fields: [
          { name: 'serial_number', label: 'Unit Serial Number (S/N)', dataType: 'text' },
          { name: 'imei_number', label: 'IMEI Code (Mobile Only)', dataType: 'text' },
          { name: 'model_number', label: 'Manufacturer Model Number', dataType: 'text' },
          { name: 'warranty_period', label: 'Warranty Period', dataType: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years', '5 Years'] },
          { name: 'brand', label: 'Appliance Brand', dataType: 'select', options: ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo'] },
          { name: 'power_type', label: 'Power Supply', dataType: 'select', options: ['Battery', 'Electric', 'Solar', 'Hybrid'] },
          { name: 'condition', label: 'Functional Condition', dataType: 'select', options: ['New', 'Refurbished', 'Used'] }
        ]
      }
    ]
  },
  {
    slug: 'healthcare',
    sections: [
      {
        id: 'general',
        title: 'Diagnostics Registry',
        fields: [
          { name: 'name', label: 'Treatment / Package Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Billing / Procedure Code', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Procedure Scope', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Commercial Billing',
        fields: [
          { name: 'price', label: 'Package Fee', dataType: 'number', required: true },
          { name: 'mrp', label: 'Full Rate', dataType: 'number' },
          { name: 'discount', label: 'Insurance Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Medical GST / Tax (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Availability',
        fields: [
          { name: 'stock', label: 'Daily Slots Available', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Clinical Procedure Controls',
        fields: [
          { name: 'service_type', label: 'Healthcare Service Type', dataType: 'select', options: ['Diagnostic', 'Consultation', 'Therapy', 'Surgery'] },
          { name: 'duration', label: 'Duration (e.g. 30 mins)', dataType: 'text' },
          { name: 'lab_required', label: 'Requires Laboratory Setup', dataType: 'boolean' }
        ]
      }
    ]
  },
  {
    slug: 'education',
    sections: [
      {
        id: 'general',
        title: 'Academics Registry',
        fields: [
          { name: 'name', label: 'Course / Training Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Course Syllabus SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Syllabus Outline', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Course Tuition & Fees',
        fields: [
          { name: 'price', label: 'Tuition Fee', dataType: 'number', required: true },
          { name: 'mrp', label: 'Standard Fee', dataType: 'number' },
          { name: 'discount', label: 'Scholarship Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Edu Tax (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Seat Allocation',
        fields: [
          { name: 'stock', label: 'Total Seat Intake', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Academic Program Details',
        fields: [
          { name: 'course_duration', label: 'Program Duration', dataType: 'select', options: ['1 Month', '3 Months', '6 Months', '1 Year'] },
          { name: 'trainer_name', label: 'Assigned Instructor Name', dataType: 'text' },
          { name: 'batch_timing', label: 'Batch Timing Slot', dataType: 'select', options: ['Morning', 'Afternoon', 'Evening'] },
          { name: 'certificate_included', label: 'Offers Professional Certificate', dataType: 'boolean' }
        ]
      }
    ]
  },
  {
    slug: 'real-estate',
    sections: [
      {
        id: 'general',
        title: 'Property Listing Details',
        fields: [
          { name: 'name', label: 'Property Title / Unit Code', dataType: 'text', required: true },
          { name: 'sku', label: 'Registration Plot / SKU', dataType: 'text' },
          { name: 'status', label: 'Listing Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Detailed Amenities', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Valuation & Premium',
        fields: [
          { name: 'price', label: 'Listing Base Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Max Expected Value', dataType: 'number' },
          { name: 'discount', label: 'Negotiation Rebate (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Property Stamp GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Available Listing Portions',
        fields: [
          { name: 'stock', label: 'Portions / Units Count', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Real Estate Layout Parameters',
        fields: [
          { name: 'property_type', label: 'Property Class', dataType: 'select', options: ['Residential', 'Commercial', 'Plot', 'Villa'] },
          { name: 'property_size', label: 'Super Built-up Area (sqft)', dataType: 'text' },
          { name: 'floor_number', label: 'Floor Level', dataType: 'number' },
          { name: 'parking_available', label: 'Dedicated Parking Space', dataType: 'boolean' },
          { name: 'furnishing', label: 'Furnishing Condition', dataType: 'select', options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'] },
          { name: 'facing', label: 'Vastu / Facing Orientation', dataType: 'select', options: ['East', 'West', 'North', 'South'] }
        ]
      }
    ]
  },
  {
    slug: 'logistics',
    sections: [
      {
        id: 'general',
        title: 'Transit Package Service',
        fields: [
          { name: 'name', label: 'Shipping Route Service', dataType: 'text', required: true },
          { name: 'sku', label: 'Consignment / Tariff Code', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Route Specifics', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Cargo Logistics Tariffs',
        fields: [
          { name: 'price', label: 'Standard Freight Charge', dataType: 'number', required: true },
          { name: 'mrp', label: 'Max Carrier Charge', dataType: 'number' },
          { name: 'discount', label: 'Corporate Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Logistics Tax (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Shipping Allocation',
        fields: [
          { name: 'stock', label: 'Daily Cargo Slots', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Cargo & Fleet Configuration',
        fields: [
          { name: 'travel_type', label: 'Mode of Transport', dataType: 'select', options: ['Air', 'Road', 'Rail', 'Sea'] },
          { name: 'departure_location', label: 'Port of Departure', dataType: 'text' },
          { name: 'arrival_location', label: 'Port of Destination', dataType: 'text' }
        ]
      }
    ]
  },
  {
    slug: 'manufacturing',
    sections: [
      {
        id: 'general',
        title: 'Industrial Goods Catalog',
        fields: [
          { name: 'name', label: 'Manufactured Component', dataType: 'text', required: true },
          { name: 'sku', label: 'Part SKU / Barcode', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Technical Description', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Pricing & Excise Duties',
        fields: [
          { name: 'price', label: 'Wholesale Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Max retail tag', dataType: 'number' },
          { name: 'discount', label: 'Contractor Rebate (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Industrial GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Bulk Warehouse Stock',
        fields: [
          { name: 'stock', label: 'Pcs In Plant Storage', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Minimum Batch Limit', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Plant Machinery & Grade Specs',
        fields: [
          { name: 'quality_grade', label: 'Steel/Quality Grade', dataType: 'select', options: ['A', 'B', 'C'] },
          { name: 'production_batch', label: 'Production Batch Code', dataType: 'text' },
          { name: 'industrial_standard', label: 'Compliance Standard (e.g. IS 1786)', dataType: 'text' },
          { name: 'production_status', label: 'Factory Process Phase', dataType: 'select', options: ['In Production', 'Completed', 'Quality Check', 'Dispatched'] },
          { name: 'machine_type', label: 'Operation Automation', dataType: 'select', options: ['Automatic', 'Semi Automatic', 'Manual'] }
        ]
      }
    ]
  },
  {
    slug: 'hospitality',
    sections: [
      {
        id: 'general',
        title: 'Suite / Room Inventory',
        fields: [
          { name: 'name', label: 'Room Stay Package Name', dataType: 'text', required: true },
          { name: 'sku', label: 'Billing Package SKU', dataType: 'text' },
          { name: 'status', label: 'Listing Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Package Amenities Description', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Room Stay Rates',
        fields: [
          { name: 'price', label: 'Base Night Tariff', dataType: 'number', required: true },
          { name: 'mrp', label: 'Weekend Tariff', dataType: 'number' },
          { name: 'discount', label: 'Club Member Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Luxury GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Availability Counter',
        fields: [
          { name: 'stock', label: 'Vacant Suites', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Hotel Accommodation Options',
        fields: [
          { name: 'room_type', label: 'Suite Type Class', dataType: 'select', options: ['Single', 'Double', 'Deluxe', 'Suite'] },
          { name: 'check_in_time', label: 'Standard Check-in Time', dataType: 'text' },
          { name: 'breakfast_included', label: 'Breakfast Buffet Included', dataType: 'boolean' }
        ]
      }
    ]
  },
  {
    slug: 'textile',
    sections: [
      {
        id: 'general',
        title: 'Textile Fabric Catalog',
        fields: [
          { name: 'name', label: 'Garment / Fabric Title', dataType: 'text', required: true },
          { name: 'sku', label: 'EAN Barcode / SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Design Narrative', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Textile Commercials',
        fields: [
          { name: 'price', label: 'Garment Selling Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'MSRP price', dataType: 'number' },
          { name: 'discount', label: 'Promo Rebate (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Textile GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Textile Factory Stock',
        fields: [
          { name: 'stock', label: 'Pieces In Factory', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Low Roll Warning Level', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Garment Thread & Fabric Options',
        fields: [
          { name: 'size', label: 'Garment Size Label', dataType: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'color', label: 'Color Shade Code', dataType: 'text' },
          { name: 'fabric_type', label: 'Fabric Composition', dataType: 'select', options: ['Cotton', 'Silk', 'Denim', 'Polyester', 'Wool'] },
          { name: 'pattern', label: 'Apparel Pattern Style', dataType: 'select', options: ['Solid', 'Striped', 'Checked', 'Printed'] }
        ]
      }
    ]
  },
  {
    slug: 'fmcg',
    sections: [
      {
        id: 'general',
        title: 'FMCG Product Details',
        fields: [
          { name: 'name', label: 'FMCG Pack Name', dataType: 'text', required: true },
          { name: 'sku', label: 'Barcode SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Product Ingredients', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Commercial Billing',
        fields: [
          { name: 'price', label: 'Store Offer Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Box MRP', dataType: 'number' },
          { name: 'discount', label: 'Bulk Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Consumer Goods GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Store Supply Control',
        fields: [
          { name: 'stock', label: 'Boxes / Pcs In Stock', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Safety Threshold Boxes', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'FMCG Safety & FSSAI Standards',
        fields: [
          { name: 'weight', label: 'Net Package Weight (e.g. 5kg)', dataType: 'text' },
          { name: 'expiryDate', label: 'Product Expiry Date', dataType: 'date' },
          { name: 'batch_number', label: 'Factory Batch Number', dataType: 'text' },
          { name: 'fssai_number', label: 'FSSAI License License No', dataType: 'text' }
        ]
      }
    ]
  },
  {
    slug: 'jewellery',
    sections: [
      {
        id: 'general',
        title: 'Precious Jewels Registry',
        fields: [
          { name: 'name', label: 'Ornaments / Jewel Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Barcode / Unique ID', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Crafting Notes', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Metal Value Tariffs',
        fields: [
          { name: 'price', label: 'Valuation Selling Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Estimated Premium', dataType: 'number' },
          { name: 'discount', label: 'Making Charge Off (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Gold Jewelry GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Vault Safe Stock',
        fields: [
          { name: 'stock', label: 'Total Ornaments', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Hallmarking & Metal Purity Specs',
        fields: [
          { name: 'purity', label: 'Gold Karat Purity', dataType: 'select', options: ['18K', '22K', '24K'] },
          { name: 'gross_weight', label: 'Gross Weight (Grams)', dataType: 'text' },
          { name: 'hallmark_number', label: 'BIS Hallmark HUID Code', dataType: 'text' },
          { name: 'stone_certificate', label: 'Stone Certification agency', dataType: 'select', options: ['GIA', 'IGI', 'None'] },
          { name: 'jewelry_type', label: 'Ornament Class', dataType: 'select', options: ['Ring', 'Necklace', 'Bracelet', 'Earrings'] },
          { name: 'stone_type', label: 'Primary Gemstone Class', dataType: 'select', options: ['Diamond', 'Ruby', 'Emerald', 'None'] }
        ]
      }
    ]
  },
  {
    slug: 'services',
    sections: [
      {
        id: 'general',
        title: 'Service Listing',
        fields: [
          { name: 'name', label: 'Professional Service Name', dataType: 'text', required: true },
          { name: 'sku', label: 'Billing / Procedure Code', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Service Scope Narrative', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Billing Tariffs',
        fields: [
          { name: 'price', label: 'Service Charge', dataType: 'number', required: true },
          { name: 'mrp', label: 'Standard Tariff', dataType: 'number' },
          { name: 'discount', label: 'Promo Rebate (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Service GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Service Slots Available',
        fields: [
          { name: 'stock', label: 'Available Hours / Bookings', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Professional Service SLAs',
        fields: [
          { name: 'service_duration', label: 'Standard Session Duration', dataType: 'text' },
          { name: 'assigned_employee', label: 'Technician/Employee Assigned', dataType: 'text' },
          { name: 'service_type', label: 'Professional Service Class', dataType: 'select', options: ['Installation', 'Repair', 'Maintenance', 'Consulting', 'Development'] },
          { name: 'billing_type', label: 'Billing Frequency', dataType: 'select', options: ['Hourly', 'Daily', 'Fixed Price', 'Milestone'] },
          { name: 'sla_level', label: 'Service SLA Level Tier', dataType: 'select', options: ['Basic', 'Standard', 'Premium'] }
        ]
      }
    ]
  },
  {
    slug: 'grocery',
    sections: [
      {
        id: 'general',
        title: 'Grocery Details',
        fields: [
          { name: 'name', label: 'Produce / Pack Name', dataType: 'text', required: true },
          { name: 'sku', label: 'EAN Barcode / SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Portion Description', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Commercial Billing',
        fields: [
          { name: 'price', label: 'Mart Offer price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Pack MRP', dataType: 'number' },
          { name: 'discount', label: 'Loyalty Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Grocery GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Store Supply Control',
        fields: [
          { name: 'stock', label: 'Portions / Pcs In Stock', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Safety Threshold Units', dataType: 'number' },
          { name: 'batch_number', label: 'Lot / Batch Code', dataType: 'text' },
          { name: 'expiryDate', label: 'Produce Expiry Date', dataType: 'date' }
        ]
      },
      {
        id: 'custom',
        title: 'Supermarket Packing & Storage',
        fields: [
          { name: 'weight', label: 'Grocery Net Weight', dataType: 'text' },
          { name: 'packing_type', label: 'Packaging Type', dataType: 'select', options: ['Loose', 'Packed', 'Vacuum Packed'] },
          { name: 'unit', label: 'Measurement Unit', dataType: 'select', options: ['Kg', 'Gram', 'Liter', 'ml', 'Packet', 'Box', 'Bottle'] },
          { name: 'storage_type', label: 'Grocery Storage Condition', dataType: 'select', options: ['Room Temperature', 'Refrigerated', 'Frozen'] }
        ]
      }
    ]
  },
  {
    slug: 'gym',
    sections: [
      {
        id: 'general',
        title: 'Membership Registry',
        fields: [
          { name: 'name', label: 'Gold/Silver Membership Package', dataType: 'text', required: true },
          { name: 'sku', label: 'Catalog SKU ID', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Access Plan details', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Membership Fees',
        fields: [
          { name: 'price', label: 'Gold Package Fee', dataType: 'number', required: true },
          { name: 'mrp', label: 'List Fee Price', dataType: 'number' },
          { name: 'discount', label: 'Annual Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Gym GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Registration Slots',
        fields: [
          { name: 'stock', label: 'Available Admissions', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Gym Workout Program details',
        fields: [
          { name: 'membership_duration', label: 'Plan Subscription Duration', dataType: 'select', options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'] },
          { name: 'trainer_assigned', label: 'Requires Assigned Personal Trainer', dataType: 'boolean' },
          { name: 'diet_plan', label: 'Custom Diet Plan Included', dataType: 'boolean' },
          { name: 'workout_type', label: 'Workout Specialty Routine', dataType: 'select', options: ['Cardio', 'Strength', 'Crossfit', 'Yoga'] },
          { name: 'trainer_type', label: 'Trainer Level Class', dataType: 'select', options: ['General', 'Personal Trainer'] }
        ]
      }
    ]
  },
  {
    slug: 'salon',
    sections: [
      {
        id: 'general',
        title: 'Salon Service details',
        fields: [
          { name: 'name', label: 'Bridal / Makeup Service Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Billing / Procedure Code', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Stylist Service Details', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Billing Tariffs',
        fields: [
          { name: 'price', label: 'Stylist Charge', dataType: 'number', required: true },
          { name: 'mrp', label: 'Standard Rate Card', dataType: 'number' },
          { name: 'discount', label: 'Salon Coupon (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Salon GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Admissions Available',
        fields: [
          { name: 'stock', label: 'Available Day Slots', dataType: 'number', required: true }
        ]
      },
      {
        id: 'custom',
        title: 'Beauty Stylist SLAs',
        fields: [
          { name: 'service_duration', label: 'Styling Session Duration', dataType: 'text' },
          { name: 'stylist_name', label: 'Assigned Hair Specialist', dataType: 'text' },
          { name: 'appointment_type', label: 'Beauty Specialty Class', dataType: 'select', options: ['Hair', 'Facial', 'Bridal', 'Massage'] }
        ]
      }
    ]
  },
  {
    slug: 'hardware',
    sections: [
      {
        id: 'general',
        title: 'Appliance Registry',
        fields: [
          { name: 'name', label: 'Drill / Power Tool Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Tool Barcode SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Tool Specifications', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Hardware Tariffs',
        fields: [
          { name: 'price', label: 'Hardware Store Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Tag MRP', dataType: 'number' },
          { name: 'discount', label: 'Store Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Hardware GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Warehouse Rack Control',
        fields: [
          { name: 'stock', label: 'Pieces In Plant Storage', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Safety Threshold Pcs', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Plant Machinery Specs & Voltage',
        fields: [
          { name: 'tool_type', label: 'Hardware Tool Class', dataType: 'select', options: ['Power Tool', 'Hand Tool', 'Industrial Tool'] },
          { name: 'voltage_rating', label: 'Voltage rating class', dataType: 'select', options: ['110V', '220V', '440V'] },
          { name: 'safety_certification', label: 'Safety Compliance Standards', dataType: 'select', options: ['CE', 'UL', 'None'] },
          { name: 'usage', label: 'Domestic / Factory usage class', dataType: 'select', options: ['Domestic', 'Commercial', 'Industrial'] }
        ]
      }
    ]
  },
  {
    slug: 'furniture',
    sections: [
      {
        id: 'general',
        title: 'Furniture Catalog',
        fields: [
          { name: 'name', label: 'King Bed / Sofa Title', dataType: 'text', required: true },
          { name: 'sku', label: 'Barcode SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Wood & Polish Specifications', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Billing Parameters',
        fields: [
          { name: 'price', label: 'Furniture Selling Price', dataType: 'number', required: true },
          { name: 'mrp', label: 'List MRP Price', dataType: 'number' },
          { name: 'discount', label: 'Flat Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Furniture GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Warehouse stock',
        fields: [
          { name: 'stock', label: 'Units Stock on Hand', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Low Stock Level Indicator', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'Wood & Furniture variants',
        fields: [
          { name: 'material', label: 'Furniture Wood Grade', dataType: 'select', options: ['Teak Wood', 'Metal', 'Plastic', 'Glass', 'Engineered Wood'] },
          { name: 'size', label: 'Bed/Table Size Variant', dataType: 'select', options: ['Single', 'Double', 'King', 'Queen'] },
          { name: 'color', label: 'Polish Shade Finish', dataType: 'text' }
        ]
      }
    ]
  },
  {
    slug: 'mobile-shop',
    sections: [
      {
        id: 'general',
        title: 'Smartphones catalog',
        fields: [
          { name: 'name', label: 'Smartphone Device Title', dataType: 'text', required: true },
          { name: 'sku', label: 'EAN Barcode / SKU', dataType: 'text' },
          { name: 'status', label: 'Status', dataType: 'select', options: ['Active', 'Inactive', 'Draft'] },
          { name: 'description', label: 'Camera & Processor Specs', dataType: 'textarea' }
        ]
      },
      {
        id: 'price',
        title: 'Smartphones Billing Details',
        fields: [
          { name: 'price', label: 'Mobile Offer price', dataType: 'number', required: true },
          { name: 'mrp', label: 'Standard MSRP tag', dataType: 'number' },
          { name: 'discount', label: 'Brand Cashback Discount (%)', dataType: 'number' },
          { name: 'taxRate', label: 'Smartphone GST (%)', dataType: 'select', options: ['0', '5', '12', '18', '28'] }
        ]
      },
      {
        id: 'inventory',
        title: 'Vault IMEI stock',
        fields: [
          { name: 'stock', label: 'Boxes Available', dataType: 'number', required: true },
          { name: 'minStockLevel', label: 'Safety Margin Level', dataType: 'number' }
        ]
      },
      {
        id: 'custom',
        title: 'IMEI Registry & Brand Warranty',
        fields: [
          { name: 'imei_number', label: 'Primary IMEI Code', dataType: 'text' },
          { name: 'serial_number', label: 'Manufacturer Serial Code', dataType: 'text' },
          { name: 'warranty_period', label: 'Brand Warranty period', dataType: 'select', options: ['6 Months', '1 Year', '2 Years'] }
        ]
      }
    ]
  }
];

async function seedProductViewForms() {
  console.log('🌱 Seeding IndustryWiseProductViewForm dynamic forms for all 21 industries...');

  for (const item of formsData) {
    // Find the industry id
    const industry = await prisma.industryMaster.findUnique({
      where: { slug: item.slug }
    });

    if (!industry) {
      console.log(`⚠️  Industry not found for slug: ${item.slug}, skipping.`);
      continue;
    }

    const structureString = JSON.stringify({ sections: item.sections });

    await prisma.industryWiseProductViewForm.upsert({
      where: { industryId: industry.id },
      update: {
        formStructure: structureString,
        isActive: true
      },
      create: {
        industryId: industry.id,
        formStructure: structureString,
        isActive: true
      }
    });

    console.log(`✅ Seeded IndustryWiseProductViewForm for ${item.slug}`);
  }

  console.log('🎉 Seeding dynamic view forms completed successfully!');
}

async function main() {
  try {
    await seedProductViewForms();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
