import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate unique codes and barcodes
const generateSku = (industry: string, index: number) => `${industry.substring(0, 4).toUpperCase()}-${1000 + index}`;
const generateBarcode = (industry: string, index: number) => `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

const productsSeedData: Record<string, Array<{
  name: string;
  description: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStockLevel: number;
  taxRate: number;
  category: string;
  brand: string;
  unit: string;
  customFields: Record<string, any>;
}>> = {
  electronics: [
    { name: 'Samsung Galaxy S24 Ultra', description: 'AI-powered flagship smartphone with S-Pen', price: 129999, purchasePrice: 110000, stock: 45, minStockLevel: 5, taxRate: 18, category: 'Smartphones', brand: 'Samsung', unit: 'Pcs', customFields: { brand: 'Samsung', warranty_type: '1 Year', power_type: 'Battery', condition: 'New' } },
    { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling wireless headphones', price: 29990, purchasePrice: 24000, stock: 30, minStockLevel: 4, taxRate: 18, category: 'Audio', brand: 'Sony', unit: 'Pcs', customFields: { brand: 'Sony', warranty_type: '1 Year', power_type: 'Battery', condition: 'New' } },
    { name: 'LG C3 55" OLED 4K TV', description: 'Self-lit OLED evo pixels with α9 AI Processor Gen6', price: 145000, purchasePrice: 120000, stock: 12, minStockLevel: 2, taxRate: 28, category: 'Television', brand: 'LG', unit: 'Pcs', customFields: { brand: 'LG', warranty_type: '2 Years', power_type: 'Electric', condition: 'New' } },
    { name: 'Dell XPS 13 Laptop', description: 'Intel Core i7, 16GB RAM, 512GB SSD premium ultrabook', price: 115000, purchasePrice: 95000, stock: 15, minStockLevel: 3, taxRate: 18, category: 'Laptops', brand: 'Dell', unit: 'Pcs', customFields: { brand: 'Dell', warranty_type: '1 Year', power_type: 'Battery', condition: 'New' } },
    { name: 'HP LaserJet Pro M404dn', description: 'High speed monochrome laser printer for office use', price: 27500, purchasePrice: 22000, stock: 20, minStockLevel: 5, taxRate: 18, category: 'Printers', brand: 'HP', unit: 'Pcs', customFields: { brand: 'HP', warranty_type: '1 Year', power_type: 'Electric', condition: 'New' } },
    { name: 'Lenovo ThinkPad E14', description: 'Business-grade laptop with AMD Ryzen 5, 8GB RAM', price: 54000, purchasePrice: 46000, stock: 25, minStockLevel: 5, taxRate: 18, category: 'Laptops', brand: 'Lenovo', unit: 'Pcs', customFields: { brand: 'Lenovo', warranty_type: '3 Years', power_type: 'Battery', condition: 'New' } },
    { name: 'Apple iPhone 15 Pro Max', description: 'Titanium design, A17 Pro chip, advanced camera system', price: 159900, purchasePrice: 140000, stock: 18, minStockLevel: 2, taxRate: 18, category: 'Smartphones', brand: 'Apple', unit: 'Pcs', customFields: { brand: 'Apple', warranty_type: '1 Year', power_type: 'Battery', condition: 'New' } },
    { name: 'Sony PlayStation 5 Slim', description: 'Next-gen gaming console with 1TB SSD', price: 44990, purchasePrice: 38000, stock: 22, minStockLevel: 4, taxRate: 28, category: 'Gaming Consoles', brand: 'Sony', unit: 'Pcs', customFields: { brand: 'Sony', warranty_type: '1 Year', power_type: 'Electric', condition: 'New' } },
    { name: 'Samsung 990 PRO 2TB SSD', description: 'High speed PCIe 4.0 NVMe M.2 internal SSD', price: 17500, purchasePrice: 14000, stock: 50, minStockLevel: 10, taxRate: 18, category: 'Storage', brand: 'Samsung', unit: 'Pcs', customFields: { brand: 'Samsung', warranty_type: '5 Years', power_type: 'Electric', condition: 'New' } },
    { name: 'Logistics Hybrid Power Bank', description: '20000mAh rugged power bank with solar charging panels', price: 3499, purchasePrice: 2200, stock: 100, minStockLevel: 15, taxRate: 18, category: 'Accessories', brand: 'Generic', unit: 'Pcs', customFields: { brand: 'Samsung', warranty_type: '6 Months', power_type: 'Solar', condition: 'New' } }
  ],
  retail: [
    { name: 'Slim Fit Denim Jeans', description: 'Premium stretch denim in dark indigo wash', price: 1999, purchasePrice: 900, stock: 120, minStockLevel: 20, taxRate: 5, category: 'Apparel', brand: 'BillSoft Originals', unit: 'Pcs', customFields: { size_alphabetic: 'Medium', size_numeric: '32', gender: 'Men', fabric: 'Denim', fit_type: 'Slim Fit' } },
    { name: 'Classic Linen Shirt', description: 'Breathable pure linen summer shirt', price: 2499, purchasePrice: 1100, stock: 80, minStockLevel: 15, taxRate: 5, category: 'Apparel', brand: 'BillSoft Originals', unit: 'Pcs', customFields: { size_alphabetic: 'Large', size_numeric: '40', gender: 'Men', fabric: 'Linen', fit_type: 'Regular Fit' } },
    { name: 'Floral Print Cotton Kurti', description: 'Pure cotton daily wear printed kurti for women', price: 1299, purchasePrice: 500, stock: 150, minStockLevel: 25, taxRate: 5, category: 'Apparel', brand: 'Aura', unit: 'Pcs', customFields: { size_alphabetic: 'Small', size_numeric: '36', gender: 'Women', fabric: 'Cotton', fit_type: 'Regular Fit' } },
    { name: 'Oversized Winter Hoodie', description: 'Thick fleece lined cozy pullover hoodie', price: 2199, purchasePrice: 950, stock: 60, minStockLevel: 10, taxRate: 12, category: 'Apparel', brand: 'StreetStyle', unit: 'Pcs', customFields: { size_alphabetic: 'XL', size_numeric: '42', gender: 'Unisex', fabric: 'Polyester', fit_type: 'Oversized' } },
    { name: 'Kids Denim Dungaree', description: 'Cute and durable adjustable dungaree set', price: 1499, purchasePrice: 650, stock: 90, minStockLevel: 15, taxRate: 5, category: 'Apparel', brand: 'LittleStar', unit: 'Pcs', customFields: { size_alphabetic: 'XS', size_numeric: '28', gender: 'Kids', fabric: 'Denim', fit_type: 'Regular Fit' } },
    { name: 'Silk Designer Saree', description: 'Handcrafted Banarasi pure silk saree with heavy zari borders', price: 7999, purchasePrice: 4000, stock: 30, minStockLevel: 5, taxRate: 5, category: 'Apparel', brand: 'RoyalWeaves', unit: 'Pcs', customFields: { size_alphabetic: 'XL', size_numeric: '38', gender: 'Women', fabric: 'Silk', fit_type: 'Regular Fit' } },
    { name: 'Stretch Cotton Chinos', description: 'Flat front smart casual cotton chinos for men', price: 1799, purchasePrice: 800, stock: 110, minStockLevel: 20, taxRate: 5, category: 'Apparel', brand: 'FitWear', unit: 'Pcs', customFields: { size_alphabetic: 'Medium', size_numeric: '32', gender: 'Men', fabric: 'Cotton', fit_type: 'Slim Fit' } },
    { name: 'Unisex Woolen Scarf', description: 'Soft pure merino wool warm knitted scarf', price: 799, purchasePrice: 350, stock: 200, minStockLevel: 30, taxRate: 12, category: 'Accessories', brand: 'WinterCozy', unit: 'Pcs', customFields: { size_alphabetic: 'Small', size_numeric: '30', gender: 'Unisex', fabric: 'Wool', fit_type: 'Regular Fit' } },
    { name: 'Sports Polyester Shorts', description: 'Quick dry athletic training shorts with pockets', price: 899, purchasePrice: 400, stock: 140, minStockLevel: 20, taxRate: 5, category: 'Apparel', brand: 'ActiveGear', unit: 'Pcs', customFields: { size_alphabetic: 'Large', size_numeric: '34', gender: 'Men', fabric: 'Polyester', fit_type: 'Slim Fit' } },
    { name: 'Premium Leather Wallet', description: 'Genuine leather bifold wallet with RFID blocking', price: 1200, purchasePrice: 500, stock: 200, minStockLevel: 20, taxRate: 12, category: 'Accessories', brand: 'BillSoft Originals', unit: 'Pcs', customFields: { size_alphabetic: 'Small', size_numeric: '30', gender: 'Men', fabric: 'Cotton', fit_type: 'Regular Fit' } }
  ],
  grocery: [
    { name: 'Basmati Rice Premium 10kg', description: 'Aged long grain fragrant premium basmati rice', price: 1250, purchasePrice: 1000, stock: 80, minStockLevel: 10, taxRate: 0, category: 'Grains & Rice', brand: 'IndiaGate', unit: 'Bag', customFields: { unit: 'Kg', packaging: 'Vacuum Packed', storage_type: 'Room Temperature' } },
    { name: 'Organic Honey 500g', description: 'Raw pure unfiltered forest organic honey', price: 349, purchasePrice: 250, stock: 150, minStockLevel: 20, taxRate: 5, category: 'Sweeteners', brand: 'Dabur', unit: 'Bottle', customFields: { unit: 'Gram', packaging: 'Packed', storage_type: 'Room Temperature' } },
    { name: 'Fresh Full Cream Milk 1L', description: 'Pasteurized whole milk rich in calcium and fat', price: 68, purchasePrice: 58, stock: 200, minStockLevel: 30, taxRate: 0, category: 'Dairy', brand: 'Amul', unit: 'Packet', customFields: { unit: 'Liter', packaging: 'Packed', storage_type: 'Refrigerated' } },
    { name: 'Frozen Peas 1kg', description: 'Quick frozen sweet green garden peas', price: 180, purchasePrice: 130, stock: 60, minStockLevel: 10, taxRate: 5, category: 'Frozen Foods', brand: 'Safal', unit: 'Packet', customFields: { unit: 'Kg', packaging: 'Vacuum Packed', storage_type: 'Frozen' } },
    { name: 'Unsalted Butter 500g', description: 'Pure white creamy unsalted cow butter', price: 275, purchasePrice: 230, stock: 100, minStockLevel: 15, taxRate: 12, category: 'Dairy', brand: 'Amul', unit: 'Box', customFields: { unit: 'Gram', packaging: 'Packed', storage_type: 'Refrigerated' } },
    { name: 'Refined Sunflower Oil 5L', description: 'Healthy and clear refined cooking sunflower oil', price: 650, purchasePrice: 550, stock: 90, minStockLevel: 15, taxRate: 5, category: 'Edible Oils', brand: 'Fortune', unit: 'Bottle', customFields: { unit: 'Liter', packaging: 'Packed', storage_type: 'Room Temperature' } },
    { name: 'Organic Iodized Salt 1kg', description: 'Pure vacuum dried iodized dining salt', price: 28, purchasePrice: 20, stock: 500, minStockLevel: 50, taxRate: 0, category: 'Spices & Salt', brand: 'Tata', unit: 'Packet', customFields: { unit: 'Kg', packaging: 'Packed', storage_type: 'Room Temperature' } },
    { name: 'Fresh Green Apple 1kg', description: 'Crisp and juicy imported green granny smith apples', price: 260, purchasePrice: 190, stock: 45, minStockLevel: 5, taxRate: 0, category: 'Fruits', brand: 'FreshProduce', unit: 'Kg', customFields: { unit: 'Kg', packaging: 'Loose', storage_type: 'Refrigerated' } },
    { name: 'Assorted Cold Brew Coffee 250ml', description: 'Rich roasted organic dark cold brew can', price: 120, purchasePrice: 80, stock: 120, minStockLevel: 20, taxRate: 18, category: 'Beverages', brand: 'BrewCo', unit: 'Bottle', customFields: { unit: 'ml', packaging: 'Packed', storage_type: 'Refrigerated' } },
    { name: 'Whole Wheat Flour 10kg', description: '100% whole wheat stone ground pure chakki atta', price: 440, purchasePrice: 380, stock: 110, minStockLevel: 15, taxRate: 0, category: 'Flours', brand: 'Aashirvaad', unit: 'Bag', customFields: { unit: 'Kg', packaging: 'Packed', storage_type: 'Room Temperature' } }
  ],
  pharmacy: [
    { name: 'Paracetamol 650mg (Dolo)', description: 'Fever reducer and pain reliever tablets', price: 30, purchasePrice: 18, stock: 1000, minStockLevel: 100, taxRate: 12, category: 'Analgesics', brand: 'MicroLabs', unit: 'Box', customFields: { medicine_type: 'Tablet', schedule_type: 'OTC', prescription: 'Not Required', storage: 'Cool Place' } },
    { name: 'Amoxicillin 500mg Capsules', description: 'Broad-spectrum penicillin antibiotic', price: 120, purchasePrice: 80, stock: 350, minStockLevel: 50, taxRate: 12, category: 'Antibiotics', brand: 'Cipla', unit: 'Box', customFields: { medicine_type: 'Capsule', schedule_type: 'Schedule H', prescription: 'Required', storage: 'Cool Place' } },
    { name: 'Cough Syrup (Ascoril LS)', description: 'Expectorant and bronchodilator cough formula', price: 145, purchasePrice: 105, stock: 240, minStockLevel: 30, taxRate: 12, category: 'Cough & Cold', brand: 'Glenmark', unit: 'Bottle', customFields: { medicine_type: 'Syrup', schedule_type: 'Schedule H', prescription: 'Required', storage: 'Cool Place' } },
    { name: 'Insulin Glargine Injection', description: 'Long-acting insulin injection for diabetes control', price: 850, purchasePrice: 700, stock: 50, minStockLevel: 10, taxRate: 5, category: 'Antidiabetics', brand: 'Lantus', unit: 'Pcs', customFields: { medicine_type: 'Injection', schedule_type: 'Schedule H', prescription: 'Required', storage: 'Refrigerated' } },
    { name: 'Betadine Ointment 20g', description: 'Antiseptic microbicidal water soluble cream', price: 115, purchasePrice: 85, stock: 180, minStockLevel: 25, taxRate: 12, category: 'First Aid', brand: 'Win-Medicare', unit: 'Pcs', customFields: { medicine_type: 'Cream', schedule_type: 'OTC', prescription: 'Not Required', storage: 'Avoid Sunlight' } },
    { name: 'Multivitamin Syrup (A to Z)', description: 'Essential mineral and nutritional syrup base', price: 160, purchasePrice: 110, stock: 150, minStockLevel: 20, taxRate: 18, category: 'Nutritional Support', brand: 'Alkem', unit: 'Bottle', customFields: { medicine_type: 'Syrup', schedule_type: 'OTC', prescription: 'Not Required', storage: 'Cool Place' } },
    { name: 'Cetirizine 10mg Tablets', description: 'Fast non-drowsy anti-allergic antihistamine', price: 18, purchasePrice: 10, stock: 800, minStockLevel: 100, taxRate: 12, category: 'Antihistamines', brand: 'Cipla', unit: 'Box', customFields: { medicine_type: 'Tablet', schedule_type: 'OTC', prescription: 'Not Required', storage: 'Cool Place' } },
    { name: 'ORSL Rehydration Powder', description: 'Apple flavored rehydration electrolyte powder drink', price: 42, purchasePrice: 30, stock: 600, minStockLevel: 50, taxRate: 12, category: 'Rehydration', brand: 'Johnson & Johnson', unit: 'Packet', customFields: { medicine_type: 'Powder', schedule_type: 'OTC', prescription: 'Not Required', storage: 'Cool Place' } },
    { name: 'Clexane 40mg Prefilled Syringe', description: 'Anticoagulant blood thinner injection', price: 560, purchasePrice: 480, stock: 75, minStockLevel: 15, taxRate: 5, category: 'Anticoagulants', brand: 'Sanofi', unit: 'Box', customFields: { medicine_type: 'Injection', schedule_type: 'Schedule H', prescription: 'Required', storage: 'Cool Place' } },
    { name: 'Pantocid 40mg Gastro-Resistant', description: 'Proton pump inhibitor acid reflux medication', price: 150, purchasePrice: 98, stock: 400, minStockLevel: 50, taxRate: 12, category: 'Antacids', brand: 'SunPharma', unit: 'Box', customFields: { medicine_type: 'Tablet', schedule_type: 'Schedule H', prescription: 'Required', storage: 'Cool Place' } }
  ],
  restaurant: [
    { name: 'Butter Chicken Full Plate', description: 'Tender tandoori chicken cooked in rich butter and cashew gravy', price: 450, purchasePrice: 200, stock: 100, minStockLevel: 10, taxRate: 5, category: 'Main Course', brand: 'House Special', unit: 'Full', customFields: { food_type: 'Non Veg', spice_level: 'Medium', serving_size: 'Full', order_type: 'Dine In' } },
    { name: 'Paneer Tikka Masala half', description: 'Charred paneer cubes in spicy onion tomato masala', price: 290, purchasePrice: 120, stock: 100, minStockLevel: 10, taxRate: 5, category: 'Main Course', brand: 'House Special', unit: 'Half', customFields: { food_type: 'Veg', spice_level: 'Spicy', serving_size: 'Half', order_type: 'Dine In' } },
    { name: 'Tandoori Garlic Roti', description: 'Whole wheat flatbread baked in clay oven with butter garlic', price: 40, purchasePrice: 15, stock: 500, minStockLevel: 50, taxRate: 5, category: 'Breads', brand: 'House Special', unit: 'Pcs', customFields: { food_type: 'Veg', spice_level: 'Mild', serving_size: 'Half', order_type: 'Dine In' } },
    { name: 'Veg Fried Rice Family Pack', description: 'Stir fried vegetables and rice with authentic soy-garlic sauces', price: 380, purchasePrice: 160, stock: 80, minStockLevel: 8, taxRate: 5, category: 'Chinese', brand: 'WokStar', unit: 'Family Pack', customFields: { food_type: 'Veg', spice_level: 'Medium', serving_size: 'Family Pack', order_type: 'Delivery' } },
    { name: 'Extra Spicy Chicken Wings', description: 'Crispy fried jumbo wings tossed in ghost pepper sauce', price: 280, purchasePrice: 110, stock: 120, minStockLevel: 15, taxRate: 5, category: 'Starters', brand: 'House Special', unit: 'Full', customFields: { food_type: 'Non Veg', spice_level: 'Extra Spicy', serving_size: 'Full', order_type: 'Takeaway' } },
    { name: 'Jain Dal Khichdi Comfort', description: 'Simple steamed lentils and rice prepared without onion or garlic', price: 190, purchasePrice: 70, stock: 60, minStockLevel: 5, taxRate: 5, category: 'Rice', brand: 'House Special', unit: 'Full', customFields: { food_type: 'Jain', spice_level: 'Mild', serving_size: 'Full', order_type: 'Dine In' } },
    { name: 'Vegan Quinoa Salad', description: 'Fresh garden quinoa tossed in olive lemon organic dressing', price: 320, purchasePrice: 150, stock: 40, minStockLevel: 5, taxRate: 5, category: 'Salads', brand: 'GreenDiet', unit: 'Full', customFields: { food_type: 'Vegan', spice_level: 'Mild', serving_size: 'Full', order_type: 'Takeaway' } },
    { name: 'Sizzling Hot Brownie Dessert', description: 'Freshly baked chocolate fudge brownie with vanilla scoop', price: 220, purchasePrice: 90, stock: 70, minStockLevel: 10, taxRate: 18, category: 'Desserts', brand: 'SweetTooth', unit: 'Pcs', customFields: { food_type: 'Veg', spice_level: 'Mild', serving_size: 'Half', order_type: 'Dine In' } },
    { name: 'Blue Lagoon Mocktail 300ml', description: 'Chilled carbonated blue curacao and lemonade drink', price: 150, purchasePrice: 35, stock: 200, minStockLevel: 20, taxRate: 18, category: 'Beverages', brand: 'BarCo', unit: 'Bottle', customFields: { food_type: 'Veg', spice_level: 'Mild', serving_size: 'Half', order_type: 'Dine In' } },
    { name: 'Jumbo Cheese Burger Combo', description: 'Loaded double patty cheese burger with salted French fries', price: 349, purchasePrice: 150, stock: 95, minStockLevel: 12, taxRate: 5, category: 'Fast Food', brand: 'BurgerKing', unit: 'Full', customFields: { food_type: 'Non Veg', spice_level: 'Medium', serving_size: 'Full', order_type: 'Takeaway' } }
  ],
  automobile: [
    { name: 'Premium Brake Pad Set - Front', description: 'High performance wear resistant ceramic front brake pads', price: 4200, purchasePrice: 2800, stock: 80, minStockLevel: 10, taxRate: 18, category: 'Brakes', brand: 'Bosch', unit: 'Pcs', customFields: { fuel_type: 'Diesel', vehicle_type: 'Car', transmission: 'Automatic', ownership: 'First Owner' } },
    { name: 'Castrol Edge 5W-40 Oil 4L', description: 'Fully synthetic high fluid strength engine motor oil', price: 3400, purchasePrice: 2400, stock: 120, minStockLevel: 15, taxRate: 18, category: 'Lubricants', brand: 'Castrol', unit: 'Bottle', customFields: { fuel_type: 'Petrol', vehicle_type: 'Car', transmission: 'Manual', ownership: 'First Owner' } },
    { name: 'Tubeless Sports Tyre (140/70 R17)', description: 'Rear radial tubeless premium grip bike tyre', price: 5400, purchasePrice: 3900, stock: 50, minStockLevel: 8, taxRate: 28, category: 'Tyres', brand: 'MRF', unit: 'Pcs', customFields: { fuel_type: 'Petrol', vehicle_type: 'Bike', transmission: 'Manual', ownership: 'First Owner' } },
    { name: 'Halogen Front Headlight Bulb', description: 'Bright white 12V 55W long range halogen bulb', price: 450, purchasePrice: 280, stock: 250, minStockLevel: 30, taxRate: 18, category: 'Electricals', brand: 'Philips', unit: 'Pcs', customFields: { fuel_type: 'Electric', vehicle_type: 'Car', transmission: 'Manual', ownership: 'First Owner' } },
    { name: 'Heavy Duty Oil Filter Spin-On', description: 'High dirt holding capacity spin-on oil filter unit', price: 350, purchasePrice: 190, stock: 300, minStockLevel: 40, taxRate: 18, category: 'Filters', brand: 'Bosch', unit: 'Pcs', customFields: { fuel_type: 'CNG', vehicle_type: 'Bus', transmission: 'Manual', ownership: 'Third Owner' } },
    { name: 'Exide Express Truck Battery', description: 'Maintenance free heavy load long life commercial battery', price: 12500, purchasePrice: 9800, stock: 35, minStockLevel: 5, taxRate: 28, category: 'Electricals', brand: 'Exide', unit: 'Pcs', customFields: { fuel_type: 'Diesel', vehicle_type: 'Truck', transmission: 'Manual', ownership: 'First Owner' } },
    { name: 'Premium Wiper Blades Pair', description: 'All-weather streak free silicone wiper blades dual set', price: 1100, purchasePrice: 650, stock: 140, minStockLevel: 20, taxRate: 18, category: 'Accessories', brand: 'Bosch', unit: 'Pcs', customFields: { fuel_type: 'Hybrid', vehicle_type: 'Car', transmission: 'Automatic', ownership: 'Second Owner' } },
    { name: 'High Efficiency Spark Plug', description: 'Super fine wire iridium spark plug for rapid combustion', price: 650, purchasePrice: 420, stock: 400, minStockLevel: 50, taxRate: 18, category: 'Ignition', brand: 'NGK', unit: 'Pcs', customFields: { fuel_type: 'Petrol', vehicle_type: 'Bike', transmission: 'Manual', ownership: 'First Owner' } },
    { name: 'Premium Leather Steering Cover', description: 'Stitchable genuine black leather anti-slip grip cover', price: 850, purchasePrice: 400, stock: 180, minStockLevel: 25, taxRate: 18, category: 'Accessories', brand: 'AutoStyle', unit: 'Pcs', customFields: { fuel_type: 'Petrol', vehicle_type: 'Car', transmission: 'Automatic', ownership: 'First Owner' } },
    { name: 'Alloy Wheel Ring Protector Rim', description: 'Universal soft silicon tyre alloy rim protective rings', price: 1600, purchasePrice: 980, stock: 90, minStockLevel: 10, taxRate: 18, category: 'Wheels', brand: 'RimArmor', unit: 'Pcs', customFields: { fuel_type: 'Petrol', vehicle_type: 'Car', transmission: 'Automatic', ownership: 'Second Owner' } }
  ],
  services: [
    { name: 'Deep AC Cleaning Service', description: 'Advanced jet pump washing and gas pressure inspection', price: 1800, purchasePrice: 600, stock: 1000, minStockLevel: 10, taxRate: 18, category: 'Repairs', brand: 'BillSoft Service', unit: 'Fixed Price', customFields: { service_type: 'Maintenance', billing_type: 'Fixed Price', sla_level: 'Standard' } },
    { name: 'Hourly Senior Consultant', description: 'One hour dedicated IT network and database consulting', price: 2500, purchasePrice: 1000, stock: 1000, minStockLevel: 5, taxRate: 18, category: 'Consulting', brand: 'BillSoft Enterprise', unit: 'Hourly', customFields: { service_type: 'Consulting', billing_type: 'Hourly', sla_level: 'Premium' } },
    { name: 'Full Home Deep Sanitization', description: 'Anti-viral mist sanitization and chemical wash', price: 4999, purchasePrice: 1800, stock: 1000, minStockLevel: 10, taxRate: 18, category: 'Cleaning', brand: 'CleanSafe', unit: 'Fixed Price', customFields: { service_type: 'Maintenance', billing_type: 'Fixed Price', sla_level: 'Premium' } },
    { name: 'Water Purifier RO Service', description: 'Sediment filter replacement and membrane diagnostics', price: 950, purchasePrice: 400, stock: 1000, minStockLevel: 15, taxRate: 18, category: 'Repairs', brand: 'KentService', unit: 'Fixed Price', customFields: { service_type: 'Repair', billing_type: 'Fixed Price', sla_level: 'Basic' } },
    { name: 'Professional Electrician Daily', description: 'Eight hours standard wiring and appliance fitting labor', price: 3200, purchasePrice: 1500, stock: 1000, minStockLevel: 8, taxRate: 18, category: 'Maintenance', brand: 'SparkFix', unit: 'Daily', customFields: { service_type: 'Installation', billing_type: 'Daily', sla_level: 'Standard' } },
    { name: 'CCTV Camera 4 Channel Setup', description: 'Physical configuration and DVR online networking layout', price: 8500, purchasePrice: 5000, stock: 1000, minStockLevel: 4, taxRate: 18, category: 'Installations', brand: 'SecureCam', unit: 'Fixed Price', customFields: { service_type: 'Installation', billing_type: 'Fixed Price', sla_level: 'Premium' } },
    { name: 'App Development Phase 1 Milestone', description: 'Completion of high fidelity wireframes and user flow schema', price: 75000, purchasePrice: 35000, stock: 1000, minStockLevel: 2, taxRate: 18, category: 'Development', brand: 'BillSoft Tech', unit: 'Milestone', customFields: { service_type: 'Development', billing_type: 'Milestone', sla_level: 'Premium' } },
    { name: 'Express Plumbing Pipe Repair', description: 'Immediate leak plugging and pipe coupling replacement', price: 600, purchasePrice: 200, stock: 1000, minStockLevel: 10, taxRate: 18, category: 'Repairs', brand: 'PlumbCo', unit: 'Fixed Price', customFields: { service_type: 'Repair', billing_type: 'Fixed Price', sla_level: 'Basic' } },
    { name: 'Custom Wooden Wardrobe Fitting', description: 'On-site wooden frame cutting and laminate assembly', price: 15000, purchasePrice: 9000, stock: 1000, minStockLevel: 3, taxRate: 18, category: 'Carpentry', brand: 'WoodCraft', unit: 'Fixed Price', customFields: { service_type: 'Installation', billing_type: 'Fixed Price', sla_level: 'Standard' } },
    { name: 'Monthly Brand Marketing SEO Campaign', description: 'Keyword strategy, backlink optimization, and content creation', price: 25000, purchasePrice: 8000, stock: 1000, minStockLevel: 2, taxRate: 18, category: 'Marketing', brand: 'SEOStars', unit: 'Fixed Price', customFields: { service_type: 'Consulting', billing_type: 'Fixed Price', sla_level: 'Premium' } }
  ],
  education: [
    { name: 'Full Stack Coding Bootcamp', description: '6-month intensive web development training program', price: 45000, purchasePrice: 15000, stock: 500, minStockLevel: 20, taxRate: 18, category: 'Courses', brand: 'Academy', unit: 'Pcs', customFields: { course_mode: 'Online', course_level: 'Beginner', duration: '6 Months' } },
    { name: 'Data Structures Advanced Offline', description: 'In-classroom intensive training on complex graph algorithms', price: 15000, purchasePrice: 5000, stock: 100, minStockLevel: 10, taxRate: 18, category: 'Courses', brand: 'Academy', unit: 'Pcs', customFields: { course_mode: 'Offline', course_level: 'Advanced', duration: '3 Months' } },
    { name: 'SaaS Marketing Masterclass', description: 'Short course on conversion funnels and churn management', price: 8999, purchasePrice: 2500, stock: 1000, minStockLevel: 50, taxRate: 18, category: 'Courses', brand: 'Academy', unit: 'Pcs', customFields: { course_mode: 'Hybrid', course_level: 'Intermediate', duration: '1 Month' } },
    { name: 'Academic Math Grade 10', description: 'Complete year syllabus mapping with live practice sheets', price: 12000, purchasePrice: 4000, stock: 300, minStockLevel: 15, taxRate: 18, category: 'Tuitions', brand: 'Tutors', unit: 'Pcs', customFields: { course_mode: 'Online', course_level: 'Beginner', duration: '1 Year' } },
    { name: 'IELTS English Prep Bundle', description: 'Interactive course with 20 live mock evaluation reviews', price: 9500, purchasePrice: 3000, stock: 400, minStockLevel: 25, taxRate: 18, category: 'Preparation', brand: 'PrepStars', unit: 'Pcs', customFields: { course_mode: 'Online', course_level: 'Intermediate', duration: '3 Months' } },
    { name: 'AWS Cloud Architect Training', description: 'In-depth AWS certification preparation module and lab guide', price: 18500, purchasePrice: 6000, stock: 250, minStockLevel: 12, taxRate: 18, category: 'Certifications', brand: 'CloudLab', unit: 'Pcs', customFields: { course_mode: 'Hybrid', course_level: 'Advanced', duration: '3 Months' } },
    { name: 'Spoken French Level 1', description: 'Basic conversational speaking patterns and accent drills', price: 6500, purchasePrice: 2000, stock: 150, minStockLevel: 8, taxRate: 18, category: 'Languages', brand: 'GlobalTalk', unit: 'Pcs', customFields: { course_mode: 'Offline', course_level: 'Beginner', duration: '3 Months' } },
    { name: 'Corporate Leadership Module', description: 'Two weeks intensive high level organizational workshop', price: 28000, purchasePrice: 12000, stock: 80, minStockLevel: 5, taxRate: 18, category: 'Corporate', brand: 'ExecLead', unit: 'Pcs', customFields: { course_mode: 'Offline', course_level: 'Advanced', duration: '1 Month' } },
    { name: 'Machine Learning Python Bundle', description: 'TensorFlow, Pandas, and Sci-Kit Learn coding modules', price: 16000, purchasePrice: 5000, stock: 600, minStockLevel: 30, taxRate: 18, category: 'Courses', brand: 'Academy', unit: 'Pcs', customFields: { course_mode: 'Online', course_level: 'Advanced', duration: '6 Months' } },
    { name: 'UX/UI Product Design Diploma', description: 'Comprehensive Figma wireframing and prototyping series', price: 32000, purchasePrice: 11000, stock: 180, minStockLevel: 10, taxRate: 18, category: 'Design', brand: 'Creatives', unit: 'Pcs', customFields: { course_mode: 'Online', course_level: 'Intermediate', duration: '6 Months' } }
  ]
};

// Default fallback generator for remaining 14 industries
const buildDefaultProductsForIndustry = (slug: string): typeof productsSeedData[string] => {
  const list: typeof productsSeedData[string] = [];
  const displaySlug = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  for (let i = 1; i <= 10; i++) {
    let customFields: Record<string, any> = {};
    if (slug === 'real-estate') {
      customFields = { property_type: i % 2 === 0 ? 'Apartment' : 'Villa', furnishing: i % 3 === 0 ? 'Fully Furnished' : 'Semi Furnished', facing: 'East' };
    } else if (slug === 'healthcare') {
      customFields = { service_type: 'Diagnostic', lab_required: 'Required' };
    } else if (slug === 'logistics') {
      customFields = { travel_type: 'Air' };
    } else if (slug === 'manufacturing') {
      customFields = { production_status: 'In Production', quality_grade: 'A', machine_type: 'Automatic' };
    } else if (slug === 'hospitality') {
      customFields = { room_type: 'Deluxe' };
    } else if (slug === 'textile') {
      customFields = { size: 'M', fabric_type: 'Cotton', pattern: 'Solid' };
    } else if (slug === 'fmcg') {
      customFields = { weight: '5kg' };
    } else if (slug === 'jewellery') {
      customFields = { purity: '22K', jewelry_type: 'Ring', stone_type: 'Diamond', stone_certificate: 'GIA' };
    } else if (slug === 'gym') {
      customFields = { membership_duration: 'Yearly', workout_type: 'Strength', trainer_type: 'Personal Trainer' };
    } else if (slug === 'salon') {
      customFields = { appointment_type: 'Hair' };
    } else if (slug === 'hardware') {
      customFields = { tool_type: 'Power Tool', voltage_rating: '220V', safety_certification: 'CE', usage: 'Industrial' };
    } else if (slug === 'furniture') {
      customFields = { material: 'Teak Wood', size: 'King' };
    } else if (slug === 'mobile-shop') {
      customFields = { warranty_period: '1 Year' };
    } else {
      customFields = { default_val: 'None' };
    }

    list.push({
      name: `${displaySlug} Premium Item ${i}`,
      description: `High-quality specialized product ${i} built for the ${displaySlug} ERP vertical.`,
      price: i * 750,
      purchasePrice: i * 450,
      stock: 50 + (i * 10),
      minStockLevel: 5,
      taxRate: 18,
      category: `${displaySlug} Essentials`,
      brand: `${displaySlug} Co`,
      unit: 'Pcs',
      customFields
    });
  }
  return list;
};

async function main() {
  console.log('🌱 Starting full-stack 21-industry product seeding (10 products per industry)...');

  const industries = await prisma.industryMaster.findMany();
  
  if (industries.length === 0) {
    console.error('❌ Error: No industries found in database. Please run seed-industries.ts first.');
    process.exit(1);
  }

  let totalSeeded = 0;

  for (const industry of industries) {
    const slug = industry.slug;
    
    // Find matching user
    const email = `support_${slug.replace(/-/g, '_')}@agbtechnologies.com`;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      console.warn(`⚠️ Warning: Demo user ${email} not found. Skipping product seeding for ${slug}.`);
      continue;
    }

    // Retrieve or construct seed set
    const dataList = productsSeedData[slug] || buildDefaultProductsForIndustry(slug);

    console.log(`📦 Seeding 10 products for industry: ${slug} under user: ${email}...`);

    // Clean up old products for this user first to keep seed clean
    await prisma.product.deleteMany({
      where: { userId: user.id }
    });

    for (let index = 0; index < dataList.length; index++) {
      const pData = dataList[index];
      const sku = generateSku(slug, index);
      const barcode = generateBarcode(slug, index);

      await prisma.product.create({
        data: {
          userId: user.id,
          name: pData.name,
          description: pData.description,
          price: pData.price,
          purchasePrice: pData.purchasePrice,
          taxRate: pData.taxRate,
          stock: BigInt(pData.stock),
          minStockLevel: pData.minStockLevel,
          category: pData.category,
          brand: pData.brand,
          unit: pData.unit,
          sku: sku,
          productCode: sku,
          barcode: barcode,
          status: 'Active',
          customFields: JSON.stringify(pData.customFields)
        }
      });
    }

    console.log(`✅ Seeded ${dataList.length} products for ${slug}!`);
    totalSeeded += dataList.length;
  }

  console.log(`🎉 Success! Seeded a total of ${totalSeeded} products across all industries.`);
}

main()
  .catch(e => {
    console.error('❌ Product Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
