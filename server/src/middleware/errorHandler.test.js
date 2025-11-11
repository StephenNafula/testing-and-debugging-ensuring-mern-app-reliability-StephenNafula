// server/src/middleware/errorHandler.test.js
// Unit tests for Express error handler middleware

const errorHandler = require('./errorHandler');

describe('Express Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    // Mock console.error to suppress output in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle errors with status code', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Validation failed');
    error.status = 400;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should default to 500 status code if not provided', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Internal error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal error',
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should use default error message if not provided', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error();

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should include stack trace in non-production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Dev error');
    error.status = 500;

    errorHandler(error, req, res, next);

    const callArgs = res.json.mock.calls[0][0];
    expect(callArgs).toHaveProperty('stack');
    expect(callArgs.error).toBe('Dev error');

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Prod error');
    error.status = 500;

    errorHandler(error, req, res, next);

    const callArgs = res.json.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('stack');

    process.env.NODE_ENV = originalEnv;
  });

  it('should log the error', () => {
    const error = new Error('Logged error');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('should handle errors without a message property', () => {
    const error = { status: 422 };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });
});
