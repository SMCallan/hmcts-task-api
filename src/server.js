// src/server.js

// Import necessary modules
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
const taskRoutes = require('./routes/taskRoutes'); // Make sure this path is correct

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
const PORT = process.env.PORT || 3001;

// --- Start the Server ---
// Store the server instance returned by app.listen()
const server = app.listen(PORT, () => {
  // Only log the running message if NOT in test environment
  // Jest typically sets NODE_ENV to 'test' automatically
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});

// --- Export App and Server Instance ---
// Export both the app (for Supertest requests) and the server (for closing)
module.exports = { app, server };