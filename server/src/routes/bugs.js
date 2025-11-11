/**
 * Bug Routes
 * Handles all CRUD operations for bug tracking.
 * 
 * Endpoints:
 * POST   /api/bugs              - Create a new bug report
 * GET    /api/bugs              - Retrieve all bugs with filtering
 * GET    /api/bugs/:id          - Retrieve a single bug by ID
 * PUT    /api/bugs/:id          - Update bug details
 * DELETE /api/bugs/:id          - Delete a bug
 * POST   /api/bugs/:id/comments - Add a comment to a bug
 */

const express = require('express');
const Bug = require('../models/Bug');
const { isValidObjectId, sanitizeInput } = require('../utils/validation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Create a new bug report
 * POST /api/bugs
 * 
 * Requires authentication. Validates input and creates a bug
 * associated with the authenticated user.
 * 
 * @param {string} title - Bug title (5-200 characters)
 * @param {string} description - Detailed bug description
 * @param {string} priority - Priority level (low/medium/high/critical)
 * @param {array} tags - Optional tags for categorization
 * 
 * @returns {object} Created bug document with populated user references
 * @throws {400} Invalid input validation
 * @throws {401} Unauthorized (requires authentication)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, priority, tags } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        error: 'Title and description are required',
      });
    }

    // Validate title length
    if (title.length < 5) {
      return res.status(400).json({
        error: 'Title must be at least 5 characters',
      });
    }

    // Validate description length
    if (description.length < 10) {
      return res.status(400).json({
        error: 'Description must be at least 10 characters',
      });
    }

    // Create bug with sanitized input
    const bug = await Bug.create({
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      priority: priority || 'medium',
      reportedBy: req.user.id,
      tags: tags || [],
    });

    // Populate referenced user data
    await bug.populate('reportedBy', 'username email');

    return res.status(201).json(bug);
  } catch (error) {
    return next(error);
  }
});

/**
 * Retrieve all bugs with optional filtering
 * GET /api/bugs
 * 
 * Supports filtering by status and priority, with configurable sorting.
 * No authentication required for reading bugs.
 * 
 * @query {string} status - Filter by status (open/in-progress/resolved)
 * @query {string} priority - Filter by priority (low/medium/high/critical)
 * @query {string} sortBy - Sort field (default: -createdAt)
 * 
 * @returns {array} Array of bug documents
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, sortBy = '-createdAt' } = req.query;
    const query = {};

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    // Apply priority filter if provided
    if (priority) {
      query.priority = priority;
    }

    // Query database with filters and sorting
    const bugs = await Bug.find(query)
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort(sortBy)
      .exec();

    return res.json(bugs);
  } catch (error) {
    return next(error);
  }
});

/**
 * Retrieve a single bug by ID
 * GET /api/bugs/:id
 * 
 * Fetches detailed information for a specific bug including
 * reporter, assignee, and all comments.
 * 
 * @param {string} id - Bug document ID (MongoDB ObjectId)
 * 
 * @returns {object} Bug document with populated references
 * @throws {400} Invalid bug ID format
 * @throws {404} Bug not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bug ID' });
    }

    const bug = await Bug.findById(req.params.id)
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate('comments.author', 'username email');

    // Return 404 if bug not found
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    return res.json(bug);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update bug details
 * PUT /api/bugs/:id
 * 
 * Allows updating bug status, priority, assignment, and tags.
 * Requires authentication. If status is changed to 'resolved',
 * sets the resolvedAt timestamp automatically.
 * 
 * @param {string} id - Bug document ID
 * @param {string} status - New status (open/in-progress/resolved)
 * @param {string} priority - New priority (low/medium/high/critical)
 * @param {string} assignedTo - User ID to assign bug to
 * @param {array} tags - Updated tags array
 * 
 * @returns {object} Updated bug document
 * @throws {400} Invalid input or ID format
 * @throws {401} Unauthorized
 * @throws {404} Bug not found
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bug ID' });
    }

    const { status, priority, assignedTo, tags } = req.body;

    // Validate status if provided
    if (status && !['open', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: open, in-progress, resolved',
      });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority. Must be one of: low, medium, high, critical',
      });
    }

    // Fetch bug document
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    // Update status and set resolvedAt timestamp if resolved
    if (status) {
      bug.status = status;
      if (status === 'resolved') {
        bug.resolvedAt = new Date();
      }
    }

    // Update other fields if provided
    if (priority) {
      bug.priority = priority;
    }
    if (assignedTo !== undefined) {
      bug.assignedTo = assignedTo || null;
    }
    if (tags) {
      bug.tags = tags;
    }

    // Save updated bug
    await bug.save();

    // Populate references for response
    await bug.populate('reportedBy', 'username email');
    await bug.populate('assignedTo', 'username email');

    return res.json(bug);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a bug
 * DELETE /api/bugs/:id
 * 
 * Permanently removes a bug from the database.
 * Requires authentication.
 * 
 * @param {string} id - Bug document ID
 * 
 * @returns {object} Confirmation message and deleted bug data
 * @throws {400} Invalid bug ID format
 * @throws {401} Unauthorized
 * @throws {404} Bug not found
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bug ID' });
    }

    const bug = await Bug.findByIdAndDelete(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    return res.json({ 
      message: 'Bug deleted successfully', 
      bug 
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Add a comment to a bug
 * POST /api/bugs/:id/comments
 * 
 * Adds a new comment to the bug's comment thread.
 * Requires authentication. Associates the comment with the
 * authenticated user as the author.
 * 
 * @param {string} id - Bug document ID
 * @param {string} text - Comment text content
 * 
 * @returns {object} Updated bug document with new comment
 * @throws {400} Invalid ID format or empty comment text
 * @throws {401} Unauthorized
 * @throws {404} Bug not found
 */
router.post('/:id/comments', authMiddleware, async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bug ID' });
    }

    const { text } = req.body;

    // Validate comment text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }

    // Add new comment to comments array
    bug.comments.push({
      text: sanitizeInput(text),
      author: req.user.id,
    });

    await bug.save();

    // Populate comment authors for response
    await bug.populate('comments.author', 'username email');

    return res.json(bug);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
