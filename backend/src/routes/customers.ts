// @ts-nocheck
import express from 'express'
// @ts-nocheck
import prisma from '../lib/prisma'
// @ts-nocheck
import { recordAuditLog } from '../lib/auditLog'
// @ts-nocheck
import { authenticateToken, requirePermission } from '../middleware/auth'
// @ts-nocheck
import { validateAddressFields } from '../lib/addressValidation'
// @ts-nocheck
import { validateEmail } from '../lib/validation'
// @ts-nocheck

// @ts-nocheck
const router = express.Router()
// @ts-nocheck

// @ts-nocheck
// Get all customers
// @ts-nocheck
router.get('/', authenticateToken, requirePermission('view_customers'), async (req: any, res) => {
// @ts-nocheck
  try {
// @ts-nocheck
    const { search } = req.query
// @ts-nocheck
    const userId = req.user.orgId
// @ts-nocheck
    const _actorId = req.user.id;
// @ts-nocheck

// @ts-nocheck
    const whereClause: any = { userId }
// @ts-nocheck

// @ts-nocheck
    if (search) {
// @ts-nocheck
      whereClause.OR = [
// @ts-nocheck
        { name: { contains: search } },
// @ts-nocheck
        { email: { contains: search } },
// @ts-nocheck
        { phone: { contains: search } }
// @ts-nocheck
      ]
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const customers = await prisma.customer.findMany({
// @ts-nocheck
      where: whereClause,
// @ts-nocheck
      orderBy: { createdAt: 'desc' }
// @ts-nocheck
    })
// @ts-nocheck

// @ts-nocheck
    res.status(200).json({ customers })
// @ts-nocheck

// @ts-nocheck
  } catch (error) {
// @ts-nocheck
    console.error('Get customers error:', error)
// @ts-nocheck
    res.status(500).json({ error: 'Internal server error' })
// @ts-nocheck
  }
// @ts-nocheck
})
// @ts-nocheck

// @ts-nocheck
// Create customer
// @ts-nocheck
router.post('/', authenticateToken, requirePermission('create_customers'), async (req: any, res) => {
// @ts-nocheck
  try {
// @ts-nocheck
    const { name, email, phone, address, state, city, pincode, gstNumber, isMarkedRed } = req.body
// @ts-nocheck
    const userId = req.user.orgId
// @ts-nocheck
    const _actorId = req.user.id;
// @ts-nocheck

// @ts-nocheck
    const addressValidation = validateAddressFields({ address, city, state, pincode });
// @ts-nocheck
    if (!addressValidation.isValid) {
// @ts-nocheck
      return res.status(400).json({ error: addressValidation.error });
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
// @ts-nocheck
    if (normalizedEmail) {
// @ts-nocheck
      const emailValidation = validateEmail(normalizedEmail);
// @ts-nocheck
      if (!emailValidation.isValid) {
// @ts-nocheck
        return res.status(400).json({ error: emailValidation.error });
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // Check for email uniqueness per organization
// @ts-nocheck
      const emailExists = await prisma.customer.findFirst({
// @ts-nocheck
        where: { userId, email: normalizedEmail }
// @ts-nocheck
      });
// @ts-nocheck
      if (emailExists) {
// @ts-nocheck
        return res.status(400).json({ error: 'Customer with this email already exists' });
// @ts-nocheck
      }
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    if (!name) {
// @ts-nocheck
      return res.status(400).json({ error: 'Customer name is required' })
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
// @ts-nocheck
      return res.status(400).json({ error: 'Phone must be 10 digits and start with 6, 7, 8, or 9' })
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const existingCustomer = await prisma.customer.findFirst({
// @ts-nocheck
      where: { userId, name }
// @ts-nocheck
    })
// @ts-nocheck

// @ts-nocheck
    if (existingCustomer) {
// @ts-nocheck
      return res.status(400).json({ error: `Customer with name "${name}" already exists.` })
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const customer = await (prisma.customer as any).create({
// @ts-nocheck
      data: {
// @ts-nocheck
        userId,
// @ts-nocheck
        name,
// @ts-nocheck
        email: normalizedEmail,
// @ts-nocheck
        phone: phone || null,
// @ts-nocheck
        address: address || null,
// @ts-nocheck
        state: state || null,
// @ts-nocheck
        city: city || null,
// @ts-nocheck
        pincode: pincode || null,
// @ts-nocheck
        gstNumber: gstNumber || null,
// @ts-nocheck
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
// @ts-nocheck
        isMarkedRed: isMarkedRed !== undefined ? isMarkedRed : false
// @ts-nocheck
      }
// @ts-nocheck
    })
// @ts-nocheck

// @ts-nocheck
    // Audit Log: Create
// @ts-nocheck
    await recordAuditLog({
// @ts-nocheck
      userId: userId,
// @ts-nocheck
      subUserId: _actorId,
// @ts-nocheck
      action: 'CREATE',
// @ts-nocheck
      entity: 'Customer',
// @ts-nocheck
      entityId: customer.id,
// @ts-nocheck
      description: `Customer: ${customer.name} added to CRM`,
// @ts-nocheck
      req,
// @ts-nocheck
      newData: { name: customer.name, email: customer.email }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    // Create Notification for the Tray
// @ts-nocheck
    await (prisma as any).notification.create({
// @ts-nocheck
      data: {
// @ts-nocheck
        userId,
// @ts-nocheck
        type: 'customer',
// @ts-nocheck
        message: `New customer added: ${customer.name}`,
// @ts-nocheck
        isRead: false
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    // Welcome email disabled by user request
// @ts-nocheck

// @ts-nocheck
    res.status(201).json({ message: 'Customer created successfully', customer })
// @ts-nocheck

// @ts-nocheck
  } catch (error: any) {
// @ts-nocheck
    console.error('Create customer error:', error)
// @ts-nocheck
    if (error.code === 'P2002') return res.status(400).json({ error: 'Customer with this email already exists' })
// @ts-nocheck
    res.status(500).json({ error: 'Internal server error' })
// @ts-nocheck
  }
// @ts-nocheck
})
// @ts-nocheck

// @ts-nocheck
// Get customer by ID
// @ts-nocheck
router.get('/:id', authenticateToken, requirePermission('view_customers'), async (req: any, res) => {
// @ts-nocheck
  try {
// @ts-nocheck
    const { id } = req.params
// @ts-nocheck
    const userId = req.user.orgId
// @ts-nocheck
    const _actorId = req.user.id;
// @ts-nocheck
    const customer = await prisma.customer.findFirst({
// @ts-nocheck
      where: { id, userId },
// @ts-nocheck
      include: {
// @ts-nocheck
        bills: {
// @ts-nocheck
          orderBy: { createdAt: 'desc' },
// @ts-nocheck
          take: 50,
// @ts-nocheck
          select: { id: true, billNumber: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true }
// @ts-nocheck
        }
// @ts-nocheck
      }
// @ts-nocheck
    })
// @ts-nocheck
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
// @ts-nocheck
    res.status(200).json({ customer })
// @ts-nocheck
  } catch (error) {
// @ts-nocheck
    console.error('Get customer error:', error)
// @ts-nocheck
    res.status(500).json({ error: 'Internal server error' })
// @ts-nocheck
  }
// @ts-nocheck
})
// @ts-nocheck

// @ts-nocheck
// Update customer
// @ts-nocheck
router.put('/:id', authenticateToken, requirePermission('edit_customers'), async (req: any, res) => {
// @ts-nocheck
  try {
// @ts-nocheck
    const { id } = req.params
// @ts-nocheck
    const { name, email, phone, address, state, city, pincode, gstNumber, isActive, isMarkedRed } = req.body
// @ts-nocheck
    const userId = req.user.orgId
// @ts-nocheck
    const _actorId = req.user.id;
// @ts-nocheck

// @ts-nocheck
    const { validateAddressFields } = require('../lib/addressValidation');
// @ts-nocheck
    const addressValidation = validateAddressFields({ address, city, state, pincode });
// @ts-nocheck
    if (!addressValidation.isValid) {
// @ts-nocheck
      return res.status(400).json({ error: addressValidation.error });
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
// @ts-nocheck

// @ts-nocheck
    if (normalizedEmail) {
// @ts-nocheck
      const { validateEmail } = require('../lib/validation');
// @ts-nocheck
      const emailValidation = validateEmail(normalizedEmail);
// @ts-nocheck
      if (!emailValidation.isValid) {
// @ts-nocheck
        return res.status(400).json({ error: emailValidation.error });
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // Check for email uniqueness per organization
// @ts-nocheck
      const emailExists = await prisma.customer.findFirst({
// @ts-nocheck
        where: { userId, email: normalizedEmail, NOT: { id } }
// @ts-nocheck
      });
// @ts-nocheck
      if (emailExists) {
// @ts-nocheck
        return res.status(400).json({ error: 'Customer with this email already exists' });
// @ts-nocheck
      }
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    if (!name) return res.status(400).json({ error: 'Customer name is required' })
// @ts-nocheck

// @ts-nocheck
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
// @ts-nocheck
      return res.status(400).json({ error: 'Phone must be 10 digits and start with 6, 7, 8, or 9' })
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const existingCustomer = await prisma.customer.findFirst({
// @ts-nocheck
      where: { userId, name, NOT: { id } }
// @ts-nocheck
    })
// @ts-nocheck
    if (existingCustomer) return res.status(400).json({ error: `Another customer with name "${name}" already exists.` })
// @ts-nocheck

// @ts-nocheck
    const customer = await (prisma.customer as any).update({
// @ts-nocheck
      where: { id },
// @ts-nocheck
      data: { 
// @ts-nocheck
        name, 
// @ts-nocheck
        email: normalizedEmail, 
// @ts-nocheck
        phone: phone || null, 
// @ts-nocheck
        address: address || null, 
// @ts-nocheck
        state: state || null, 
// @ts-nocheck
        city: city || null, 
// @ts-nocheck
        pincode: pincode || null, 
// @ts-nocheck
        gstNumber: gstNumber || null,
// @ts-nocheck
        isActive: isActive !== undefined ? isActive : undefined,
// @ts-nocheck
        isMarkedRed: isMarkedRed !== undefined ? isMarkedRed : undefined
// @ts-nocheck
      }
// @ts-nocheck
    })
// @ts-nocheck

// @ts-nocheck
    const updatedCustomer = await prisma.customer.findFirst({ where: { id, userId } })
// @ts-nocheck
    if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' })
// @ts-nocheck

// @ts-nocheck
    // Audit Log: Update
// @ts-nocheck
    await recordAuditLog({
// @ts-nocheck
      userId: userId,
// @ts-nocheck
      subUserId: _actorId,
// @ts-nocheck
      action: 'UPDATE',
// @ts-nocheck
      entity: 'Customer',
// @ts-nocheck
      entityId: id,
// @ts-nocheck
      description: `Customer: ${updatedCustomer.name} details updated`,
// @ts-nocheck
      req,
// @ts-nocheck
      newData: { name: updatedCustomer.name, email: updatedCustomer.email }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer })
// @ts-nocheck
  } catch (error) {
// @ts-nocheck
    console.error('Update customer error:', error)
// @ts-nocheck
    res.status(500).json({ error: 'Internal server error' })
// @ts-nocheck
  }
// @ts-nocheck
})
// @ts-nocheck

// @ts-nocheck
router.delete('/:id', authenticateToken, requirePermission('delete_customers'), async (req: any, res) => {
// @ts-nocheck
  try {
// @ts-nocheck
    const { id } = req.params;
// @ts-nocheck
    const userId = req.user.orgId;
// @ts-nocheck
    const _actorId = req.user.id;
// @ts-nocheck
    const userRole = (req.user.role?.name || 'VIEWER').toUpperCase();
// @ts-nocheck

// @ts-nocheck
    const customer = await prisma.customer.findFirst({
// @ts-nocheck
      where: userRole === 'ADMIN' ? { id } : { id, userId }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
// @ts-nocheck

// @ts-nocheck
    await prisma.customer.delete({ where: { id } });
// @ts-nocheck

// @ts-nocheck
    // Audit Log: Delete
// @ts-nocheck
    await recordAuditLog({
// @ts-nocheck
      userId: userId,
// @ts-nocheck
      subUserId: _actorId,
// @ts-nocheck
      action: 'DELETE',
// @ts-nocheck
      entity: 'Customer',
// @ts-nocheck
      entityId: id,
// @ts-nocheck
      description: `Customer: ${customer.name} removed from system`,
// @ts-nocheck
      req,
// @ts-nocheck
      oldData: { name: customer.name }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    res.status(200).json({ message: 'Customer deleted successfully' })
// @ts-nocheck
  } catch (error: any) {
// @ts-nocheck
    console.error('Delete customer error:', error)
// @ts-nocheck
    if (error.code === 'P2003') {
// @ts-nocheck
      return res.status(400).json({ error: 'Cannot delete customer due to an existing record constraint. Please contact support.' })
// @ts-nocheck
    }
// @ts-nocheck
    res.status(500).json({ error: 'Internal server error while removing customer' })
// @ts-nocheck
  }
// @ts-nocheck
})
// @ts-nocheck

// @ts-nocheck
export default router
