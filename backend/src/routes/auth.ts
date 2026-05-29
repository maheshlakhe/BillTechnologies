import express from 'express'
import prisma from '../lib/prisma'
import { hashPassword, verifyPassword, createAuthResponse, extractUserFromRequest } from '../lib/auth'
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail, sendSignupVerificationEmail } from '../services/emailService';
import { getBaseUrl, getFrontendUrl } from '../lib/baseUrl';

import { authenticateToken } from '../middleware/auth'

const router = express.Router()

import { emailSchema, nameSchema, personalNameSchema, mobileSchema } from '../lib/validation';

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  companyName: nameSchema,
  name: personalNameSchema.optional().or(z.literal('')),
  phone: mobileSchema.optional().or(z.literal('')),
  organizationSize: z.string().optional()
});

// Auth API Information
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      organizationLogin: 'POST /organization-login',
      profile: 'GET /profile'
    }
  })
})

// Register
router.post('/register', async (req, res) => {
  console.log('--- SIGNUP ATTEMPT ---')
  console.log('Payload:', JSON.stringify({ ...req.body, password: '***' }))

  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, companyName, name, phone } = validatedData;

    // --- DYNAMIC PASSWORD STRENGTH ENFORCEMENT ---
    const { validatePasswordStrength } = await import('../lib/auth');
    const { isValid, error } = await validatePasswordStrength(password, prisma);
    if (!isValid) {
      return res.status(400).json({ error: 'Weak Password', details: error });
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    console.log('Checking for existing user:', normalizedEmail)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      console.log('User already exists:', normalizedEmail)
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await hashPassword(password)

    // Find ADMIN role — log a warning if not found so DB seeding issues are obvious
    // Find ADMIN role — try both cases for cross-deployment compatibility
    let allRoles = await prisma.role.findMany();

    // Auto-seed basic roles if none exist (emergency fix)
    if (allRoles.length === 0) {
      console.warn('[REGISTER] ⚠️ No roles found. Seeding default roles...');
      const defaultRoles = [
        { name: 'ADMIN', displayName: 'Administrator' },
        { name: 'MANAGER', displayName: 'Manager' },
        { name: 'ACCOUNTANT', displayName: 'Accountant' },
        { name: 'VIEWER', displayName: 'Viewer' }
      ];

      for (const r of defaultRoles) {
        await prisma.role.upsert({
          where: { name: r.name as any },
          update: {},
          create: { name: r.name as any, displayName: r.displayName }
        });
      }
      allRoles = await prisma.role.findMany();
    }

    let adminRole = allRoles.find(r => r.name.toUpperCase() === 'ADMIN');

    // Fail-safe: ensure roleId is never null
    if (!adminRole && allRoles.length > 0) {
      adminRole = allRoles[0];
      console.warn(`[REGISTER] ADMIN role not found. Falling back to role: ${adminRole.name}`);
    }

    if (!adminRole) {
      console.error('[REGISTER] ❌ CRITICAL: No roles found in database. User creation will fail or have no role.');
    } else {
      console.log(`[REGISTER] Using role ${adminRole.name} (id=${adminRole.id})`);
    }

    // Create user with Admin role and full permissions
    // Include the role relation so createAuthResponse can read role.name correctly
    console.log('Creating user in database...')
    const userData: any = {
      email: normalizedEmail,
      password: hashedPassword,
      companyName: companyName,
      name: name || null,
      phone: phone || null,
      planType: 'FREE',
      permissions: JSON.stringify(['all'])
    };

    if (adminRole) {
      userData.role = { connect: { id: adminRole.id } };
    }

    // --- SIGNUP VERIFICATION GATE (STRICT IMPLEMENTATION) ---
    // User data is NOT saved in DB until verified.
    // Packaging all data into the token.
    const SIGNUP_SECRET = 'billsoft-stable-signup-secret-2024';

    const verificationToken = jwt.sign({
      type: 'signup-verification',
      userData: {
        email: normalizedEmail,
        password: hashedPassword,
        plainPassword: password, // Store plain password for auto-fill after verification
        companyName: companyName,
        name: name || null,
        phone: phone || null,
        roleId: adminRole?.id
      }
    }, SIGNUP_SECRET, { expiresIn: '24h' });

    console.log(`[Signup] Gating registration for ${normalizedEmail}. Sending verification email...`);

    // ASYNC SEND: Prevents timeout/network error if SMTP is slow
    const { sendSignupVerificationEmail } = await import('../services/emailService');
    const resolvedFrontendUrl = getFrontendUrl(req);
    sendSignupVerificationEmail(normalizedEmail, verificationToken, resolvedFrontendUrl).catch(err => {
      console.error('[SignupEmail] Background dispatch failed:', err);
    });

    return res.status(200).json({
      message: 'Verification email sent! Please check your inbox to activate your account.',
      email: normalizedEmail
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map((e: any) => e.message).join(', ')
      });
    }

    console.error('CRITICAL REGISTRATION ERROR:', err)

    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'User already exists with this email',
        detail: 'Unique constraint failed on email'
      })
    }

    return res.status(500).json({
      error: 'Registration failed',
      detail: err.message,
      code: err.code
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log(` Attempt: ${normalizedEmail} (Pwd len: ${password.length})`);
    // Find user by email
    console.log(` Search user: ${normalizedEmail}`);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { 
        role: true,
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true,
        security: true,
        industry: true
      }
    })

    if (!user) {
      console.warn(` FAILED: User not found: ${normalizedEmail}`);
      return res.status(401).json({ error: 'User not found' })
    }

    console.log(` User found. ID: ${user.id}. Role: ${user.role?.name || 'NONE'}`);

    // Verify password
    console.log(` Verifying password for ${normalizedEmail}...`);
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      console.warn(` FAILED: Password mismatch for ${normalizedEmail}`);
      console.log(` Received plain: ${password}`);
      console.log(` Stored hash: ${user.password}`);
      return res.status(401).json({ error: 'Incorrect password' })
    }

    console.log(` SUCCESS: ${normalizedEmail}`);

    // Update lastLoginAt
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      include: { 
        role: true,
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true,
        security: true,
        industry: true
      }
    });

    // Device tracking and new device alert
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) os = 'Mac OS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    const deviceInfo = `${os} - ${browser}`;

    // Check if this device is new
    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        deviceInfo: deviceInfo
      }
    });

    // ── Smart Session Upsert (Gmail-style deduplication) ──
    // If this device fingerprint already has a session → update it (no new row).
    // If it's a brand-new device → create a new session and send an alert email.
    const crypto = await import('crypto');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let sessionId: string;

    if (existingSession) {
      // Re-use existing row: refresh timestamps and reactivate
      sessionId = existingSession.sessionId;
      await prisma.userSession.update({
        where: { id: existingSession.id },
        data: {
          ipAddress,
          userAgent,
          isActive: true,
          lastUsedAt: new Date(),
          expiresAt,
        }
      });
    } else {
      // Brand-new device — create entry and send alert
      sessionId = crypto.randomUUID();
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionId,
          ipAddress,
          userAgent,
          deviceInfo,
          expiresAt,
          isActive: true,
        }
      });
      try {
        const { sendNewDeviceAlertEmail } = await import('../services/emailService');
        sendNewDeviceAlertEmail(user.email, user.profile?.name || user.profile?.companyName || 'User', deviceInfo, ipAddress)
          .catch(err => {});
      } catch (err) {
      }
    }

    const authResponse = createAuthResponse(updatedUser as any, sessionId)


    res.status(200).json({
      message: 'Login successful',
      ...authResponse
    })

  } catch (err: any) {

    // Check for specific Prisma/SQLite errors
    if (err.message?.includes('locked') || err.message?.includes('busy')) {
      return res.status(503).json({
        error: 'Database is currently busy due to heavy bulk operations.',
        detail: 'Please wait 5 seconds and try again.'
      });
    }

    res.status(500).json({
      error: 'Backend session error',
      detail: err.message || 'Internal Server Error'
    });
  }
})

