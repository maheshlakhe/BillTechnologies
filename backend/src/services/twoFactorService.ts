// @ts-nocheck
import * as crypto from 'crypto';
// @ts-nocheck
import prisma from '../lib/prisma';
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
// @ts-nocheck

// @ts-nocheck
// Type assertion to ensure Prisma client has all models
// @ts-nocheck
const typedPrisma = prisma as PrismaClient;
// @ts-nocheck

// @ts-nocheck
export class TwoFactorService {
// @ts-nocheck
  private static instance: TwoFactorService;
// @ts-nocheck

// @ts-nocheck
  public static getInstance(): TwoFactorService {
// @ts-nocheck
    if (!TwoFactorService.instance) {
// @ts-nocheck
      TwoFactorService.instance = new TwoFactorService();
// @ts-nocheck
    }
// @ts-nocheck
    return TwoFactorService.instance;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate a base32 secret for TOTP
// @ts-nocheck
   */
// @ts-nocheck
  private generateBase32Secret(): string {
// @ts-nocheck
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
// @ts-nocheck
    let secret = '';
// @ts-nocheck
    for (let i = 0; i < 32; i++) {
// @ts-nocheck
      secret += alphabet[Math.floor(Math.random() * alphabet.length)];
// @ts-nocheck
    }
// @ts-nocheck
    return secret;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate backup codes for 2FA recovery
// @ts-nocheck
   */
// @ts-nocheck
  private generateBackupCodes(): string[] {
// @ts-nocheck
    const codes: string[] = [];
// @ts-nocheck
    for (let i = 0; i < 10; i++) {
// @ts-nocheck
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
// @ts-nocheck
      codes.push(code);
// @ts-nocheck
    }
// @ts-nocheck
    return codes;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Enable 2FA for a user
// @ts-nocheck
   */
// @ts-nocheck
  public async enable2FA(userId: string): Promise<{
// @ts-nocheck
    secret: string;
// @ts-nocheck
    qrCodeUrl: string;
// @ts-nocheck
    backupCodes: string[];
// @ts-nocheck
  }> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!user) {
// @ts-nocheck
      throw new Error('User not found');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const secret = this.generateBase32Secret();
// @ts-nocheck
    const backupCodes = this.generateBackupCodes();
// @ts-nocheck

// @ts-nocheck
    // Generate QR code URL for authenticator apps
// @ts-nocheck
    const serviceName = 'BillSoft';
// @ts-nocheck
    const accountName = user.email;
// @ts-nocheck
    const qrCodeUrl = `otpauth://totp/${serviceName}:${accountName}?secret=${secret}&issuer=${serviceName}`;
// @ts-nocheck

// @ts-nocheck
    // Store the secret and backup codes (hashed) in database
// @ts-nocheck
    const hashedBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
// @ts-nocheck

// @ts-nocheck
    await typedPrisma.user.update({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      data: {
// @ts-nocheck
        twoFactorSecret: secret,
// @ts-nocheck
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
// @ts-nocheck
        twoFactorEnabled: false // Will be enabled after verification
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return {
// @ts-nocheck
      secret,
// @ts-nocheck
      qrCodeUrl,
// @ts-nocheck
      backupCodes
// @ts-nocheck
    };
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Verify 2FA setup with TOTP token
// @ts-nocheck
   */
// @ts-nocheck
  public async verify2FASetup(userId: string, token: string): Promise<boolean> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!user || !user.twoFactorSecret) {
// @ts-nocheck
      return false;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const isValid = this.verifyTOTP(user.twoFactorSecret, token);
// @ts-nocheck

// @ts-nocheck
    if (isValid) {
// @ts-nocheck
      // Enable 2FA
// @ts-nocheck
      await typedPrisma.user.update({
// @ts-nocheck
        where: { id: userId },
// @ts-nocheck
        data: { twoFactorEnabled: true }
// @ts-nocheck
      });
// @ts-nocheck

// @ts-nocheck
      // Log security event
// @ts-nocheck
      await this.logSecurityEvent(userId, 'TWO_FACTOR_ENABLED', 'User enabled 2FA');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return isValid;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Verify TOTP token during login
// @ts-nocheck
   */
// @ts-nocheck
  public async verifyLoginToken(userId: string, token: string): Promise<boolean> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
// @ts-nocheck
      return false;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    // Try TOTP verification first
// @ts-nocheck
    const isValidTOTP = this.verifyTOTP(user.twoFactorSecret, token);
// @ts-nocheck
    
// @ts-nocheck
    if (isValidTOTP) {
// @ts-nocheck
      await this.logSecurityEvent(userId, 'TWO_FACTOR_SUCCESS', 'Successful 2FA login');
// @ts-nocheck
      return true;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    // Try backup code verification
// @ts-nocheck
    const isValidBackupCode = await this.verifyBackupCode(userId, token);
// @ts-nocheck
    
// @ts-nocheck
    if (isValidBackupCode) {
// @ts-nocheck
      await this.logSecurityEvent(userId, 'TWO_FACTOR_SUCCESS', 'Successful 2FA login with backup code');
// @ts-nocheck
      return true;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    await this.logSecurityEvent(userId, 'TWO_FACTOR_FAILED', 'Failed 2FA login attempt');
// @ts-nocheck
    return false;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Disable 2FA for a user
// @ts-nocheck
   */
// @ts-nocheck
  public async disable2FA(userId: string): Promise<void> {
// @ts-nocheck
    await typedPrisma.user.update({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      data: {
// @ts-nocheck
        twoFactorEnabled: false,
// @ts-nocheck
        twoFactorSecret: null,
// @ts-nocheck
        twoFactorBackupCodes: null
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    await this.logSecurityEvent(userId, 'TWO_FACTOR_DISABLED', 'User disabled 2FA');
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate new backup codes
// @ts-nocheck
   */
// @ts-nocheck
  public async generateNewBackupCodes(userId: string): Promise<string[]> {
// @ts-nocheck
    const backupCodes = this.generateBackupCodes();
// @ts-nocheck
    const hashedBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
// @ts-nocheck

// @ts-nocheck
    await typedPrisma.user.update({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      data: {
// @ts-nocheck
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes)
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return backupCodes;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Verify TOTP token using time-based algorithm
// @ts-nocheck
   */
// @ts-nocheck
  private verifyTOTP(secret: string, token: string, window: number = 1): boolean {
// @ts-nocheck
    const timeStep = 30; // 30 seconds
// @ts-nocheck
    const currentTime = Math.floor(Date.now() / 1000);
// @ts-nocheck
    const currentStep = Math.floor(currentTime / timeStep);
// @ts-nocheck

// @ts-nocheck
    // Check current time step and previous/next steps for clock drift
// @ts-nocheck
    for (let i = -window; i <= window; i++) {
// @ts-nocheck
      const stepTime = currentStep + i;
// @ts-nocheck
      const expectedToken = this.generateTOTP(secret, stepTime);
// @ts-nocheck
      if (expectedToken === token) {
// @ts-nocheck
        return true;
// @ts-nocheck
      }
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return false;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Generate TOTP token for given time step
// @ts-nocheck
   */
// @ts-nocheck
  private generateTOTP(secret: string, timeStep: number): string {
// @ts-nocheck
    const secretBuffer = this.base32Decode(secret);
// @ts-nocheck
    const timeBuffer = Buffer.alloc(8);
// @ts-nocheck
    timeBuffer.writeBigUInt64BE(BigInt(timeStep), 0);
// @ts-nocheck

// @ts-nocheck
    const hmac = crypto.createHmac('sha1', secretBuffer);
// @ts-nocheck
    hmac.update(timeBuffer);
// @ts-nocheck
    const hash = hmac.digest();
// @ts-nocheck

// @ts-nocheck
    const offset = hash[hash.length - 1] & 0x0f;
// @ts-nocheck
    const truncated = hash.readUInt32BE(offset) & 0x7fffffff;
// @ts-nocheck
    const token = (truncated % 1000000).toString().padStart(6, '0');
// @ts-nocheck

// @ts-nocheck
    return token;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Decode base32 string to buffer
// @ts-nocheck
   */
// @ts-nocheck
  private base32Decode(encoded: string): Buffer {
// @ts-nocheck
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
// @ts-nocheck
    let bits = '';
// @ts-nocheck
    
// @ts-nocheck
    for (const char of encoded.toUpperCase()) {
// @ts-nocheck
      const index = alphabet.indexOf(char);
// @ts-nocheck
      if (index === -1) continue;
// @ts-nocheck
      bits += index.toString(2).padStart(5, '0');
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const bytes: number[] = [];
// @ts-nocheck
    for (let i = 0; i < bits.length; i += 8) {
// @ts-nocheck
      const byte = bits.substr(i, 8);
// @ts-nocheck
      if (byte.length === 8) {
// @ts-nocheck
        bytes.push(parseInt(byte, 2));
// @ts-nocheck
      }
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return Buffer.from(bytes);
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Hash backup code for secure storage
// @ts-nocheck
   */
// @ts-nocheck
  private hashBackupCode(code: string): string {
// @ts-nocheck
    return crypto.createHash('sha256').update(code).digest('hex');
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Verify and consume backup code
// @ts-nocheck
   */
// @ts-nocheck
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    if (!user || !user.twoFactorBackupCodes) {
// @ts-nocheck
      return false;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    const hashedCode = this.hashBackupCode(code);
// @ts-nocheck
    const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes);
// @ts-nocheck

// @ts-nocheck
    const codeIndex = backupCodes.indexOf(hashedCode);
// @ts-nocheck
    if (codeIndex === -1) {
// @ts-nocheck
      return false;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    // Remove used backup code
// @ts-nocheck
    backupCodes.splice(codeIndex, 1);
// @ts-nocheck
    await typedPrisma.user.update({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      data: {
// @ts-nocheck
        twoFactorBackupCodes: JSON.stringify(backupCodes)
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return true;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Check if user has 2FA enabled
// @ts-nocheck
   */
// @ts-nocheck
  public async is2FAEnabled(userId: string): Promise<boolean> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      select: { twoFactorEnabled: true }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    return user?.twoFactorEnabled || false;
// @ts-nocheck
  }
// @ts-nocheck

// @ts-nocheck
  /**
// @ts-nocheck
   * Get 2FA status for user
// @ts-nocheck
   */
// @ts-nocheck
  public async get2FAStatus(userId: string): Promise<{
// @ts-nocheck
    enabled: boolean;
// @ts-nocheck
    backupCodesRemaining: number;
// @ts-nocheck
  }> {
// @ts-nocheck
    const user = await typedPrisma.user.findUnique({
// @ts-nocheck
      where: { id: userId },
// @ts-nocheck
      select: { 
// @ts-nocheck
        twoFactorEnabled: true,
// @ts-nocheck
        twoFactorBackupCodes: true
// @ts-nocheck
      }
// @ts-nocheck
    });
// @ts-nocheck

// @ts-nocheck
    let backupCodesRemaining = 0;
// @ts-nocheck
    if (user?.twoFactorBackupCodes) {
// @ts-nocheck
      const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes);
// @ts-nocheck
      backupCodesRemaining = backupCodes.length;
// @ts-nocheck
    }
// @ts-nocheck

// @ts-nocheck
    return {
// @ts-nocheck
      enabled: user?.twoFactorEnabled || false,
// @ts-nocheck
      backupCodesRemaining
// @ts-nocheck
    };
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
    userId: string, 
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
export const twoFactorService = TwoFactorService.getInstance();
