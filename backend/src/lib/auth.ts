import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string
  email: string
  name?: string
  isEmployee?: boolean
  sessionId?: string
  orgId?: string
  role?: string
  permissions?: string[]
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch (error) {
    return null
  }
}

export const extractUserFromRequest = (authHeader: string | undefined): JWTPayload | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export const createAuthResponse = (user: any, sessionId?: string) => {
  // Flatten nested objects for frontend compatibility
  const flattenedUser = {
    ...user,
    name: user.profile?.name || user.name,
    phone: user.profile?.phone || user.phone,
    companyName: user.profile?.companyName || user.companyName,
    avatarUrl: user.profile?.avatarUrl || user.avatarUrl,
    address: user.profile?.address || user.address,
    city: user.profile?.city || user.city,
    state: user.profile?.state || user.state,
    pincode: user.profile?.pincode || user.pincode,
    
    logoUrl: user.branding?.logoUrl || user.logoUrl,
    logoPosition: user.branding?.logoPosition || user.logoPosition,
    logoWidth: user.branding?.logoWidth || user.logoWidth,
    logoOffsetX: user.branding?.logoOffsetX || user.logoOffsetX,
    logoOffsetY: user.branding?.logoOffsetY || user.logoOffsetY,
    
    gstNumber: user.billingInfo?.gstNumber || user.gstNumber,
    panNumber: user.billingInfo?.panNumber || user.panNumber,
    stateCode: user.billingInfo?.stateCode || user.stateCode,
    
    twoFactorEnabled: user.security?.twoFactorEnabled || user.twoFactorEnabled,
    passwordSet: user.security?.passwordSet || user.passwordSet,

    // Template preferences with fallback to branding / defaults
    activeTemplateId: user.businessProfile?.activeTemplateId || user.branding?.activeTemplateId || 'thermal_58mm',
    defaultBillSize: user.businessProfile?.defaultBillSize || user.branding?.defaultBillSize || '58mm',
    billIndustry: user.businessProfile?.billIndustry || user.branding?.billIndustry || '',
    billType: user.businessProfile?.billType || user.branding?.billType || '',
  };

  const token = generateToken({ 
    userId: flattenedUser.id, 
    email: flattenedUser.email, 
    name: flattenedUser.name || '', 
    isEmployee: !!flattenedUser.isEmployee, 
    sessionId 
  })

  let parsedPermissions = [];
  if (flattenedUser.permissions) {
    try {
      parsedPermissions = typeof flattenedUser.permissions === 'string' 
        ? JSON.parse(flattenedUser.permissions) 
        : flattenedUser.permissions;
    } catch (e) {
      console.error('Failed to parse user permissions', e);
    }
  }

  const resolvedRole = flattenedUser.role?.name
    ? flattenedUser.role.name.toUpperCase()
    : (flattenedUser.parentId ? 'VIEWER' : 'ADMIN');

  console.log(`[createAuthResponse] userId=${flattenedUser.id} role=${resolvedRole}`);

  return {
    user: {
      id: flattenedUser.id,
      email: flattenedUser.email,
      name: flattenedUser.name,
      companyName: flattenedUser.companyName,
      role: resolvedRole,
      permissions: parsedPermissions,
      parentId: flattenedUser.parentId,
      logoUrl: flattenedUser.logoUrl,
      logoPosition: flattenedUser.logoPosition,
      logoWidth: flattenedUser.logoWidth,
      logoOffsetX: flattenedUser.logoOffsetX,
      logoOffsetY: flattenedUser.logoOffsetY,
      address: flattenedUser.address,
      city: flattenedUser.city,
      state: flattenedUser.state,
      pincode: flattenedUser.pincode,
      gstNumber: flattenedUser.gstNumber,
      panNumber: flattenedUser.panNumber,
      createdAt: flattenedUser.createdAt,
      lastLoginAt: flattenedUser.lastLoginAt,
      industryId: user.industryId,
      industry: user.industry,
      activeTemplateId: flattenedUser.activeTemplateId,
      defaultBillSize: flattenedUser.defaultBillSize,
      billIndustry: flattenedUser.billIndustry,
      billType: flattenedUser.billType
    },
    token
  }
}

export const validatePasswordStrength = async (password: string, prisma: any): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const strengthSetting = await prisma.settings.findFirst({
      where: { key: 'password_strength', category: 'security' }
    });
    const strength = strengthSetting ? JSON.parse(strengthSetting.value) : 'strong';

    if (strength === 'strong') {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        return { 
          isValid: false, 
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character' 
        };
      }
    } else {
      if (password.length < 3) {
        return { isValid: false, error: 'Password must be at least 3 characters' };
      }
    }
    return { isValid: true };
  } catch (err) {
    return { isValid: true }; // Fallback to allow progress if settings table is inaccessible
  }
}
