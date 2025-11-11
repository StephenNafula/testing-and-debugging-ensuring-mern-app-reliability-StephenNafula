/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in route handlers and middleware.
 * Formats error responses consistently and prevents sensitive data leaks.
 * In production, stack traces are excluded from responses.
 * Should be registered as the last middleware in the Express app.
 */

/**
 * Express error handling middleware
 * 
 * Catches errors from all previous middleware and route handlers.
 * Logs errors for debugging and formats consistent JSON responses.
 * 
 * Note: This middleware signature (4 parameters) is required for Express
 * to recognize it as an error handler.
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (unused but required)
 * @returns {void} Sends error response to client
 * 
 * @example
 * // In app.js, must be registered last
 * app.use(errorHandler);
 * 
 * @example
 * // Usage in route handlers
 * app.get('/api/users', async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error); // Passes to errorHandler
 *   }
 * });
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  // TODO: Replace with structured logging service (e.g., Winston, Bunyan)
  // eslint-disable-next-line no-console
  console.error(err);

  // Extract status code from error or default to 500
  const status = err.status || 500;

  // Build response object
  const response = {
    error: err.message || 'Internal Server Error',
  };

  // Include stack trace in development only
  // Never include stack traces in production to avoid leaking sensitive info
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  // Send error response
  res.status(status).json(response);
}

module.exports = errorHandler;
