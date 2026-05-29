import { PrismaClient, CustomerType, InvoiceType, BillStatus, PaymentStatus, POStatus, ServiceTicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

const INDIAN_STATES = [
  { name: 'Maharashtra', code: 'MH', stateCode: '27' },
  { name: 'Karnataka', code: 'KA', stateCode: '29' },
  { name: 'Delhi', code: 'DL', stateCode: '07' },
  { name: 'Tamil Nadu', code: 'TN', stateCode: '33' },
  { name: 'Gujarat', code: 'GJ', stateCode: '24' },
  { name: 'Telangana', code: 'TS', stateCode: '36' },
  { name: 'West Bengal', code: 'WB', stateCode: '19' },
  { name: 'Uttar Pradesh', code: 'UP', stateCode: '09' },
  { name: 'Rajasthan', code: 'RJ', stateCode: '08' },
  { name: 'Haryana', code: 'HR', stateCode: '06' }
];

async function main() {
  console.log('🌱 Starting Advanced Database Seeding (Customers, Services, Tickets, Bills, Purchase Orders)...');

  // Fetch all users in the system
  const users = await prisma.user.findMany({
    include: {
      profile: true
    }
  });

  if (users.length === 0) {
    console.log('⚠️ No users found in the database. Please run seed-demo-user first.');
    return;
  }

  console.log(`👤 Found ${users.length} users in database. Seeding data for each user...`);

  for (let uIdx = 0; uIdx < users.length; uIdx++) {
    const user = users[uIdx];
    console.log(`\n------------------------------------------------------------`);
    console.log(`👉 [${uIdx + 1}/${users.length}] Seeding for User: ${user.email} (${user.profile?.companyName || 'No Company'})`);

    // Clean up existing data to allow clean re-runs
    console.log('🧹 Cleaning old transactional seed data for this user...');
    await prisma.serviceItem.deleteMany({ where: { serviceTicket: { userId: user.id } } });
    await prisma.serviceTicket.deleteMany({ where: { userId: user.id } });
    await prisma.billItem.deleteMany({ where: { bill: { userId: user.id } } });
    await prisma.bill.deleteMany({ where: { userId: user.id } });
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { userId: user.id } } });
    await prisma.purchaseOrder.deleteMany({ where: { userId: user.id } });
    await prisma.supplier.deleteMany({ where: { userId: user.id } });
    await prisma.customer.deleteMany({ where: { userId: user.id } });
    await prisma.service.deleteMany({ where: { userId: user.id } });
    await prisma.expense.deleteMany({ where: { userId: user.id } });

    // 1. Create 10 Customers representing different industries and GST states
    console.log('👥 Creating 10 diverse Customers...');
    const customerDefs = [
      { name: 'Aura Retail Outlet', email: 'billing@auraretail.com', phone: '9812345670', address: '12, Fashion Street, Bandra', city: 'Mumbai', stateIdx: 0, type: CustomerType.REGISTERED, gstin: `27AABCA${uIdx.toString().padStart(4, '0')}A1Z1` },
      { name: 'Wellness Pharmacy & Labs', email: 'procure@wellnessrx.com', phone: '9812345671', address: '45, MG Road, Indiranagar', city: 'Bangalore', stateIdx: 1, type: CustomerType.REGISTERED, gstin: `29AABCA${uIdx.toString().padStart(4, '0')}B1Z2` },
      { name: 'Apex Automobile Distributors', email: 'spares@apexauto.in', phone: '9812345672', address: '8, Connaught Place', city: 'New Delhi', stateIdx: 2, type: CustomerType.REGISTERED, gstin: `07AABCA${uIdx.toString().padStart(4, '0')}C1Z3` },
      { name: 'Galaxy Electronics Hub', email: 'sales@galaxyelectronics.com', phone: '9812345673', address: '102, T-Nagar', city: 'Chennai', stateIdx: 3, type: CustomerType.REGISTERED, gstin: `33AABCA${uIdx.toString().padStart(4, '0')}D1Z4` },
      { name: 'Zenith Education Group', email: 'accounts@zenithedu.org', phone: '9812345674', address: '304, Ashram Road', city: 'Ahmedabad', stateIdx: 4, type: CustomerType.REGISTERED, gstin: `24AABCA${uIdx.toString().padStart(4, '0')}E1Z5` },
      { name: 'Vanguard Logistics Services', email: 'ops@vanguardlogistics.com', phone: '9812345675', address: 'Gachibowli Outer Ring Road', city: 'Hyderabad', stateIdx: 5, type: CustomerType.REGISTERED, gstin: `36AABCA${uIdx.toString().padStart(4, '0')}F1Z6` },
      { name: 'Grand Palace Hotel & Suites', email: 'inventory@grandpalace.in', phone: '9812345676', address: 'Sector 5, Salt Lake', city: 'Kolkata', stateIdx: 6, type: CustomerType.UNREGISTERED, gstin: null },
      { name: 'Nexa Furniture Mart', email: 'retail@nexafurniture.com', phone: '9812345677', address: 'Hazratganj Main Cross', city: 'Lucknow', stateIdx: 7, type: CustomerType.UNREGISTERED, gstin: null },
      { name: 'Elite Salon & Spa Lounge', email: 'appointments@elitesalon.com', phone: '9812345678', address: 'C-Scheme, MI Road', city: 'Jaipur', stateIdx: 8, type: CustomerType.UNREGISTERED, gstin: null },
      { name: 'Max Grocery Supermarket', email: 'suppliers@maxgrocery.in', phone: '9812345679', address: 'DLF Phase 3', city: 'Gurgaon', stateIdx: 9, type: CustomerType.UNREGISTERED, gstin: null }
    ];

    const seededCustomers = [];
    for (let i = 0; i < customerDefs.length; i++) {
      const def = customerDefs[i];
      const stateObj = INDIAN_STATES[def.stateIdx];
      const customer = await prisma.customer.create({
        data: {
          id: `${user.id}-customer-${i + 1}`,
          userId: user.id,
          name: def.name,
          email: def.email,
          phone: def.phone,
          address: def.address,
          city: def.city,
          state: stateObj.name,
          stateCode: stateObj.stateCode,
          pincode: '400001',
          type: def.type,
          gstNumber: def.gstin,
          isActive: true
        }
      });
      seededCustomers.push(customer);
    }
    console.log(`✅ Seeded ${seededCustomers.length} Customers.`);

    // 2. Create 10 Services representing different industry specialties
    console.log('🛠️ Creating 10 diverse Services...');
    const serviceDefs = [
      { name: 'Annual Smart TV Maintenance Contract', desc: 'Full diagnostic & screen coverage for corporate display screens', price: 2400.0, taxRate: 18.0, hsn: '998713', duration: '1 Year', cat: 'Electronics Support' },
      { name: 'Pharmacology Formulation Lab Consultation', desc: 'Expert verification of drug compatibility and custom formulations', price: 4500.0, taxRate: 12.0, hsn: '998311', duration: '2 Hours', cat: 'Medical Services' },
      { name: 'Premium Car Detailing & Engine Calibration', desc: 'Engine tuning, paint protection, and ECU calibration', price: 8500.0, taxRate: 18.0, hsn: '998714', duration: '4 Hours', cat: 'Automobile Repair' },
      { name: 'Vedic Mathematics Masterclass Series', desc: 'Curriculum-aligned masterclass sessions for school educators', price: 12000.0, taxRate: 18.0, hsn: '999293', duration: '6 Weeks', cat: 'Educational Services' },
      { name: 'Commercial Real Estate Valuation Report', desc: 'Certified valuation for banking, tax, and asset records', price: 25000.0, taxRate: 18.0, hsn: '998222', duration: '3 Days', cat: 'Property Valuation' },
      { name: 'Interstate Cargo Carrier & Shipping Insurance', desc: 'Express transport logistics from Maharashtra to Karnataka with basic cover', price: 15000.0, taxRate: 18.0, hsn: '996511', duration: '48 Hours', cat: 'Logistics Operations' },
      { name: 'Luxury Bridal Hair, Makeup & Styling package', desc: 'Complete high-definition airbrush makeup and professional hairstyling', price: 35000.0, taxRate: 18.0, hsn: '999721', duration: '5 Hours', cat: 'Beauty Services' },
      { name: 'Direct Farm-to-Kitchen Supply Chain Fee', desc: 'Custom handling, sorting, and refrigeration transportation logistics', price: 1500.0, taxRate: 5.0, hsn: '996519', duration: 'Same Day', cat: 'Supply Chain Fee' },
      { name: 'Custom ERP Feature Module Development', desc: 'Full-stack software engineering to build industry-specific logic', price: 120000.0, taxRate: 18.0, hsn: '998313', duration: '1 Month', cat: 'Software Engineering' },
      { name: '5-Star Corporate Event Catering Management', desc: 'Premium buffet service and dedicated chefs for up to 100 guests', price: 80000.0, taxRate: 18.0, hsn: '996331', duration: '1 Day', cat: 'Hospitality Events' }
    ];

    const seededServices = [];
    for (let i = 0; i < serviceDefs.length; i++) {
      const def = serviceDefs[i];
      const service = await prisma.service.create({
        data: {
          id: `${user.id}-service-${i + 1}`,
          userId: user.id,
          name: def.name,
          description: def.desc,
          price: def.price,
          taxRate: def.taxRate,
          hsnCode: def.hsn,
          duration: def.duration,
          category: def.cat,
          isActive: true
        }
      });
      seededServices.push(service);
    }
    console.log(`✅ Seeded ${seededServices.length} Services.`);

    // 3. Create Supplier
    console.log('🏢 Creating Supplier for Purchase Orders...');
    const supplier = await prisma.supplier.create({
      data: {
        id: `${user.id}-supplier-1`,
        userId: user.id,
        name: 'Prime Goods Supplier Ltd',
        contact: 'Karan Sharma',
        email: 'sales@primesupplier.in',
        phone: '9923456789',
        address: 'Plot 88, MIDC Industrial Area',
        city: 'Pune',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '411018',
        gstNumber: `27AABCP${uIdx.toString().padStart(4, '0')}G1Z9`,
        isActive: true,
        balance: 145000.0
      }
    });

    // 4. Create 10 Service Tickets with diverse statuses, priorities, technicians
    console.log('🎫 Creating 10 Service Tickets...');
    const ticketProblems = [
      { problem: 'Smart TV Screen Flickering on Corporate Boardroom Display', tech: 'Vikram Phalke', priority: 'HIGH', status: ServiceTicketStatus.OPEN, dev: 'Samsung QLED 65-inch' },
      { problem: 'ECU Calibration required after clutch replacement', tech: 'Anil Deshmukh', priority: 'MEDIUM', status: ServiceTicketStatus.IN_PROGRESS, dev: 'Honda City i-VTEC' },
      { problem: 'Formulation verify check failing for multi-vitamin capsule batch #92', tech: 'Dr. Sneha Patil', priority: 'HIGH', status: ServiceTicketStatus.OPEN, dev: 'Lab Mixer Model-X2' },
      { problem: 'Event venue sound system setup and audio levels tuning', tech: 'Rahul Kulkarni', priority: 'LOW', status: ServiceTicketStatus.COMPLETED, dev: 'JBL Professional Sound Stack' },
      { problem: 'Verify property legal title and cross-verify with boundary lines', tech: 'Adv. Suresh Mehta', priority: 'MEDIUM', status: ServiceTicketStatus.IN_PROGRESS, dev: 'Land Registry Documents' },
      { problem: 'Cold-chain refrigeration malfunction during fresh farm delivery', tech: 'Kunal Shinde', priority: 'HIGH', status: ServiceTicketStatus.OPEN, dev: 'Carrier Refrigerator Truck' },
      { problem: 'Troubleshoot database locks and API timeouts during heavy sync loading', tech: 'Shubham Pardhi', priority: 'HIGH', status: ServiceTicketStatus.IN_PROGRESS, dev: 'Postgres DB Server Instance' },
      { problem: 'Bridal trial makeup hair coloring and skin prep styling session', tech: 'Priya Sen', priority: 'LOW', status: ServiceTicketStatus.COMPLETED, dev: 'Luxury Bridal Suite' },
      { problem: 'Air cargo tracking portal showing incorrect dispatch weights', tech: 'Sumit Joshi', priority: 'MEDIUM', status: ServiceTicketStatus.COMPLETED, dev: 'Logistics Air API' },
      { problem: 'Check classroom digital smartboard projector lamp status and alignment', tech: 'Rohan Deshpande', priority: 'LOW', status: ServiceTicketStatus.CANCELLED, dev: 'Epson Interactive Projector' }
    ];

    for (let i = 0; i < ticketProblems.length; i++) {
      const prob = ticketProblems[i];
      const cust = seededCustomers[i % seededCustomers.length];
      const serv = seededServices[i % seededServices.length];
      
      const ticket = await prisma.serviceTicket.create({
        data: {
          id: `${user.id}-ticket-${i + 1}`,
          userId: user.id,
          ticketNumber: `TK-${uIdx}-${new Date().getFullYear()}-${1000 + i}`,
          customerId: cust.id,
          serviceId: serv.id,
          deviceInfo: prob.dev,
          problemDescription: prob.problem,
          assignedTechnician: prob.tech,
          priority: prob.priority,
          status: prob.status,
          serviceItems: {
            create: [
              { itemName: 'Basic Diagnostics Service Fee', price: 500.0 },
              { itemName: 'Technician Visiting & Travel Allowance', price: 300.0 }
            ]
          }
        }
      });
    }
    console.log(`✅ Seeded 10 Service Tickets.`);

    // 5. Create 15 Bills spread across 5 months (Jan 2026 to May 2026) to generate awesome graph progression
    // Distribute different GSTR-1 Categories: B2B, B2C_SMALL, B2C_LARGE, EXPORT
    console.log('📄 Creating 15 monthly progress Bills to load GST and Sales reports...');
    
    // Monthly configurations
    const monthlyBills = [
      // JANUARY 2026
      { month: 0, day: 5, customerIdx: 0, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: false, subtotal: 45000.0, gstRate: 18.0, billNo: '01-01' },
      { month: 0, day: 15, customerIdx: 6, status: BillStatus.PAID, invType: InvoiceType.B2C_SMALL, isInterstate: true, subtotal: 12000.0, gstRate: 12.0, billNo: '01-02' },
      { month: 0, day: 22, customerIdx: 1, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: true, subtotal: 120000.0, gstRate: 18.0, billNo: '01-03' },
      
      // FEBRUARY 2026
      { month: 1, day: 4, customerIdx: 2, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: true, subtotal: 90000.0, gstRate: 18.0, billNo: '02-01' },
      { month: 1, day: 14, customerIdx: 7, status: BillStatus.PAID, invType: InvoiceType.B2C_SMALL, isInterstate: false, subtotal: 25000.0, gstRate: 5.0, billNo: '02-02' },
      { month: 1, day: 28, customerIdx: 3, status: BillStatus.PAID, invType: InvoiceType.B2C_LARGE, isInterstate: true, subtotal: 280000.0, gstRate: 18.0, billNo: '02-03' }, // B2C Large (>2.5L Interstate)
      
      // MARCH 2026
      { month: 2, day: 10, customerIdx: 4, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: true, subtotal: 180000.0, gstRate: 18.0, billNo: '03-01' },
      { month: 2, day: 18, customerIdx: 8, status: BillStatus.PAID, invType: InvoiceType.B2C_SMALL, isInterstate: false, subtotal: 18500.0, gstRate: 18.0, billNo: '03-02' },
      { month: 2, day: 26, customerIdx: 0, status: BillStatus.PAID, invType: InvoiceType.EXPORT, isInterstate: true, subtotal: 350000.0, gstRate: 18.0, billNo: '03-03' }, // Export (zero-rated outward supplies)
      
      // APRIL 2026
      { month: 3, day: 8, customerIdx: 5, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: true, subtotal: 22000.0, gstRate: 18.0, billNo: '04-01' },
      { month: 3, day: 16, customerIdx: 9, status: BillStatus.PAID, invType: InvoiceType.B2C_SMALL, isInterstate: false, subtotal: 45000.0, gstRate: 5.0, billNo: '04-02' },
      { month: 3, day: 25, customerIdx: 1, status: BillStatus.PAID, invType: InvoiceType.B2C_LARGE, isInterstate: true, subtotal: 290000.0, gstRate: 18.0, billNo: '04-03' },
      
      // MAY 2026 (Live Current Month)
      { month: 4, day: 3, customerIdx: 0, status: BillStatus.PAID, invType: InvoiceType.B2B, isInterstate: false, subtotal: 310000.0, gstRate: 18.0, billNo: '05-01' },
      { month: 4, day: 10, customerIdx: 2, status: BillStatus.PENDING, invType: InvoiceType.B2B, isInterstate: true, subtotal: 150000.0, gstRate: 18.0, billNo: '05-02' }, // Pending Bill
      { month: 4, day: 15, customerIdx: 9, status: BillStatus.DRAFT, invType: InvoiceType.B2C_SMALL, isInterstate: false, subtotal: 3500.0, gstRate: 5.0, billNo: '05-03' } // Draft Bill
    ];

    for (let i = 0; i < monthlyBills.length; i++) {
      const config = monthlyBills[i];
      const cust = seededCustomers[config.customerIdx];
      const service = seededServices[i % seededServices.length];
      
      const billDate = new Date(2026, config.month, config.day, 12, 0, 0);
      const dueDate = new Date(2026, config.month, config.day + 15, 12, 0, 0);

      // Calculate exact GST splits
      const gstPercent = config.gstRate;
      const totalTax = Math.round((config.subtotal * (gstPercent / 100)) * 100) / 100;
      const totalAmount = Math.round((config.subtotal + totalTax) * 100) / 100;
      
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (config.isInterstate) {
        igst = totalTax;
      } else {
        cgst = Math.round((totalTax / 2) * 100) / 100;
        sgst = Math.round((totalTax / 2) * 100) / 100;
      }

      await prisma.bill.create({
        data: {
          id: `${user.id}-bill-${i + 1}`,
          userId: user.id,
          customerId: cust.id,
          billNumber: `INV-${uIdx}-${config.billNo}-${i}`,
          customerName: cust.name,
          customerEmail: cust.email,
          status: config.status,
          subtotal: config.subtotal,
          taxAmount: totalTax,
          totalAmount: totalAmount,
          dueDate: dueDate,
          createdAt: billDate,
          updatedAt: billDate,
          paymentStatus: config.status === BillStatus.PAID ? PaymentStatus.PAID : PaymentStatus.PENDING,
          paidAmount: config.status === BillStatus.PAID ? totalAmount : 0.0,
          dueAmount: config.status === BillStatus.PAID ? 0.0 : totalAmount,
          invoiceType: config.invType,
          placeOfSupply: cust.state,
          isInterstate: config.isInterstate,
          reverseCharge: false,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          paymentMode: config.status === BillStatus.PAID ? 'UPI' : 'Cash',
          templateId: 'standard',
          items: {
            create: [
              {
                productName: service.name,
                quantity: 1n,
                price: config.subtotal,
                total: config.subtotal,
                taxRate: gstPercent,
                taxAmount: totalTax,
                cgstAmount: cgst,
                sgstAmount: sgst,
                igstAmount: igst,
                hsnCode: service.hsnCode,
                isService: true,
                serviceId: service.id
              }
            ]
          }
        }
      });
    }
    console.log(`✅ Seeded ${monthlyBills.length} monthly progression & GST Bills.`);

    // 6. Create 5 Purchase Orders with status 'RECEIVED' to generate ITC input tax credits for GSTR-3B
    console.log('📦 Creating 5 Purchase Orders to satisfy GSTR-3B Input Tax Credit (ITC) metrics...');
    const poDefs = [
      { subtotal: 35000.0, gstRate: 18.0, isInterstate: false, poNo: 'PO/2026/01/01', month: 1 },
      { subtotal: 62000.0, gstRate: 18.0, isInterstate: true, poNo: 'PO/2026/02/01', month: 2 },
      { subtotal: 18000.0, gstRate: 12.0, isInterstate: false, poNo: 'PO/2026/03/01', month: 3 },
      { subtotal: 120000.0, gstRate: 18.0, isInterstate: true, poNo: 'PO/2026/04/01', month: 4 },
      { subtotal: 80000.0, gstRate: 18.0, isInterstate: false, poNo: 'PO/2026/05/01', month: 4 }
    ];

    for (let i = 0; i < poDefs.length; i++) {
      const config = poDefs[i];
      const poDate = new Date(2026, config.month, 10, 10, 0, 0);

      const totalTax = Math.round((config.subtotal * (config.gstRate / 100)) * 100) / 100;
      const totalAmount = Math.round((config.subtotal + totalTax) * 100) / 100;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (config.isInterstate) {
        igst = totalTax;
      } else {
        cgst = Math.round((totalTax / 2) * 100) / 100;
        sgst = Math.round((totalTax / 2) * 100) / 100;
      }

      await prisma.purchaseOrder.create({
        data: {
          id: `${user.id}-po-${i + 1}`,
          userId: user.id,
          poNumber: `PO-${uIdx}-${config.poNo.replace(/\//g, '-')}-${i}`,
          supplierId: supplier.id,
          orderDate: poDate,
          createdAt: poDate,
          updatedAt: poDate,
          status: POStatus.RECEIVED,
          totalAmount: totalAmount,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          items: {
            create: [
              {
                productName: 'Raw Bulk Materials & Enterprise Accessories',
                quantity: 10n,
                price: Math.round((config.subtotal / 10) * 100) / 100,
                total: config.subtotal,
                taxRate: config.gstRate,
                taxAmount: totalTax,
                cgstAmount: cgst,
                sgstAmount: sgst,
                igstAmount: igst,
                hsnCode: '847330'
              }
            ]
          }
        }
      });
    }
    console.log(`✅ Seeded ${poDefs.length} Purchase Orders with ITC credits.`);

    // 7. Create 10 diverse Expenses spread across 5 months to feed financial reports
    console.log('💸 Creating 10 diverse Expenses...');
    const expenseDefs = [
      { title: 'Monthly Office Rent', category: 'Rent', amount: 35000.0, gstAmount: 6300.0, month: 0, day: 2 },
      { title: 'High-speed Fiber Internet Billing', category: 'Utilities', amount: 2500.0, gstAmount: 450.0, month: 0, day: 10 },
      { title: 'Professional Branding & Printing', category: 'Marketing', amount: 8500.0, gstAmount: 1530.0, month: 1, day: 5 },
      { title: 'Monthly Office Rent', category: 'Rent', amount: 35000.0, gstAmount: 6300.0, month: 1, day: 2 },
      { title: 'Electricity Utility Bill', category: 'Utilities', amount: 6200.0, gstAmount: 1116.0, month: 2, day: 12 },
      { title: 'Monthly Office Rent', category: 'Rent', amount: 35000.0, gstAmount: 6300.0, month: 2, day: 2 },
      { title: 'Facebook & Google Ad Campaign', category: 'Marketing', amount: 15000.0, gstAmount: 2700.0, month: 3, day: 15 },
      { title: 'Monthly Office Rent', category: 'Rent', amount: 35000.0, gstAmount: 6300.0, month: 3, day: 2 },
      { title: 'A4 Printing Paper & Office Stationery', category: 'Office Supplies', amount: 1200.0, gstAmount: 216.0, month: 4, day: 8 },
      { title: 'Monthly Office Rent', category: 'Rent', amount: 35000.0, gstAmount: 6300.0, month: 4, day: 2 }
    ];

    for (let i = 0; i < expenseDefs.length; i++) {
      const exp = expenseDefs[i];
      const expDate = new Date(2026, exp.month, exp.day, 10, 0, 0);
      await prisma.expense.create({
        data: {
          id: `${user.id}-expense-${i + 1}`,
          userId: user.id,
          title: exp.title,
          category: exp.category,
          amount: exp.amount,
          gstAmount: exp.gstAmount,
          date: expDate,
          description: `Seeded ${exp.category} expense record for company analysis.`,
          createdAt: expDate,
          updatedAt: expDate
        }
      });
    }
    console.log(`✅ Seeded ${expenseDefs.length} diverse Expenses.`);
  }

  console.log('\n🎉 ALL ADVANCED SEED DATA POPULATED SUCCESSFULLY!');
  console.log('   - 10 detailed Customers per user');
  console.log('   - 10 specialized industry-slotted Services per user');
  console.log('   - 10 Service Tickets with items, priorities, assigned technicians per user');
  console.log('   - 15 monthly bills (B2B, B2C Large, B2C Small, EXPORT) to satisfy all GSTR reports');
  console.log('   - 5 Received Purchase Orders generating realistic ITC for GSTR-3B');
}

main()
  .catch((e) => {
    console.error('❌ Error executing advanced seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
