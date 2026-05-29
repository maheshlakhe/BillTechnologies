import express from 'express'
import prisma from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Get all industries
router.get('/', async (req, res) => {
    try {
        const industries = await prisma.industryMaster.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, industries });
    } catch (error) {
        console.error('Fetch industries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get industry-specific fields for an entity
router.get('/:industryId/fields/:entity', async (req, res) => {
    try {
        const { industryId, entity } = req.params;
        const fields = await prisma.industryFormField.findMany({
            where: { 
                industryId, 
                entity,
                isActive: true 
            },
            include: {
                group: {
                    include: {
                        options: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, fields });
    } catch (error) {
        console.error('Fetch industry fields error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get industry fields for current user
router.get('/my-fields/:entity', authenticateToken, async (req, res) => {
    try {
        const { entity } = req.params;
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { industryId: true }
        });

        let whereClause: any = { entity, isActive: true };
        if (user && user.industryId) {
            whereClause.industryId = user.industryId;
        }

        let fields = await prisma.industryFormField.findMany({
            where: whereClause,
            include: {
                group: {
                    include: {
                        options: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Deduplicate fields by name if returning all industries
        if (!user || !user.industryId) {
            const uniqueFields = new Map();
            fields.forEach((f: any) => {
                if (!uniqueFields.has(f.name)) {
                    uniqueFields.set(f.name, f);
                }
            });
            fields = Array.from(uniqueFields.values());
        }

        res.json({ success: true, fields });
    } catch (error) {
        console.error('Fetch my industry fields error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product view form structure for current user's industry
router.get('/my-product-form', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { industryId: true }
        });

        if (!user || !user.industryId) {
            return res.status(400).json({ error: 'User does not belong to any industry' });
        }

        const form = await prisma.industryWiseProductViewForm.findUnique({
            where: { industryId: user.industryId }
        });

        if (!form) {
            return res.status(404).json({ error: 'Product form structure not found for this industry' });
        }

        res.json({ success: true, formStructure: JSON.parse(form.formStructure) });
    } catch (error) {
        console.error('Fetch my product form structure error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product view form structure by industry ID
router.get('/:industryId/product-form', async (req, res) => {
    try {
        const { industryId } = req.params;

        const form = await prisma.industryWiseProductViewForm.findUnique({
            where: { industryId }
        });

        if (!form) {
            return res.status(404).json({ error: 'Product form structure not found for this industry' });
        }

        res.json({ success: true, formStructure: JSON.parse(form.formStructure) });
    } catch (error) {
        console.error('Fetch product form structure error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get layout configuration for current user's industry
router.get('/my-layout', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { industryId: true }
        });

        if (!user || !user.industryId) {
            return res.status(400).json({ error: 'User does not belong to any industry' });
        }

        const view = await prisma.industryView.findFirst({
            where: { 
                industryId: user.industryId,
                slug: 'layout-config',
                isActive: true
            }
        });

        if (!view) {
            return res.status(404).json({ error: 'Layout configuration not found for this industry' });
        }

        res.json({ success: true, layout: JSON.parse(view.config) });
    } catch (error) {
        console.error('Fetch my layout configuration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get layout configuration by industry ID
router.get('/:industryId/layout', async (req, res) => {
    try {
        const { industryId } = req.params;

        const view = await prisma.industryView.findFirst({
            where: { 
                industryId,
                slug: 'layout-config',
                isActive: true
            }
        });

        if (!view) {
            return res.status(404).json({ error: 'Layout configuration not found for this industry' });
        }

        res.json({ success: true, layout: JSON.parse(view.config) });
    } catch (error) {
        console.error('Fetch layout configuration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router