// Organization Login
router.post('/organization-login', async (req, res) => {
  try {
    const { email, password, organizationCode } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { 
        role: true,
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true,
        security: true,
        industry: true
      }
    })

    if (!user) {
      console.log('Login attempt failed: User not found', normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify Organization Access
    if (!user.profile?.companyName) {
      return res.status(403).json({
        error: 'Access denied. This account is not associated with an organization.'
      })
    }

    // Optional: Verify organization code if provided (future enhancement)
    if (organizationCode && user.profile.companyName !== organizationCode) {
      // logic for code verification if user.companyCode existed
    }

    // Device tracking and new device alert
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) os = 'Mac OS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    const deviceInfo = `${os} - ${browser}`;

    // Check if this device is new
    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        deviceInfo: deviceInfo
      }
    });

    // ── Smart Session Upsert (Gmail-style deduplication) ──
    const crypto = await import('crypto');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let sessionId: string;

    if (existingSession) {
      sessionId = existingSession.sessionId;
      await prisma.userSession.update({
        where: { id: existingSession.id },
        data: {
          ipAddress,
          userAgent,
          isActive: true,
          lastUsedAt: new Date(),
          expiresAt,
        }
      });
    } else {
      sessionId = crypto.randomUUID();
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionId,
          ipAddress,
          userAgent,
          deviceInfo,
          expiresAt,
          isActive: true,
        }
      });
      try {
        const { sendNewDeviceAlertEmail } = await import('../services/emailService');
        await sendNewDeviceAlertEmail(user.email, user.profile?.name || user.profile?.companyName || 'User', deviceInfo, ipAddress);
      } catch (err) { }
    }

    const authResponse = createAuthResponse(user as any, sessionId)

    res.status(200).json({
      message: `Welcome to ${user.profile?.companyName}`,
      organization: {
        name: user.profile?.companyName,
        logoUrl: user.branding?.logoUrl,
        plan: user.planType
      },
      ...authResponse
    })

  } catch (err: any) {
    console.error('Organization login error:', err)
    res.status(500).json({ detail: err.message })
  }
})

