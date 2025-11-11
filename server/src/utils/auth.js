/**
 * Authentication Utilities
 * 
 * Provides JWT-like token generation and verification for user authentication.
 * Currently implements a simplified JWT format for testing purposes.
 * 
 * Note: For production applications, use a proper JWT library like 'jsonwebtoken'
 * with a secure secret management system (e.g., environment variables, secrets manager).
 */

const crypto = require('crypto');

/**
 * Generate a JWT-like token for user authentication
 * 
 * Creates a simplified JWT token in the format: header.payload.signature
 * The token encodes user information and is signed with a secret.
 * 
 * Note: This implementation is simplified for testing. In production,
 * use the 'jsonwebtoken' npm package with a strong secret and proper
 * key management.
 * 
 * @param {Object} user - User object to encode
 * @param {string} user._id - User MongoDB ID
 * @param {string} user.id - User ID (fallback if _id not present)
 * @param {string} user.email - User email address
 * @param {string} user.username - User username
 * @returns {string} JWT-like token string
 * 
 * @example
 * const user = { _id: '123', email: 'user@example.com', username: 'john' };
 * const token = generateToken(user);
 * // Returns: "eyJ0eXAi...eyJ1c2VyI...8X9zc..."
 */
function generateToken(user) {
  // Create JWT header (algorithm and token type)
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64');

  // Create JWT payload with user data and issued-at timestamp
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id || user.id,
      email: user.email,
      username: user.username,
      iat: Math.floor(Date.now() / 1000), // Issued at time (Unix timestamp)
    })
  ).toString('base64');

  // Create signature by HMAC-SHA256 hashing header.payload with secret
  // Note: 'test-secret-key' should be replaced with a secure secret from environment variables
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'test-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');

  // Return JWT in format: header.payload.signature
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify and decode a JWT-like token
 * 
 * Validates and decodes a JWT token, returning the payload if valid.
 * Does not verify signature for performance in testing (verify before use in production).
 * 
 * Note: This implementation skips signature verification. In production,
 * always verify the signature using the 'jsonwebtoken' library.
 * 
 * @param {string} token - JWT token to verify and decode
 * @returns {Object|null} Decoded payload object if valid, null if invalid
 * 
 * @example
 * const decoded = verifyToken(validToken);
 * if (decoded) {
 *   console.log(decoded.id); // User ID
 *   console.log(decoded.email); // User email
 * }
 */
function verifyToken(token) {
  try {
    // Split token into three parts: header, payload, signature
    const [header, payload, signature] = token.split('.');

    // Validate all parts are present
    if (!header || !payload || !signature) {
      return null;
    }

    // Decode and parse JSON payload
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString()
    );

    // Return decoded payload
    return decoded;
  } catch (error) {
    // Return null if any error occurs during decoding
    // eslint-disable-next-line no-console
    console.error('Token verification error:', error.message);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
