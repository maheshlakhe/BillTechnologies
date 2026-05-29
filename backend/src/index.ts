// BillSoft API Server - Simplified JWT Secret for Reset Flow
import express from 'express'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import prisma from './lib/prisma'

// BigInt JSON support (global) – must be before any JSON.stringify occurs
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

// Global shims for shared frontend/backend code
if (typeof global !== 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
  (global as any).sessionStorage = (global as any).localStorage;
  (global as any).window = {
    location: { href: '' },
    localStorage: (global as any).localStorage,
    sessionStorage: (global as any).sessionStorage
  };
  if (typeof (global as any).Blob === 'undefined') {
    (global as any).Blob = class MockBlob {
      constructor(public parts: any[], public options?: any) {}
    };
  }
}
import { getNetworkIp } from './lib/network'
import cors from 'cors'
import dotenv from 'dotenv'
// Load environment variables immediately before any other local imports
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

import authRoutes from './routes/auth'
import customerRoutes from './routes/customers'
import productRoutes from './routes/products'
import billRoutes from './routes/bills'
import adminRoutes from './routes/admin'
import supplierRoutes from './routes/suppliers'
import expenseRoutes from './routes/expenses'
import inventoryRoutes from './routes/inventory'
import serviceRoutes from './routes/services'
import reportsRoutes from './routes/reports'
import superAdminRoutes from './routes/superAdmin'
import publicRoutes from './routes/public'
import templateRoutes from './routes/templates';
import customColumnRoutes from './routes/customColumns'


import serviceTicketRoutes from './routes/serviceTickets'
import purchaseOrderRoutes from './routes/purchaseOrders'
import gstRoutes from './routes/gst'
import industryRoutes from './routes/industry'
import warehouseRoutes from './routes/warehouses'
import developerRoutes from './routes/developer'
import thirdPartyOrderRoutes from './routes/thirdPartyOrders'
import qrMenuRoutes from './routes/qrMenu'


// Import worker — wrapped so Redis being unavailable doesn't crash the server
try {
  require('./workers/importWorker');
  console.log('[Server] BullMQ import worker loaded.');
} catch (err: any) {
  console.warn('[Server] BullMQ worker failed to load (Redis unavailable?). File imports will run in-process.', err.message);
}

// Auto-detect local IP for development/invite links
// if (!process.env.FRONTEND_URL || process.env.NODE_ENV === 'development') {
//   const localIp = getNetworkIp();
//   process.env.FRONTEND_URL = `http://${localIp}:3000`;
// }

const app = express()
const PORT: number = Number(process.env.SERVER_PORT) || 5000

// Enable CORS for all environments
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://billsoft.agbitsolutions.com',
  'https://billsoft.agbtechnologies.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',
  'http://192.168.31.132:3000',
  'https://billsoft-web.netlify.app',
  'https://billsoft.salonadmin.cloud',
  'https://api.billsoft.salonadmin.cloud',
  'http://billsoft.agbtechnologies.com',
  'http://api.billsoft.agbtechnologies.com',
  'https://api.billsoft.agbtechnologies.com',
  'https://billsoft.agbitsolutions.com',
  'http://billsoft.agbitsolutions.com',
  'https://smartgatewayuat.hdfcbank.in',
  'https://smartgateway.hdfcuat.bank.in',
  'https://smartgateway.hdfcbank.in',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // In development or if origin is in allowed list, allow it
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.error(`[CORS] Rejected origin: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'] // Use wildcard for headers to avoid preflight issues
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.error(`[Socket.IO CORS] Rejected origin: ${origin}`);
        callback(new Error(`CORS not allowed for Socket.IO: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }
})

// Store io instance on app so it can be accessed in route handlers
app.set('io', io)

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  socket.on('join_restaurant', (restaurantId: string) => {
    socket.join(restaurantId)
    console.log(`[Socket] Client ${socket.id} joined restaurant room: ${restaurantId}`)
  })

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
})

// Static uploads folder — resolve relative to this source file, not cwd
// tsx runs src/index.ts directly: __dirname = /app/src → ../uploads = /app/uploads (Docker volume)
const uploadsPath = path.join(__dirname, '../uploads');
console.log(`[Static] Serving /uploads from: ${uploadsPath}`);
app.use('/uploads', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2592000');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
}, express.static(uploadsPath));

// Also serve on /api/uploads for easier Nginx proxying
app.use('/api/uploads', (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=2592000');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
}, express.static(uploadsPath));

// Request Logging (Silenced to reduce console noise)
app.use((req, res, next) => {
  // Uncomment the lines below if you need to debug API requests
  // if (req.method === 'OPTIONS') {
  //   console.log(`[CORS Preflight] ${req.method} ${req.url} from ${req.headers.origin}`);
  // } else {
  //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'N/A'}`);
  // }
  next();
});

// Diagnostic: List uploaded files
app.get('/api/system/list-uploads', (_req, res) => {
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      success: true,
      uploadsPath,
      count: files.length,
      files: files.slice(0, 50) // Return first 50 files
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, path: uploadsPath });
  }
});

// Redundant surgical strike routes removed. Using modular routes in src/routes/admin/settings.ts instead.