// Get Profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.substring(7)
    const user = extractUserFromRequest(authHeader)

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { 
        role: { select: { name: true } },
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true,
        security: true,
        industry: true
      }
    })

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Flatten user profile properties for frontend compatibility
    const flattenedUser = {
      ...userProfile,
      name: userProfile.profile?.name || null,
      phone: userProfile.profile?.phone || null,
      companyName: userProfile.profile?.companyName || null,
      avatarUrl: userProfile.profile?.avatarUrl || null,
      address: userProfile.profile?.address || null,
      city: userProfile.profile?.city || null,
      state: userProfile.profile?.state || null,
      pincode: userProfile.profile?.pincode || null,
      
      logoUrl: userProfile.branding?.logoUrl || null,
      logoPosition: userProfile.branding?.logoPosition || null,
      logoWidth: userProfile.branding?.logoWidth || null,
      logoOffsetX: userProfile.branding?.logoOffsetX || null,
      logoOffsetY: userProfile.branding?.logoOffsetY || null,
      
      gstNumber: userProfile.billingInfo?.gstNumber || null,
      panNumber: userProfile.billingInfo?.panNumber || null,
      stateCode: userProfile.billingInfo?.stateCode || null,

      activeTemplateId: userProfile.businessProfile?.activeTemplateId || userProfile.branding?.activeTemplateId || 'thermal_58mm',
      defaultBillSize: userProfile.businessProfile?.defaultBillSize || userProfile.branding?.defaultBillSize || '58mm',
      billIndustry: userProfile.businessProfile?.billIndustry || userProfile.branding?.billIndustry || '',
      billType: userProfile.businessProfile?.billType || userProfile.branding?.billType || '',
    };

    let parsedPermissions = [];
    if (userProfile.security?.permissions) {
      try {
        parsedPermissions = JSON.parse(userProfile.security.permissions);
      } catch (e) { }
    }

    // Smart role fallback: top-level users (no parentId) are always ADMIN;
    // invited sub-users (has parentId) default to VIEWER if role is unset.
    const resolvedRole = userProfile.role?.name
      ? userProfile.role.name.toUpperCase()
      : (userProfile.parentId ? 'VIEWER' : 'ADMIN');

    res.status(200).json({
      user: {
        ...flattenedUser,
        role: resolvedRole,
        permissions: parsedPermissions,
        industryId: userProfile.industryId,
        industry: userProfile.industry
      }
    })

  } catch (err: any) {
    console.error('Profile error:', err)
    res.status(500).json({ detail: err.message })
  }
})

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const tokenUser = extractUserFromRequest(authHeader)
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const { name, companyName, phone, logoUrl, avatarUrl, address, city, state, pincode, gstNumber, panNumber } = req.body

    const { validateAddressFields } = require('../lib/addressValidation');
    const { validateMobile } = require('../lib/validation');

    const addressValidation = validateAddressFields({ address, city, state, pincode });
    if (!addressValidation.isValid) {
      return res.status(400).json({ error: addressValidation.error });
    }

    if (phone) {
      const mobileVal = validateMobile(phone);
      if (!mobileVal.isValid) {
        return res.status(400).json({ error: mobileVal.error });
      }
    }

    const updatedUser: any = await prisma.user.update({
      where: { id: tokenUser.userId },
      data: {
        profile: {
          upsert: {
            create: {
              name: name !== undefined ? name : '',
              companyName: companyName !== undefined ? companyName : '',
              phone: phone !== undefined ? phone : '',
              avatarUrl: avatarUrl !== undefined ? avatarUrl : '',
              address: address !== undefined ? address : '',
              city: city !== undefined ? city : '',
              state: state !== undefined ? state : '',
              pincode: pincode !== undefined ? pincode : '',
            },
            update: {
              name: name !== undefined ? name : undefined,
              companyName: companyName !== undefined ? companyName : undefined,
              phone: phone !== undefined ? phone : undefined,
              avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
              address: address !== undefined ? address : undefined,
              city: city !== undefined ? city : undefined,
              state: state !== undefined ? state : undefined,
              pincode: pincode !== undefined ? pincode : undefined,
            }
          }
        },
        branding: {
          upsert: {
            create: {
              logoUrl: logoUrl !== undefined ? logoUrl : '',
            },
            update: {
              logoUrl: logoUrl !== undefined ? logoUrl : undefined,
            }
          }
        },
        billingInfo: {
          upsert: {
            create: {
              gstNumber: gstNumber !== undefined ? gstNumber : '',
              panNumber: panNumber !== undefined ? panNumber : '',
            },
            update: {
              gstNumber: gstNumber !== undefined ? gstNumber : undefined,
              panNumber: panNumber !== undefined ? panNumber : undefined,
            }
          }
        }
      },
      include: {
        role: { select: { name: true } },
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true
      }
    })

    // Flatten user profile properties for frontend compatibility
    const flattenedUser = {
      ...updatedUser,
      name: updatedUser.profile?.name || null,
      phone: updatedUser.profile?.phone || null,
      companyName: updatedUser.profile?.companyName || null,
      avatarUrl: updatedUser.profile?.avatarUrl || null,
      address: updatedUser.profile?.address || null,
      city: updatedUser.profile?.city || null,
      state: updatedUser.profile?.state || null,
      pincode: updatedUser.profile?.pincode || null,
      
      logoUrl: updatedUser.branding?.logoUrl || null,
      
      gstNumber: updatedUser.billingInfo?.gstNumber || null,
      panNumber: updatedUser.billingInfo?.panNumber || null,

      activeTemplateId: updatedUser.businessProfile?.activeTemplateId || updatedUser.branding?.activeTemplateId || 'thermal_58mm',
      defaultBillSize: updatedUser.businessProfile?.defaultBillSize || updatedUser.branding?.defaultBillSize || '58mm',
      billIndustry: updatedUser.businessProfile?.billIndustry || updatedUser.branding?.billIndustry || '',
      billType: updatedUser.businessProfile?.billType || updatedUser.branding?.billType || '',
    };

    // Normalize role string for frontend consistency
    const resolvedRole = updatedUser.role?.name
      ? updatedUser.role.name.toUpperCase()
      : (updatedUser.parentId ? 'VIEWER' : 'ADMIN');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        ...flattenedUser,
        role: resolvedRole
      }
    })

  } catch (err: any) {
    console.error('Update profile error:', err)
    res.status(500).json({ detail: err.message })
  }
})

