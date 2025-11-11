/**
 * Status Updater Component
 * 
 * Provides an inline interface for updating a bug's status.
 * Allows users to select from available statuses and submit changes.
 */

import React, { useState } from 'react';
import '../styles/StatusUpdater.css';

/**
 * StatusUpdater Component
 * 
 * Displays radio button options for status selection and handles submission.
 * Prevents submission if status hasn't changed.
 * 
 * @param {string} bugId - ID of the bug being updated
 * @param {string} currentStatus - Current status of the bug
 * @param {function} onStatusUpdate - Callback function when status is updated
 * @returns {React.ReactElement} Status update form interface
 */
export function StatusUpdater({ bugId, currentStatus, onStatusUpdate }) {
  // Track selected status during editing
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  // UI state
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Available status options
  const statuses = ['open', 'in-progress', 'resolved'];

  /**
   * Handle status update submission
   * 
   * Validates that status has changed before submitting.
   * Shows loading state during the API request.
   */
  const handleUpdateClick = async () => {
    // Prevent submission if status hasn't changed
    if (selectedStatus === currentStatus) {
      setError('Please select a different status');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await onStatusUpdate(bugId, selectedStatus);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="status-updater">
      <h4>Update Status</h4>

      {error && <p className="error-text">{error}</p>}

      {/* Status Selection Options */}
      <div className="status-options">
        {statuses.map((status) => (
          <label key={status} className="status-option">
            <input
              type="radio"
              name="status"
              value={status}
              checked={selectedStatus === status}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={updating}
            />
            <span>{status.replace('-', ' ').toUpperCase()}</span>
          </label>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpdateClick}
        disabled={updating || selectedStatus === currentStatus}
        className="btn btn-primary"
      >
        {updating ? 'Updating...' : 'Save Status'}
      </button>
    </div>
  );
}

export default StatusUpdater;
