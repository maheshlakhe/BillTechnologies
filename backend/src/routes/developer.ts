import express from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { apiKeyAuth, requireApiScope } from '../middleware/apiKeyAuth';
import { recordAuditLog } from '../lib/auditLog';
import { checkProductLowStock, createLowStockNotification } from '../services/StockAlertService';

const router = express.Router();

// ==========================================
// 1. API Key Management (Session Auth)
// ==========================================

/**
 * List all active API keys for the current logged-in user
 */
router.get('/keys', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id; // current user ID
    const apiKeys = await (prisma as any).apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Mask the API keys for security before returning
    const maskedKeys = apiKeys.map((k: any) => ({
      id: k.id,
      name: k.name,
      key: `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`,
      scope: k.scope,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt
    }));

    res.json({ success: true, apiKeys: maskedKeys });
  } catch (error: any) {
    console.error('[Developer API] List Keys Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
  }
});

/**
 * Generate a new API Key for the current logged-in user
 */
router.post('/keys', authenticateToken, async (req: any, res) => {
  try {
    const { name, scope = 'READ_WRITE', expiresDays } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'API Key name is required' });
    }

    // Generate a secure API key prefix + random bits
    const randomHex = crypto.randomBytes(24).toString('hex');
    const apiKey = `bs_live_${randomHex}`;

    let expiresAt: Date | null = null;
    if (expiresDays && parseInt(expiresDays, 10) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresDays, 10));
    }

    const newKey = await (prisma as any).apiKey.create({
      data: {
        userId,
        name: name.trim(),
        key: apiKey,
        scope,
        expiresAt
      }
    });

    // Audit Log key creation
    await recordAuditLog({
      userId: req.user.orgId,
      subUserId: req.user.id,
      action: 'CREATE',
      entity: 'ApiKey',
      entityId: newKey.id,
      description: `Generated new developer API key: "${name.trim()}"`,
      req
    });

    // Return the raw key ONCE so the user can copy it
    res.status(201).json({
      success: true,
      message: 'API Key created successfully. Store this key safely as it will not be displayed again.',
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        key: apiKey, // RAW key returned once
        scope: newKey.scope,
        expiresAt: newKey.expiresAt,
        createdAt: newKey.createdAt
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Create Key Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate API key' });
  }
});

/**
 * Revoke/delete an API Key
 */
router.delete('/keys/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify key ownership
    const keyDoc = await (prisma as any).apiKey.findFirst({
      where: { id, userId }
    });

    if (!keyDoc) {
      return res.status(404).json({ success: false, error: 'API Key not found or access denied' });
    }

    await (prisma as any).apiKey.delete({
      where: { id }
    });

    // Audit Log key revocation
    await recordAuditLog({
      userId: req.user.orgId,
      subUserId: req.user.id,
      action: 'DELETE',
      entity: 'ApiKey',
      entityId: id,
      description: `Revoked developer API key: "${keyDoc.name}"`,
      req
    });

    res.json({ success: true, message: 'API Key successfully revoked' });
  } catch (error: any) {
    console.error('[Developer API] Revoke Key Error:', error);
    res.status(500).json({ success: false, error: 'Failed to revoke API key' });
  }
});


// ==========================================
// 2. Developer REST API Endpoints (API-Key Auth)
// ==========================================

// Apply apiKeyAuth to all endpoints in this block
router.use('/v1', apiKeyAuth);

/**
 * GET /v1/me
 * Retrieve profile information for the active API credentials
 */
