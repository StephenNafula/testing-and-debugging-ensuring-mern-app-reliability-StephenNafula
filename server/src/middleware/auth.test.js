// server/src/middleware/auth.test.js
// Unit tests for authentication middleware

const authMiddleware = require('./auth');
const { generateToken } = require('../utils/auth');

describe('Auth Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when token is valid', () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
    };
    const token = generateToken(user);
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('should return 401 when no authorization header', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    req.headers.authorization = 'Basic xyz';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid.token.here';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach decoded user to req.user', () => {
    const user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      username: 'testuser',
    };
    const token = generateToken(user);
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(req.user.id).toBe(user._id);
    expect(req.user.email).toBe(user.email);
  });
});
