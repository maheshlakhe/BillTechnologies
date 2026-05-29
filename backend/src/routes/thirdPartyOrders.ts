import express from 'express';
import prisma from '../lib/prisma';
import { recordAuditLog } from '../lib/auditLog';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const db = prisma as any;

// Helper to parse JSON string
const safeParse = (str: any) => {
  if (!str) return [];
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
};

// Sample mock items for simulation
const MOCK_ITEMS = [
  { name: 'Veg Biryani', price: 220, taxRate: 5 },
  { name: 'Paneer Tikka', price: 280, taxRate: 5 },
  { name: 'Butter Chicken', price: 380, taxRate: 5 },
  { name: 'Garlic Naan', price: 60, taxRate: 5 },
  { name: 'Mango Lassi', price: 90, taxRate: 5 },
  { name: 'Dal Makhani', price: 240, taxRate: 5 },
  { name: 'Mutton Rogan Josh', price: 420, taxRate: 5 },
  { name: 'Chicken Tikka Masala', price: 340, taxRate: 5 }
];

const MOCK_CUSTOMERS = [
  { name: 'Aarav Sharma', phone: '9876543210', address: 'Flat 402, Royal Palms, Sector 15, Vashi, Navi Mumbai' },
  { name: 'Rahul Verma', phone: '9812345678', address: '12B, Park Street, Near Metro Station, Kolkata' },
  { name: 'Priya Patel', phone: '9765432109', address: 'Plot 45, Jubilee Hills, Road No. 3, Hyderabad' },
  { name: 'Siddharth Sen', phone: '9900112233', address: 'Apt 104, Prestige Heights, Outer Ring Road, Bangalore' },
  { name: 'Anjali Nair', phone: '9845612307', address: 'House 89, Gali No. 4, Lajpat Nagar, New Delhi' },
  { name: 'Neha Kapoor', phone: '9632587410', address: 'Block C-3, Greenwood Apartments, Sector 45, Gurgaon' },
  { name: 'Vikram Singh', phone: '9514785236', address: 'Flat 12A, Sunset View Towers, Marine Drive, Mumbai' }
];

// GET: Retrieve all active or history third party orders
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const history = req.query.history === 'true';

    const statusFilter = history
      ? { in: ['SETTLED', 'CANCELLED'] }
      : { notIn: ['SETTLED', 'CANCELLED'] };

    const orders = await db.thirdPartyOrder.findMany({
      where: {
        userId,
        status: statusFilter
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: history ? 50 : undefined
    });

    const parsedOrders = orders.map((order: any) => ({
      ...order,
      items: safeParse(order.items)
    }));

    // Calculate today's settled revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const settledToday = await db.thirdPartyOrder.findMany({
      where: {
        userId,
        status: 'SETTLED',
        updatedAt: {
          gte: todayStart
        }
      },
      select: {
        totalAmount: true
      }
    });
    const todayRevenue = settledToday.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    res.status(200).json({ success: true, orders: parsedOrders, todayRevenue });
  } catch (error: any) {
    console.error('Get third party orders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST: Webhook receiver for Zomato
router.post('/webhook/zomato/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log(`[Zomato Webhook] Received webhook call for org ${orgId}:`, req.body);

    const orgUser = await prisma.user.findUnique({
      where: { id: orgId }
    });

    if (!orgUser) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const payload = req.body;
    const orderId = payload.order_id || payload.orderId || `ZOM-WEB-${Date.now().toString().slice(-6)}`;
    const customerName = payload.customer?.name || payload.customerName || 'Zomato Customer';
    const customerPhone = payload.customer?.phone || payload.customerPhone || '9999999999';
    const deliveryAddress = payload.customer?.delivery_address || payload.deliveryAddress || payload.address || 'Delivery Address';
    
    let rawItems = payload.items || (payload.cart && payload.cart.items) || [];
    if (!Array.isArray(rawItems)) {
      rawItems = [];
    }

    const items = rawItems.map((item: any) => {
      const q = Math.round(Number(item.quantity || item.qty || 1));
      const p = Number(item.price || item.rate || 0);
      return {
        productName: item.name || item.productName || 'Custom Zomato Item',
        quantity: q,
        price: p,
        total: q * p,
        taxRate: Number(item.taxRate || item.tax_rate || 5)
      };
    });

    if (items.length === 0) {
      items.push({
        productName: 'Veg Biryani',
        quantity: 1,
        price: 220,
        total: 220,
        taxRate: 5
      });
    }

    const subtotal = Number(payload.subtotal || items.reduce((sum: number, i: any) => sum + i.total, 0));
    const taxAmount = Number(payload.tax || payload.taxAmount || items.reduce((sum: number, i: any) => sum + (i.total * i.taxRate) / 100, 0));
    const totalAmount = Number(payload.total || payload.totalAmount || (subtotal + taxAmount));

    const order = await db.thirdPartyOrder.create({
      data: {
        userId: orgId,
        orderId,
        platform: 'ZOMATO',
        customerName,
        customerPhone,
        deliveryAddress,
        items: JSON.stringify(items),
        subtotal,
        taxAmount,
        totalAmount,
        status: 'PENDING'
      }
    });

    await recordAuditLog({
      userId: orgId,
      action: 'CREATE',
      entity: 'ThirdPartyOrder',
      entityId: order.id,
      description: `Incoming Zomato webhook order ${orderId} received and saved.`,
      newData: { orderId, totalAmount, platform: 'ZOMATO' }
    });

    res.status(200).json({ success: true, status: 'received', orderId: order.orderId });
  } catch (error: any) {
    console.error('[Zomato Webhook] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Webhook processing failed' });
  }
});

