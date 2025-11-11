/**
 * Error Boundary Component
 * 
 * React Error Boundary that catches errors in child components during rendering.
 * Prevents the entire application from crashing when a component encounters an error.
 * In production, consider integrating with error tracking services like Sentry or LogRocket.
 */

import React from 'react';

/**
 * ErrorBoundary Class Component
 * 
 * Catches JavaScript errors anywhere in the child component tree, logs those errors,
 * and displays a fallback UI instead of crashing the entire app.
 * 
 * @class
 * @extends React.Component
 * @example
 * <ErrorBoundary>
 *   <MyProblematicComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  /**
   * Initialize error boundary state
   * 
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   * 
   * Called after an error has been thrown by a descendant component.
   * Used to update state so that the next render will display the fallback UI.
   * 
   * @static
   * @param {Error} error - The error thrown
   * @returns {Object} Updated state object
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details for debugging
   * 
   * Called after an error has been thrown by a descendant component.
   * Use this lifecycle method to log errors to an error reporting service.
   * In production, replace console.error with a service like Sentry or LogRocket.
   * 
   * @param {Error} error - The error thrown
   * @param {Object} info - React error info object with componentStack
   */
  componentDidCatch(error, info) {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { contexts: { react: info } });
    
    // For now, log to console for development
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  /**
   * Render fallback UI or children
   * 
   * If an error was caught, displays a fallback UI.
   * Otherwise, renders the wrapped children components normally.
   * 
   * @returns {React.ReactElement} Either fallback UI or children
   */
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details (development only)</summary>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
