// __tests__/tasks.test.js
const request = require('supertest'); // For making API requests
const { app, server } = require('../src/server'); // Import Express app and server instance
const prisma = require('../src/db'); // Import Prisma client for DB interactions

// --- Test Suite for Task API Endpoints ---
describe('Task API Endpoints', () => {

    // Runs ONCE before any tests in this suite start
    beforeAll(async () => {
        // Clean the Task table before starting the test run
        // Ensures tests start with a known state (empty table)
        await prisma.task.deleteMany({});
    });

    // Runs ONCE after ALL tests in this suite have finished
    afterAll(async () => {
        // Optional: Clean up tasks created during tests
        await prisma.task.deleteMany({});
        // Disconnect Prisma client
        await prisma.$disconnect();
        // Close the server explicitly to allow Jest to exit cleanly
        await new Promise(resolve => server.close(resolve));
    });

    // --- Test Cases ---

    // Test: GET /api/tasks when no tasks exist
    it('should return an empty array when getting all tasks initially', async () => {
        const response = await request(app).get('/api/tasks');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(0);
    });

    // Test: POST /api/tasks (Create Task)
    describe('POST /api/tasks', () => {
        const newTaskData = {
            title: "Test Task from Jest",
            description: "Testing POST endpoint",
            status: "To Do",
            dueDate: "2024-12-31T23:59:59.000Z" // Use ISO format
        };
        let createdTaskId; // To store the ID for potential cleanup if needed

        it('should create a new task and return it', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send(newTaskData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            createdTaskId = response.body.id; // Store the ID
            expect(response.body.title).toBe(newTaskData.title);
            expect(response.body.description).toBe(newTaskData.description);
            expect(response.body.status).toBe(newTaskData.status);
            expect(response.body.dueDate).toBe(newTaskData.dueDate);
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');

            // Optional: Verify it's actually in the DB
            const taskInDb = await prisma.task.findUnique({ where: { id: response.body.id } });
            expect(taskInDb).toBeTruthy();
            expect(taskInDb.title).toBe(newTaskData.title);
        });

        it('should return 400 if required fields are missing (e.g., title)', async () => {
            // Create data missing the 'title'
            const incompleteData = {
                 description: "Missing title",
                 status: "To Do",
                 dueDate: "2024-12-31T23:59:59.000Z"
            };
            const response = await request(app)
                .post('/api/tasks')
                .send(incompleteData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Missing required fields');
        });

         it('should return 400 if date format is invalid', async () => {
            const invalidDateData = { ...newTaskData, dueDate: "31st December 2024" }; // Invalid format
            const response = await request(app)
                .post('/api/tasks')
                .send(invalidDateData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid date format');
        });

        // Optional cleanup specific to this describe block if needed,
        // but the main afterAll should handle it.
        // afterAll(async () => {
        //    if(createdTaskId) {
        //        await prisma.task.delete({ where: { id: createdTaskId } }).catch(e => {}); // Ignore errors if already deleted
        //    }
        // });
    });


    // Test: Interactions involving a specific created task (GET by ID, PATCH, DELETE)
    describe('Operations on a specific task', () => {
        let createdTask; // Variable to hold the task created for these tests

        // Create a task before running tests in this block
        beforeAll(async () => {
             // Ensure clean slate just before this block (optional redundancy)
             await prisma.task.deleteMany({});
             createdTask = await prisma.task.create({
                data: {
                    title: "Task for GET/PATCH/DELETE",
                    description: "A specific task instance",
                    status: "Initial Status",
                    dueDate: new Date("2025-01-01T12:00:00.000Z")
                }
             });
             // Make sure createdTask is defined
             if (!createdTask || !createdTask.id) {
                throw new Error("Failed to create task in beforeAll for specific operations.");
             }
        });

        // Test: GET /api/tasks/:id (Get Task By ID)
        it('should retrieve a specific task by its ID', async () => {
            const response = await request(app).get(`/api/tasks/${createdTask.id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(createdTask.id);
            expect(response.body.title).toBe(createdTask.title);
            expect(response.body.description).toBe(createdTask.description);
        });

        it('should return 404 when getting a task with a non-existent ID', async () => {
            const nonExistentId = createdTask.id + 100; // Assumes this ID won't exist
            const response = await request(app).get(`/api/tasks/${nonExistentId}`);
            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Task not found.');
        });

         it('should return 400 when getting a task with an invalid ID format', async () => {
            const invalidId = 'not-a-number';
            const response = await request(app).get(`/api/tasks/${invalidId}`);
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Invalid task ID provided.');
        });


        // Test: PATCH /api/tasks/:id/status (Update Status)
        it('should update the status of a specific task', async () => {
            const newStatus = "Updated Status";
            const response = await request(app)
                .patch(`/api/tasks/${createdTask.id}/status`)
                .send({ status: newStatus });

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toBe(createdTask.id);
            expect(response.body.status).toBe(newStatus);
            // Check if updatedAt time changed
            expect(response.body.updatedAt).not.toBe(createdTask.updatedAt.toISOString());

            // Verify in DB
            const taskInDb = await prisma.task.findUnique({ where: { id: createdTask.id } });
            expect(taskInDb.status).toBe(newStatus);

            // Update the local 'createdTask' object's status for subsequent tests if needed
            createdTask.status = newStatus;
        });

        it('should return 404 when updating a non-existent task', async () => {
             const nonExistentId = createdTask.id + 100;
             const response = await request(app)
                .patch(`/api/tasks/${nonExistentId}/status`)
                .send({ status: "Trying update" });
             expect(response.statusCode).toBe(404);
             expect(response.body.error).toBe('Task not found.');
        });

         it('should return 400 when updating without a status field', async () => {
             const response = await request(app)
                .patch(`/api/tasks/${createdTask.id}/status`)
                .send({ title: "trying to send wrong field" }); // Sending wrong/no field
             expect(response.statusCode).toBe(400);
             expect(response.body.error).toContain('Missing required field: status');
        });


        // Test: DELETE /api/tasks/:id (Delete Task)
        it('should delete a specific task', async () => {
            const response = await request(app).delete(`/api/tasks/${createdTask.id}`);

            expect(response.statusCode).toBe(204); // Check for 204 No Content

            // Verify it's gone from the DB
            const taskInDb = await prisma.task.findUnique({ where: { id: createdTask.id } });
            expect(taskInDb).toBeNull();
        });

        it('should return 404 when deleting a task that was already deleted', async () => {
            // Note: The previous test already deleted createdTask.id
            const response = await request(app).delete(`/api/tasks/${createdTask.id}`);
            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Task not found.');
        });

         it('should return 404 when deleting a non-existent task ID initially', async () => {
            const nonExistentId = createdTask.id + 100; // Use an ID assumed not to exist
            const response = await request(app).delete(`/api/tasks/${nonExistentId}`);
            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Task not found.');
        });

        // No afterAll needed here specifically, the main one cleans up.
    });

}); // End of main describe block