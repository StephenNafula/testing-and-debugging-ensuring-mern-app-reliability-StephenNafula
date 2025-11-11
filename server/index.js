/**
 * Bug Tracker Server Entry Point
 * 
 * Starts the Express application and listens for incoming requests.
 * Configures the server port from environment variables or defaults to 5000.
 * Displays startup information for debugging and verification.
 */

const app = require('./src/app');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

/**
 * Start the server and listen for incoming connections
 * 
 * Displays a welcome message with server information including:
 * - Server URL
 * - API documentation endpoint
 * - MongoDB connection requirement
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          🐛 Bug Tracker Server Started                     ║
║                                                            ║
║  Server:      http://localhost:${PORT}                       ║
║  API Docs:    http://localhost:${PORT}/api/bugs               ║
║                                                            ║
║  Make sure MongoDB is running for full functionality      ║
╚════════════════════════════════════════════════════════════╝
  `);
});
