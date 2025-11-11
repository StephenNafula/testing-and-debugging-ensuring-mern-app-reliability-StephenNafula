// server/src/utils/auth.test.js
// Unit tests for authentication utilities (JWT token generation/verification)

const { generateToken, verifyToken } = require('./auth');

describe('Auth Utilities', () => {
  describe('generateToken', () => {
    it('should generate a token with three parts (header.payload.signature)', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should encode user data in the payload', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);
      const [, payload] = token.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

      expect(decoded.id).toBe(user._id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.username).toBe(user.username);
      expect(decoded.iat).toBeDefined();
    });

    it('should include issued-at timestamp', () => {
      const user = { _id: '123', email: 'test@example.com', username: 'test' };
      const beforeTime = Math.floor(Date.now() / 1000);

      const token = generateToken(user);

      const [, payload] = token.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      const afterTime = Math.floor(Date.now() / 1000);

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
      expect(decoded.iat).toBeLessThanOrEqual(afterTime);
    });

    it('should support user.id as fallback for user._id', () => {
      const user = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(user);
      const [, payload] = token.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

      expect(decoded.id).toBe(user.id);
    });
  });

  describe('verifyToken', () => {
    it('should decode a valid token', () => {
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

    it('should return null for token without three parts', () => {
      expect(verifyToken('invalid')).toBeNull();
      expect(verifyToken('two.parts')).toBeNull();
      expect(verifyToken('')).toBeNull();
    });

    it('should return null if payload is not valid base64', () => {
      const invalidToken = 'header.!!!invalid-base64!!!.signature';
      expect(verifyToken(invalidToken)).toBeNull();
    });

    it('should return null if payload is not valid JSON', () => {
      const invalidPayload = Buffer.from('not-json').toString('base64');
      const invalidToken = `header.${invalidPayload}.signature`;
      expect(verifyToken(invalidToken)).toBeNull();
    });

    it('should handle errors gracefully', () => {
      expect(verifyToken(null)).toBeNull();
      expect(verifyToken(undefined)).toBeNull();
    });

    it('should preserve all payload fields', () => {
      const user = {
        _id: 'user123',
        email: 'user@example.com',
        username: 'john_doe',
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(Object.keys(decoded)).toContain('id');
      expect(Object.keys(decoded)).toContain('email');
      expect(Object.keys(decoded)).toContain('username');
      expect(Object.keys(decoded)).toContain('iat');
    });
  });

  describe('Token Round-Trip', () => {
    it('should generate and verify token successfully', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'integration@example.com',
        username: 'integrationtest',
      };

      const token = generateToken(user);
      const verified = verifyToken(token);

      expect(verified).toBeDefined();
      expect(verified.id).toBe(user._id);
      expect(verified.email).toBe(user.email);
      expect(verified.username).toBe(user.username);
    });

    it('should handle multiple token generations for same user', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token1 = generateToken(user);
      // Small delay to ensure different timestamp
      const waitMs = 1;
      const before = Date.now();
      while (Date.now() - before < waitMs);
      const token2 = generateToken(user);

      // Both should decode correctly
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1.id).toBe(decoded2.id);
      expect(decoded1.email).toBe(decoded2.email);
      expect(decoded1.username).toBe(decoded2.username);
    });
  });
});
