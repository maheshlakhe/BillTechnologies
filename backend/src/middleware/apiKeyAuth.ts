import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let apiKey = '';
    const authHeader = req.headers.authorization;
    const xApiKey = req.headers['x-api-key'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else if (xApiKey) {
      apiKey = xApiKey as string;
    } else if (req.query.api_key) {
      apiKey = req.query.api_key as string;
    }

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API Key required. Provide it in the Authorization header as Bearer token, or X-API-Key header.'
      });
    }

    // Lookup ApiKey
    const apiKeyDoc = await (prisma as any).apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          include: {
            role: true,
            profile: true
          }
        }
      }
    });

    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or revoked API Key'
      });
    }

    // Check expiration
    if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'API Key has expired'
      });
    }

    const userFromDb = apiKeyDoc.user;

    if (!userFromDb || !userFromDb.isActive) {
      return res.status(401).json({
        success: false,
        error: 'The user account associated with this API key is deactivated'
      });
    }

    let parsedPermissions: string[] = [];
    try {
      const security = await prisma.userSecurity.findUnique({
        where: { userId: userFromDb.id }
      });
      if (security && security.permissions) {
        parsedPermissions = JSON.parse(security.permissions);
      }
    } catch (e) { /* ignore parse error */ }

    // Resolve organization ID (orgId)
    const orgId = userFromDb.parentId || userFromDb.id;

    const resolvedRole = userFromDb.role?.name
      ? userFromDb.role.name.toUpperCase()
      : (userFromDb.parentId ? 'VIEWER' : 'ADMIN');

    // Populate req.user
    req.user = {
      id: userFromDb.id,
      name: userFromDb.profile?.name || userFromDb.email.split('@')[0],
      email: userFromDb.email,
      parentId: userFromDb.parentId,
      orgId: orgId,
      role: { name: resolvedRole },
      permissions: parsedPermissions,
      isEmployee: !!userFromDb.isEmployee
    };

    // Store scope and key information for rate limiting/logging
    (req as any).apiKeyScope = apiKeyDoc.scope || 'READ_WRITE';
    (req as any).apiKeyName = apiKeyDoc.name;

    next();
  } catch (error) {
    console.error('API Key Authentication Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during API key verification'
    });
  }
};

/**
 * Middleware to restrict API Key actions based on its scope (e.g. READ_ONLY)
 */
export const requireApiScope = (requiredScope: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const activeScope = (req as any).apiKeyScope || 'READ_WRITE';

    if (requiredScope === 'ADMIN' && activeScope !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin scope required for this operation'
      });
    }

    if (requiredScope === 'READ_WRITE' && activeScope === 'READ_ONLY') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Read-Write scope required for this operation'
      });
    }

    next();
  };
};
