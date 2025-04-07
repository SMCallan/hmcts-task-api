# HMCTS Task Management API Backend

## Project Overview

This repository contains the backend API for the HMCTS Task Management system, developed as part of the DTS Developer Technical Test. The objective is to provide a robust API for managing caseworker tasks, allowing creation, retrieval, updating, and deletion of tasks.

This API is designed to be consumed by a separate frontend application (`hmcts-task-ui`).

## Scenario

HMCTS requires a new system to help caseworkers track their tasks efficiently. This API serves as the backbone for that system, managing task data persistently.

## Features Implemented

*   **Create Task:** Add a new task with title, description (optional), status, and due date.
*   **Retrieve All Tasks:** Get a list of all existing tasks.
*   **Retrieve Task by ID:** Get the details of a single task using its unique ID.
*   **Update Task Status:** Modify the status of an existing task.
*   **Delete Task:** Remove a task from the system.
*   **Database Persistence:** Tasks are stored in a PostgreSQL database.
*   **Validation & Error Handling:** Basic validation for inputs and consistent error responses.
*   **API Testing:** Integration tests cover core API endpoint functionality.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Testing:** Jest, Supertest
*   **Middleware:** CORS (for cross-origin requests), `express.json` (for body parsing)
*   **Environment Variables:** `dotenv`

## Prerequisites

