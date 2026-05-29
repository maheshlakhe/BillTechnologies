/**
 * Unified Validation Utility for BillSoft SaaS
 * Includes Address, Email, State, City, and Pincode validation rules (Backend).
 */

import { z } from 'zod';

// ==========================================
// 1. REGEX DEFINITIONS (Low-level Rules)
// ==========================================

export const NAME_REGEX = /^[a-zA-Z0-9\s.,&'/\-()#]+$/;
export const PRODUCT_NAME_REGEX = /^[a-zA-Z0-9\s.,&'/\-()#:[\]]+$/;
export const PERSON_NAME_REGEX = /^[a-zA-Z\s.\-]{2,100}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const ADDRESS_REGEX = /^[\s\S]{1,500}$/;
export const STATE_CITY_REGEX = /^[a-zA-Z\s.\-0-9]+$/;
export const PINCODE_REGEX = /^[0-9]{6}$/;

// ==========================================
// 2. ZOD SCHEMAS (Backend Shared)
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

// ==========================================
// 3. HELPER FUNCTIONS (For manual validation)
// ==========================================

export const validateEmail = (email: string) => {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid email' };
  }
};

export const validateMobile = (mobile: string) => {
  try {
    mobileSchema.parse(mobile);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid mobile' };
  }
};

export const validateName = (name: string) => {
  try {
    nameSchema.parse(name);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid name' };
  }
};

export const validateProductName = (name: string) => {
  try {
    productNameSchema.parse(name);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.errors?.[0]?.message || 'Invalid name' };
  }
};
