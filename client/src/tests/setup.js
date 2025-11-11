// client/src/tests/setup.js
// Jest setup for React Testing Library (CommonJS compatible)

// Use require so Jest (running in Node) can load this file without ESM enabled
require('@testing-library/jest-dom');

// Provide a global fetch polyfill for tests that use fetch.
// The project should install 'whatwg-fetch' (see package.json devDependencies).
try {
  // eslint-disable-next-line global-require
  global.fetch = require('whatwg-fetch');
} catch (e) {
  // If not installed, tests that need fetch should mock it explicitly.
}

// Optional: configure global timers, mock localStorage, etc.
