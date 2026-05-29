import express from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { generateGstr1, generateGstr2, getGstr3bSummary, getGstConstants, searchHsn } from '../controllers/gstController';

const router = express.Router();

// Generate GSTR-1 JSON (Sales)
router.get('/gstr1', authenticateToken, requirePermission('REPORTS_READ' as any), generateGstr1);

// Generate GSTR-2 JSON (Purchases)
router.get('/gstr2', authenticateToken, requirePermission('REPORTS_READ' as any), generateGstr2);

// Get GSTR-3B Summary
router.get('/gstr3b', authenticateToken, requirePermission('REPORTS_READ' as any), getGstr3bSummary);

// Search HSN
router.get('/hsn', authenticateToken, searchHsn);

// Get GST constants (State Codes, etc.)
router.get('/constants', authenticateToken, getGstConstants);

export default router;
