import express from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// Apply authentication to the entire router
router.use(authenticateToken);

router.get('/gstr1/b2b', requirePermission('tax_gst_reports'), async (req: any, res) => {
    try {
        const userId = req.user?.orgId;
        const { period } = req.query; // YYYYMM format

        const where: any = { 
            userId, 
            invoiceType: 'B2B',
            status: 'PAID' // Assuming based on compliance logic
        };

        if (period) {
            const year = parseInt(period.substring(0, 4));
            const month = parseInt(period.substring(4, 6)) - 1;
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);
            where.createdAt = { gte: startDate, lte: endDate };
        }

        const bills = await prisma.bill.findMany({
            where,
            include: { customer: true }
        });

        res.json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/gstr1/b2c-large', requirePermission('tax_gst_reports'), async (req: any, res) => {
    try {
        const userId = req.user?.orgId;
        const bills = await (prisma.bill as any).findMany({
            where: { userId, invoiceType: 'B2C_LARGE' }
        });
        res.json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/gstr1/b2c-small-summary', requirePermission('tax_gst_reports'), async (req: any, res) => {
    try {
        const userId = req.user?.orgId;
        // Group by placeOfSupply and taxRate
        // This requires a manual grouping or a raw query in Prisma
        const result = await (prisma.billItem as any).groupBy({
            by: ['taxRate'],
            where: { bill: { userId, invoiceType: 'B2C_SMALL' } },
            _sum: {
                total: true,
                cgstAmount: true,
                sgstAmount: true,
                igstAmount: true
            }
        });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/gstr1/hsn-summary', requirePermission('tax_gst_reports'), async (req: any, res) => {
    try {
        const userId = req.user?.orgId;
        const result = await (prisma.billItem as any).groupBy({
            by: ['hsnCode'],
            where: { bill: { userId } },
            _sum: {
                quantity: true,
                total: true, // taxable value
                cgstAmount: true,
                sgstAmount: true,
                igstAmount: true
            }
        });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/gstr3b/summary', requirePermission('tax_gst_reports'), async (req: any, res) => {
    try {
        const userId = req.user?.orgId;
        const outwardSupplies = await (prisma.bill as any).aggregate({
            where: { userId, status: 'PAID' },
            _sum: {
                subtotal: true,
                cgstAmount: true,
                sgstAmount: true,
                igstAmount: true
            }
        });

        const zeroRated = await (prisma.bill as any).aggregate({
            where: { userId, invoiceType: 'EXPORT', status: 'PAID' },
            _sum: {
                subtotal: true,
                igstAmount: true
            }
        });

        // ITC requires Purchase data. Current schema has PurchaseOrder and PurchaseOrderItem.
        // Assuming purchase logic similar to bills.
        const itc = await (prisma.purchaseOrder as any).aggregate({
            where: { userId, status: 'RECEIVED' },
            _sum: {
                cgstAmount: true,
                sgstAmount: true,
                igstAmount: true
            }
        });

        res.json({
            success: true,
            data: {
                outwardSupplies,
                zeroRated,
                itc,
                netTaxPayable: {
                    igst: ((outwardSupplies as any)._sum.igstAmount || 0) - ((itc as any)._sum.igstAmount || 0),
                    cgst: ((outwardSupplies as any)._sum.cgstAmount || 0) - ((itc as any)._sum.cgstAmount || 0),
                    sgst: ((outwardSupplies as any)._sum.sgstAmount || 0) - ((itc as any)._sum.sgstAmount || 0)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
