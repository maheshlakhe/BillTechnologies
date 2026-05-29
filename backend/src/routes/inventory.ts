import express from 'express'
import prisma from '../lib/prisma'
import { authenticateToken, requirePermission } from '../middleware/auth'

const router = express.Router()

// Apply common middleware
router.use(authenticateToken)

// Get unified global alerts and notifications
router.get('/alerts', requirePermission('view_products'), async (req: any, res: any) => {
    try {
        const userId = req.user.orgId

        // 1. Fetch unread bills (Standard behavior for bills)
        const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        const recentBills = await prisma.bill.findMany({
            where: {
                userId,
                createdAt: { gte: oneDayAgo },
                isNotificationRead: false
            },
            select: {
                id: true,
                billNumber: true,
                totalAmount: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        // 2. Fetch ALL unread persistent notifications (Products, Tickets, etc.)
        const rawNotifications = await (prisma as any).notification.findMany({
            where: {
                userId,
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        // 3. Read Low Stock Alert settings — non-invasive, reads three rows from the settings table only
        const [alertSetting, thresholdSetting, dashboardSetting] = await Promise.all([
            prisma.settings.findFirst({ where: { key: 'lowStockAlertEnabled', category: 'notifications' } }),
            prisma.settings.findFirst({ where: { key: 'lowStockThreshold', category: 'notifications' } }),
            prisma.settings.findFirst({ where: { key: 'enableDashboardLowStockAlerts', category: 'notifications' } })
        ]);

        const isLowStockAlertEnabled: boolean = (() => {
            if (!alertSetting) return true; // Default to TRUE to restore behavior
            try { return JSON.parse(alertSetting.value as string) === true; }
            catch { return alertSetting.value === 'true'; }
        })();

        const lowStockThreshold: number = (() => {
            if (!thresholdSetting || thresholdSetting.value === '') return 0; // Default to 0
            try {
                const parsed = JSON.parse(thresholdSetting.value as string);
                const val = parseInt(parsed, 10);
                return isNaN(val) ? 0 : val;
            } catch {
                const val = parseInt(thresholdSetting.value as string, 10);
                return isNaN(val) ? 0 : val;
            }
        })();

        const enableDashboardLowStockAlerts: boolean = (() => {
            if (!dashboardSetting) return true; // Default to TRUE
            try { return JSON.parse(dashboardSetting.value as string) === true; }
            catch { return dashboardSetting.value === 'true'; }
        })();

        // 4. Fetch Low Stock Products if either toggle is enabled
        let lowStockProducts: any[] = [];
        if (enableDashboardLowStockAlerts || isLowStockAlertEnabled) {
            lowStockProducts = await prisma.product.findMany({
                where: {
                    userId,
                    stock: { lt: lowStockThreshold } // Fix: Changed from lte to lt (strict threshold)
                },
                select: { id: true, name: true, stock: true, minStockLevel: true, updatedAt: true },
                orderBy: { stock: 'asc' }
            });

            // DEBUG MUST ADD
            if (lowStockProducts.length > 0) {
                console.log("Stock:", Number(lowStockProducts[0].stock));
                console.log("Threshold:", lowStockThreshold);
                console.log("IsLow:", Number(lowStockProducts[0].stock) < lowStockThreshold);
            }
        }

        // 4b. Dynamically insert stock notifications from the real-time query
        let finalNotifications = rawNotifications.filter((n: any) => n.type !== 'stock');

        // Fix: System alerts (bell) now depend on isLowStockAlertEnabled independently
        if (isLowStockAlertEnabled) {
            const dynamicStockNotifications = lowStockProducts.map(p => ({
                id: `dynamic-stock-${p.id}`,
                message: `Product ${p.name} is running low (${Number(p.stock)} units remaining)`,
                type: 'stock',
                createdAt: p.updatedAt || new Date()
            }));

            // Limit to avoid payload becoming infinitely large, usually top 50 is fine
            finalNotifications = [...dynamicStockNotifications, ...finalNotifications].slice(0, 50);
        }

        // 5. Fetch expiring soon products (For the Dashboard Widget — unaffected by stock toggle)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringProducts = await prisma.product.findMany({
            where: {
                userId,
                expiryDate: {
                    lte: sevenDaysFromNow,
                    gte: new Date()
                }
            },
            take: 10
        });

        res.status(200).json({
            // DASHBOARD WIDGET: Real-time inventory status
            lowStock: enableDashboardLowStockAlerts ? lowStockProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                stock: Number(p.stock),
                minStockLevel: p.minStockLevel,
                type: 'stock',
                date: p.updatedAt
            })) : [],
            // Global threshold value for frontend consumption
            effectiveThreshold: lowStockThreshold,
            // Summary for badge/count displays
            summary: {
                totalAlerts: (enableDashboardLowStockAlerts ? lowStockProducts.length : 0) + expiringProducts.length,
                lowStockCount: enableDashboardLowStockAlerts ? lowStockProducts.length : 0,
                expiringCount: expiringProducts.length
            },
            // TRAY: Recent bills
            recentBills: recentBills.map((b: any) => ({
                id: b.id,
                name: `New bill generated: #${b.billNumber || b.id.slice(0, 8)}`,
                amount: b.totalAmount,
                date: b.createdAt,
                type: 'bill'
            })),
            // TRAY: Unread notifications (stock alerts generated dynamically)
            notifications: finalNotifications.map((n: any) => ({
                id: n.id,
                name: n.message,
                type: n.type,
                date: n.createdAt
            })),
            expiringSoon: expiringProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                expiryDate: p.expiryDate,
                type: 'expiry'
            }))
        })

    } catch (error) {
        console.error('Get unified alerts error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Mark notification as read (Permanent Dismissal - handles both bills and notifications)
router.post('/notifications/:id/read', requirePermission('view_bills'), async (req: any, res: any) => {
    try {
        const { id } = req.params
        const userId = req.user.orgId

        // Try marking a persistent notification first
        try {
            const notification = await (prisma as any).notification.findFirst({
                where: { id, userId }
            })
            if (notification) {
                await (prisma as any).notification.update({
                    where: { id },
                    data: { isRead: true }
                })
                return res.status(200).json({ success: true, message: 'Notification marked as read' })
            }
        } catch (e) {
            // Notification table lookup failed, fall through to bill
        }

        // Fall back to bill notification
        const bill = await prisma.bill.findFirst({
            where: { id, userId }
        })

        if (!bill) {
            return res.status(404).json({ error: 'Notification not found' })
        }

        await prisma.bill.update({
            where: { id },
            data: { isNotificationRead: true }
        })

        res.status(200).json({ success: true, message: 'Notification marked as read' })
    } catch (error) {
        console.error('Mark notification read error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Mark all notifications as read (Global)
router.post('/notifications/read-all', requirePermission('view_products'), async (req: any, res: any) => {
    try {
        const userId = req.user.orgId

        // 1. Mark bills as read for this organization
        await prisma.bill.updateMany({
            where: { userId, isNotificationRead: false },
            data: { isNotificationRead: true }
        })

        // 2. Mark ALL persistent notifications as read (Unified Global)
        await (prisma as any).notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        })

        res.status(200).json({ success: true, message: 'All notifications marked as read' })
    } catch (error) {
        console.error('Mark all read error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Duplicate for PUT compatibility as requested
router.put('/notifications/mark-all-read', requirePermission('view_products'), async (req: any, res: any) => {
    try {
        const userId = req.user.orgId
        await prisma.bill.updateMany({
            where: { userId, isNotificationRead: false },
            data: { isNotificationRead: true }
        })
        await (prisma as any).notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        })
        res.status(200).json({ success: true, message: 'All notifications marked as read' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
