/**
 * Unified Validation Utility for BillSoft SaaS
 * Includes Address, Email, State, City, and Pincode validation rules (Frontend).
 */

import { z } from 'zod';

// ==========================================
// 1. REGEX DEFINITIONS (Low-level Rules)
// ==========================================

/**
 * NAME: Used for Customers and Suppliers. 
 * Allows letters, spaces, and common symbols (&, ., -, /, etc). NO DIGITS.
 */
export const NAME_REGEX = /^[a-zA-Z0-9\s.,&'/\-()#]+$/;

/**
 * PRODUCT NAME: Permissive regex allowing alphanumeric characters, spaces, and special symbols.
 * Used to avoid "Invalid name" errors for products containing numbers like '7Up', 'iPhone 15'.
 */
export const PRODUCT_NAME_REGEX = /^[a-zA-Z0-9\s.,&'/\-()#:[\]]+$/;

// eslint-disable-next-line no-useless-escape
export const PERSON_NAME_REGEX = /^[a-zA-Z\s.\-]{2,100}$/;

/**
 * MOBILE: Numeric only. Must be exactly 10 digits and start with 6, 7, 8, or 9 (Indian Standard).
 */
export const MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * STREET ADDRESS: Alphanumeric with common separators
 */
// eslint-disable-next-line no-useless-escape
export const ADDRESS_REGEX = /^[\s\S]{1,500}$/;

/**
 * STATE/CITY: Letters, spaces, dots, and hyphens only
 */
export const STATE_CITY_REGEX = /^[a-zA-Z\s.\-0-9]+$/;

/**
 * PINCODE: Exactly 6 digits
 */
export const PINCODE_REGEX = /^[0-9]{6}$/;

/**
 * GSTIN: Exactly 15 alphanumeric characters.
 * Format: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit, 1 letter (Z), 1 digit/letter.
 */
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * PAN: 10 alphanumeric. 5 letters, 4 digits, 1 letter
 */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// ==========================================
// 2. ZOD SCHEMAS (Frontend Shared)
// ==========================================

export const nameSchema = z.string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(200, 'Name must be 200 characters or less')
  .regex(NAME_REGEX, 'Name contains invalid characters.');

export const productNameSchema = z.string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(200, 'Name must be 200 characters or less')
  .regex(PRODUCT_NAME_REGEX, 'Invalid name. Only alphanumeric characters, spaces, and common symbols are allowed.');

export const personalNameSchema = z.string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be 100 characters or less');

export const mobileSchema = z.string()
  .trim()
  .regex(MOBILE_REGEX, 'Mobile must be 10 digits and start with 6, 7, 8, or 9');

export const emailSchema = z.string()
  .trim()
  .email('Invalid email format')
  .toLowerCase();

export const addressSchema = z.string()
  .trim()
  .min(1, 'Address is required')
  .max(500, 'Address is too long (max 500 characters)');

export const citySchema = z.string()
  .trim()
  .min(2, 'City must be at least 2 characters')
  .max(100, 'City must be 100 characters or less');

export const stateSchema = z.string()
  .trim()
  .min(2, 'State must be at least 2 characters')
  .max(100, 'State must be 100 characters or less');

export const pincodeSchema = z.string()
  .trim()
  .regex(PINCODE_REGEX, 'Pincode must be exactly 6 digits');

export const gstSchema = z.string()
  .trim()
  .toUpperCase()
  .regex(GST_REGEX, 'Invalid GST format (Example: 22AAAAA0000A1Z5)');

export const panSchema = z.string()
  .trim()
  .toUpperCase()
  .regex(PAN_REGEX, 'Invalid PAN format (Example: ABCDE1234F)');

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

export const validateEmail = (email: string) => {
  if (!email) return { isValid: false, error: 'Email is required' };
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid email' };
  }
};

export const validateMobile = (mobile: string) => {
  if (!mobile) return { isValid: false, error: 'Mobile is required' };
  try {
    mobileSchema.parse(mobile);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid mobile' };
  }
};

export const validateName = (name: string) => {
  if (!name) return { isValid: false, error: 'Name is required' };
  try {
    nameSchema.parse(name);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid name' };
  }
};

export const validateProductName = (name: string) => {
  if (!name) return { isValid: false, error: 'Product name is required' };
  try {
    productNameSchema.parse(name);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid name' };
  }
};

export const validatePersonalName = (name: string) => {
  if (!name) return { isValid: false, error: 'Name is required' };
  try {
    personalNameSchema.parse(name);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid name' };
  }
};

export const validateGST = (gst: string) => {
  if (!gst) return { isValid: true }; // GST is usually optional
  try {
    gstSchema.parse(gst);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid GST number' };
  }
};

export const validatePAN = (pan: string) => {
  if (!pan) return { isValid: true };
  try {
    panSchema.parse(pan);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid PAN number' };
  }
};
