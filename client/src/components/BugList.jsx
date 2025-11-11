/**
 * Bug List Component
 * 
 * Displays a list of bug reports with filtering, sorting, and management capabilities.
 * Provides real-time statistics and allows users to update bug statuses or delete bugs.
 */

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import StatusUpdater from './StatusUpdater';
import '../styles/BugList.css';

/**
 * BugList Component
 * 
 * Fetches bugs from the API and displays them in an organized, filterable list.
 * Handles bug deletion and status updates with user-friendly interactions.
 * 
 * @param {number} refreshTrigger - Dependency to trigger re-fetch of bugs
 * @returns {React.ReactElement} Organized list of bugs with filters and controls
 */
export function BugList({ refreshTrigger }) {
  // Bug data state
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Interaction state
  const [editingBugId, setEditingBugId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  /**
   * Fetch bugs from API when component mounts or refreshTrigger changes
   */
  useEffect(() => {
    fetchBugs();
  }, [refreshTrigger]);

  /**
   * Apply active filters to bug list
   * 
   * Updates filteredBugs whenever bugs array or filter values change.
   * Applies status and priority filters in sequence.
   */
  useEffect(() => {
    let filtered = bugs;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((bug) => bug.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter((bug) => bug.priority === priorityFilter);
    }

    setFilteredBugs(filtered);
  }, [bugs, statusFilter, priorityFilter]);

  /**
   * Fetch all bugs from the API
   * 
   * Retrieves the complete bug list and updates state.
   * Handles errors gracefully with user feedback.
   */
  const fetchBugs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/bugs', 'GET');
      setBugs(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load bugs');
      console.error('Error fetching bugs:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a bug's status
   * 
   * Sends status update to API and updates local state.
   * Closes the edit interface after successful update.
   * 
   * @param {string} bugId - ID of the bug to update
   * @param {string} newStatus - New status value
   */
  const handleStatusUpdate = async (bugId, newStatus) => {
    try {
      const response = await apiRequest(`/api/bugs/${bugId}`, 'PUT', {
        status: newStatus,
      });

      // Update bug in local state
      setBugs((prevBugs) =>
        prevBugs.map((bug) => (bug._id === bugId ? response : bug))
      );

      // Close edit interface
      setEditingBugId(null);
    } catch (err) {
      setError(err.message || 'Failed to update bug status');
      console.error('Error updating bug:', err);
    }
  };

  /**
   * Delete a bug
   * 
   * Requests confirmation from user before deleting.
   * Removes bug from API and updates local state on success.
   * 
   * @param {string} bugId - ID of the bug to delete
   */
  const handleDeleteBug = async (bugId) => {
    // Request user confirmation
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    setDeleting(bugId);
    try {
      await apiRequest(`/api/bugs/${bugId}`, 'DELETE');

      // Remove bug from local state
      setBugs((prevBugs) => prevBugs.filter((bug) => bug._id !== bugId));
    } catch (err) {
      setError(err.message || 'Failed to delete bug');
      console.error('Error deleting bug:', err);
    } finally {
      setDeleting(null);
    }
  };

  /**
   * Get CSS class for priority badge styling
   * 
   * @param {string} priority - Priority value
   * @returns {string} CSS class name for styling
   */
  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  /**
   * Get CSS class for status badge styling
   * 
   * @param {string} status - Status value
   * @returns {string} CSS class name for styling
   */
  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  // Show loading state
  if (loading) {
    return <div className="bug-list"><p className="loading">Loading bugs...</p></div>;
  }

  return (
    <div className="bug-list">
      <h2>Bug Tracker</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Controls */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button onClick={fetchBugs} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {/* Statistics Display */}
      <div className="bug-stats">
        <p>Total Bugs: <strong>{filteredBugs.length}</strong></p>
        <p>Open: <strong>{filteredBugs.filter((b) => b.status === 'open').length}</strong></p>
        <p>In Progress: <strong>{filteredBugs.filter((b) => b.status === 'in-progress').length}</strong></p>
        <p>Resolved: <strong>{filteredBugs.filter((b) => b.status === 'resolved').length}</strong></p>
      </div>

      {/* Bug List or Empty State */}
      {filteredBugs.length === 0 ? (
        <p className="no-bugs">No bugs found</p>
      ) : (
        <div className="bugs-container">
          {filteredBugs.map((bug) => (
            <div key={bug._id} className="bug-card">
              {/* Bug Header with Title and Controls */}
              <div className="bug-header">
                <div className="bug-title-section">
                  <h3>{bug.title}</h3>
                  <span className={`priority-badge ${getPriorityClass(bug.priority)}`}>
                    {bug.priority.toUpperCase()}
                  </span>
                  <span className={`status-badge ${getStatusClass(bug.status)}`}>
                    {bug.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="bug-actions">
                  <button
                    onClick={() => setEditingBugId(editingBugId === bug._id ? null : bug._id)}
                    className="btn btn-small btn-primary"
                  >
                    {editingBugId === bug._id ? 'Cancel' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => handleDeleteBug(bug._id)}
                    disabled={deleting === bug._id}
                    className="btn btn-small btn-danger"
                  >
                    {deleting === bug._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Bug Description */}
              <p className="bug-description">{bug.description}</p>

              {/* Tags Display */}
              {bug.tags && bug.tags.length > 0 && (
                <div className="tags">
                  {bug.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bug Metadata */}
              <div className="bug-meta">
                <small>
                  Reported by: <strong>{bug.reportedBy?.username || 'Unknown'}</strong>
                </small>
                <small>
                  Created: <strong>{new Date(bug.createdAt).toLocaleDateString()}</strong>
                </small>
              </div>

              {/* Status Update Interface */}
              {editingBugId === bug._id && (
                <StatusUpdater
                  bugId={bug._id}
                  currentStatus={bug.status}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BugList;
