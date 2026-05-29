import { Router } from 'express';
import axios from 'axios';
import { createPaymentSession, verifyPaymentStatus } from '../services/paymentService';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Plan configuration
const PLAN_PRICES: Record<string, number> = { STARTER: 399, GROWTH: 999, PRO: 2499 };
const PLAN_DAYS: Record<string, number> = { STARTER: 30, GROWTH: 30, PRO: 365 };

const generateOrderId = (plan: string, userId: string): string => {
  // Requirement: Unique, <21 chars, no special chars, Alphanumeric, Non-sequential
  const prefix = 'BS'; // 2 chars
  const planCode = plan.substring(0, 1).toUpperCase(); // 1 char (S, G, P)
  
  // Use last 4 digits of timestamp + 10 random alphanumeric chars
  const timePart = Date.now().toString().slice(-4);
  const randomPart = Math.random().toString(36).substring(2, 12).toUpperCase();
  
  const id = `${prefix}${planCode}${timePart}${randomPart}`; // 2 + 1 + 4 + 10 = 17 chars
  return id.substring(0, 20); // Safety cap at 20 chars
};

const orderMeta: Record<string, { plan: string; userId: string; origin?: string }> = {};

// ─────────────────────────────────────────────────────────
// UI Templates
// ─────────────────────────────────────────────────────────

function getBaseStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      padding: 20px;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 40px;
      max-width: 450px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn {
      display: block; width: 100%; padding: 14px; border-radius: 12px;
      text-decoration: none; font-weight: 600; margin-top: 10px; transition: 0.2s;
    }
    .details { background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; margin: 20px 0; text-align: left; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .label { color: #94a3b8; }
  `;
}

function generateSuccessHTML(orderId: string, planName: string = 'Premium', baseUrl?: string) {
  const frontendUrl = (baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  
  // Locale-independent safe date formatting
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful — BillSoft</title>
  <style>
    ${getBaseStyles()}
    .card { border-color: rgba(34, 197, 94, 0.3); }
    .icon { width: 60px; height: 60px; background: #22c55e; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
    .btn-primary { background: #22c55e; color: white; }
    .btn-primary:hover { background: #16a34a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1 style="margin-bottom:10px; font-size: 24px;">Payment Successful!</h1>
    <p style="color:#94a3b8">Your subscription is now active.</p>
    <div class="details">
      <div class="row"><span class="label">Order ID</span><span>${orderId || 'N/A'}</span></div>
      <div class="row"><span class="label">Plan</span><span>${planName} Plan</span></div>
      <div class="row"><span class="label">Date</span><span>${dateStr}</span></div>
    </div>
    <a href="${frontendUrl}/dashboard" class="btn btn-primary">Go to Dashboard</a>
  </div>
</body>
</html>`;
}

function generateFailureHTML(orderId: string, reason: string = 'User Cancelled', baseUrl?: string) {
  const frontendUrl = (baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const cleanReason = String(reason || 'Declined').replace(/_/g, ' ');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed — BillSoft</title>
  <style>
    ${getBaseStyles()}
    .card { border-color: rgba(239, 68, 68, 0.3); }
    .icon { width: 60px; height: 60px; background: #ef4444; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-secondary { background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <h1 style="margin-bottom:10px; font-size: 24px;">Payment Failed</h1>
    <p style="color:#f87171">Something went wrong with the transaction.</p>
    <div class="details">
      <div class="row"><span class="label">Order ID</span><span>${orderId || 'N/A'}</span></div>
      <div class="row"><span class="label">Reason</span><span style="color:#f87171">${cleanReason}</span></div>
    </div>
    <a href="${frontendUrl}/upgrade" class="btn btn-primary">Try Again</a>
    <a href="${frontendUrl}/dashboard" class="btn btn-secondary">Back to Dashboard</a>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
// Debugging & Logging
// ─────────────────────────────────────────────────────────

const paymentLogs: any[] = [];
function addPaymentLog(type: string, data: any) {
  paymentLogs.unshift({ timestamp: new Date().toISOString(), type, data });
  if (paymentLogs.length > 50) paymentLogs.pop();
  console.log(`[PaymentLog] ${type}:`, JSON.stringify(data));
}

router.get('/debug-logs', (req, res) => {
  res.json({ logs: paymentLogs, meta_count: Object.keys(orderMeta).length });
});

// Proxy route to bypass network blocks on SDK script
router.get('/sdk-proxy', async (req, res) => {
  try {
    const sdkUrl = 'https://smartgatewayuat.hdfcbank.in/checkout.js';
    console.log(`[Payments SDK Proxy] Fetching from: ${sdkUrl}`);
    const response = await axios.get(sdkUrl, { responseType: 'text', timeout: 5000 });
    res.setHeader('Content-Type', 'application/javascript');
    res.send(response.data);
  } catch (err: any) {
    console.error('[Payments SDK Proxy] Failed:', err.message);
    res.status(500).send(`/* SDK Proxy Failed: ${err.message} */`);
  }
});

// ─────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────

router.post(['/handle-response', '/handle-response/'], async (req, res) => {
  try {
    const body = req.body || {};
    const orderId = body.order_id || body.orderId || '';
    const status = body.status || '';
    
    addPaymentLog('POST_CALLBACK', { orderId, status, body_keys: Object.keys(req.body || {}) });

    if (Object.keys(body).length === 0) {
      console.warn('[Payments POST Callback] WARNING: Empty request body received.');
    }

    const isSuccess = status === 'CHARGED' || status === 'Success' || status === 'SUCCESS';

    if (isSuccess) {
      const meta = orderMeta[orderId];
      if (meta) {
        addPaymentLog('PROVISIONING', { userId: meta.userId, plan: meta.plan, orderId });
        try {
           await prisma.user.update({
            where: { id: meta.userId },
            data: {
              planType: meta.plan as any,
              planExpiresAt: new Date(Date.now() + (PLAN_DAYS[meta.plan] || 30) * 86400000)
            }
          });
          delete orderMeta[orderId];
          addPaymentLog('PROVISION_SUCCESS', { orderId });
        } catch (dbErr: any) {
          console.error('[Payments] Database update failed:', dbErr);
          addPaymentLog('PROVISION_ERROR', { error: dbErr.message, orderId });
        }
      } else {
        console.warn(`[Payments] No metadata found for order ${orderId}.`);
        addPaymentLog('META_MISSING', { orderId });
      }
    } else {
      addPaymentLog('PAYMENT_FAIL_STATE', { orderId, status });
    }
    
    // REDIRECT back to the FRONTEND /payment-response page
    const finalStatus = isSuccess ? 'success' : 'failed';
    const origin = orderMeta[orderId]?.origin || '';
    const frontendBaseUrl = (origin || process.env.FRONTEND_URL || 'http://localhost:3002').replace(/\/$/, '');
    const redirectUrl = `${frontendBaseUrl}/payment-response?status=${finalStatus}&order_id=${orderId}`;
    
    console.log(`[Payments] Redirecting browser back to frontend: ${redirectUrl}`);
    res.redirect(redirectUrl);

  } catch (err: any) {
    console.error('[Payments] POST Error:', err);
    addPaymentLog('POST_CRASH', { error: err.message });
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(generateFailureHTML('', `Internal Processing Error: ${err.message}`));
  }
});

router.get(['/handle-response', '/handle-response/'], (req, res) => {
  try {
    const orderId = (req.query.order_id as string) || (req.query.orderId as string) || '';
    const status = (req.query.status as string) || '';
    const origin = (req.query.origin as string) || '';
    
    console.log(`[Payments GET Callback] Received: ID=${orderId}, Status=${status}, Origin=${origin}`);

    if (status === 'success' || status === 'CHARGED' || status === 'SUCCESS' || status === 'Success') {
      // Dynamically detect plan from the Order ID (BS + S/G/P)
      const planLetter = orderId.charAt(2);
      const planMap: Record<string, string> = { 'S': 'Starter', 'G': 'Growth', 'P': 'Pro' };
      const planName = planMap[planLetter] || 'Subscription';
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(generateSuccessHTML(orderId, planName, origin));
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateFailureHTML(orderId, status, origin));
  } catch (err) {
    console.error('[Payments] GET Error:', err);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(generateFailureHTML('', 'Internal Processing Error'));
  }
});

// ─────────────────────────────────────────────────────────
// Support & Test Routes
// ─────────────────────────────────────────────────────────

router.get('/test-success', (req, res) => res.send(generateSuccessHTML('BS_TEST_SUCCESS', 'GROWTH')));
router.get('/test-failed', (req, res) => res.send(generateFailureHTML('BS_TEST_FAIL', 'AUTHENTICATION_FAILED')));

router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`[Payments] Manual verification requested for: ${orderId}`);
    
    const result = await verifyPaymentStatus(orderId);
    const status = result.status || result.order_status || 'UNKNOWN';
    
    const isSuccess = status === 'CHARGED' || status === 'Success' || status === 'SUCCESS' || status === 'PAID';
    
    if (isSuccess) {
      const meta = orderMeta[orderId];
      if (meta) {
        addPaymentLog('PROVISIONING_MANUAL', { userId: meta.userId, plan: meta.plan, orderId });
        await prisma.user.update({
          where: { id: meta.userId },
          data: {
            planType: meta.plan as any,
            planExpiresAt: new Date(Date.now() + (PLAN_DAYS[meta.plan] || 30) * 86400000)
          }
        });
        delete orderMeta[orderId];
        addPaymentLog('PROVISION_SUCCESS_MANUAL', { orderId });
      }
    }

    res.json({ 
      success: isSuccess, 
      status, 
      order_id: orderId,
      plan: orderMeta[orderId]?.plan,
      detail: result 
    });
  } catch (err: any) {
    console.error('[Payments] Verification Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/create-subscription-session', authenticateToken, async (req: any, res) => {
  try {
    const { plan, origin } = req.body;
    const userId = req.user.id;
    const amount = PLAN_PRICES[plan];
    
    if (!amount) return res.status(400).json({ message: 'Invalid plan' });
    
    const orderId = generateOrderId(plan, userId);
    orderMeta[orderId] = { plan, userId, origin };
    
    const session = await createPaymentSession(orderId, amount, userId, req.user.email);
    console.log('[Payments] HDFC Session Response Payload:', JSON.stringify(session, null, 2));
    
    res.json({ 
      success: true, 
      sdk_payload: session.sdk_payload, 
      payment_links: session.payment_links,
      order_id: orderId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Session creation failed' });
  }
});

export default router;
