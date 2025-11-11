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

## End-to-end (E2E)

- We suggest Cypress (already referenced in `package.json` scripts). Install dev dependency and write E2E tests under `cypress/integration` or `cypress/e2e` depending on version.
- E2E tests should point to a running instance of the app (use test environment and test data).

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
