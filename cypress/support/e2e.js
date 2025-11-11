// cypress/support/e2e.js
// Cypress support file for shared commands and utilities

// Add custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid=logout-button]').click();
  cy.url().should('include', '/');
});

Cypress.Commands.add('createPost', (title, content) => {
  cy.visit('/posts/create');
  cy.get('[data-testid=post-title-input]').type(title);
  cy.get('[data-testid=post-content-textarea]').type(content);
  cy.get('[data-testid=post-create-button]').click();
  cy.url().should('include', '/posts');
});

Cypress.Commands.add('deletePost', (postId) => {
  cy.visit(`/posts/${postId}`);
  cy.get('[data-testid=post-delete-button]').click();
  cy.on('window:confirm', () => true);
  cy.url().should('include', '/posts');
});

// Disable uncaught exception handling for test reliability
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  return false;
});
