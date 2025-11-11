// cypress/e2e/auth.cy.js
// End-to-end tests for authentication flows

describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Registration Flow', () => {
    it('should navigate to registration page', () => {
      cy.get('[data-testid=register-link]').click();
      cy.url().should('include', '/register');
      cy.get('h1').should('contain', 'Register');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/register');
      cy.get('[data-testid=register-button]').click();
      cy.get('[data-testid=email-error]').should('exist');
      cy.get('[data-testid=password-error]').should('exist');
    });

    it('should successfully register a new user', () => {
      cy.visit('/register');
      const email = `user${Date.now()}@example.com`;
      cy.get('[data-testid=username-input]').type('testuser123');
      cy.get('[data-testid=email-input]').type(email);
      cy.get('[data-testid=password-input]').type('Password123!@');
      cy.get('[data-testid=register-button]').click();
      cy.url().should('not.include', '/register');
    });

    it('should prevent duplicate email registration', () => {
      cy.visit('/register');
      cy.get('[data-testid=username-input]').type('user1');
      cy.get('[data-testid=email-input]').type('existing@example.com');
      cy.get('[data-testid=password-input]').type('Password123!@');
      cy.get('[data-testid=register-button]').click();
      cy.get('[data-testid=error-message]').should('contain', 'already exists');
    });
  });

  describe('Login Flow', () => {
    it('should navigate to login page', () => {
      cy.get('[data-testid=login-link]').click();
      cy.url().should('include', '/login');
      cy.get('h1').should('contain', 'Login');
    });

    it('should show validation errors for invalid credentials', () => {
      cy.visit('/login');
      cy.get('[data-testid=email-input]').type('invalid');
      cy.get('[data-testid=password-input]').type('short');
      cy.get('[data-testid=login-button]').click();
      cy.get('[data-testid=error-message]').should('be.visible');
    });

    it('should successfully login with valid credentials', () => {
      cy.login('user@example.com', 'Password123!@');
      cy.url().should('not.include', '/login');
      cy.get('[data-testid=user-menu]').should('be.visible');
    });

    it('should display error for non-existent user', () => {
      cy.visit('/login');
      cy.get('[data-testid=email-input]').type('nonexistent@example.com');
      cy.get('[data-testid=password-input]').type('Password123!@');
      cy.get('[data-testid=login-button]').click();
      cy.get('[data-testid=error-message]').should('contain', 'Invalid credentials');
    });

    it('should display error for incorrect password', () => {
      cy.visit('/login');
      cy.get('[data-testid=email-input]').type('user@example.com');
      cy.get('[data-testid=password-input]').type('WrongPassword123');
      cy.get('[data-testid=login-button]').click();
      cy.get('[data-testid=error-message]').should('contain', 'Invalid credentials');
    });
  });

  describe('Logout Flow', () => {
    it('should logout and redirect to home', () => {
      cy.login('user@example.com', 'Password123!@');
      cy.logout();
      cy.url().should('include', '/');
      cy.get('[data-testid=login-link]').should('be.visible');
    });

    it('should not allow access to protected routes after logout', () => {
      cy.login('user@example.com', 'Password123!@');
      cy.logout();
      cy.visit('/posts/create');
      cy.url().should('include', '/login');
    });
  });

  describe('Password Reset Flow', () => {
    it('should navigate to password reset', () => {
      cy.visit('/login');
      cy.get('[data-testid=forgot-password-link]').click();
      cy.url().should('include', '/forgot-password');
    });

    it('should send reset email for registered user', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid=email-input]').type('user@example.com');
      cy.get('[data-testid=reset-button]').click();
      cy.get('[data-testid=success-message]').should('contain', 'Check your email');
    });

    it('should handle non-existent email gracefully', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid=email-input]').type('nonexistent@example.com');
      cy.get('[data-testid=reset-button]').click();
      cy.get('[data-testid=message]').should('contain', 'If an account exists');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page navigation', () => {
      cy.login('user@example.com', 'Password123!@');
      cy.visit('/posts');
      cy.url().should('include', '/posts');
      cy.visit('/profile');
      cy.url().should('include', '/profile');
      cy.get('[data-testid=user-menu]').should('be.visible');
    });

    it('should redirect to login if session expires', () => {
      cy.login('user@example.com', 'Password123!@');
      cy.window().then(win => {
        localStorage.removeItem('authToken');
      });
      cy.visit('/posts/create');
      cy.url().should('include', '/login');
    });
  });
});
