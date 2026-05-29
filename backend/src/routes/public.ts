import express from 'express'
import prisma from '../lib/prisma'
import { sendLeadNotificationEmail, sendDemoRequestNotificationEmail } from '../services/emailService'

const router = express.Router()

// Submit a new lead
router.post('/leads', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body

        if (!name) {
            return res.status(400).json({ error: 'Name is required' })
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                email: email || 'demousermail@billsoft.com',
                phone,
                message
            }
        })

        // Send notification emails
        try {
            await sendLeadNotificationEmail({
                name: lead.name,
                email: lead.email || '',
                phone: lead.phone || undefined,
                message: lead.message || undefined
            });
        } catch (emailErr) {
            console.error('Failed to send lead notification emails:', emailErr);
        }

        res.status(201).json({ success: true, lead })
    } catch (error) {
        console.error('Submit lead error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Submit a demo request
router.post('/demo-requests', async (req, res) => {
    try {
        const { name, email, phone, companyName } = req.body

        if (!name) {
            return res.status(400).json({ error: 'Name is required' })
        }

        const demoRequest = await prisma.demoRequest.create({
            data: {
                name,
                email: email || 'demousermail@billsoft.com',
                phone,
                companyName
            }
        })

        // Send notification emails
        try {
            await sendDemoRequestNotificationEmail({
                name: demoRequest.name,
                email: demoRequest.email || '',
                phone: demoRequest.phone || '',
                companyName: demoRequest.companyName || undefined
            });
        } catch (emailErr) {
            console.error('Failed to send demo request notification emails:', emailErr);
        }

        res.status(201).json({ success: true, demoRequest })
    } catch (error) {
        console.error('Submit demo request error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get public password policy
router.get('/password-policy', async (req, res) => {
    try {
        const policy = await prisma.settings.findUnique({
            where: { category_key: { category: 'security', key: 'password_strength' } }
        });

        res.json({
            success: true,
            strength: policy ? JSON.parse(policy.value) : 'strong'
        });
    } catch (error) {
        res.json({
            success: true,
            strength: 'strong' // Default to strong if error
        });
    }
})

// Get active industries
router.get('/industries', async (req, res) => {
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

export default router
