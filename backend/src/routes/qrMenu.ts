import express from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { recordAuditLog } from '../lib/auditLog';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const db = prisma as any;

// Type for order item data used when building create payloads
interface OrderItemData {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes: string | null;
}

// Helper function to generate bill number
const generateBillNumber = (): string => {
  const prefix = 'INV';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// -------------------------------------------------------------
// GROUP 1: Restaurant Table Setup (Admin Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/tables — list all tables
router.get('/tables', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const tables = await db.restaurantTable.findMany({
      where: { userId, isActive: true },
      include: {
        qrCode: true,
        qrSessions: {
          where: { isActive: true },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, tables });
  } catch (error: any) {
    console.error('[QR Menu API] Get tables error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/tables — create a single table
router.post('/tables', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { name, section, capacity } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Table name is required' });
    }

    const table = await db.$transaction(async (tx: any) => {
      // 1. Create table
      const newTable = await tx.restaurantTable.create({
        data: {
          userId,
          name,
          section: section || 'General',
          capacity: Number(capacity) || 4,
          status: 'AVAILABLE'
        }
      });

      // 2. Generate secure token & QR code entry
      const token = crypto.randomBytes(16).toString('hex');
      const qrCodeUrl = `/menu/${userId}/${token}`;
      await tx.qrCode.create({
        data: {
          tableId: newTable.id,
          token,
          qrCodeUrl
        }
      });

      // 3. Log activity
      await tx.tableActivityLog.create({
        data: {
          userId,
          tableId: newTable.id,
          action: 'CREATE',
          details: `Table ${name} created in section ${section || 'General'}`
        }
      });

      return newTable;
    });

    res.status(201).json({ success: true, table });
  } catch (error: any) {
    console.error('[QR Menu API] Create table error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/tables/bulk — bulk create tables
router.post('/tables/bulk', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { totalTables, prefix, startNumber, section, capacity } = req.body;

    const count = Number(totalTables);
    const startNum = Number(startNumber) || 1;
    const tableCapacity = Number(capacity) || 4;
    const tableSection = section || 'General';

    if (!count || count <= 0) {
      return res.status(400).json({ success: false, error: 'Total tables count must be greater than 0' });
    }

    const createdTables = [];

    for (let i = 0; i < count; i++) {
      const num = startNum + i;
      const name = prefix ? `${prefix} ${num}` : `Table ${num}`;

      const table = await db.$transaction(async (tx: any) => {
        const newTable = await tx.restaurantTable.create({
          data: {
            userId,
            name,
            section: tableSection,
            capacity: tableCapacity,
            status: 'AVAILABLE'
          }
        });

        const token = crypto.randomBytes(16).toString('hex');
        const qrCodeUrl = `/menu/${userId}/${token}`;
        await tx.qrCode.create({
          data: {
            tableId: newTable.id,
            token,
            qrCodeUrl
          }
        });

        return newTable;
      });

      createdTables.push(table);
    }

    res.status(201).json({ success: true, count: createdTables.length, tables: createdTables });
  } catch (error: any) {
    console.error('[QR Menu API] Bulk create tables error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/qr-menu/tables/:id — edit table properties
router.put('/tables/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { id } = req.params;
    const { name, section, capacity } = req.body;

    const table = await db.restaurantTable.findFirst({
      where: { id, userId }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const updated = await db.restaurantTable.update({
      where: { id },
      data: {
        name: name !== undefined ? name : table.name,
        section: section !== undefined ? section : table.section,
        capacity: capacity !== undefined ? Number(capacity) : table.capacity
      }
    });

    res.status(200).json({ success: true, table: updated });
  } catch (error: any) {
    console.error('[QR Menu API] Edit table error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/tables/:id/status — enable/disable/merge/set status
router.patch('/tables/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { id } = req.params;
    const { status, isActive } = req.body;

    const table = await db.restaurantTable.findFirst({
      where: { id, userId }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const updated = await db.restaurantTable.update({
      where: { id },
      data: {
        status: status !== undefined ? status : table.status,
        isActive: isActive !== undefined ? isActive : table.isActive
      }
    });

    // Notify client sockets of table status change
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('table_status_updated', { tableId: id, status: updated.status, isActive: updated.isActive });
    }

    res.status(200).json({ success: true, table: updated });
  } catch (error: any) {
    console.error('[QR Menu API] Patch table status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/qr-menu/tables/:id — soft delete table
router.delete('/tables/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { id } = req.params;

    const table = await db.restaurantTable.findFirst({
      where: { id, userId }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    await db.restaurantTable.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({ success: true, message: 'Table successfully deleted' });
  } catch (error: any) {
    console.error('[QR Menu API] Delete table error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 2: QR Code Management (Admin Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/qr-codes — list all QR codes
router.get('/qr-codes', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const qrCodes = await db.qrCode.findMany({
      where: {
        table: {
          userId,
          isActive: true
        }
      },
      include: {
        table: true
      }
    });
    res.status(200).json({ success: true, qrCodes });
  } catch (error: any) {
    console.error('[QR Menu API] Get QR codes error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/qr-codes/:tableId/generate — regenerate token/URL
router.post('/qr-codes/:tableId/generate', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { tableId } = req.params;

    const table = await db.restaurantTable.findFirst({
      where: { id: tableId, userId }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const qrCodeUrl = `/menu/${userId}/${token}`;

    const qr = await db.qrCode.upsert({
      where: { tableId },
      update: { token, qrCodeUrl, isActive: true },
      create: { tableId, token, qrCodeUrl }
    });

    res.status(200).json({ success: true, qrCode: qr });
  } catch (error: any) {
    console.error('[QR Menu API] Generate QR code error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 3: Customer Menu (Public — NO Authentication)
// -------------------------------------------------------------

// GET /api/qr-menu/public/menu/:restaurantId/:token — scan QR & fetch active menu/info
router.get('/public/menu/:restaurantId/:token', async (req, res) => {
  try {
    const { restaurantId, token } = req.params;

    // 1. Validate QR code token
    const qr = await db.qrCode.findFirst({
      where: {
        token,
        isActive: true,
        table: {
          userId: restaurantId,
          isActive: true
        }
      },
      include: {
        table: true
      }
    });

    if (!qr) {
      return res.status(404).json({ success: false, error: 'Invalid or deactivated QR Code menu' });
    }

    // 2. Fetch active restaurant menu items (active products)
    let products = await db.product.findMany({
      where: {
        userId: restaurantId,
        status: 'Active'
      },
      orderBy: { category: 'asc' }
    });

    if (products.length === 0) {
      const defaultProducts = [
        {
          name: 'Margherita Pizza',
          description: 'Classic cheese and tomato pizza with fresh basil',
          price: 199.0,
          category: 'Pizza',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Veg Cheese Burger',
          description: 'Crispy veg patty with cheese, lettuce, tomato and signature sauce',
          price: 119.0,
          category: 'Burgers',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Paneer Butter Masala',
          description: 'Cottage cheese cubes cooked in rich, creamy tomato gravy',
          price: 249.0,
          category: 'Main Course',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Butter Chicken',
          description: 'Tender chicken pieces cooked in a creamy butter and tomato gravy',
          price: 289.0,
          category: 'Main Course',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Butter Naan',
          description: 'Soft Indian flatbread cooked in clay oven with butter',
          price: 45.0,
          category: 'Breads',
          stock: 999,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'French Fries',
          description: 'Crispy salted golden potato fries',
          price: 99.0,
          category: 'Sides',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Cold Coffee',
          description: 'Rich blended coffee served chilled with vanilla ice cream scoop',
          price: 89.0,
          category: 'Beverages',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60'
        },
        {
          name: 'Masala Lemonade',
          description: 'Refreshing carbonated lime drink with Indian spices',
          price: 59.0,
          category: 'Beverages',
          stock: 99,
          taxRate: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60'
        }
      ];

      for (const p of defaultProducts) {
        await db.product.create({
          data: {
            userId: restaurantId,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            stock: BigInt(p.stock),
            taxRate: p.taxRate,
            imageUrl: p.imageUrl,
            status: 'Active'
          }
        });
      }

      // Re-fetch products after seeding
      products = await db.product.findMany({
        where: {
          userId: restaurantId,
          status: 'Active'
        },
        orderBy: { category: 'asc' }
      });
    }

    // 3. Fetch branding configuration
    const branding = await db.userBranding.findUnique({
      where: { userId: restaurantId }
    });

    // 4. Fetch/create active session for this table
    let activeSession = await db.qrSession.findFirst({
      where: {
        tableId: qr.tableId,
        isActive: true
      }
    });

    if (!activeSession) {
      // Create a default anonymous session
      const sessionToken = crypto.randomBytes(12).toString('hex');
      activeSession = await db.qrSession.create({
        data: {
          userId: restaurantId,
          tableId: qr.tableId,
          token: sessionToken,
          customerName: 'Guest Customer',
          isActive: true
        }
      });

      // Update table status to occupied (since session is active)
      await db.restaurantTable.update({
        where: { id: qr.tableId },
        data: { status: 'OCCUPIED' }
      });

      // Notify sockets of status change
      const io = req.app.get('io');
      if (io) {
        io.to(restaurantId).emit('table_status_updated', { tableId: qr.tableId, status: 'OCCUPIED' });
        io.to(restaurantId).emit('new_session_started', { tableId: qr.tableId, session: activeSession });
      }
    }

    res.status(200).json({
      success: true,
      table: qr.table,
      session: activeSession,
      branding,
      products
    });
  } catch (error: any) {
    console.error('[QR Menu API] Get public menu error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/public/session — update/create customer session
router.post('/public/session', async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, restaurantId } = req.body;

    if (!tableId || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Table ID and Restaurant ID are required' });
    }

    // Check if table exists
    const table = await db.restaurantTable.findFirst({
      where: { id: tableId, userId: restaurantId, isActive: true }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    // Check if active session already exists
    let session = await db.qrSession.findFirst({
      where: { tableId, isActive: true }
    });

    if (session) {
      // Update details of existing session
      session = await db.qrSession.update({
        where: { id: session.id },
        data: {
          customerName: customerName || session.customerName,
          customerPhone: customerPhone || session.customerPhone
        }
      });
    } else {
      // Create new session
      const token = crypto.randomBytes(12).toString('hex');
      session = await db.qrSession.create({
        data: {
          userId: restaurantId,
          tableId,
          token,
          customerName: customerName || 'Guest Customer',
          customerPhone: customerPhone || null,
          isActive: true
        }
      });

      // Set table to occupied
      await db.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    // Notify backend sockets
    const io = req.app.get('io');
    if (io) {
      io.to(restaurantId).emit('table_status_updated', { tableId, status: 'OCCUPIED' });
      io.to(restaurantId).emit('session_updated', session);
    }

    res.status(200).json({ success: true, session });
  } catch (error: any) {
    console.error('[QR Menu API] Public session error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/public/orders — place an order (creates DineInOrder + KitchenQueue)
router.post('/public/orders', async (req, res) => {
  try {
    const { sessionId, tableId, items, notes, restaurantId } = req.body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0 || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Invalid parameters. Table ID and items are required.' });
    }

    // Verify session
    let session = null;
    if (sessionId) {
      session = await db.qrSession.findFirst({
        where: { id: sessionId, tableId, isActive: true }
      });
    }

    if (!session) {
      // Auto-create session if missing
      const token = crypto.randomBytes(12).toString('hex');
      session = await db.qrSession.create({
        data: {
          userId: restaurantId,
          tableId,
          token,
          customerName: 'Guest Customer',
          isActive: true
        }
      });
    }

    // Generate readable order number
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random
    const orderNumber = `QR-${datePrefix}-${randomSuffix}`;

    // Calculate totals
    let subtotal = 0;
    const orderItemsData: OrderItemData[] = [];

    // Fetch product details to ensure price integrity
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds }, userId: restaurantId }
    });
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

    for (const item of items) {
      const product: any = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.name}` });
      }
      const qty = Math.round(Number(item.quantity)) || 1;
      const price = Number(product.price);
      const total = price * qty;
      subtotal += total;

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        quantity: qty,
        price,
        totalPrice: total,
        notes: item.notes || null
      });
    }

    const taxRate = 5; // standard 5% tax or calculate from product tax rates if preferred
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Run transaction
    const finalOrder = await db.$transaction(async (tx: any) => {
      // 1. Create DineInOrder
      const newOrder = await tx.dineInOrder.create({
        data: {
          userId: restaurantId,
          tableId,
          sessionId: session.id,
          orderNumber,
          status: 'PENDING',
          subtotal,
          taxAmount,
          totalAmount,
          notes: notes || null,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true,
          table: true,
          session: true
        }
      });

      // 2. Create Kitchen Queue entry
      await tx.kitchenQueue.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING'
        }
      });

      // 3. Create Status Log
      await tx.dineInOrderStatusLog.create({
        data: {
          orderId: newOrder.id,
          fromStatus: 'NONE',
          toStatus: 'PENDING',
          remarks: 'Order submitted via customer mobile QR Menu'
        }
      });

      // 4. Update table status to occupied
      await tx.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' }
      });

      return newOrder;
    });

    // Notify kitchen panel & live dashboard in real-time
    const io = req.app.get('io');
    if (io) {
      io.to(restaurantId).emit('table_status_updated', { tableId, status: 'OCCUPIED' });
      io.to(restaurantId).emit('new_dine_in_order', finalOrder);
      io.to(restaurantId).emit('kitchen_kot_updated', { orderId: finalOrder.id });
    }

    res.status(201).json({ success: true, order: finalOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Place order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// GET /api/qr-menu/public/orders/:sessionId — get order list/status for live tracking
router.get('/public/orders/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const orders = await db.dineInOrder.findMany({
      where: { sessionId },
      include: {
        items: true,
        kitchenQueue: true,
        table: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    console.error('[QR Menu API] Get public orders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/public/call-waiter — trigger waiter notification
router.post('/public/call-waiter', async (req, res) => {
  try {
    const { tableId, sessionId, restaurantId } = req.body;

    if (!tableId || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Table ID and Restaurant ID are required' });
    }

    const action = await db.waiterAction.create({
      data: {
        userId: restaurantId,
        tableId,
        sessionId: sessionId || null,
        actionType: 'CALL_WAITER',
        status: 'PENDING'
      },
      include: {
        table: true
      }
    });

    // Notify Waiter sockets
    const io = req.app.get('io');
    if (io) {
      io.to(restaurantId).emit('waiter_called', action);
    }

    res.status(201).json({ success: true, action });
  } catch (error: any) {
    console.error('[QR Menu API] Call waiter error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/public/request-bill — trigger bill request notification
router.post('/public/request-bill', async (req, res) => {
  try {
    const { tableId, sessionId, restaurantId } = req.body;

    if (!tableId || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Table ID and Restaurant ID are required' });
    }

    const action = await db.waiterAction.create({
      data: {
        userId: restaurantId,
        tableId,
        sessionId: sessionId || null,
        actionType: 'REQUEST_BILL',
        status: 'PENDING'
      },
      include: {
        table: true
      }
    });

    // Notify Waiter and Admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to(restaurantId).emit('waiter_called', action);
    }

    res.status(201).json({ success: true, action });
  } catch (error: any) {
    console.error('[QR Menu API] Request bill error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/public/feedback — submit rating/feedback
router.post('/public/feedback', async (req, res) => {
  try {
    const { tableId, rating, remarks, restaurantId } = req.body;

    if (!tableId || !rating || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Table ID, Rating and Restaurant ID are required' });
    }

    // Save feedback as table activity log
    const log = await db.tableActivityLog.create({
      data: {
        userId: restaurantId,
        tableId,
        action: 'CUSTOMER_FEEDBACK',
        details: JSON.stringify({ rating, remarks })
      }
    });

    res.status(201).json({ success: true, log });
  } catch (error: any) {
    console.error('[QR Menu API] Feedback submission error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 4: Admin Live Dashboard (Admin Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/dashboard — live statistics
router.get('/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [activeTablesCount, pendingOrdersCount, preparingOrdersCount, readyOrdersCount, todayRevenue] = await Promise.all([
      db.restaurantTable.count({
        where: { userId, status: 'OCCUPIED', isActive: true }
      }),
      db.dineInOrder.count({
        where: { userId, status: 'PENDING', createdAt: { gte: todayStart } }
      }),
      db.dineInOrder.count({
        where: { userId, status: 'PREPARING', createdAt: { gte: todayStart } }
      }),
      db.dineInOrder.count({
        where: { userId, status: 'READY', createdAt: { gte: todayStart } }
      }),
      db.dineInOrder.aggregate({
        where: { userId, status: 'SETTLED', createdAt: { gte: todayStart } },
        _sum: { totalAmount: true }
      })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activeTables: activeTablesCount,
        pendingOrders: pendingOrdersCount,
        preparingOrders: preparingOrdersCount,
        readyOrders: readyOrdersCount,
        todayRevenue: todayRevenue._sum.totalAmount || 0
      }
    });
  } catch (error: any) {
    console.error('[QR Menu API] Get dashboard error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/qr-menu/orders — list dine-in orders with filters
router.get('/orders', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { status, tableId, history } = req.query;

    const whereFilter: any = { userId };
    if (status) {
      whereFilter.status = status;
    } else if (history === 'true') {
      whereFilter.status = { in: ['SETTLED', 'CANCELLED'] };
    } else {
      whereFilter.status = { notIn: ['SETTLED', 'CANCELLED'] };
    }

    if (tableId) {
      whereFilter.tableId = tableId;
    }

    const orders = await db.dineInOrder.findMany({
      where: whereFilter,
      include: {
        table: true,
        items: true,
        session: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    console.error('[QR Menu API] Get orders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 5: Kitchen Panel (Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/kitchen/queue — live kitchen queue
router.get('/kitchen/queue', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const queue = await db.kitchenQueue.findMany({
      where: {
        order: {
          userId,
          status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] }
        }
      },
      include: {
        order: {
          include: {
            table: true,
            items: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json({ success: true, queue });
  } catch (error: any) {
    console.error('[QR Menu API] Get kitchen queue error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/kitchen/:orderId/accept — kitchen accepts order
router.patch('/kitchen/:orderId/accept', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { orderId } = req.params;

    const order = await db.dineInOrder.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await db.$transaction(async (tx: any) => {
      const o = await tx.dineInOrder.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' },
        include: { table: true, items: true }
      });

      await tx.kitchenQueue.updateMany({
        where: { orderId },
        data: { status: 'ACCEPTED' }
      });

      await tx.dineInOrderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'ACCEPTED',
          remarks: 'Order accepted by Kitchen'
        }
      });

      return o;
    });

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('order_status_updated', { orderId, status: 'ACCEPTED', order: updatedOrder });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Accept order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/kitchen/:orderId/preparing — mark preparing
router.patch('/kitchen/:orderId/preparing', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { orderId } = req.params;
    const { estimatedTime } = req.body;

    const order = await db.dineInOrder.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await db.$transaction(async (tx: any) => {
      const o = await tx.dineInOrder.update({
        where: { id: orderId },
        data: { status: 'PREPARING' },
        include: { table: true, items: true }
      });

      await tx.kitchenQueue.updateMany({
        where: { orderId },
        data: { status: 'PREPARING', estimatedTime: estimatedTime ? Number(estimatedTime) : null }
      });

      await tx.dineInOrderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PREPARING',
          remarks: `Preparing order. Est time: ${estimatedTime || 'N/A'} mins`
        }
      });

      return o;
    });

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('order_status_updated', { orderId, status: 'PREPARING', order: updatedOrder });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Mark preparing error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/kitchen/:orderId/ready — mark ready
router.patch('/kitchen/:orderId/ready', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { orderId } = req.params;

    const order = await db.dineInOrder.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await db.$transaction(async (tx: any) => {
      const o = await tx.dineInOrder.update({
        where: { id: orderId },
        data: { status: 'READY' },
        include: { table: true, items: true }
      });

      await tx.kitchenQueue.updateMany({
        where: { orderId },
        data: { status: 'READY' }
      });

      await tx.dineInOrderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'READY',
          remarks: 'Order is ready for serving'
        }
      });

      return o;
    });

    // Notify sockets (Waiter panel and customer track)
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('order_status_updated', { orderId, status: 'READY', order: updatedOrder });
      io.to(userId).emit('kot_ready_alert', { orderId, tableName: updatedOrder.table.name });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Mark ready error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 6: Waiter Panel (Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/waiter/tables — table-wise order summary
router.get('/waiter/tables', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const tables = await db.restaurantTable.findMany({
      where: { userId, isActive: true },
      include: {
        dineInOrders: {
          where: { status: { notIn: ['SETTLED', 'CANCELLED'] } },
          include: { items: true }
        },
        qrSessions: {
          where: { isActive: true }
        }
      }
    });

    res.status(200).json({ success: true, tables });
  } catch (error: any) {
    console.error('[QR Menu API] Waiter tables error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/qr-menu/waiter/actions — list pending waiter requests
router.get('/waiter/actions', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const actions = await db.waiterAction.findMany({
      where: { userId, status: 'PENDING' },
      include: { table: true },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json({ success: true, actions });
  } catch (error: any) {
    console.error('[QR Menu API] Get waiter actions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/waiter/actions/:id/resolve — resolve waiter call
router.patch('/waiter/actions/:id/resolve', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { id } = req.params;

    const action = await db.waiterAction.findFirst({
      where: { id, userId }
    });

    if (!action) {
      return res.status(404).json({ success: false, error: 'Waiter action not found' });
    }

    const updated = await db.waiterAction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Notify backend sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('waiter_resolved', { actionId: id });
    }

    res.status(200).json({ success: true, action: updated });
  } catch (error: any) {
    console.error('[QR Menu API] Resolve waiter action error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/qr-menu/waiter/:orderId/served — mark served
router.patch('/waiter/:orderId/served', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { orderId } = req.params;

    const order = await db.dineInOrder.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await db.$transaction(async (tx: any) => {
      const o = await tx.dineInOrder.update({
        where: { id: orderId },
        data: { status: 'SERVED' },
        include: { table: true, items: true }
      });

      await tx.kitchenQueue.updateMany({
        where: { orderId },
        data: { status: 'SERVED' }
      });

      await tx.dineInOrderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'SERVED',
          remarks: 'Order successfully served by waiter'
        }
      });

      return o;
    });

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('order_status_updated', { orderId, status: 'SERVED', order: updatedOrder });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Served order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/waiter/:tableId/transfer — transfer active session to another table
router.post('/waiter/:tableId/transfer', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { tableId } = req.params;
    const { targetTableId } = req.body;

    if (!targetTableId) {
      return res.status(400).json({ success: false, error: 'Target table ID is required' });
    }

    const [sourceTable, targetTable] = await Promise.all([
      db.restaurantTable.findFirst({ where: { id: tableId, userId } }),
      db.restaurantTable.findFirst({ where: { id: targetTableId, userId } })
    ]);

    if (!sourceTable || !targetTable) {
      return res.status(404).json({ success: false, error: 'Source or target table not found' });
    }

    // Get active session on source table
    const session = await db.qrSession.findFirst({
      where: { tableId, isActive: true }
    });

    if (!session) {
      return res.status(400).json({ success: false, error: 'No active session found on source table' });
    }

    await db.$transaction(async (tx: any) => {
      // 1. Move session to target table
      await tx.qrSession.update({
        where: { id: session.id },
        data: { tableId: targetTableId }
      });

      // 2. Move active orders to target table
      await tx.dineInOrder.updateMany({
        where: { sessionId: session.id },
        data: { tableId: targetTableId }
      });

      // 3. Move waiter actions
      await tx.waiterAction.updateMany({
        where: { sessionId: session.id },
        data: { tableId: targetTableId }
      });

      // 4. Update tables status
      await tx.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'AVAILABLE' }
      });

      await tx.restaurantTable.update({
        where: { id: targetTableId },
        data: { status: 'OCCUPIED' }
      });

      // 5. Activity log
      await tx.tableActivityLog.create({
        data: {
          userId,
          tableId,
          action: 'TRANSFER_OUT',
          details: `Session transferred to ${targetTable.name}`
        }
      });

      await tx.tableActivityLog.create({
        data: {
          userId,
          tableId: targetTableId,
          action: 'TRANSFER_IN',
          details: `Session transferred from ${sourceTable.name}`
        }
      });
    });

    // Notify backend sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('table_status_updated', { tableId, status: 'AVAILABLE' });
      io.to(userId).emit('table_status_updated', { tableId: targetTableId, status: 'OCCUPIED' });
      io.to(userId).emit('tables_refreshed');
    }

    res.status(200).json({ success: true, message: 'Table session successfully transferred' });
  } catch (error: any) {
    console.error('[QR Menu API] Transfer table error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/qr-menu/waiter/:tableId/add-items — waiter adds items to table session
router.post('/waiter/:tableId/add-items', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { tableId } = req.params;
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    // Get active session
    const session = await db.qrSession.findFirst({
      where: { tableId, isActive: true }
    });

    if (!session) {
      return res.status(400).json({ success: false, error: 'No active session found on this table' });
    }

    // Place an order on behalf of waiter
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `QR-WAIT-${datePrefix}-${randomSuffix}`;

    // Calculate totals
    let subtotal = 0;
    const orderItemsData: OrderItemData[] = [];

    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds }, userId }
    });
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

    for (const item of items) {
      const product: any = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.name}` });
      }
      const qty = Math.round(Number(item.quantity)) || 1;
      const price = Number(product.price);
      const total = price * qty;
      subtotal += total;

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        quantity: qty,
        price,
        totalPrice: total,
        notes: item.notes || null
      });
    }

    const taxRate = 5;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const finalOrder = await db.$transaction(async (tx: any) => {
      // 1. Create DineInOrder
      const newOrder = await tx.dineInOrder.create({
        data: {
          userId,
          tableId,
          sessionId: session.id,
          orderNumber,
          status: 'ACCEPTED', // Waiter orders are pre-accepted
          subtotal,
          taxAmount,
          totalAmount,
          notes: notes || null,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true,
          table: true
        }
      });

      // 2. Create Kitchen Queue entry (starts accepted)
      await tx.kitchenQueue.create({
        data: {
          orderId: newOrder.id,
          status: 'ACCEPTED'
        }
      });

      // 3. Create Status Log
      await tx.dineInOrderStatusLog.create({
        data: {
          orderId: newOrder.id,
          fromStatus: 'NONE',
          toStatus: 'ACCEPTED',
          remarks: `Order placed by Waiter (actor: ${req.user.id})`
        }
      });

      return newOrder;
    });

    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('new_dine_in_order', finalOrder);
      io.to(userId).emit('kitchen_kot_updated', { orderId: finalOrder.id });
    }

    res.status(201).json({ success: true, order: finalOrder });
  } catch (error: any) {
    console.error('[QR Menu API] Waiter add items error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 7: Billing Integration (Authenticated)
// -------------------------------------------------------------

// POST /api/qr-menu/orders/:orderId/settle — settle a single order
router.post('/orders/:orderId/settle', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const actorId = req.user.id;
    const { orderId } = req.params;
    const { paymentMode } = req.body; // Cash, Card, UPI, etc.

    const order = await db.dineInOrder.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        table: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status === 'SETTLED') {
      return res.status(400).json({ success: false, error: 'Order is already settled' });
    }

    // Complete transaction: Create standard Bill, decrement stock, mark order SETTLED
    const result = await db.$transaction(async (tx: any) => {
      // 1. Fetch default settings
      const settings = await tx.settings.findFirst({
        where: { key: 'invoice_settings' } // standard categorization
      });

      // 2. Generate unique Bill/Invoice Number
      const count = await tx.bill.count({ where: { userId } });
      const prefix = 'INV';
      const year = new Date().getFullYear().toString().slice(-2);
      let sequence = count + 1;
      let billNumber = '';
      let isUnique = false;

      while (!isUnique) {
        billNumber = `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
        const existing = await tx.bill.findUnique({ where: { billNumber } });
        if (!existing) {
          isUnique = true;
        } else {
          sequence++;
        }
      }

      // 3. Verify and decrement product stocks
      const productIds = order.items.map((i: any) => i.productId).filter(Boolean);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, userId }
      });
      const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));

      for (const item of order.items) {
        if (item.productId) {
          const product: any = productMap.get(item.productId);
          if (product && product.stock !== null) {
            const requestedQty = BigInt(item.quantity);
            const newStock = product.stock >= requestedQty ? product.stock - requestedQty : BigInt(0);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: newStock }
            });
          }
        }
      }

      // 4. Create standard invoice bill
      const newBill = await tx.bill.create({
        data: {
          userId,
          billNumber,
          customerName: `Dine-in Table ${order.table.name}`,
          status: 'PAID',
          paymentStatus: 'PAID',
          paidAmount: order.totalAmount,
          dueAmount: 0,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          totalAmount: order.totalAmount,
          paymentMode: paymentMode || 'Cash',
          templateId: 'standard',
          items: {
            create: order.items.map((item: any) => {
              const itemTaxRate = 5;
              const itemTaxAmount = (item.totalPrice * itemTaxRate) / 100;
              return {
                productId: item.productId,
                isService: false,
                productName: item.name,
                quantity: BigInt(item.quantity),
                price: item.price,
                total: item.totalPrice,
                taxRate: itemTaxRate,
                taxAmount: itemTaxAmount
              };
            })
          }
        }
      });

      // 5. Update order status to SETTLED
      await tx.dineInOrder.update({
        where: { id: orderId },
        data: {
          status: 'SETTLED',
          billId: newBill.id
        }
      });

      // 6. Close the QrSession if all orders on this session are settled
      if (order.sessionId) {
        const unsettledOrders = await tx.dineInOrder.count({
          where: {
            sessionId: order.sessionId,
            status: { notIn: ['SETTLED', 'CANCELLED'] }
          }
        });

        if (unsettledOrders === 0) {
          // Close session
          await tx.qrSession.update({
            where: { id: order.sessionId },
            data: {
              isActive: false,
              endedAt: new Date()
            }
          });

          // Set table status to available
          await tx.restaurantTable.update({
            where: { id: order.tableId },
            data: { status: 'AVAILABLE' }
          });

          await tx.tableActivityLog.create({
            data: {
              userId,
              tableId: order.tableId,
              action: 'CLOSE_SESSION',
              details: `Session closed at settlement of order ${order.orderNumber}`
            }
          });
        }
      } else {
        // Safe fallback: release table if no session was used
        await tx.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' }
        });
      }

      // 7. Audit log
      await recordAuditLog({
        prismaClient: tx,
        userId,
        subUserId: actorId,
        action: 'CREATE',
        entity: 'Bill',
        entityId: newBill.id,
        description: `Dine-in settlement: Table ${order.table.name} order ${order.orderNumber} settled with Bill ${billNumber}`,
        newData: { billNumber, totalAmount: order.totalAmount }
      });

      return { bill: newBill };
    });

    // Notify backend sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('table_status_updated', { tableId: order.tableId, status: 'AVAILABLE' });
      io.to(userId).emit('order_status_updated', { orderId, status: 'SETTLED' });
      io.to(userId).emit('tables_refreshed');
    }

    res.status(200).json({ success: true, message: 'Order settled and bill created', bill: result.bill });
  } catch (error: any) {
    console.error('[QR Menu API] Settle order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// POST /api/qr-menu/orders/:tableId/merge — merge all active orders of a table session and settle
router.post('/orders/:tableId/merge', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const actorId = req.user.id;
    const { tableId } = req.params;
    const { paymentMode } = req.body;

    const table = await db.restaurantTable.findFirst({
      where: { id: tableId, userId },
      include: {
        qrSessions: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const session = table.qrSessions[0];
    if (!session) {
      return res.status(400).json({ success: false, error: 'No active session found on this table' });
    }

    // Get all unsettled orders in this session
    const orders = await db.dineInOrder.findMany({
      where: {
        sessionId: session.id,
        status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'] }
      },
      include: {
        items: true
      }
    });

    if (orders.length === 0) {
      return res.status(400).json({ success: false, error: 'No unsettled orders found to merge' });
    }

    // Settle them all
    const result = await db.$transaction(async (tx: any) => {
      // 1. Generate Bill Number
      const count = await tx.bill.count({ where: { userId } });
      const prefix = 'INV';
      const year = new Date().getFullYear().toString().slice(-2);
      let sequence = count + 1;
      let billNumber = '';
      let isUnique = false;

      while (!isUnique) {
        billNumber = `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
        const existing = await tx.bill.findUnique({ where: { billNumber } });
        if (!existing) {
          isUnique = true;
        } else {
          sequence++;
        }
      }

      // 2. Accumulate merged items and check stock
      let subtotal = 0;
      let taxAmount = 0;
      let totalAmount = 0;
      const billItemsData: any[] = [];

      for (const order of orders) {
        subtotal += order.subtotal;
        taxAmount += order.taxAmount;
        totalAmount += order.totalAmount;

        // Decrement stock
        for (const item of order.items) {
          if (item.productId) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (product && product.stock !== null) {
              const requestedQty = BigInt(item.quantity);
              const newStock = product.stock >= requestedQty ? product.stock - requestedQty : BigInt(0);
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: newStock }
              });
            }
          }

          // Add to bill items list
          billItemsData.push({
            productId: item.productId,
            isService: false,
            productName: item.name,
            quantity: BigInt(item.quantity),
            price: item.price,
            total: item.totalPrice,
            taxRate: 5,
            taxAmount: (item.totalPrice * 5) / 100
          });
        }
      }

      // 3. Create Bill
      const mergedBill = await tx.bill.create({
        data: {
          userId,
          billNumber,
          customerName: `Dine-in Table ${table.name}`,
          status: 'PAID',
          paymentStatus: 'PAID',
          paidAmount: totalAmount,
          dueAmount: 0,
          subtotal,
          taxAmount,
          totalAmount,
          paymentMode: paymentMode || 'Cash',
          templateId: 'standard',
          items: {
            create: billItemsData
          }
        }
      });

      // 4. Mark all orders as settled
      await tx.dineInOrder.updateMany({
        where: {
          id: { in: orders.map((o: any) => o.id) }
        },
        data: {
          status: 'SETTLED',
          billId: mergedBill.id
        }
      });

      // 5. Close session & Release table
      await tx.qrSession.update({
        where: { id: session.id },
        data: {
          isActive: false,
          endedAt: new Date()
        }
      });

      await tx.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'AVAILABLE' }
      });

      // 6. Log table activity
      await tx.tableActivityLog.create({
        data: {
          userId,
          tableId,
          action: 'MERGE_SETTLE',
          details: `Merged and settled ${orders.length} orders into Bill ${billNumber}`
        }
      });

      // 7. Audit log
      await recordAuditLog({
        prismaClient: tx,
        userId,
        subUserId: actorId,
        action: 'CREATE',
        entity: 'Bill',
        entityId: mergedBill.id,
        description: `Merged settlement: Table ${table.name} (${orders.length} orders) settled with Bill ${billNumber}`,
        newData: { billNumber, totalAmount }
      });

      return mergedBill;
    });

    // Notify backend sockets
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('table_status_updated', { tableId, status: 'AVAILABLE' });
      for (const order of orders) {
        io.to(userId).emit('order_status_updated', { orderId: order.id, status: 'SETTLED' });
      }
      io.to(userId).emit('tables_refreshed');
    }

    res.status(200).json({ success: true, message: 'All table orders successfully merged and settled', bill: result });
  } catch (error: any) {
    console.error('[QR Menu API] Merge settle error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});


// -------------------------------------------------------------
// GROUP 8: Analytics (Admin Authenticated)
// -------------------------------------------------------------

// GET /api/qr-menu/analytics — QR code ordering statistics & report charts
router.get('/analytics', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.orgId;

    // 1. Most ordered items
    const orderedItems = await db.dineInOrderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: {
          userId,
          status: 'SETTLED'
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // 2. Scan and session counts
    const scanCount = await db.qrSession.count({
      where: { userId }
    });

    // 3. Peak times (grouped by hour of day)
    const orders = await db.dineInOrder.findMany({
      where: { userId, status: 'SETTLED' },
      select: { createdAt: true }
    });

    const hourlySales: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) hourlySales[i] = 0;

    orders.forEach((o: any) => {
      const hour = new Date(o.createdAt).getHours();
      hourlySales[hour] = (hourlySales[hour] || 0) + 1;
    });

    const peakTimes = Object.keys(hourlySales).map(hour => ({
      hour: `${hour}:00`,
      orders: hourlySales[Number(hour)]
    }));

    res.status(200).json({
      success: true,
      analytics: {
        popularItems: orderedItems.map((item: any) => ({
          name: item.name,
          quantity: item._sum.quantity,
          revenue: item._sum.totalPrice
        })),
        totalScans: scanCount,
        peakTimes
      }
    });
  } catch (error: any) {
    console.error('[QR Menu API] Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
