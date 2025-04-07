// src/controllers/taskController.js
const prisma = require('../db'); // Import Prisma Client instance

// --- Create Task ---
const createTask = async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  if (!title || !status || !dueDate) {
    return res.status(400).json({
      error: 'Missing required fields: title, status, and dueDate are required.',
    });
  }

  const dueDateObject = new Date(dueDate);
  if (isNaN(dueDateObject.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for dueDate. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).' });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description,
        status: status,
        dueDate: dueDateObject,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

// --- Get All Tasks ---
const getAllTasks = async (req, res) => {
  // --- Add log to check variable at runtime ---
  console.log('>>> DATABASE_URL in getAllTasks:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND!');
  // --- End log ---
  try {
    const tasks = await prisma.task.findMany({
       orderBy: {
         createdAt: 'desc' // Optional: Sort newest first
       }
    });
    res.status(200).json(tasks);
  } catch (error) {
    // Log the detailed error on the backend for debugging
    console.error("Error retrieving tasks:", error);
    // Send a generic error response to the client
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

// --- Get Task By ID ---
const getTaskById = async (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID provided.' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.status(200).json(task);

  } catch (error) {
    console.error(`!!! Error in getTaskById for ID ${taskId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve task.' });
  }
};


// --- Update Task Status ---
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID provided.' });
  }
  if (!status) {
       return res.status(400).json({ error: 'Missing required field: status is required.' });
  }

  try {
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status: status },
    });
    res.status(200).json(updatedTask);

  } catch (error) {
     if (error.code === 'P2025') {
        console.log(`Update failed: Task with ID ${taskId} not found.`);
        return res.status(404).json({ error: 'Task not found.' });
     } else {
        console.error(`!!! Error updating status for task ID ${taskId}:`, error);
        res.status(500).json({ error: 'Failed to update task status.' });
     }
  }
};


// --- Delete Task ---
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID provided.' });
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    res.status(204).send();

  } catch (error) {
     if (error.code === 'P2025') {
        console.log(`Delete failed: Task with ID ${taskId} not found.`);
        return res.status(404).json({ error: 'Task not found.' });
     } else {
        console.error(`!!! Error deleting task ID ${taskId}:`, error);
        res.status(500).json({ error: 'Failed to delete task.' });
     }
  }
};


// --- Export All Functions ---
module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskStatus,
  deleteTask,
};