Before running this project locally, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, includes npm)
*   [Git](https://git-scm.com/)
*   A running PostgreSQL database instance. You can:
    *   Install PostgreSQL locally.
    *   Use a Docker container for PostgreSQL.
    *   Use a free cloud provider like [Railway](https://railway.app/), [ElephantSQL](https://www.elephantsql.com/), or [Render](https://render.com/).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [(https://github.com/SMCallan/hmcts-task-api)] # e.g., git clone https://github.com/your-username/hmcts-task-api.git
    cd hmcts-task-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Database Connection:**
    *   Obtain the connection URL (connection string) for your PostgreSQL database instance. It typically looks like: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`.
    *   Create a `.env` file in the root of the project directory. You can copy the example file:
        ```bash
        cp .env.example .env
        ```
        *(Note: If `.env.example` doesn't exist, create `.env` manually)*
    *   Open the `.env` file and **replace the placeholder** value for `DATABASE_URL` with your actual database connection URL:
        ```dotenv
        # .env file
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

        # Optional: Define a specific port if needed, otherwise defaults to 3001
        # PORT=3001
        ```
    *   **Important:** Ensure the `.env` file is listed in your `.gitignore` file to prevent committing sensitive credentials.

4.  **Run Database Migrations:**
    *   Prisma uses migrations to create and update your database schema based on the definition in `prisma/schema.prisma`. Run the following command to apply migrations:
        ```bash
        npx prisma migrate dev
        ```
    *   This will create the necessary `Task` table in your database.

## Running the Application (Development Mode)

*   To start the server with automatic restarts on file changes (using Nodemon):
    ```bash
    npm run dev
    ```
*   The API will typically be running at `http://localhost:3001` (or the port specified in your `.env` file).
*   You can check if the server is running by accessing the health check endpoint in your browser or using a tool like Insomnia/Postman: `GET http://localhost:3001/health` (should return `{"status":"UP"}`).

## Running Tests

*   To run the API integration tests (using Jest and Supertest):
    ```bash
    npm test
    ```
*   Tests will interact with the database specified in your `.env` file. The tests include cleanup steps (`beforeAll`, `afterAll`) to delete test data.

## API Documentation

Base URL: `/api/tasks`

---

### 1. Create Task

*   **Endpoint:** `/`
*   **Method:** `POST`
*   **Description:** Creates a new task.
*   **Request Body:** JSON object
    ```json
    {
      "title": "string (required)",
      "description": "string (optional, can be null or omitted)",
      "status": "string (required)",
      "dueDate": "string (required, ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ)"
    }
    ```
*   **Success Response:**
    *   **Code:** `201 Created`
    *   **Body:** JSON object representing the newly created task (including `id`, `createdAt`, `updatedAt`).
        ```json
        {
          "id": 1,
          "title": "Example Task",
          "description": "Details here",
          "status": "To Do",
          "dueDate": "2024-12-01T10:00:00.000Z",
          "createdAt": "2024-04-07T14:00:00.123Z",
          "updatedAt": "2024-04-07T14:00:00.123Z"
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing required fields or invalid `dueDate` format.
        *   Body: `{"error": "Missing required fields..."}` or `{"error": "Invalid date format..."}`
    *   `500 Internal Server Error`: Database error during creation.
        *   Body: `{"error": "Failed to create task."}`

---

### 2. Get All Tasks

*   **Endpoint:** `/`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all tasks, sorted by creation date (newest first).
*   **Request Body:** None
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON array of task objects. Empty array `[]` if no tasks exist.
        ```json
        [
          { "id": 2, "title": "Task Two", ... },
          { "id": 1, "title": "Task One", ... }
        ]
        ```
*   **Error Responses:**
    *   `500 Internal Server Error`: Database error during retrieval.
        *   Body: `{"error": "Failed to retrieve tasks."}`

---

### 3. Get Task By ID

*   **Endpoint:** `/:id`
*   **Method:** `GET`
*   **Description:** Retrieves a single task by its unique ID.
*   **URL Parameters:**
    *   `id` (integer, required): The ID of the task to retrieve.
*   **Request Body:** None
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON object representing the requested task.
        ```json
        { "id": 1, "title": "Task One", ... }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid ID format (not an integer).
        *   Body: `{"error": "Invalid task ID provided."}`
    *   `404 Not Found`: No task exists with the specified ID.
        *   Body: `{"error": "Task not found."}`
    *   `500 Internal Server Error`: Database error.
        *   Body: `{"error": "Failed to retrieve task."}`

---

### 4. Update Task Status

*   **Endpoint:** `/:id/status`
*   **Method:** `PATCH`
*   **Description:** Updates the status of a specific task.
*   **URL Parameters:**
    *   `id` (integer, required): The ID of the task to update.
*   **Request Body:** JSON object
    ```json
    {
      "status": "string (required)" // e.g., "In Progress", "Done"
    }
    ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON object representing the *updated* task (with new status and `updatedAt`).
        ```json
        { "id": 1, "title": "Task One", "status": "Done", ... "updatedAt": "2024-04-07T14:05:00.456Z" }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: `status` field missing in request body or invalid ID format.
        *   Body: `{"error": "Missing required field: status is required."}` or `{"error": "Invalid task ID provided."}`
    *   `404 Not Found`: No task exists with the specified ID.
        *   Body: `{"error": "Task not found."}`
    *   `500 Internal Server Error`: Database error during update.
        *   Body: `{"error": "Failed to update task status."}`

---

### 5. Delete Task

*   **Endpoint:** `/:id`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific task by its ID.
*   **URL Parameters:**
    *   `id` (integer, required): The ID of the task to delete.
*   **Request Body:** None
*   **Success Response:**
    *   **Code:** `204 No Content`
    *   **Body:** None
*   **Error Responses:**
    *   `400 Bad Request`: Invalid ID format (not an integer).
        *   Body: `{"error": "Invalid task ID provided."}`
    *   `404 Not Found`: No task exists with the specified ID.
        *   Body: `{"error": "Task not found."}`
    *   `500 Internal Server Error`: Database error during deletion.
        *   Body: `{"error": "Failed to delete task."}`

---

## Deployment

This API needs to be deployed to a hosting service (like Railway, Render, Fly.io, Heroku, AWS, etc.) so the frontend application can access it via a public URL.

When deploying, ensure the following environment variables are set on the hosting platform:

*   `DATABASE_URL`: The connection string for your *production* PostgreSQL database.
*   `PORT` (Optional): The port the hosting service expects your application to listen on (many platforms set this automatically).
*   `NODE_ENV`: Should typically be set to `production`.

**Live API Base URL:** [Link to deployed API Base URL - e.g., https://your-api-deployment.onrender.com] *(You will add this link once deployed)*

## Project Structure
```
hmcts-task-api/
├── __tests__/             # API integration tests
│   └── tasks.test.js
├── prisma/                # Prisma configuration and migrations
│   ├── migrations/        # Database migration history
│   └── schema.prisma      # Prisma schema definition (Task model)
├── src/                   # Source code
│   ├── controllers/       # Request handling logic for routes
│   │   └── taskController.js
│   ├── routes/            # API route definitions
│   │   └── taskRoutes.js
│   ├── db.js              # Prisma client initialization
│   └── server.js          # Express server setup and startup
├── .env                   # Environment variables (SECRET, ignored by Git)
├── .env.example           # Example environment variables (safe to commit)
├── .gitignore             # Files/folders ignored by Git
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Lockfile for dependencies
└── README.md              # This file
```


## Potential Future Improvements

*   User Authentication & Authorization (e.g., JWT)
*   Assigning tasks to specific users
*   More advanced filtering and sorting options for tasks
*   Input validation using a dedicated library (e.g., `express-validator` or Zod)
*   More comprehensive unit testing (e.g., testing controller logic in isolation by mocking Prisma)
*   Swagger/OpenAPI documentation generation
