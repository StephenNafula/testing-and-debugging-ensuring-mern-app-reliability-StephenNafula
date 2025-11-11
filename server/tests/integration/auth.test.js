// server/tests/integration/auth.test.js
// Integration tests for authentication middleware

const authMiddleware = require('../../src/middleware/auth');
const { generateToken, verifyToken } = require('../../src/utils/auth');

describe('Auth Integration Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('generateToken', () => {
    it('should generate a valid token for a user', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should be able to verify a generated token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user._id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.username).toBe(user.username);
    });
  });

  describe('authMiddleware', () => {
    it('should reject requests without authorization header', () => {
      req.headers = {};

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Missing or invalid authorization header'),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid Bearer token format', () => {
      req.headers.authorization = 'InvalidFormat token123';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with malformed token', () => {
      req.headers.authorization = 'Bearer malformed.token';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid token and attach user to request', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);
      req.headers.authorization = `Bearer ${token}`;

      authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(user._id);
      expect(req.user.email).toBe(user.email);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle token verification errors gracefully', () => {
      req.headers.authorization = 'Bearer invalid.base64.signature';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should return null for invalid token format', () => {
      const result = verifyToken('invalid');
      expect(result).toBeNull();
    });

    it('should return null for malformed payload', () => {
      const result = verifyToken('header.invalid-base64...signature');
      expect(result).toBeNull();
    });

    it('should return null for missing parts', () => {
      expect(verifyToken('header.payload')).toBeNull();
      expect(verifyToken('header')).toBeNull();
      expect(verifyToken('')).toBeNull();
    });

    it('should successfully verify and decode a valid token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        username: 'user123',
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded.id).toBe(user._id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.iat).toBeDefined();
    });
  });
});
