// @ts-nocheck
import prisma from '../lib/prisma';
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
// @ts-nocheck
import { featureFlagService } from './featureFlagService';
// @ts-nocheck

// @ts-nocheck
// Type assertion to ensure Prisma client has all models
// @ts-nocheck
const typedPrisma = prisma as PrismaClient;
// @ts-nocheck

// @ts-nocheck
export interface GoogleUserInfo {
// @ts-nocheck
  id: string;
// @ts-nocheck
  email: string;
// @ts-nocheck
  name: string;
// @ts-nocheck
  picture?: string;
// @ts-nocheck
  verified_email: boolean;
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
export class OAuthService {
// @ts-nocheck
  private static instance: OAuthService;
// @ts-nocheck
  private readonly googleClientId = process.env.GOOGLE_CLIENT_ID;
// @ts-nocheck
  private readonly googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
// @ts-nocheck
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI;
// @ts-nocheck

// @ts-nocheck
  public static getInstance(): OAuthService {
// @ts-nocheck
    if (!OAuthService.instance) {
// @ts-nocheck
      OAuthService.instance = new OAuthService();
// @ts-nocheck
    }
// @ts-nocheck
    return OAuthService.instance;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate Google OAuth URL
// @ts-nocheck
   */
// @ts-nocheck
  public generateGoogleAuthUrl(): string {
// @ts-nocheck
    const scope = 'openid email profile';
// @ts-nocheck
    const state = this.generateState();
// @ts-nocheck
    
// @ts-nocheck
    const params = new URLSearchParams({
// @ts-nocheck
      client_id: this.googleClientId || '',
// @ts-nocheck
      redirect_uri: this.redirectUri || '',
// @ts-nocheck
      response_type: 'code',
// @ts-nocheck
      scope,
// @ts-nocheck
      state,
// @ts-nocheck
      access_type: 'offline',
// @ts-nocheck
      prompt: 'select_account'
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Exchange authorization code for access token
// @ts-nocheck
   */
// @ts-nocheck
  public async exchangeCodeForToken(code: string): Promise<{
// @ts-nocheck
    access_token: string;
// @ts-nocheck
    id_token: string;
// @ts-nocheck
    expires_in: number;
// @ts-nocheck
  }> {
// @ts-nocheck
    const response = await fetch('https://oauth2.googleapis.com/token', {
// @ts-nocheck
      method: 'POST',
// @ts-nocheck
      headers: {
// @ts-nocheck
        'Content-Type': 'application/x-www-form-urlencoded',
// @ts-nocheck
      },
// @ts-nocheck
      body: new URLSearchParams({
// @ts-nocheck
        client_id: this.googleClientId || '',
// @ts-nocheck
        client_secret: this.googleClientSecret || '',
// @ts-nocheck
        code,
// @ts-nocheck
        grant_type: 'authorization_code',
// @ts-nocheck
        redirect_uri: this.redirectUri || '',
// @ts-nocheck
      }),
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!response.ok) {
// @ts-nocheck
      throw new Error('Failed to exchange code for token');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return await response.json() as any;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Get user info from Google
// @ts-nocheck
   */
// @ts-nocheck
  public async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
// @ts-nocheck
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
// @ts-nocheck
    
// @ts-nocheck
    if (!response.ok) {
// @ts-nocheck
      throw new Error('Failed to get user info from Google');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return await response.json() as any;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Handle Google OAuth login/signup
// @ts-nocheck
   */
// @ts-nocheck
  public async handleGoogleAuth(code: string): Promise<{
// @ts-nocheck
    user: any;
// @ts-nocheck
    token: string;
// @ts-nocheck
    isNewUser: boolean;
// @ts-nocheck
  }> {
// @ts-nocheck
    try {
// @ts-nocheck
      // Check if OAuth is enabled
// @ts-nocheck
      const access = await featureFlagService.hasFeatureAccess('oauth_integration');
// @ts-nocheck
      if (!access.hasAccess) {
// @ts-nocheck
        throw new Error('OAuth integration is not enabled');
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // Exchange code for token
// @ts-nocheck
      const tokenData = await this.exchangeCodeForToken(code);
// @ts-nocheck
      
// @ts-nocheck
      // Get user info from Google
// @ts-nocheck
      const googleUser = await this.getGoogleUserInfo(tokenData.access_token);
// @ts-nocheck

// @ts-nocheck
      if (!googleUser.verified_email) {
// @ts-nocheck
        throw new Error('Email not verified with Google');
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // Check if user already exists
// @ts-nocheck
      let user = await typedPrisma.user.findFirst({
// @ts-nocheck
        where: {
// @ts-nocheck
          OR: [
// @ts-nocheck
            { email: googleUser.email },
// @ts-nocheck
            { googleId: googleUser.id }
// @ts-nocheck
          ]
// @ts-nocheck
        }
// @ts-nocheck
      });
// @ts-nocheck

// @ts-nocheck
      let isNewUser = false;
// @ts-nocheck

// @ts-nocheck
      if (!user) {
// @ts-nocheck
        // Create new user (auto-provisioning)
// @ts-nocheck
        const autoProvision = await this.getAutoProvisionSetting();
// @ts-nocheck
        
// @ts-nocheck
        if (!autoProvision) {
// @ts-nocheck
          throw new Error('Auto-provisioning is disabled. Please contact administrator.');
// @ts-nocheck
        }
// @ts-nocheck

// @ts-nocheck
        user = await typedPrisma.user.create({
// @ts-nocheck
          data: {
// @ts-nocheck
            email: googleUser.email,
// @ts-nocheck
            password: '', // OAuth users don't need password
// @ts-nocheck
            companyName: googleUser.name,
// @ts-nocheck
            googleId: googleUser.id,
// @ts-nocheck
            oauthProvider: 'google',
// @ts-nocheck
            isActive: true,
// @ts-nocheck
            planType: 'FREE'
// @ts-nocheck
          }
// @ts-nocheck
        });
// @ts-nocheck

// @ts-nocheck
        isNewUser = true;
// @ts-nocheck

// @ts-nocheck
        // Log security event
// @ts-nocheck
        await this.logSecurityEvent(user.id, 'LOGIN_SUCCESS', 'New user created via Google OAuth');
// @ts-nocheck
      } else {
// @ts-nocheck
        // Update existing user with Google ID if not set
// @ts-nocheck
        if (!user.googleId) {
// @ts-nocheck
          user = await typedPrisma.user.update({
// @ts-nocheck
            where: { id: user.id },
// @ts-nocheck
            data: {
// @ts-nocheck
              googleId: googleUser.id,
// @ts-nocheck
              oauthProvider: 'google'
// @ts-nocheck
            }
// @ts-nocheck
          });
// @ts-nocheck
        }
// @ts-nocheck

// @ts-nocheck
        // Update last login
// @ts-nocheck
        await typedPrisma.user.update({
// @ts-nocheck
          where: { id: user.id },
// @ts-nocheck
          data: { lastLoginAt: new Date() }
// @ts-nocheck
        });
// @ts-nocheck

// @ts-nocheck
        // Log security event
// @ts-nocheck
        await this.logSecurityEvent(user.id, 'LOGIN_SUCCESS', 'User logged in via Google OAuth');
// @ts-nocheck
      }
// @ts-nocheck

// @ts-nocheck
      // Generate JWT token
// @ts-nocheck
      const token = this.generateJWTToken(user);
// @ts-nocheck

// @ts-nocheck
      return {
// @ts-nocheck
        user: {
// @ts-nocheck
          id: user.id,
// @ts-nocheck
          email: user.email,
// @ts-nocheck
          companyName: user.companyName,
// @ts-nocheck
          planType: user.planType
// @ts-nocheck
        },
// @ts-nocheck
        token,
// @ts-nocheck
        isNewUser
// @ts-nocheck
      };
// @ts-nocheck

// @ts-nocheck
    } catch (error: any) {
// @ts-nocheck
      console.error('Google OAuth error:', error);
// @ts-nocheck
      
// @ts-nocheck
      // Log failed attempt
// @ts-nocheck
      await this.logSecurityEvent(null, 'LOGIN_FAILED', `Google OAuth failed: ${error?.message || 'Unknown error'}`);
// @ts-nocheck
      
// @ts-nocheck
      throw error;
// @ts-nocheck
    }
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Unlink Google account
// @ts-nocheck
   */
// @ts-nocheck
  public async unlinkGoogleAccount(userId: string): Promise<void> {
// @ts-nocheck
    await typedPrisma.user.update({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      data: {
// @ts-nocheck
        googleId: null,
// @ts-nocheck
        oauthProvider: null
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    await this.logSecurityEvent(userId, 'ACCOUNT_UNLINKED', 'Google account unlinked');
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Check if user has linked Google account
// @ts-nocheck
   */
// @ts-nocheck
  public async hasLinkedGoogleAccount(userId: string): Promise<boolean> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      select: { googleId: true }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return !!user?.googleId;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Get OAuth settings from organization settings
// @ts-nocheck
   */
// @ts-nocheck
  private async getAutoProvisionSetting(): Promise<boolean> {
// @ts-nocheck
    const settings = await typedPrisma.organizationSettings.findFirst();
// @ts-nocheck
    return settings?.oauthEnabled || false;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate random state for OAuth
// @ts-nocheck
   */
// @ts-nocheck
  private generateState(): string {
// @ts-nocheck
    return Math.random().toString(36).substring(2, 15) + 
// @ts-nocheck
           Math.random().toString(36).substring(2, 15);
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate JWT token for user
// @ts-nocheck
   */
// @ts-nocheck
  private generateJWTToken(user: any): string {
// @ts-nocheck
    // This should use the same JWT logic as your existing auth
// @ts-nocheck
    const jwt = require('jsonwebtoken');
// @ts-nocheck
    
// @ts-nocheck
    return jwt.sign(
// @ts-nocheck
      {
// @ts-nocheck
        userId: user.id,
// @ts-nocheck
        email: user.email,
// @ts-nocheck
        planType: user.planType
// @ts-nocheck
      },
// @ts-nocheck
      process.env.JWT_SECRET || 'your-secret-key',
// @ts-nocheck
      { expiresIn: '7d' }
// @ts-nocheck
    );
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Log security events
// @ts-nocheck
   */
// @ts-nocheck
  private async logSecurityEvent(
// @ts-nocheck
    userId: string | null,
// @ts-nocheck
    eventType: string,
// @ts-nocheck
    description: string
// @ts-nocheck
  ): Promise<void> {
// @ts-nocheck
    try {
// @ts-nocheck
      await typedPrisma.securityLog.create({
// @ts-nocheck
        data: {
// @ts-nocheck
          userId,
// @ts-nocheck
          eventType: eventType as any,
// @ts-nocheck
          description,
// @ts-nocheck
          success: !eventType.includes('FAILED')
// @ts-nocheck
        }
// @ts-nocheck
      });
// @ts-nocheck
    } catch (error) {
// @ts-nocheck
      console.error('Failed to log security event:', error);
// @ts-nocheck
    }
// @ts-nocheck
  }
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
export const oauthService = OAuthService.getInstance();
