// server/src/middleware/errorHandler.js
// Express global error handler middleware

function errorHandler(err, req, res, next) {
  // Log error (can be replaced with Winston, Bunyan, etc.)
  // In production prefer more structured logs and avoid leaking sensitive info
  console.error(err);

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
