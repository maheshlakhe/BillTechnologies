import express from 'express'
import prisma from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Apply authentication to the entire router
router.use(authenticateToken)

// Get all warehouses
router.get('/', async (req: any, res) => {
    try {
        const userId = req.user.orgId
        const warehouses = await (prisma as any).warehouse.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
        res.status(200).json({ warehouses })
    } catch (error) {
        console.error('Get warehouses error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create warehouse
router.post('/', async (req: any, res) => {
    try {
        const { name, address, city, isActive } = req.body
        const userId = req.user.orgId

        if (!name) {
            return res.status(400).json({ error: 'Warehouse name is required' })
        }

        const warehouse = await (prisma as any).warehouse.create({
            data: {
                userId,
                name,
                address: address || null,
                city: city || null,
                isActive: isActive !== undefined ? isActive : true
            }
        })

        res.status(201).json({
            message: 'Warehouse created successfully',
            warehouse
        })
    } catch (error) {
        console.error('Create warehouse error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update warehouse
router.put('/:id', async (req: any, res) => {
    try {
        const { id } = req.params
        const { name, address, city, isActive } = req.body
        const userId = req.user.orgId

        const warehouse = await (prisma as any).warehouse.updateMany({
            where: { id, userId },
            data: {
                name,
                address,
                city,
                isActive,
                updatedAt: new Date()
            }
        })

        if (warehouse.count === 0) {
            return res.status(404).json({ error: 'Warehouse not found' })
        }

        const updatedWarehouse = await (prisma as any).warehouse.findUnique({
            where: { id }
        })

        res.status(200).json({
            message: 'Warehouse updated successfully',
            warehouse: updatedWarehouse
        })
    } catch (error) {
        console.error('Update warehouse error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete warehouse
router.delete('/:id', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.orgId

        const result = await (prisma as any).warehouse.deleteMany({
            where: { id, userId }
        })

        if (result.count === 0) {
            return res.status(404).json({ error: 'Warehouse not found' })
        }

        res.status(200).json({ message: 'Warehouse deleted successfully' })
    } catch (error: any) {
        console.error('Delete warehouse error:', error)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete warehouse with associated products' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