// POST: Webhook receiver for Swiggy
router.post('/webhook/swiggy/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log(`[Swiggy Webhook] Received webhook call for org ${orgId}:`, req.body);

    const orgUser = await prisma.user.findUnique({
      where: { id: orgId }
    });

    if (!orgUser) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const payload = req.body;
    const orderId = payload.orderId || payload.order_id || `SWI-WEB-${Date.now().toString().slice(-6)}`;
    const customerName = payload.customerName || payload.customer?.name || 'Swiggy Customer';
    const customerPhone = payload.customerPhone || payload.customer?.phone || '9999999999';
    const deliveryAddress = payload.address || payload.deliveryAddress || payload.customer?.delivery_address || 'Delivery Address';
    
    let rawItems = payload.items || (payload.cart && payload.cart.items) || [];
    if (!Array.isArray(rawItems)) {
      rawItems = [];
    }

    const items = rawItems.map((item: any) => {
      const q = Math.round(Number(item.quantity || item.qty || 1));
      const p = Number(item.price || item.rate || 0);
      return {
        productName: item.name || item.productName || 'Custom Swiggy Item',
        quantity: q,
        price: p,
        total: q * p,
        taxRate: Number(item.taxRate || item.tax_rate || 5)
      };
    });

    if (items.length === 0) {
      items.push({
        productName: 'Butter Chicken',
        quantity: 1,
        price: 380,
        total: 380,
        taxRate: 5
      });
    }

    const subtotal = Number(payload.subtotal || (payload.cart && payload.cart.subtotal) || items.reduce((sum: number, i: any) => sum + i.total, 0));
    const taxAmount = Number(payload.tax || payload.taxAmount || (payload.cart && payload.cart.tax) || items.reduce((sum: number, i: any) => sum + (i.total * i.taxRate) / 100, 0));
    const totalAmount = Number(payload.total || payload.totalAmount || (payload.cart && payload.cart.total) || (subtotal + taxAmount));

    const order = await db.thirdPartyOrder.create({
      data: {
        userId: orgId,
        orderId,
        platform: 'SWIGGY',
        customerName,
        customerPhone,
        deliveryAddress,
        items: JSON.stringify(items),
        subtotal,
        taxAmount,
        totalAmount,
        status: 'PENDING'
      }
    });

    await recordAuditLog({
      userId: orgId,
      action: 'CREATE',
      entity: 'ThirdPartyOrder',
      entityId: order.id,
      description: `Incoming Swiggy webhook order ${orderId} received and saved.`,
      newData: { orderId, totalAmount, platform: 'SWIGGY' }
    });

    res.status(200).json({ success: true, status: 'received', orderId: order.orderId });
  } catch (error: any) {
    console.error('[Swiggy Webhook] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Webhook processing failed' });
  }
});


