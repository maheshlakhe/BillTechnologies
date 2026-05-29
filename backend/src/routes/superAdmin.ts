import express from 'express'
import prisma from '../lib/prisma'
import { authenticateToken, requireSuperAdmin } from '../middleware/auth'

const router = express.Router()

// Apply super admin check to all routes in this file
router.use(authenticateToken, requireSuperAdmin)

// Get overview stats for super admin
router.get('/stats', async (req, res) => {
    try {
        const [
            totalBills,
            totalRevenue,
            totalUsers,
            totalLeads,
            totalDemoRequests,
            newLeads,
            pendingDemos
        ] = await Promise.all([
            prisma.bill.count(),
            prisma.bill.aggregate({
                _sum: {
                    totalAmount: true
                },
                where: {
                    status: 'PAID'
                }
            }),
            prisma.user.count(),
            prisma.lead.count(),
            prisma.demoRequest.count(),
            prisma.lead.count({ where: { status: 'NEW' } }),
            prisma.demoRequest.count({ where: { status: 'PENDING' } })
        ])

        res.status(200).json({
            success: true,
            stats: {
                totalBills,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalUsers,
                pendingUsers: await prisma.user.count({ where: { isVerified: false, parentId: null } }),
                totalLeads,
                totalDemoRequests,
                newLeads,
                pendingDemos
            }
        })
    } catch (error) {
        console.error('Super admin stats error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get all bills across all platforms
router.get('/bills', async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query
        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const whereClause: any = {}
        if (search) {
            whereClause.OR = [
                { billNumber: { contains: search as string } },
                { customerName: { contains: search as string } },
                { user: { profile: { companyName: { contains: search as string } } } }
            ]
        }

        const [bills, total] = await Promise.all([
            prisma.bill.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            email: true,
                            profile: {
                                select: {
                                    companyName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.bill.count({ where: whereClause })
        ])

        res.status(200).json({
            success: true,
            bills,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        console.error('Super admin bills error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get usage breakdown by organization (user)
router.get('/organizations', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { parentId: null }, // Only main accounts
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        companyName: true
                    }
                },
                createdAt: true,
                planType: true,
                planExpiresAt: true,
                isActive: true,
                isVerified: true,
                _count: {
                    select: {
                        bills: true,
                        customers: true,
                        products: true
                    }
                },
                bills: {
                    select: {
                        totalAmount: true
                    }
                }
            },
            orderBy: [
                { isVerified: 'asc' }, // Show unverified/pending first
                { createdAt: 'desc' }
            ]
        })

        const organizations = users.map((user: any) => {
            const totalRevenue = user.bills.reduce((sum: number, bill: any) => sum + bill.totalAmount, 0)
            return {
                id: user.id,
                email: user.email,
                companyName: user.profile?.companyName || '',
                createdAt: user.createdAt,
                planType: user.planType,
                planExpiresAt: user.planExpiresAt,
                isActive: user.isActive,
                isVerified: user.isVerified,
                billCount: user._count?.bills || 0,
                customerCount: user._count?.customers || 0,
                totalRevenue
            }
        })

        res.status(200).json({ success: true, organizations })
    } catch (error) {
        console.error('Super admin organizations error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get all leads
router.get('/leads', async (req, res) => {
    try {
        const { search } = req.query
        const whereClause: any = {}
        if (search) {
            whereClause.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string, mode: 'insensitive' } },
                { message: { contains: search as string, mode: 'insensitive' } }
            ]
        }
        const leads = await prisma.lead.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        })
        res.status(200).json({ success: true, leads })
    } catch (error) {
        console.error('Super admin leads error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update lead status
router.patch('/leads/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const lead = await prisma.lead.update({
            where: { id },
            data: { status }
        })

        res.status(200).json({ success: true, lead })
    } catch (error) {
        console.error('Update lead error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get all demo requests
router.get('/demo-requests', async (req, res) => {
    try {
        const { search } = req.query
        const whereClause: any = {}
        if (search) {
            whereClause.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string, mode: 'insensitive' } },
                { companyName: { contains: search as string, mode: 'insensitive' } }
            ]
        }
        const demoRequests = await prisma.demoRequest.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        })
        res.status(200).json({ success: true, demoRequests })
    } catch (error) {
        console.error('Super admin demo requests error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update demo request status
router.patch('/demo-requests/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const demoRequest = await prisma.demoRequest.update({
            where: { id },
            data: { status }
        })

        res.status(200).json({ success: true, demoRequest })
    } catch (error) {
        console.error('Update demo request error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Toggle organization active status
router.patch('/organizations/:id/status', async (req, res) => {
    try {
        const { id } = req.params
        const { isActive } = req.body

        const user = await prisma.user.update({
            where: { id },
            data: { isActive }
        })

        res.status(200).json({ success: true, user })
    } catch (error) {
        console.error('Update organization status error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Toggle organization verification status
router.patch('/organizations/:id/verify', async (req, res) => {
    try {
        const { id } = req.params
        const { isVerified } = req.body

        const user = await prisma.user.update({
            where: { id },
            data: { isVerified },
            include: { profile: true }
        })

        // If verified, send notification email
        if (isVerified) {
            try {
                const { sendAccountVerifiedEmail } = await import('../services/emailService');
                sendAccountVerifiedEmail(user.email, (user as any).profile?.name || (user as any).profile?.companyName || 'User').catch(err => {
                    console.error('[VerifyOrg] Email notification failed:', err);
                });
            } catch (e) {}
        }

        res.status(200).json({ success: true, user })
    } catch (error) {
        console.error('Update organization verification error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Reset organization admin password
router.post('/organizations/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params
        const { password } = req.body

        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' })
        }

        const { hashPassword } = await import('../lib/auth')
        const { sendPasswordResetByAdminEmail } = await import('../services/emailService')
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.update({
            where: { id },
            data: { 
                password: hashedPassword,
                security: {
                    upsert: {
                        create: {
                            passwordSet: true,
                            failedLoginAttempts: 0,
                            lockedUntil: null
                        },
                        update: {
                            passwordSet: true,
                            failedLoginAttempts: 0,
                            lockedUntil: null
                        }
                    }
                }
            }
        })

        if (user && user.email) {
            sendPasswordResetByAdminEmail(user.email, password).catch(err => {
                console.error('Failed to send password reset email:', err)
            })
        }

        res.status(200).json({ success: true, message: 'Password updated successfully and email sent' })
    } catch (error) {
        console.error('Reset organization password error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
