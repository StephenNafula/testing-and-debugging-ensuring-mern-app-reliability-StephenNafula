/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens from the Authorization header and attaches
 * user information to the request object for downstream handlers.
 */

const { verifyToken } = require('../utils/auth');

/**
 * Middleware to verify Bearer token from Authorization header
 * 
 * Extracts JWT token from the Authorization header, verifies its validity,
 * and attaches the decoded user data to req.user for use in route handlers.
 * 
 * Expected header format: Authorization: Bearer <token>
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if valid, or sends error response
 * 
 * @example
 * app.get('/api/protected', authMiddleware, (req, res) => {
 *   console.log(req.user); // Contains decoded token data
 * });
 */
function authMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    // Validate header exists and uses Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
      });
    }

    // Extract token by removing 'Bearer ' prefix (7 characters)
    const token = authHeader.slice(7);
    
    // Verify token and get decoded payload
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach decoded user data to request
    req.user = decoded;
    
    // Continue to next middleware/route
    return next();
  } catch (error) {
    // Catch any errors during authentication
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
