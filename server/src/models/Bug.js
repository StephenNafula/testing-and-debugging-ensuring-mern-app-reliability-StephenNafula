/**
 * Bug Model
 * Represents a bug report in the tracking system.
 * 
 * Fields:
 * - title: Brief description of the bug (5-200 characters)
 * - description: Detailed explanation of the issue
 * - priority: Severity level (low, medium, high, critical)
 * - status: Current state (open, in-progress, resolved)
 * - reportedBy: Reference to user who reported the bug
 * - assignedTo: Reference to user assigned to fix the bug (optional)
 * - tags: Array of category tags for organization
 * - comments: Array of discussion comments with authors
 * - resolvedAt: Timestamp when bug was marked as resolved
 * - timestamps: Automatic createdAt and updatedAt fields
 */

const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Bug title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Bug description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Priority must be one of: low, medium, high, critical',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'resolved'],
        message: 'Status must be one of: open, in-progress, resolved',
      },
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bug must have a reporter'],
    },
    tags: {
      type: [String],
      default: [],
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);