router.get('/v1/me', async (req: any, res) => {
  try {
    res.json({
      success: true,
      auth: {
        apiKeyName: req.apiKeyName,
        scope: req.apiKeyScope,
        authorizedUser: req.user.email,
        organizationId: req.user.orgId,
        role: req.user.role?.name
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /v1/products
 * List products under the organization (with optional search and category filters)
 */
router.get('/v1/products', async (req: any, res) => {
  try {
    const userId = req.user.orgId; // Organization boundary
    const { search, category, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { sku: { contains: search as string } }
      ];
    }

    if (category) {
      whereClause.category = category as string;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.product.count({ where: whereClause })
    ]);

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      taxRate: p.taxRate,
      stock: p.stock !== null ? Number(p.stock) : 0,
      sku: p.sku,
      category: p.category,
      hsnCode: p.hsnCode,
      status: p.status,
      unit: p.unit,
      mrp: p.mrp,
      createdAt: p.createdAt
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Fetch Products Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve products' });
  }
});

/**
 * POST /v1/products
 * Create a new product for the organization
 */
router.post('/v1/products', requireApiScope('READ_WRITE'), async (req: any, res) => {
  try {
    const { name, description, price, taxRate = 0, stock = 0, sku, category = 'Uncategorized', hsnCode, unit, mrp } = req.body;
    const userId = req.user.orgId;
    const actorId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const cleanPrice = parseFloat(price as any);
    const cleanStock = parseInt(stock as any, 10);
    const cleanTaxRate = parseFloat(taxRate as any);

    if (isNaN(cleanPrice) || cleanPrice < 0) {
      return res.status(400).json({ success: false, error: 'Valid selling price (greater than or equal to 0) is required' });
    }
    if (isNaN(cleanStock) || cleanStock < 0) {
      return res.status(400).json({ success: false, error: 'Stock quantity cannot be negative' });
    }
    if (isNaN(cleanTaxRate) || cleanTaxRate < 0 || cleanTaxRate > 100) {
      return res.status(400).json({ success: false, error: 'Tax rate must be between 0 and 100' });
    }

    const nameTrimmed = name.trim();

    // Check duplicate name
    const nameCollision = await prisma.product.findFirst({
      where: { userId, name: { equals: nameTrimmed } }
    });
    if (nameCollision) {
      return res.status(400).json({ success: false, error: `Product name "${nameTrimmed}" already exists` });
    }

    // Check duplicate SKU
    if (sku && sku.trim()) {
      const skuCollision = await prisma.product.findFirst({
        where: { userId, sku: sku.trim() }
      });
      if (skuCollision) {
        return res.status(400).json({ success: false, error: `Product with SKU "${sku.trim()}" already exists` });
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        userId,
        name: nameTrimmed,
        description: description || null,
        price: cleanPrice,
        taxRate: cleanTaxRate,
        stock: BigInt(cleanStock),
        sku: sku?.trim() || null,
        category: category.trim(),
        hsnCode: hsnCode || null,
        unit: unit || null,
        mrp: parseFloat(mrp as any) || cleanPrice,
        status: 'Active'
      } as any
    });

    // Record audit log
    await recordAuditLog({
      userId,
      subUserId: actorId,
      action: 'CREATE',
      entity: 'Product',
      entityId: newProduct.id,
      description: `Created product "${nameTrimmed}" via Developer REST API`,
      req
    });

    // Check for low stock alert
    const { isLowStock, notificationsEnabled } = await checkProductLowStock(newProduct.id, cleanStock);
    if (isLowStock && notificationsEnabled) {
      await createLowStockNotification(userId, newProduct.name, cleanStock);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        taxRate: newProduct.taxRate,
        stock: Number(newProduct.stock),
        sku: newProduct.sku,
        category: newProduct.category,
        hsnCode: newProduct.hsnCode,
        createdAt: newProduct.createdAt
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Product Creation Failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
  }
});

/**
 * GET /v1/customers
 * List customers under the organization
 */
router.get('/v1/customers', async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { search, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Fetch Customers Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve customers' });
  }
});

/**
 * POST /v1/customers
 * Create a new customer for the organization
 */
router.post('/v1/customers', requireApiScope('READ_WRITE'), async (req: any, res) => {
  try {
    const { name, email, phone, address, city, state, pincode, gstNumber } = req.body;
    const userId = req.user.orgId;
    const actorId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    // Phone validation if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be a valid 10-digit Indian phone number starting with 6-9' });
    }

    const nameTrimmed = name.trim();

    // Check duplicate customer name per organization
    const customerCollision = await prisma.customer.findFirst({
      where: { userId, name: { equals: nameTrimmed } }
    });
    if (customerCollision) {
      return res.status(400).json({ success: false, error: `Customer with name "${nameTrimmed}" already exists` });
    }

    // Check duplicate email
    if (email && email.trim()) {
      const emailCollision = await prisma.customer.findFirst({
        where: { userId, email: email.trim().toLowerCase() }
      });
      if (emailCollision) {
        return res.status(400).json({ success: false, error: `Customer with email "${email.trim()}" already exists` });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        userId,
        name: nameTrimmed,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        gstNumber: gstNumber || null,
        isActive: true
      } as any
    });

    // Record audit log
    await recordAuditLog({
      userId,
      subUserId: actorId,
      action: 'CREATE',
      entity: 'Customer',
      entityId: customer.id,
      description: `Created customer "${nameTrimmed}" via Developer REST API`,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer
    });
  } catch (error: any) {
    console.error('[Developer API] Customer Creation Failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create customer' });
  }
});

/**
 * GET /v1/bills
 * Retrieve paginated lists of billing invoices
 */
router.get('/v1/bills', async (req: any, res) => {
  try {
    const userId = req.user.orgId;
    const { search, status, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { billNumber: { contains: search as string } },
        { customerName: { contains: search as string } }
      ];
    }

    if (status) {
      whereClause.status = status.toString().toUpperCase();
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where: whereClause,
        include: {
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.bill.count({ where: whereClause })
    ]);

    const formattedBills = bills.map((b: any) => ({
      id: b.id,
      billNumber: b.billNumber,
      customerId: b.customerId,
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      status: b.status,
      paymentStatus: b.paymentStatus,
      subtotal: b.subtotal,
      taxAmount: b.taxAmount,
      totalAmount: b.totalAmount,
      paidAmount: b.paidAmount,
      dueAmount: b.dueAmount,
      paymentMode: b.paymentMode,
      createdAt: b.createdAt,
      items: b.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        price: item.price,
        total: item.total,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount
      }))
    }));

    res.json({
      success: true,
      bills: formattedBills,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Fetch Bills Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve bills' });
  }
});

