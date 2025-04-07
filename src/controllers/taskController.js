// src/controllers/taskController.js
const prisma = require('../db'); // Import Prisma Client instance (ONCE at the top)

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
  try {
    const tasks = await prisma.task.findMany({
       orderBy: {
         createdAt: 'desc' // Optional: Sort newest first
       }
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
};

// --- Get Task By ID ---
const getTaskById = async (req, res) => {
  console.log("--- getTaskById Controller START ---"); // <-- Debug log
  const { id } = req.params;
  console.log("Received ID parameter:", id); // <-- Debug log

  const taskId = parseInt(id, 10);
  console.log("Parsed task ID:", taskId); // <-- Debug log

  if (isNaN(taskId)) {
      console.log("Validation failed: Invalid task ID."); // <-- Debug log
      return res.status(400).json({ error: 'Invalid task ID provided.' });
  }

  try {
    console.log(`Attempting to find task with ID: ${taskId}`); // <-- Debug log
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    // *** THE TIMEOUT MIGHT BE HAPPENING DURING THE ABOVE `await` CALL ***
    console.log("Prisma findUnique result:", task); // <-- Debug log

    if (!task) {
      console.log(`Task with ID ${taskId} not found.`); // <-- Debug log
      return res.status(404).json({ error: 'Task not found.' });
    }

    console.log(`Task found, sending response for ID: ${taskId}`); // <-- Debug log
    res.status(200).json(task);

  } catch (error) {
    // This catch block might be hit if prisma.$connect fails or times out internally
    console.error(`!!! Error in getTaskById for ID ${taskId}:`, error); // <-- Enhanced log
    res.status(500).json({ error: 'Failed to retrieve task.' });
  }
  console.log("--- getTaskById Controller END ---"); // <-- Debug log
};


// --- Update Task Status (Placeholder) ---
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expecting status in the request body

  console.log(`--- updateTaskStatus Controller START for ID: ${id}, Status: ${status} ---`); // Debug log

  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID provided.' });
  }

  // Validation: Check if status is provided
  if (!status) {
       return res.status(400).json({ error: 'Missing required field: status is required.' });
  }

  // Optional: Add validation for allowed status values (e.g., 'To Do', 'In Progress', 'Done')
  // const allowedStatuses = ['To Do', 'In Progress', 'Done'];
  // if (!allowedStatuses.includes(status)) {
  //    return res.status(400).json({ error: `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}` });
  // }


  try {
    console.log(`Attempting to update status for task ID: ${taskId} to "${status}"`); // Debug log

    // Use prisma.task.update to change the status
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status: status }, // Only update the status field
    });

    console.log("Prisma update result:", updatedTask); // Debug log
    res.status(200).json(updatedTask); // Send back the updated task

  } catch (error) {
     // Handle errors, including the case where the task doesn't exist (P2025 error code)
     if (error.code === 'P2025') { // Prisma error code for record not found during update/delete
        console.log(`Update failed: Task with ID ${taskId} not found.`);
        return res.status(404).json({ error: 'Task not found.' });
     } else {
        console.error(`!!! Error updating status for task ID ${taskId}:`, error);
        res.status(500).json({ error: 'Failed to update task status.' });
     }
  }
   console.log("--- updateTaskStatus Controller END ---"); // Debug log
};


// --- Delete Task (Placeholder) ---
const deleteTask = async (req, res) => {
  const { id } = req.params;
  console.log(`--- deleteTask Controller START for ID: ${id} ---`); // Debug log

  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID provided.' });
  }

  try {
    console.log(`Attempting to delete task with ID: ${taskId}`); // Debug log

    // Use prisma.task.delete - this will error if the task doesn't exist
    await prisma.task.delete({
      where: { id: taskId },
    });

    console.log(`Successfully deleted task with ID: ${taskId}`); // Debug log
    res.status(204).send(); // Send No Content response on successful deletion

  } catch (error) {
     // Handle errors, including the case where the task doesn't exist (P2025 error code)
     if (error.code === 'P2025') { // Prisma error code for record not found during update/delete
        console.log(`Delete failed: Task with ID ${taskId} not found.`);
        return res.status(404).json({ error: 'Task not found.' });
     } else {
        console.error(`!!! Error deleting task ID ${taskId}:`, error);
        res.status(500).json({ error: 'Failed to delete task.' });
     }
  }
  console.log("--- deleteTask Controller END ---"); // Debug log
};


// --- Export All Functions ---
module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskStatus, // Added placeholder
  deleteTask,       // Added placeholder
};