// Manage Column Configuration
router.post('/columns', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { column } = req.body;
    if (!column) return res.status(400).json({ error: 'Column is required' });

    const branding = await prisma.userBranding.findUnique({ where: { userId: tokenUser.userId } });
    let cols = JSON.parse(branding?.customColumns || '["Product Name", "Quantity", "Price", "Total"]');

    // BACKEND VALIDATION: MAX 6
    if (cols.length >= 6) {
      return res.status(400).json({ error: 'Maximum 6 columns allowed' });
    }

    if (!cols.includes(column)) {
      cols.push(column);
      await prisma.userBranding.upsert({
        where: { userId: tokenUser.userId },
        create: { userId: tokenUser.userId, customColumns: JSON.stringify(cols) },
        update: { customColumns: JSON.stringify(cols) }
      });
    }

    res.status(200).json({ columns: cols });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

router.get('/columns', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const branding = await prisma.userBranding.findUnique({ where: { userId: tokenUser.userId } });
    let cols = JSON.parse(branding?.customColumns || '["Product Name", "Quantity", "Price", "Total"]');
    res.status(200).json({ columns: cols });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

router.delete('/columns/:columnName', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { columnName } = req.params;

    const branding = await prisma.userBranding.findUnique({ where: { userId: tokenUser.userId } });
    let cols = JSON.parse(branding?.customColumns || '["Product Name", "Quantity", "Price", "Total"]');

    // BACKEND VALIDATION: MIN 2
    if (cols.length <= 2) {
      return res.status(400).json({ error: 'Minimum 2 columns required' });
    }

    cols = cols.filter((c: string) => c !== columnName);

    // BACKEND VALIDATION: MIN 2
    if (cols.length <= 2) {
      return res.status(400).json({ error: 'Minimum 2 columns required' });
    }

    const finalCols = cols.filter((c: string) => c !== columnName);

    await prisma.userBranding.upsert({
      where: { userId: tokenUser.userId },
      create: { userId: tokenUser.userId, customColumns: JSON.stringify(finalCols) },
      update: { customColumns: JSON.stringify(finalCols) }
    });

    res.status(200).json({ columns: finalCols });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
})

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
    }

    // STABLE SECRET: Bypasses environment variable issues for resets
    const RESET_SECRET = 'billsoft-stable-reset-secret-2024';
    const token = jwt.sign({ userId: user.id, type: 'password-reset' }, RESET_SECRET, { expiresIn: '24h' });

    const { sendForgotPasswordEmail } = await import('../services/emailService');
    console.log(`[AUTH] Scheduling background reset email for ${user.email} (userId: ${user.id})`);

    // QUICK SEND: Async background dispatch
    const resolvedFrontendUrl = getFrontendUrl(req);
    sendForgotPasswordEmail(user.email, token, resolvedFrontendUrl).catch(err => {
      console.error('[ForgotPwdEmail] Background dispatch failed:', err);
    });

    res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Reset Password — serves self-contained HTML page from backend (no port 3000 needed)