/**
 * POST /v1/bills
 * Generate a GST-compliant invoice/bill automatically calculating taxes,
 * decrementing product inventory stock, and creating audit trails/alert notifications.
 */
router.post('/v1/bills', requireApiScope('READ_WRITE'), async (req: any, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items, // Array of: { productId, quantity, price }
      notes,
      paymentMode = 'Cash',
      paidAmount = 0
    } = req.body;

    const userId = req.user.orgId;
    const actorId = req.user.id;

    if (!customerId || !customerName || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Customer ID, Customer Name, and items list are required' });
    }

    // Start database transaction to guarantee inventory accuracy
    const resultBill = await prisma.$transaction(async (tx) => {
      // 1. Validate Customer
      const customer = await tx.customer.findFirst({
        where: { id: customerId, userId }
      });
      if (!customer) {
        throw new Error(`Customer with ID "${customerId}" not found`);
      }

      // 2. Resolve items & validate inventory stock
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, userId }
      });

      const productMap = new Map(dbProducts.map(p => [p.id, p]));
      const processedItems = [];
      let subtotal = 0;
      let totalTaxAmount = 0;

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product not found with ID: ${item.productId}`);
        }

        const requestedQty = BigInt(Math.round(item.quantity || 1));
        const unitPrice = parseFloat(item.price) || product.price;

        // Stock check
        if (product.stock !== null && product.stock < requestedQty) {
          throw new Error(`Insufficient stock for product "${product.name}". Available stock: ${product.stock}, Requested: ${requestedQty}`);
        }

        // Deduct Inventory Stock
        const newStock = product.stock !== null ? product.stock - requestedQty : null;
        if (newStock !== null) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: newStock }
          });

          // Perform low-stock alerts
          const { isLowStock, effectiveThreshold, notificationsEnabled } = await checkProductLowStock(product.id, newStock);
          if (isLowStock && notificationsEnabled) {
            await createLowStockNotification(userId, product.name, newStock);
          }
        }

        const itemSubtotal = Number(requestedQty) * unitPrice;
        const taxRate = product.taxRate || 0;
        const itemTax = itemSubtotal * (taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        totalTaxAmount += itemTax;

        processedItems.push({
          productId: product.id,
          productName: product.name,
          quantity: requestedQty,
          price: unitPrice,
          taxRate,
          taxAmount: itemTax,
          total: itemTotal,
          hsnCode: product.hsnCode
        });
      }

      const grandTotal = subtotal + totalTaxAmount;
      const cleanPaid = parseFloat(paidAmount as any) || 0;
      const dueAmount = grandTotal - cleanPaid;
      const paymentStatus = cleanPaid >= grandTotal ? 'PAID' : (cleanPaid > 0 ? 'PARTIAL' : 'PENDING');
      const billStatus = paymentStatus === 'PAID' ? 'PAID' : 'PENDING';

      // Auto-generate invoice number
      const billNumber = `INV-DEV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Create main bill document
      const bill = await tx.bill.create({
        data: {
          userId,
          customerId,
          customerName,
          customerEmail: customerEmail || customer.email || null,
          billNumber,
          status: billStatus as any,
          paymentStatus: paymentStatus as any,
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount: grandTotal,
          paidAmount: cleanPaid,
          dueAmount,
          paymentMode,
          notes: notes || 'Generated via Developer API Integration',
          items: {
            create: processedItems.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              total: item.total,
              hsnCode: item.hsnCode
            }))
          }
        },
        include: {
          items: true
        }
      });

      return bill;
    });

    // Record audit log
    await recordAuditLog({
      userId,
      subUserId: actorId,
      action: 'CREATE',
      entity: 'Bill',
      entityId: resultBill.id,
      description: `Created Invoice ${resultBill.billNumber} via Developer REST API`,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created and finalized successfully',
      invoice: {
        id: resultBill.id,
        billNumber: resultBill.billNumber,
        customerName: resultBill.customerName,
        subtotal: resultBill.subtotal,
        taxAmount: resultBill.taxAmount,
        totalAmount: resultBill.totalAmount,
        paidAmount: resultBill.paidAmount,
        dueAmount: resultBill.dueAmount,
        status: resultBill.status,
        paymentStatus: resultBill.paymentStatus,
        createdAt: resultBill.createdAt,
        items: resultBill.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: Number(item.quantity),
          price: item.price,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          total: item.total
        }))
      }
    });
  } catch (error: any) {
    console.error('[Developer API] Invoice Generation Failed:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to generate invoice' });
  }
});

export default router;
