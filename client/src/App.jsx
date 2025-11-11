/**
 * Main Application Component
 * 
 * Provides the primary user interface for the bug tracker application.
 * Manages tab-based navigation between bug list view and bug report form.
 * Integrates error boundary for crash prevention.
 */

import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ReportBugForm from './components/ReportBugForm';
import BugList from './components/BugList';
import './App.css';

/**
 * App Component
 * 
 * Serves as the root component for the application. Manages the active tab state
 * and handles the refresh mechanism for the bug list when new bugs are created.
 * 
 * @returns {React.ReactElement} The main application interface
 */
function App() {
  // Tracks which tab is currently active: 'list' or 'report'
  const [activeTab, setActiveTab] = useState('list');
  
  // Used to trigger a refresh of the bug list after new bug creation
  // Incremented in handleBugCreated to cause BugList to re-fetch data
  const [refreshBugList, setRefreshBugList] = useState(0);

  /**
   * Handle successful bug creation
   * 
   * Triggered when a bug is successfully reported through the form.
   * Increments the refresh trigger to cause the bug list to reload,
   * then switches to the list view to show the new bug.
   */
  const handleBugCreated = () => {
    setRefreshBugList((prev) => prev + 1);
    setActiveTab('list');
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>Bug Tracker</h1>
            <p className="tagline">Report, track, and resolve bugs efficiently</p>
          </div>
        </header>

        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Bug List
          </button>
          <button
            className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Report Bug
          </button>
        </nav>

        <main className="app-main">
          <div className="content-container">
            {activeTab === 'list' && (
              <section className="content-section">
                <BugList refreshTrigger={refreshBugList} />
              </section>
            )}

            {activeTab === 'report' && (
              <section className="content-section">
                <ReportBugForm onBugCreated={handleBugCreated} />
              </section>
            )}
          </div>
        </main>

        <footer className="app-footer">
          <p>Bug Tracker - Testing and Debugging Assignment</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
