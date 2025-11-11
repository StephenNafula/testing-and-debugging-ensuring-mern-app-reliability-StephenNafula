/**
 * Express Application Setup
 * 
 * Configures Express server with middleware, routes, and error handling.
 * Initializes all API endpoints and serves as the main application entry point.
 */

const express = require('express');
const Post = require('./models/Post');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const bugRoutes = require('./routes/bugs');

const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

/**
 * Parse incoming JSON request bodies
 */
app.use(express.json());

// ============================================================================
// BUG ROUTES
// ============================================================================

/**
 * Mount bug tracker routes at /api/bugs
 * Handles all bug-related CRUD operations
 */
app.use('/api/bugs', bugRoutes);

// ============================================================================
// POST ROUTES
// ============================================================================

/**
 * POST /api/posts
 * Create a new post
 * 
 * Requires:
 * - Authentication (JWT token)
 * - Body: { title, content, category }
 * 
 * Returns:
 * - 201: Created post object
 * - 400: Validation error
 * - 401: Unauthorized
 */
app.post('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
        errors: {
          title: !title ? 'Title is required' : undefined,
          content: !content ? 'Content is required' : undefined,
        },
      });
    }

    // Create post with user as author
    const post = await Post.create({
      title,
      content,
      category,
      author: req.user.id,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
    });

    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/posts
 * Fetch all posts with optional filtering and pagination
 * 
 * Query Parameters:
 * - category: Filter posts by category
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10)
 * 
 * Returns:
 * - 200: Array of post objects
 */
app.get('/api/posts', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Build query filter
    const query = {};
    if (category) {
      query.category = category;
    }

    // Fetch posts with pagination
    const posts = await Post.find(query)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/posts/:id
 * Fetch a single post by ID
 * 
 * URL Parameters:
 * - id: Post ID
 * 
 * Returns:
 * - 200: Post object
 * - 404: Post not found
 */
app.get('/api/posts/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json(post);
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/posts/:id
 * Update a post
 * 
 * Requires:
 * - Authentication (JWT token)
 * - User must be the post author
 * 
 * URL Parameters:
 * - id: Post ID
 * 
 * Body: { title?, content?, category? }
 * 
 * Returns:
 * - 200: Updated post object
 * - 403: Not authorized
 * - 404: Post not found
 */
app.put('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user is the post author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update post fields
    const { title, content, category } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;

    await post.save();

    return res.json(post);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post
 * 
 * Requires:
 * - Authentication (JWT token)
 * - User must be the post author
 * 
 * URL Parameters:
 * - id: Post ID
 * 
 * Returns:
 * - 200: Success message
 * - 403: Not authorized
 * - 404: Post not found
 */
app.delete('/api/posts/:id', authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user is the post author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    return next(error);
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler middleware
 * Must be registered last to catch all errors from other routes
 */
app.use(errorHandler);

module.exports = app;
