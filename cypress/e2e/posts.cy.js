// cypress/e2e/posts.cy.js
// End-to-end tests for post CRUD operations

describe('Posts CRUD E2E Tests', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'Password123!@');
  });

  describe('Create Posts', () => {
    it('should navigate to create post page', () => {
      cy.visit('/');
      cy.get('[data-testid=create-post-link]').click();
      cy.url().should('include', '/posts/create');
      cy.get('h1').should('contain', 'Create Post');
    });

    it('should display validation errors for empty form', () => {
      cy.visit('/posts/create');
      cy.get('[data-testid=post-create-button]').click();
      cy.get('[data-testid=title-error]').should('be.visible');
      cy.get('[data-testid=content-error]').should('be.visible');
    });

    it('should successfully create a new post', () => {
      cy.createPost('E2E Test Post', 'This is a test post for e2e testing');
      cy.get('[data-testid=post-title]').should('contain', 'E2E Test Post');
      cy.get('[data-testid=post-content]').should('contain', 'This is a test post');
    });

    it('should display success message after creating post', () => {
      cy.visit('/posts/create');
      cy.get('[data-testid=post-title-input]').type('Success Post');
      cy.get('[data-testid=post-content-textarea]').type('Post created successfully');
      cy.get('[data-testid=post-create-button]').click();
      cy.get('[data-testid=success-message]').should('contain', 'Post created');
    });
  });

  describe('Read Posts', () => {
    it('should display list of posts', () => {
      cy.visit('/posts');
      cy.get('[data-testid=posts-list]').should('be.visible');
      cy.get('[data-testid=post-item]').should('have.length.greaterThan', 0);
    });

    it('should navigate to post detail page', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().click();
      cy.url().should('match', /\/posts\/[a-f0-9]{24}/);
      cy.get('[data-testid=post-title]').should('be.visible');
    });

    it('should display 404 for non-existent post', () => {
      cy.visit('/posts/000000000000000000000000', { failOnStatusCode: false });
      cy.get('[data-testid=not-found-message]').should('be.visible');
    });

    it('should search and filter posts', () => {
      cy.visit('/posts');
      cy.get('[data-testid=search-input]').type('test');
      cy.get('[data-testid=posts-list]').should('be.visible');
      cy.get('[data-testid=post-item]').each(post => {
        cy.wrap(post).should('contain.text', 'test');
      });
    });

    it('should paginate posts list', () => {
      cy.visit('/posts');
      cy.get('[data-testid=next-page-button]').click();
      cy.url().should('include', 'page=2');
      cy.get('[data-testid=posts-list]').should('be.visible');
    });
  });

  describe('Update Posts', () => {
    it('should navigate to edit post page', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=edit-button]').click();
      });
      cy.url().should('match', /\/posts\/[a-f0-9]{24}\/edit/);
      cy.get('h1').should('contain', 'Edit Post');
    });

    it('should display validation errors on invalid update', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=edit-button]').click();
      });
      cy.get('[data-testid=post-title-input]').clear();
      cy.get('[data-testid=post-update-button]').click();
      cy.get('[data-testid=title-error]').should('be.visible');
    });

    it('should successfully update a post', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=edit-button]').click();
      });
      cy.get('[data-testid=post-title-input]').clear().type('Updated Title');
      cy.get('[data-testid=post-content-textarea]').clear().type('Updated content');
      cy.get('[data-testid=post-update-button]').click();
      cy.get('[data-testid=success-message]').should('contain', 'Post updated');
    });

    it('should not allow editing another user\'s post', () => {
      // This test assumes another user's post ID is known
      cy.visit('/posts/other-user-post-id/edit', { failOnStatusCode: false });
      cy.get('[data-testid=forbidden-message]').should('be.visible');
    });
  });

  describe('Delete Posts', () => {
    it('should show delete confirmation', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=delete-button]').click();
      });
      cy.get('[data-testid=delete-confirmation]').should('be.visible');
    });

    it('should cancel delete operation', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=delete-button]').click();
      });
      cy.get('[data-testid=cancel-delete-button]').click();
      cy.get('[data-testid=post-item]').first().should('be.visible');
    });

    it('should successfully delete a post', () => {
      cy.createPost('Post to Delete', 'This post will be deleted');
      cy.get('[data-testid=post-delete-button]').click();
      cy.get('[data-testid=confirm-delete-button]').click();
      cy.get('[data-testid=success-message]').should('contain', 'Post deleted');
    });

    it('should not allow deleting another user\'s post', () => {
      // Navigate to another user's post and verify delete is not available
      cy.visit('/posts/other-user-post-id');
      cy.get('[data-testid=post-delete-button]').should('not.exist');
    });
  });

  describe('Post Interactions', () => {
    it('should like a post', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=like-button]').click();
      });
      cy.get('[data-testid=like-count]').should('contain.text', /\d+/);
    });

    it('should add a comment to post', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().click();
      cy.get('[data-testid=comment-input]').type('Great post!');
      cy.get('[data-testid=comment-submit]').click();
      cy.get('[data-testid=comment]').should('contain.text', 'Great post!');
    });

    it('should share a post', () => {
      cy.visit('/posts');
      cy.get('[data-testid=post-item]').first().within(() => {
        cy.get('[data-testid=share-button]').click();
      });
      cy.get('[data-testid=share-menu]').should('be.visible');
    });
  });
});
