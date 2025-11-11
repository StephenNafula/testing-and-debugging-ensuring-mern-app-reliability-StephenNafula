// server/tests/setup.js
// Global Jest setup for server tests

process.env.NODE_ENV = 'test';

// Optionally silence expected logs during tests; keep unexpected errors visible
const originalConsoleError = console.error;
console.error = (...args) => {
  // Let tests that intentionally assert on errors still work. If an error
  // should fail the test, it will be thrown or asserted explicitly.
  originalConsoleError(...args);
};

// Increase default timeout for a bit if CI or cold machines are slow
jest.setTimeout(20000);

// If you want to add globals (e.g., shared factories), expose them here.
// Example:
// global.factory = require('./testFactory');
