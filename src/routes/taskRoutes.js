// src/routes/taskRoutes.js
const express = require('express');
const taskController = require('../controllers/taskController'); // Imports all exported functions

const router = express.Router();

// --- Define All Task Routes ---

// Create a Task
// POST /api/tasks
router.post('/', taskController.createTask);

// Get All Tasks
// GET /api/tasks
router.get('/', taskController.getAllTasks);

// Get a Single Task by ID
// GET /api/tasks/:id
router.get('/:id', taskController.getTaskById);

// Update a Task's Status
// PATCH /api/tasks/:id/status  (Using PATCH for partial update, targeting status specifically)
// Or you could use PUT /api/tasks/:id if updating the whole task was intended
router.patch('/:id/status', taskController.updateTaskStatus); // Route added

// Delete a Task
// DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask); // Route added


module.exports = router; // Export the configured router