router.get('/reset-password-redirect', (req, res) => {
  const { token } = req.query as { token: string };
  const backendUrl = getBaseUrl(req);

  if (!token) {
    return res.status(400).send('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2 style="color:#e53e3e">Link Expired or Server Moved</h2><p>No valid token found in this link. Please request a new reset link.</p></body></html>');
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - BillSoft</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#e8f0fe 0%,#f0f4ff 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,68,204,.15);max-width:440px;width:100%;overflow:hidden}
    .header{background:#0044CC;padding:32px 24px;text-align:center;color:white}
    .header h1{font-size:22px;font-weight:700}
    .header p{opacity:.85;margin-top:8px;font-size:14px}
    .icon{font-size:48px;margin-bottom:12px}
    .body{padding:32px 28px}
    label{display:block;font-size:13px;font-weight:600;color:#444;margin-bottom:6px}
    input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:15px;outline:none;transition:border-color .2s;margin-bottom:16px}
    input:focus{border-color:#0044CC}
    button{width:100%;background:#0044CC;color:white;border:none;padding:15px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;transition:opacity .2s}
    button:hover{opacity:.9}
    button:disabled{opacity:.6;cursor:not-allowed}
    .error{background:#fff5f5;color:#e53e3e;border:1px solid #fed7d7;border-radius:8px;padding:12px;font-size:14px;margin-bottom:12px;display:none}
    .success{background:#f0fff4;color:#276749;border:1px solid #c6f6d5;border-radius:8px;padding:16px;font-size:15px;margin-bottom:12px;display:none;text-align:center;font-weight:600}
    .spinner{display:inline-block;width:18px;height:18px;border:3px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:8px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .hint{font-size:12px;color:#999;margin-top:-10px;margin-bottom:16px}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">🔐</div>
      <h1>Reset Your Password</h1>
      <p>Enter a new password for your BillSoft account</p>
    </div>
    <div class="body">
      <form id="form" onsubmit="submitForm(event)">
        <div class="error" id="errBox"></div>
        <div class="success" id="successBox"></div>
        <label for="password">New Password</label>
        <input type="password" id="password" placeholder="At least 8 characters" autocomplete="new-password">
        <p class="hint">Minimum 8 characters</p>
        <label for="confirm">Confirm New Password</label>
        <input type="password" id="confirm" placeholder="Re-enter your password" autocomplete="new-password">
        <br>
        <button type="submit" id="btn">🔑 Reset Password</button>
      </form>
    </div>
  </div>

  <script>
    const TOKEN = "${token}";
    const API = "${backendUrl}/api/auth/reset-password";

    async function submitForm(e) {
      e.preventDefault();
      const pass = document.getElementById('password').value;
      const conf = document.getElementById('confirm').value;
      const btn = document.getElementById('btn');
      const errBox = document.getElementById('errBox');
      const successBox = document.getElementById('successBox');

      errBox.style.display = 'none';
      successBox.style.display = 'none';

      if (pass.length < 8) { showError('Password must be at least 8 characters.'); return; }
      if (pass !== conf) { showError('Passwords do not match.'); return; }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Resetting...';

      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: TOKEN, password: pass })
        });
        const data = await res.json();
        if (!res.ok) {
          showError(data.error || data.detail || 'Link Expired or Server Moved. Please request a new reset link.');
          btn.disabled = false;
          btn.innerHTML = '🔑 Reset Password';
          return;
        }
        successBox.style.display = 'block';
        successBox.innerHTML = '✅ Password reset! Redirecting to login...';
        btn.innerHTML = '✅ Done!';
        setTimeout(() => {
          window.location.href = '${getFrontendUrl(req)}/login';
        }, 2000);
      } catch(err) {
        showError('Network error. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '🔑 Reset Password';
      }
    }

    function showError(msg) {
      const box = document.getElementById('errBox');
      box.textContent = '⚠️ ' + msg;
      box.style.display = 'block';
    }
  </script>
</body>
</html>`);
});

// Redirect for Setup Password (Invite flow)
router.get('/setup-password-redirect', (req, res) => {
  const { token } = req.query;
  res.redirect(`${getFrontendUrl()}/setup-password?token=${token}`);
});

// Redirect for Login (Welcome flow)
router.get('/login-redirect', (req, res) => {
  res.redirect(`${getFrontendUrl()}/login`);
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    console.log(`[AUTH] Reset attempt received. Token length: ${token.length}`);
    const RESET_SECRET = 'billsoft-stable-reset-secret-2024';

    let decoded: any;
    try {
      decoded = jwt.verify(token, RESET_SECRET);
      console.log(`[AUTH] Token verified for userId: ${decoded.userId}`);
    } catch (err: any) {
      console.error('[AUTH] Reset Token Verification Failed ❌:', err.message);
      return res.status(400).json({
        error: 'Invalid or expired reset link',
        detail: err.message,
        code: 'TOKEN_INVALID'
      });
    }

    if (!decoded || decoded.type !== 'password-reset' || !decoded.userId) {
      return res.status(400).json({ error: 'Invalid or expired token payload' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.warn(`[AUTH] Reset attempt for non-existent userId: ${decoded.userId}`);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    console.log(`[AUTH] Processing valid reset for userId: ${user.id}`);

    // --- DYNAMIC PASSWORD STRENGTH ENFORCEMENT ---
    const { validatePasswordStrength } = await import('../lib/auth');
    const { isValid, error } = await validatePasswordStrength(password, prisma);
    if (!isValid) {
      return res.status(400).json({ error, details: error });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password has been successfully updated' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Change Password (authenticated — requires Bearer token)
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // --- DYNAMIC PASSWORD STRENGTH ENFORCEMENT ---
    const { validatePasswordStrength } = await import('../lib/auth');
    const { isValid, error: strengthError } = await validatePasswordStrength(newPassword, prisma);
    if (!isValid) {
      return res.status(400).json({ error: strengthError });
    }

    // Fetch user WITH password field
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const hashedNew = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNew }
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// GET /sessions - List active sessions (with self-healing deduplication)
router.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch all active, non-expired sessions for this user
    const allSessions = await prisma.userSession.findMany({
      where: {
        userId: tokenUser.userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastUsedAt: 'desc' }
    });

    // ── Self-healing deduplication ──────────────────────────────────────────
    // Group by deviceInfo fingerprint. Keep the most-recent row; mark the rest
    // as inactive so they never appear again (handles any legacy duplicates).
    const seen = new Map<string, string>(); // deviceInfo → id of the winner
    const staleIds: string[] = [];

    for (const s of allSessions) {
      const key = s.deviceInfo || s.userAgent || s.id; // fallback if deviceInfo null
      if (!seen.has(key)) {
        seen.set(key, s.id); // first entry wins (already ordered by lastUsedAt desc)
      } else {
        staleIds.push(s.id); // duplicate – deactivate
      }
    }

    if (staleIds.length > 0) {
      // Fire-and-forget: clean up old duplicates in background
      prisma.userSession.updateMany({
        where: { id: { in: staleIds } },
        data: { isActive: false }
      }).catch(err => console.error('[SESSIONS] Failed to deactivate stale sessions:', err));
    }

    // Return only the winner of each device group
    const sessions = allSessions.filter(s => !staleIds.includes(s.id));

    res.status(200).json({ sessions });
  } catch (err: any) {
    console.error('Get sessions error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// DELETE /sessions/:id - Revoke a specific session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const tokenUser = extractUserFromRequest(authHeader);
    if (!tokenUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const sessionId = req.params.id;

    // Check ownership
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== tokenUser.userId || !session.isActive) {
      return res.status(404).json({ error: 'Session not found or already revoked' });
    }

    // Revoke
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.status(200).json({ message: 'Session revoked successfully' });
  } catch (err: any) {
    console.error('Revoke session error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// --- SECURE SIGNUP ACTIVATION ---

// This handles the final step: Account Creation in DB after email verification
router.post('/verify-signup', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const SIGNUP_SECRET = 'billsoft-stable-signup-secret-2024';
    let decoded: any;
    try {
      decoded = jwt.verify(token, SIGNUP_SECRET);
    } catch (err) {
      console.error('[SignupVerify] Token error:', err);
      return res.status(400).json({ error: 'Authentication link expired or invalid. Please sign up again.' });
    }

    if (decoded.type !== 'signup-verification' || !decoded.userData) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const { email, password, plainPassword, companyName, name, phone, roleId } = decoded.userData;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if verified user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'This account is already verified. Please log in.' });
    }

    // CREATE USER IN DB
    const userData: any = {
      email: normalizedEmail,
      password,
      isVerified: true,
      isActive: true,
      planType: 'FREE',
      profile: {
        create: {
          name,
          phone,
          companyName
        }
      },
      security: {
        create: {
          permissions: JSON.stringify(['all'])
        }
      }
    };

    if (roleId) {
      userData.role = { connect: { id: roleId } };
    }

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        password,
        isVerified: true,
        isActive: true,
        profile: {
          upsert: {
            create: { name, phone, companyName },
            update: { name, phone, companyName }
          }
        }
      },
      create: userData,
      include: { 
        role: true,
        profile: true,
        branding: true,
        businessProfile: true,
        billingInfo: true,
        security: true
      }
    });

    console.log(`[Signup] ACCOUNT ACTIVATED: ${normalizedEmail}`);

    // Send welcome email in background
    try {
      const { sendWelcomeEmail } = await import('../services/emailService');
      sendWelcomeEmail(user.email, user.profile?.name || user.profile?.companyName || 'User').catch(e => console.error(e));
    } catch (e) { }

    // Return auth response with EXTRA plainPassword for auto-fill on mobile redirect
    const authResponse = createAuthResponse(user as any);
    res.status(201).json({
      message: 'Account verified successfully! Welcome to BillSoft.',
      plainPassword,
      ...authResponse
    });

  } catch (err: any) {
    console.error('CRITICAL VERIFICATION ERROR:', err);
    res.status(500).json({ error: 'Signup verification failed', detail: err.message });
  }
});


// Check Verification Status (Used for PC Auto-Sync)
router.get('/check-verification/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { isVerified: true }
    });
    res.json({ verified: user?.isVerified || false });
  } catch (err) {
    res.json({ verified: false });
  }
});

// Logout (Global Sign-out)
router.post('/logout', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Invalidate all sessions for this user across all devices
    await prisma.userSession.updateMany({
      where: {
        userId: userId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully logged out from all devices.'
    });
  } catch (err: any) {
    console.error('[LOGOUT] Error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// --- OTP FLOW: Step 1: Send OTP ---
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await prisma.oTP.create({
      data: { phone, code, expiresAt }
    });

    console.log(`[OTP] Sending code ${code} to ${phone}`);
    // In production, integrate with SMS gateway (Twilio, Gupshup, etc.)
    // For now, we simulate and return in response for easier testing
    res.json({ success: true, message: 'OTP sent successfully', debug_code: code });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send OTP', detail: err.message });
  }
});

// --- OTP FLOW: Verify OTP ---
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  try {
    const otp = await prisma.oTP.findFirst({
      where: { phone, code, isUsed: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true }
    });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err: any) {
    console.error('OTP Verification error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// --- OTP FLOW: Step 2: Login via OTP ---
router.post('/login-otp', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  try {
    // 1. Verify OTP
    const otp = await prisma.oTP.findFirst({
      where: { phone, code, isUsed: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // 2. Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true }
    });

    // 3. Find user by phone in profile
    const profile = await prisma.profile.findFirst({
      where: { phone },
      include: { 
        user: {
          include: {
            role: true,
            profile: true,
            branding: true,
            businessProfile: true,
            security: true,
            industry: true
          }
        }
      }
    });

    if (!profile || !profile.user) {
      return res.status(404).json({ error: 'No account found with this phone number.' });
    }

    const user = profile.user;

    // 4. Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact customer support.'
      });
    }

    // 5. Session Logic
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';

    const deviceInfo = `${os} - ${browser}`;
    const crypto = await import('crypto');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const sessionId = crypto.randomUUID();
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionId,
        ipAddress,
        userAgent,
        deviceInfo,
        expiresAt,
        isActive: true,
      }
    });

    const authResponse = createAuthResponse({
      ...user,
      name: user.profile?.name,
      phone: user.profile?.phone,
      companyName: user.profile?.companyName,
      industryId: user.industryId,
      industry: user.industry
    } as any, sessionId);

    res.status(200).json({
      message: 'Login successful',
      ...authResponse
    });

  } catch (err: any) {
    console.error('OTP Login error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

export default router;
