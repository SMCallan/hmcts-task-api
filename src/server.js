// src/server.js

// Import necessary modules
const express = require('express');
const cors = require('cors');

// --- Conditionally load dotenv ---
// Only load .env file if not in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('>>> Loading environment variables from .env file');
  require('dotenv').config();
}
// --- End conditional load ---

const taskRoutes = require('./routes/taskRoutes'); // Make sure this path is correct

// --- Add log to check variable on startup ---
// Check if DATABASE_URL is accessible when the application starts
console.log('>>> DATABASE_URL on Startup:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND!');
// --- End log ---

// Create an Express application instance
const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all origins
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// --- API Routes ---
// Mount the task routes under the /api/tasks path
app.use('/api/tasks', taskRoutes);

// --- Basic Health Check Route ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// --- Define the Port ---
// Use port provided by environment (like Railway) or default to 3001
const PORT = process.env.PORT || 3001;

// --- Start the Server ---
// Store the server instance returned by app.listen()
const server = app.listen(PORT, () => {
  // Only log the running message if NOT in test environment
  if (process.env.NODE_ENV !== 'test') {
    // Use the actual PORT variable in the log message
    console.log(`Server is running on port ${PORT}`);
  }
});

// --- Export App and Server Instance ---
// Export both the app (for Supertest requests) and the server (for closing tests)
module.exports = { app, server };