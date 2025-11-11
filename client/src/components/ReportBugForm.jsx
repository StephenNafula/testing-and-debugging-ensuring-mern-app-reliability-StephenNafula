/**
 * Report Bug Form Component
 * 
 * Provides a user interface for reporting new bugs. Handles form validation,
 * submission to the API, and user feedback through error and success messages.
 */

import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import '../styles/ReportBugForm.css';

/**
 * ReportBugForm Component
 * 
 * Captures bug information from users and submits to the API.
 * Implements client-side validation and provides immediate feedback.
 * 
 * @param {function} onBugCreated - Callback function triggered after successful bug creation
 * @returns {React.ReactElement} Form for reporting new bugs
 */
export function ReportBugForm({ onBugCreated }) {
  // Form field state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  /**
   * Handle input field changes
   * 
   * Updates form state as user types. Clears any existing error messages.
   * 
   * @param {React.ChangeEvent} e - Change event from form input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear previous error when user starts typing
    setError('');
  };

  /**
   * Handle form submission
   * 
   * Validates form data, sends to API, and handles success/error responses.
   * Clears form on successful submission.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Title and description are required');
        setLoading(false);
        return;
      }

      // Validate title length
      if (formData.title.length < 5) {
        setError('Title must be at least 5 characters');
        setLoading(false);
        return;
      }

      // Validate description length
      if (formData.description.length < 10) {
        setError('Description must be at least 10 characters');
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await apiRequest('/api/bugs', 'POST', {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });

      setSuccess('Bug reported successfully!');

      // Reset form fields
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: '',
      });

      // Notify parent component of successful creation
      if (onBugCreated) {
        onBugCreated(response);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to report bug');
      console.error('Bug reporting error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-bug-form">
      <h2>Report a New Bug</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title of the bug"
            maxLength="200"
            disabled={loading}
          />
          <small>{formData.title.length}/200</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the bug"
            rows="5"
            disabled={loading}
          />
          <small>{formData.description.length} characters</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., ui, performance, database"
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Reporting...' : 'Report Bug'}
        </button>
      </form>
    </div>
  );
}

export default ReportBugForm;
