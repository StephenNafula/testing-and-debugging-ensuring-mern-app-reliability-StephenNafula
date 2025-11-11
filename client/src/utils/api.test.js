// client/src/utils/api.test.js
// Unit tests for client API utilities

import { getRequest, postRequest, putRequest, deleteRequest, apiRequest } from './api';

describe('API Utilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('apiRequest', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await apiRequest('/api/test');

      expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }));
      expect(result).toEqual(mockData);
    });

    it('should include authorization token if present', async () => {
      localStorage.setItem('authToken', 'test-token-123');
      const mockData = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await apiRequest('/api/protected');

      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should throw error on non-OK response with JSON error data', async () => {
      const errorData = { error: 'Not found' };
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce(errorData),
      });

      await expect(apiRequest('/api/missing')).rejects.toThrow('API Error: 404');
    });

    it('should handle non-JSON error responses gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValueOnce(new Error('Not JSON')),
      });

      await expect(apiRequest('/api/error')).rejects.toThrow('API Error: 500');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiRequest('/api/test')).rejects.toThrow('Network error');
    });

    it('should merge custom options with defaults', async () => {
      const mockData = {};
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await apiRequest('/api/test', { method: 'POST' });

      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.method).toBe('POST');
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('getRequest', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await getRequest('/api/users');

      expect(fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
        method: 'GET',
      }));
      expect(result).toEqual(mockData);
    });
  });

  describe('postRequest', () => {
    it('should make a POST request with body', async () => {
      const payload = { name: 'John' };
      const mockData = { id: 1, ...payload };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await postRequest('/api/users', payload);

      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.method).toBe('POST');
      expect(callArgs.body).toBe(JSON.stringify(payload));
      expect(result).toEqual(mockData);
    });
  });

  describe('putRequest', () => {
    it('should make a PUT request with body', async () => {
      const payload = { name: 'Jane' };
      const mockData = { id: 1, ...payload };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await putRequest('/api/users/1', payload);

      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.method).toBe('PUT');
      expect(callArgs.body).toBe(JSON.stringify(payload));
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteRequest', () => {
    it('should make a DELETE request', async () => {
      const mockData = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await deleteRequest('/api/users/1');

      const callArgs = fetch.mock.calls[0][1];
      expect(callArgs.method).toBe('DELETE');
      expect(result).toEqual(mockData);
    });
  });
});
