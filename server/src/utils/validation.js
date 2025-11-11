/**
 * Validation Utilities
 * 
 * Common server-side validation functions for email, passwords, user input,
 * and database identifiers. All functions include comprehensive documentation
 * and return values suitable for form validation and API error responses.
 */

/**
 * Validates if a string is a valid email address format
 * 
 * Uses a basic regex pattern to check for common email format:
 * non-whitespace@non-whitespace.non-whitespace
 * 
 * Note: This is a simple format check. For production, consider using
 * a more comprehensive email validation library like 'email-validator'.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email matches basic format, false otherwise
 * 
 * @example
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password meets minimum security requirements
 * 
 * Password must contain:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 * @returns {boolean} result.isValid - Whether password passes all checks
 * @returns {Array<string>} result.errors - Array of specific validation failures
 * 
 * @example
 * const result = validatePassword('weak');
 * // { isValid: false, errors: ['Password must be at least 8 characters long', ...] }
 * 
 * @example
 * const result = validatePassword('SecurePass123');
 * // { isValid: true, errors: [] }
 */
function validatePassword(password) {
  const errors = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for digit
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes user input by trimming and removing potentially dangerous characters
 * 
 * Removes:
 * - Leading/trailing whitespace
 * - Angle brackets (< and >) which could be used for HTML injection
 * 
 * Note: This is a basic sanitization. For production HTML contexts, consider
 * using a dedicated HTML sanitization library like 'sanitize-html' or 'DOMPurify'.
 * 
 * @param {string} input - Raw user input to sanitize
 * @returns {string} Sanitized input string
 * 
 * @example
 * sanitizeInput('  hello world  '); // 'hello world'
 * sanitizeInput('hello <script>'); // 'hello script'
 */
function sanitizeInput(input) {
  // Return empty string if input is not a string
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace and remove angle brackets
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * 
 * MongoDB ObjectIds are 24-character hexadecimal strings.
 * This function checks if the input matches that format.
 * 
 * @param {string} id - ID string to validate
 * @returns {boolean} True if valid MongoDB ObjectId format, false otherwise
 * 
 * @example
 * isValidObjectId('507f1f77bcf86cd799439011'); // true
 * isValidObjectId('invalid-id'); // false
 * isValidObjectId('507f1f77bcf86cd79943901'); // false (too short)
 */
function isValidObjectId(id) {
  // Match 24-character hexadecimal string (case-insensitive)
  return /^[a-f\d]{24}$/i.test(id);
}

module.exports = {
  isValidEmail,
  validatePassword,
  sanitizeInput,
  isValidObjectId,
};
