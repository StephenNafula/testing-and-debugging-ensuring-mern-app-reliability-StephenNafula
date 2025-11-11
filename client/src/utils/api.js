/**
 * API Request Utilities
 * 
 * Provides a wrapper around the Fetch API with error handling, JSON parsing,
 * and automatic token management. Supports all standard HTTP methods.
 */

/**
 * Base wrapper for fetch requests with error handling and JSON parsing
 * 
 * Automatically includes authorization token from localStorage if available.
 * Handles error responses and parses JSON bodies.
 * 
 * @param {string} url - URL endpoint to fetch
 * @param {string} [method='GET'] - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} [body] - Request body data (automatically stringified as JSON)
 * @param {Object} [options={}] - Additional fetch options (headers, etc.)
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} With status and data properties on API errors
 * 
 * @example
 * const data = await apiRequest('/api/bugs', 'GET');
 * 
 * @example
 * const newBug = await apiRequest('/api/bugs', 'POST', { title: 'Bug', priority: 'high' });
 */
async function apiRequest(url, method = 'GET', body = null, options = {}) {
  // Set up default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization token if available in localStorage
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Build fetch configuration
  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Include body if provided (for POST, PUT, PATCH, etc.)
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      const error = new Error(`API Error: ${response.status}`);
      error.status = response.status;
      
      // Try to parse error response as JSON
      try {
        error.data = await response.json();
      } catch {
        error.data = { error: response.statusText };
      }
      
      throw error;
    }

    // Parse and return JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw error with additional context
    throw error;
  }
}

/**
 * Helper function for GET requests
 * 
 * @param {string} url - URL endpoint to fetch
 * @param {Object} [options={}] - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 * 
 * @example
 * const bugs = await getRequest('/api/bugs');
 */
function getRequest(url, options = {}) {
  return apiRequest(url, 'GET', null, options);
}

/**
 * Helper function for POST requests
 * 
 * @param {string} url - URL endpoint to fetch
 * @param {Object} body - Request body data
 * @param {Object} [options={}] - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 * 
 * @example
 * const newBug = await postRequest('/api/bugs', { title: 'Bug', priority: 'high' });
 */
function postRequest(url, body, options = {}) {
  return apiRequest(url, 'POST', body, options);
}

/**
 * Helper function for PUT requests
 * 
 * @param {string} url - URL endpoint to fetch
 * @param {Object} body - Request body data
 * @param {Object} [options={}] - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 * 
 * @example
 * const updatedBug = await putRequest('/api/bugs/123', { status: 'resolved' });
 */
function putRequest(url, body, options = {}) {
  return apiRequest(url, 'PUT', body, options);
}

/**
 * Helper function for DELETE requests
 * 
 * @param {string} url - URL endpoint to fetch
 * @param {Object} [options={}] - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 * 
 * @example
 * await deleteRequest('/api/bugs/123');
 */
function deleteRequest(url, options = {}) {
  return apiRequest(url, 'DELETE', null, options);
}

module.exports = {
  apiRequest,
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
};