// POST: Simulate an incoming Zomato/Swiggy order webhook
router.post('/simulate', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { platform = 'ZOMATO' } = req.body;

    // Pick a random customer profile
    const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];

    // Generate random 1-3 items
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedItems: any[] = [];
    const usedIndices = new Set();

    while (selectedItems.length < numItems) {
      const randIdx = Math.floor(Math.random() * MOCK_ITEMS.length);
      if (!usedIndices.has(randIdx)) {
        usedIndices.add(randIdx);
        const item = MOCK_ITEMS[randIdx];
        const quantity = Math.floor(Math.random() * 2) + 1;
        selectedItems.push({
          productName: item.name,
          quantity,
          price: item.price,
          total: item.price * quantity,
          taxRate: item.taxRate
        });
      }
    }

    // Calculations
    const subtotal = selectedItems.reduce((sum: number, i: any) => sum + i.total, 0);
    const taxAmount = selectedItems.reduce((sum: number, i: any) => sum + (i.total * i.taxRate) / 100, 0);
    const totalAmount = subtotal + taxAmount;

    // Order ID generation
    const prefix = platform === 'ZOMATO' ? 'ZOM' : 'SWI';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    const orderId = `${prefix}-${timestamp}-${random}`;

    // Create record
    const order = await db.thirdPartyOrder.create({
      data: {
        userId,
        orderId,
        platform,
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: customer.address,
        items: JSON.stringify(selectedItems),
        subtotal,
        taxAmount,
        totalAmount,
        status: 'PENDING'
      }
    });

    const parsedOrder = {
      ...order,
      items: selectedItems
    };

    // Trigger local audit log
    await recordAuditLog({
      userId,
      subUserId: req.user.id,
      action: 'CREATE',
      entity: 'ThirdPartyOrder',
      entityId: order.id,
      description: `Simulated incoming ${platform} order ${orderId} received.`,
      req,
      newData: { orderId, totalAmount, platform }
    });

    res.status(201).json({ success: true, order: parsedOrder });
  } catch (error: any) {
    console.error('Simulate order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// PUT: Update progress status
router.put('/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.orgId;

    if (!['PENDING', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const existingOrder = await db.thirdPartyOrder.findFirst({
      where: { id, userId }
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await db.thirdPartyOrder.update({
      where: { id },
      data: { status }
    });

    // Record audit log
    await recordAuditLog({
      userId,
      subUserId: req.user.id,
      action: 'UPDATE',
      entity: 'ThirdPartyOrder',
      entityId: id,
      description: `Updated status of ${updatedOrder.platform} order ${updatedOrder.orderId} to ${status}`,
      req,
      oldData: { status: existingOrder.status },
      newData: { status }
    });

    res.status(200).json({
      success: true,
      order: {
        ...updatedOrder,
        items: safeParse(updatedOrder.items)
      }
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST: Settle third party order by creating POS Bill
router.post('/:id/settle', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.orgId;
    const actorId = req.user.id;

    // Fetch the order
    const order = await db.thirdPartyOrder.findFirst({
      where: { id, userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status === 'SETTLED') {
      return res.status(400).json({ success: false, error: 'Order already settled' });
    }

    const items = safeParse(order.items);

    // Create POS Bill in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customerId = `customer-${order.platform.toLowerCase()}`;
      const customerExists = await tx.customer.findFirst({
        where: { userId, name: `${order.platform} Auto Profile` }
      });

      if (customerExists) {
        customerId = customerExists.id;
      } else {
        const newCust = await tx.customer.create({
          data: {
            userId,
            name: `${order.platform} Auto Profile`,
            phone: order.customerPhone || '9999999999',
            isActive: true,
            type: 'UNREGISTERED'
          }
        });
        customerId = newCust.id;
      }

      // Generate invoice number
      const prefix = 'INV';
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await tx.bill.count({ where: { userId } });
      
      let sequence = count + 1;
      let candidateNumber = '';
      let isUnique = false;

      while (!isUnique) {
        candidateNumber = `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
        const existing = await tx.bill.findUnique({ where: { billNumber: candidateNumber } });
        if (!existing) {
          isUnique = true;
        } else {
          sequence++;
        }
      }

      // Create new local bill
      const newBill = await tx.bill.create({
        data: {
          userId,
          customerId,
          billNumber: candidateNumber,
          customerName: order.customerName,
          customerEmail: null,
          status: 'PAID',
          paymentStatus: 'PAID',
          paidAmount: order.totalAmount,
          dueAmount: 0,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          totalAmount: order.totalAmount,
          templateId: 'thermal_58mm',
          dueDate: new Date(),
          notes: `Settled from ${order.platform} Order #${order.orderId}`,
          paymentMode: `Online (${order.platform})`,
          customFields: JSON.stringify({
            table_no: `Delivery (${order.platform})`,
            delivery_address: order.deliveryAddress,
            order_id: order.orderId
          }),
          items: {
            create: items.map((item: any) => ({
              productName: item.productName,
              quantity: BigInt(Math.round(item.quantity) || 1),
              price: item.price,
              total: item.total,
              taxRate: item.taxRate || 0,
              taxAmount: (item.total * (item.taxRate || 0)) / 100,
              custom_fields: JSON.stringify({
                platform: order.platform,
                order_id: order.orderId
              })
            }))
          }
        } as any,
        include: {
          items: true
        }
      });

      // Update Third Party Order status to SETTLED
      await (tx as any).thirdPartyOrder.update({
        where: { id },
        data: {
          status: 'SETTLED',
          billId: newBill.id
        }
      });

      // Audit Log
      await recordAuditLog({
        prismaClient: tx,
        userId,
        subUserId: actorId,
        action: 'CREATE',
        entity: 'Bill',
        entityId: newBill.id,
        description: `POS Bill #${newBill.billNumber} created automatically from ${order.platform} delivery settlement.`,
        req,
        newData: { billNumber: newBill.billNumber, totalAmount: newBill.totalAmount }
      });

      return newBill;
    });

    res.status(200).json({
      success: true,
      message: 'Order settled and bill created successfully',
      bill: {
        ...(result as any),
        items: (((result as any).items || []) as any[]).map((item: any) => ({
          ...item,
          custom_fields: safeParse(item.custom_fields)
        }))
      }
    });

  } catch (error: any) {
    console.error('Settle order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

export default router;
