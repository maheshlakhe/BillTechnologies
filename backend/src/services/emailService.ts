// @ts-nocheck
/**
// @ts-nocheck
 * Email Service Entry Point
// @ts-nocheck
 * This file serves as a bridge to the new modular email service in the /emailService directory.
// @ts-nocheck
 */
// @ts-nocheck

// @ts-nocheck
import * as emailNew from './emailService/index';
// @ts-nocheck
import prisma from '../lib/prisma';
// @ts-nocheck
import { getBaseUrl, getFrontendUrl } from '../lib/baseUrl';
// @ts-nocheck

// @ts-nocheck
// Re-export new functions
// @ts-nocheck
export * from './emailService/index';
// @ts-nocheck

// @ts-nocheck
/**
// @ts-nocheck
 * COMPATIBILITY WRAPPER: generateInvoicePdfBuffer
// @ts-nocheck
 * Maps the old function signature to the new modular pdfService
// @ts-nocheck
 */
// @ts-nocheck
export async function generateInvoicePdfBuffer(bill: any): Promise<Buffer> {
// @ts-nocheck
  // Fetch user/company info for the PDF
// @ts-nocheck
  const user = await prisma.user.findUnique({
// @ts-nocheck
    where: { id: bill.userId }
// @ts-nocheck
  });
// @ts-nocheck

// @ts-nocheck
  const invoiceData: emailNew.InvoiceData = {
// @ts-nocheck
    billNumber: bill.billNumber || bill.id.slice(0, 8),
// @ts-nocheck
    customerName: bill.customerName,
// @ts-nocheck
    customerEmail: bill.customerEmail || bill.customer?.email,
// @ts-nocheck
    customerPhone: bill.customer?.phone,
// @ts-nocheck
    items: bill.items.map((item: any) => ({
// @ts-nocheck
      productName: item.productName,
// @ts-nocheck
      quantity: item.quantity,
// @ts-nocheck
      price: item.price,
// @ts-nocheck
      total: item.total,
// @ts-nocheck
      custom_fields: item.custom_fields || null
// @ts-nocheck
    })),
// @ts-nocheck
    subtotal: bill.subtotal,
// @ts-nocheck
    taxAmount: bill.taxAmount,
// @ts-nocheck
    totalAmount: bill.totalAmount,
// @ts-nocheck
    notes: bill.notes,
// @ts-nocheck
    createdAt: bill.createdAt,
// @ts-nocheck
    companyName: user?.companyName || 'My Business',
// @ts-nocheck
    companyAddress: user?.address || '',
// @ts-nocheck
    companyPhone: user?.phone || '',
// @ts-nocheck
    companyEmail: user?.email || '',
// @ts-nocheck
    companyGst: user?.gstNumber || '',
// @ts-nocheck
    companyPan: user?.panNumber || '',
// @ts-nocheck
    logoUrl: user?.logoUrl || null,
// @ts-nocheck
    logoPosition: user?.logoPosition || 'left',
// @ts-nocheck
    logoWidth: user?.logoWidth ?? 100,
// @ts-nocheck
    logoOffsetY: user?.logoOffsetY ?? 0,
// @ts-nocheck
    columnsSnapshot: bill.columnsSnapshot || null,
// @ts-nocheck
  };
// @ts-nocheck

// @ts-nocheck
  return emailNew.generateInvoicePdf(invoiceData);
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
/**
// @ts-nocheck
 * COMPATIBILITY WRAPPER: sendEmailInvoiceWithPdf
// @ts-nocheck
 * Maps the old function signature to the new modular mailService
// @ts-nocheck
 */
// @ts-nocheck
export async function sendEmailInvoiceWithPdf(bill: any, pdfBuffer: Buffer, toEmail: string) {
// @ts-nocheck
  const appUrl = getBaseUrl();
// @ts-nocheck

// @ts-nocheck
  await emailNew.sendInvoiceEmail(
// @ts-nocheck
    toEmail,
// @ts-nocheck
    bill.customerName,
// @ts-nocheck
    bill.billNumber || bill.id.slice(0, 8),
// @ts-nocheck
    bill.totalAmount,
// @ts-nocheck
    bill.id,
// @ts-nocheck
    appUrl,
// @ts-nocheck
    pdfBuffer
// @ts-nocheck
  );
// @ts-nocheck

// @ts-nocheck
  return { success: true };
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
// Function to send Forgot Password Email
// @ts-nocheck
export async function sendForgotPasswordEmail(toEmail: string, token: string, frontendUrlOverride?: string) {
// @ts-nocheck
  const frontendUrl = frontendUrlOverride || getFrontendUrl();
// @ts-nocheck
  const resetLink = `${frontendUrl}/reset-password/${token}`;
// @ts-nocheck
  
// @ts-nocheck
  const html = `
// @ts-nocheck
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
// @ts-nocheck
        <div style="background-color: #0044CC; padding: 30px; text-align: center; color: white;">
// @ts-nocheck
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">PASSWORD RESET</h1>
// @ts-nocheck
        </div>
// @ts-nocheck
        <div style="padding: 40px; background-color: white;">
// @ts-nocheck
            <p style="color: #666; line-height: 1.6;">You've requested to reset your password for your <strong>BillSoft</strong> account. Click the button below to set a new password:</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin: 30px 0;">
// @ts-nocheck
                <a href="${resetLink}" style="background-color: #0044CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
// @ts-nocheck
            </div>
// @ts-nocheck

// @ts-nocheck
            <p style="color: #666; line-height: 1.6; font-size: 0.9em;">If you did not request a password reset, you can safely ignore this email.</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin-top: 40px;">
// @ts-nocheck
                <p style="color: #333; font-weight: bold; margin-bottom: 0;">BillSoft Team</p>
// @ts-nocheck
            </div>
// @ts-nocheck
        </div>
// @ts-nocheck
    </div>
// @ts-nocheck
  `;
// @ts-nocheck

// @ts-nocheck
  return emailNew.sendMail({
// @ts-nocheck
    to: toEmail,
// @ts-nocheck
    subject: 'Password Reset Request - BillSoft',
// @ts-nocheck
    html
// @ts-nocheck
  });
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
// Function to send Signup Verification Email
// @ts-nocheck
export async function sendSignupVerificationEmail(toEmail: string, token: string, _frontendUrlOverride?: string, backendUrlOverride?: string) {
// @ts-nocheck
  console.log(`[EmailBridge] 📧 Preparing verification email for: ${toEmail}`);
// @ts-nocheck
  // Use the backend URL passed from the register route (derived from req)
// @ts-nocheck
  // This ensures the link always uses the correct, reachable IP/host
// @ts-nocheck
  const backendUrl = backendUrlOverride || getBaseUrl();
// @ts-nocheck
  const verifyLink = `${backendUrl}/api/auth/verify-email-redirect?token=${token}`;
// @ts-nocheck
  
// @ts-nocheck
  const html = `
// @ts-nocheck
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
// @ts-nocheck
        <div style="background-color: #0044CC; padding: 30px; text-align: center; color: white;">
// @ts-nocheck
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">WELCOME TO BillSoft</h1>
// @ts-nocheck
        </div>
// @ts-nocheck
        <div style="padding: 40px; background-color: white;">
// @ts-nocheck
            <p style="color: #666; line-height: 1.6;">Thank you for choosing <strong>BillSoft</strong>. To complete your signup and start using our platform, please verify your email address by clicking the button below:</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin: 30px 0;">
// @ts-nocheck
                <a href="${verifyLink}" style="background-color: #0044CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
// @ts-nocheck
            </div>
// @ts-nocheck

// @ts-nocheck
            <p style="color: #666; line-height: 1.6; font-size: 0.9em;">This link will expire in 1 hour and is valid for a single use.</p>
// @ts-nocheck
            <p style="color: #666; line-height: 1.6; font-size: 0.9em;">If you did not sign up for BillSoft, you can safely ignore this email.</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin-top: 40px;">
// @ts-nocheck
                <p style="color: #333; font-weight: bold; margin-bottom: 0;">BillSoft Team</p>
// @ts-nocheck
            </div>
// @ts-nocheck
        </div>
// @ts-nocheck
    </div>
// @ts-nocheck
  `;
// @ts-nocheck

// @ts-nocheck
  return emailNew.sendMail({
// @ts-nocheck
    to: toEmail,
// @ts-nocheck
    subject: 'Verify Your Email - BillSoft',
// @ts-nocheck
    html
// @ts-nocheck
  });
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
// Function to send Password Reset by Admin Email
// @ts-nocheck
export async function sendPasswordResetByAdminEmail(toEmail: string, newPassword: string) {
// @ts-nocheck
  const html = `
// @ts-nocheck
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
// @ts-nocheck
        <div style="background-color: #0044CC; padding: 30px; text-align: center; color: white;">
// @ts-nocheck
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">PASSWORD UPDATED</h1>
// @ts-nocheck
        </div>
// @ts-nocheck
        <div style="padding: 40px; background-color: white;">
// @ts-nocheck
            <p style="color: #666; line-height: 1.6;">Your <strong>BillSoft</strong> account password has been reset by the system administrator. You can now login using the credentials below:</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px dashed #cbd5e1; text-align: center;">
// @ts-nocheck
                <p style="margin: 0; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Your New Password</p>
// @ts-nocheck
                <p style="margin: 10px 0 0 0; color: #0044CC; font-size: 20px; font-family: monospace; font-weight: bold; letter-spacing: 2px;">${newPassword}</p>
// @ts-nocheck
            </div>
// @ts-nocheck

// @ts-nocheck
            <p style="color: #ef4444; font-size: 0.85em; font-weight: 600; line-height: 1.6;">IMPORTANT: For security reasons, please login and change this password immediately from your profile settings.</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin-top: 40px;">
// @ts-nocheck
                <p style="color: #333; font-weight: bold; margin-bottom: 0;">BillSoft Team</p>
// @ts-nocheck
            </div>
// @ts-nocheck
        </div>
// @ts-nocheck
    </div>
// @ts-nocheck
  `;
// @ts-nocheck

// @ts-nocheck
  return emailNew.sendMail({
// @ts-nocheck
    to: toEmail,
// @ts-nocheck
    subject: 'Your Password Has Been Reset - BillSoft',
// @ts-nocheck
    html
// @ts-nocheck
  });
// @ts-nocheck
}
// @ts-nocheck

// @ts-nocheck
// Function to send Account Verified Email
// @ts-nocheck
export async function sendAccountVerifiedEmail(toEmail: string, name: string) {
// @ts-nocheck
  const loginUrl = `${getFrontendUrl()}/login`;
// @ts-nocheck
  const html = `
// @ts-nocheck
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
// @ts-nocheck
        <div style="background-color: #16a34a; padding: 30px; text-align: center; color: white;">
// @ts-nocheck
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">ACCOUNT VERIFIED</h1>
// @ts-nocheck
        </div>
// @ts-nocheck
        <div style="padding: 40px; background-color: white;">
// @ts-nocheck
            <p style="color: #333; font-size: 18px;">Hello ${name},</p>
// @ts-nocheck
            <p style="color: #666; line-height: 1.6;">Great news! Your <strong>BillSoft</strong> account has been verified and approved by our administrator. You can now access all features of the platform.</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin: 30px 0;">
// @ts-nocheck
                <a href="${loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
// @ts-nocheck
            </div>
// @ts-nocheck

// @ts-nocheck
            <p style="color: #666; line-height: 1.6;">If you have any questions, feel free to contact our support team.</p>
// @ts-nocheck
            
// @ts-nocheck
            <div style="text-align: center; margin-top: 40px;">
// @ts-nocheck
                <p style="color: #333; font-weight: bold; margin-bottom: 0;">BillSoft Team</p>
// @ts-nocheck
            </div>
// @ts-nocheck
        </div>
// @ts-nocheck
    </div>
// @ts-nocheck
  `;
// @ts-nocheck

// @ts-nocheck
  return emailNew.sendMail({
// @ts-nocheck
    to: toEmail,
// @ts-nocheck
    subject: 'Account Verified - Welcome to BillSoft',
// @ts-nocheck
    html
// @ts-nocheck
  });
// @ts-nocheck
}
// @ts-nocheck
// EmailService class for DI Container compatibility
// @ts-nocheck
export class EmailService {
// @ts-nocheck
  async sendMail(options: emailNew.MailOptions) {
// @ts-nocheck
    return emailNew.sendMail(options);
// @ts-nocheck
  }
// @ts-nocheck
  async sendInvoiceEmail(to: string, name: string, number: string, amount: number, id: string, url: string, pdf?: Buffer) {
// @ts-nocheck
    return emailNew.sendInvoiceEmail(to, name, number, amount, id, url, pdf);
// @ts-nocheck
  }
// @ts-nocheck
}