// --- Branding / Admin-Settings Alias for immediate UI sync ---
app.put('/api/admin-settings', async (req, res) => {
  try {
    const { primaryColor } = req.body;

    const updated = await prisma.settings.upsert({
      where: { category_key: { category: 'general', key: 'primary_color' } },
      update: { primaryColor, value: primaryColor || '#3b82f6', updatedAt: new Date() },
      create: { 
        category: 'general',
        key: 'primary_color',
        displayName: 'Primary Theme Color',
        value: primaryColor || '#3b82f6',
        primaryColor
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DIAGNOSTIC: TEST CONNECTION ---
app.get('/api/system/test-connection', (req, res) => {
  res.json({
    success: true,
    message: "Connection Successful!",
    serverTime: new Date().toISOString(),
    clientIp: req.ip,
    localIp: getNetworkIp()
  });
});

// --- FORCEFUL PUBLIC ROUTE (PLACED BEFORE PROTECTED MODULES) ---
app.get('/api/public-share/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Dynamic import to avoid circular dependency if lib/prisma imports index
    const prisma = require('./lib/prisma').default;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { companyName: true, email: true, phone: true } },
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } }
      }
    });

    if (!bill) return res.status(404).json({ error: 'Invoice not found' });

    // 2. Fetch Settings (Correct Settings + State Pattern)
    const setting_entry = await prisma.settings.findUnique({
      where: { category_key: { category: 'invoice_settings', key: 'general_preferences' } },
      include: { settingStates: { where: { userId: bill.userId } } }
    });

    const settingsValue = setting_entry?.settingStates[0]?.value || setting_entry?.value;
    const preferences = settingsValue ? JSON.parse(settingsValue) : null;

    const parsedItems = bill.items.map((item: any) => ({
      ...item,
      customFields: (() => {
        try {
          return item.customFields ? JSON.parse(item.customFields) : null;
        } catch (e) {
          return null;
        }
      })()
    }));

    res.status(200).json({
      bill: { ...bill, items: parsedItems },
      preferences
    });
  } catch (error) {
    console.error('CRITICAL: Public share fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health checks
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', message: 'BillSoft API Server is running' })
};
app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

app.get('/api/system/network-ip', (_req, res) => {
  const localIp = getNetworkIp();
  res.json({ ip: localIp });
});

// --- DIAGNOSTIC: TEST EMAIL SERVICE ---
app.post('/api/system/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Recipient email is required' });

  try {
    const { sendMail } = require('./services/emailService/mailService');
    console.log(`[Diagnostic] 📧 Testing SMTP delivery to: ${email}`);

    const result = await sendMail({
      to: email,
      subject: 'BillSoft SMTP Diagnostic Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #6366f1; border-radius: 12px;">
          <h2 style="color: #6366f1;">System Diagnostic: SMTP Connection</h2>
          <p>This is a test email from the BillSoft API to verify your Gmail App Password configuration.</p>
          <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin: 10px 0;">
            <strong>Status:</strong> Connection Established ✅<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </div>
          <p>If you received this, your email service is working perfectly!</p>
        </div>
      `
    });

    if (result.success) {
      res.json({ success: true, message: `Diagnostic email successfully dispatched to ${email}. Check your inbox/spam.` });
    } else {
      res.status(500).json({ error: `SMTP Delivery Failed: ${result.error}` });
    }
  } catch (err: any) {
    console.error('Diagnostic Email Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API Routes
import uploadRoutes from './routes/upload';

import paymentRoutes from './routes/payments';

const modules = [
  { path: 'auth', routes: authRoutes },
  { path: 'customers', routes: customerRoutes },
  { path: 'products', routes: productRoutes },
  { path: 'bills', routes: billRoutes },
  { path: 'admin', routes: adminRoutes },
  { path: 'suppliers', routes: supplierRoutes },
  { path: 'expenses', routes: expenseRoutes },
  { path: 'inventory', routes: inventoryRoutes },
  { path: 'services', routes: serviceRoutes },
  { path: 'service-tickets', routes: serviceTicketRoutes },
  { path: 'purchase-orders', routes: purchaseOrderRoutes },
  { path: 'reports', routes: reportsRoutes },
  { path: 'upload', routes: uploadRoutes },
  { path: 'super-admin', routes: superAdminRoutes },
  { path: 'templates', routes: templateRoutes },
  { path: 'custom-columns', routes: customColumnRoutes },
  { path: 'gst', routes: gstRoutes },
  { path: 'payments', routes: paymentRoutes },
  { path: 'industries', routes: industryRoutes },
  { path: 'warehouses', routes: warehouseRoutes },
  { path: 'developer', routes: developerRoutes },
  { path: 'third-party-orders', routes: thirdPartyOrderRoutes },
  { path: 'qr-menu', routes: qrMenuRoutes },

  { path: 'web', routes: publicRoutes }
];

modules.forEach(m => {
  app.use(`/api/${m.path}`, m.routes);
});

// Root Info
app.get('/', (_req, res) => res.json({ message: 'BillSoft API running on 0.0.0.0' }));

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Listen on 0.0.0.0 to allow mobile device access
server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('🚀 BillSoft API Server forced to 0.0.0.0')
  console.log(`📡 PORT: ${PORT}`)
  console.log(`🌐 TEST THIS ON MOBILE BROWSER: http://${getNetworkIp()}:${PORT}/api/system/test-connection`)
  console.log(`🔗 FRONTEND URL: ${process.env.FRONTEND_URL || 'Not Set'}`)
  console.log('')
})
