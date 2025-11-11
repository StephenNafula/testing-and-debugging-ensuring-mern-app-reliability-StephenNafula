# Testing and Debugging Guide

This repository contains a starter setup for running unit, integration, and end-to-end tests for a MERN application. The goal of this guide is to help you run tests locally and understand the testing strategies implemented.

## Quick commands

- Run all Jest projects: `npm test` or `yarn test`
- Run server tests only: `npm run test:server`
- Run client tests only: `npm run test:client`
- Run coverage: `npm run test:coverage`
- Open Cypress (e2e): `npm run e2e` (requires Cypress installed)
- Run Cypress headless: `npm run e2e:run`

Note: You must run `npm install` to install devDependencies listed in `package.json` before running the commands.

## Test setup summary

- Jest is configured at the repository root (`jest.config.js`) with two projects: `server` and `client`.
- Server integration tests use `mongodb-memory-server` (in-memory MongoDB) so that tests run isolated from your production database.
- Client tests use React Testing Library and `@testing-library/jest-dom` matchers.
- Supertest is used for API endpoint testing.

## Server testing

1. Tests live under `server/tests` (integration tests). Example: `posts.test.js`.
2. The server project references a setup file `server/tests/setup.js`. Use it to set NODE_ENV and test-wide behaviors.
3. The repository includes a reusable Express error handler at `server/src/middleware/errorHandler.js`. Include it in your `app.js` (Express) as the last middleware: `app.use(errorHandler)`.

## Client testing

1. Client Jest setup is in `client/src/tests/setup.js`. It configures RTL and a fetch polyfill.
2. Add component tests under `client/src` alongside components or in `client/src/tests`.
3. Static/asset imports are mocked with `client/src/tests/__mocks__/fileMock.js` and the `moduleNameMapper` mapping in `jest.config.js`.

## End-to-end (E2E) Testing with Cypress

E2E tests are located under `cypress/e2e/` and test full user flows (auth, CRUD operations, navigation, etc.).

### Running E2E Tests

```bash
# Open Cypress interactive UI
npm run e2e

# Run E2E tests headless
npm run e2e:run
```

### E2E Test Structure

- `cypress/e2e/auth.cy.js` — Tests for registration, login, logout, password reset, and session management.
- `cypress/e2e/posts.cy.js` — Tests for post CRUD operations (create, read, update, delete) and post interactions.
- `cypress/support/e2e.js` — Custom Cypress commands (helpers for login, logout, creating posts, etc.).

### Writing E2E Tests

Each E2E test should:
1. Set up test data (login as test user if needed)
2. Navigate to a page or perform an action
3. Verify behavior (assertions on UI, URL, API responses if mocked)
4. Clean up if necessary

Example:
```javascript
it('should successfully create a post', () => {
  cy.login('user@example.com', 'password123');
  cy.visit('/posts/create');
  cy.get('[data-testid=post-title-input]').type('Test Post');
  cy.get('[data-testid=post-content-textarea]').type('Content here');
  cy.get('[data-testid=post-create-button]').click();
  cy.url().should('include', '/posts');
});
```

### Best Practices

- Use `data-testid` attributes for element selection (more stable than selectors).
- Avoid hardcoding wait times; use Cypress implicit waits and conditions.
- Run E2E tests against a clean test database or use API fixtures/mocks for reproducibility.
- For CI/CD, use `npm run e2e:run` and integrate with your pipeline.

## Debugging techniques included

- Server: `server/src/middleware/errorHandler.js` prints errors and returns stack traces in non-production modes.
- Client: `client/src/components/ErrorBoundary.jsx` is available to wrap high-level UI to capture render-time errors.
- Tests are written to use `mongodb-memory-server` for database isolation.

## CI and coverage

- `jest.config.js` is set to collect coverage with thresholds: statements 70%, functions 70%, lines 70% and branches 60%.
- Adjust thresholds for your team as needed.

## Next steps / Recommendations

- Add `package.json` files per `client` and `server` if the projects are independent workspaces.
- Add a small `.env.test` file or CI env variables and make sure secrets are never committed.
- Integrate a logger like `winston` and connect Sentry/LogRocket for production error aggregation.
- Add Cypress visual regression tooling (Percy or Cypress snapshot plugin) to capture UI regressions.
