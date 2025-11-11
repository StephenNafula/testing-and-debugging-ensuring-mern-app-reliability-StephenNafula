// server/src/utils/validation.test.js
// Unit tests for server validation utilities

const {
  isValidEmail,
  validatePassword,
  sanitizeInput,
  isValidObjectId,
} = require('./validation');

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('a@b.c')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@exam ple.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1A');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords missing uppercase letters', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords missing lowercase letters', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords missing digits', () => {
      const result = validatePassword('NoDigitsHere');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should handle undefined or null passwords', () => {
      expect(validatePassword(undefined).isValid).toBe(false);
      expect(validatePassword(null).isValid).toBe(false);
    });

    it('should return multiple errors for severely weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\ntest\t')).toBe('test');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeInput('hello<script>')).toBe('helloscript');
      expect(sanitizeInput('test>alert')).toBe('testalert');
      expect(sanitizeInput('<b>bold</b>')).toBe('bbold/b');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should preserve safe content', () => {
      expect(sanitizeInput('Hello World 123!@#$%')).toBe('Hello World 123!@#$%');
    });
  });

  describe('isValidObjectId', () => {
    it('should validate correct MongoDB ObjectId format', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('507F1F77BCF86CD799439011')).toBe(true);
    });

    it('should reject invalid ObjectId formats', () => {
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false); // too short
      expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // too long
      expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // invalid character
      expect(isValidObjectId('')).toBe(false);
    });

    it('should handle non-string inputs gracefully', () => {
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
      expect(isValidObjectId(123)).toBe(false);
    });
  });
});
