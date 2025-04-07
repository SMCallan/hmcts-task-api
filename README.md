# HMCTS Task Management API Backend

## Project Overview

This repository contains the backend API for the HMCTS Task Management system, developed as part of the DTS Developer Technical Test. The objective is to provide a robust API for managing caseworker tasks, allowing creation, retrieval, updating, and deletion of tasks.

This API is designed to be consumed by a separate frontend application (`hmcts-task-ui`).

## Scenario

HMCTS requires a new system to help caseworkers track their tasks efficiently. This API serves as the backbone for that system, managing task data persistently.

## Live Application Links

*   **Live Frontend Demo:** **[https://fluffy-paprenjak-e29c80.netlify.app](https://fluffy-paprenjak-e29c80.netlify.app)**
*   **Live API Base URL:** **[https://hmcts-task-api-production.up.railway.app](https://hmcts-task-api-production.up.railway.app)**
    *   *(e.g., Health Check: `GET /health`, Task Endpoint: `GET /api/tasks`)*

## Frontend Repository

The corresponding frontend UI for this project can be found here:

*   **Frontend UI:** **[https://github.com/SMCallan/hmcts-task-ui](https://github.com/SMCallan/hmcts-task-ui)**

## Features Implemented

*   **Create Task:** Add a new task with title, description (optional), status, and due date.
*   **Retrieve All Tasks:** Get a list of all existing tasks.
*   **Retrieve Task by ID:** Get the details of a single task using its unique ID.
*   **Update Task Status:** Modify the status of an existing task.
*   **Delete Task:** Remove a task from the system.
*   **Database Persistence:** Tasks are stored in a PostgreSQL database.
*   **Validation & Error Handling:** Basic validation for inputs and consistent error responses.
*   **API Testing:** Integration tests cover core API endpoint functionality using Jest & Supertest.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Testing:** Jest, Supertest
*   **Middleware:** CORS (for cross-origin requests), `express.json` (for body parsing)
*   **Environment Variables:** `dotenv` (for local development)

## Prerequisites

Before running this project locally, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, includes npm)
*   [Git](https://git-scm.com/)
*   A running PostgreSQL database instance (local, Docker, or cloud provider like Railway/ElephantSQL).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SMCallan/hmcts-task-api.git
    cd hmcts-task-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Database Connection:**
    *   Obtain the connection URL for your PostgreSQL database.
    *   Create a `.env` file in the root directory (or copy `.env.example` if it exists: `cp .env.example .env`).
    *   Edit `.env` and set the `DATABASE_URL`:
        ```dotenv
        # .env file
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
        # PORT=3001 # Optional: Specify local port if needed
        ```
    *   Ensure `.env` is in `.gitignore`.

4.  **Run Database Migrations:**
    *   Apply migrations to set up the `Task` table in your database:
        ```bash
        npx prisma migrate dev
        ```

## Running the Application (Development Mode)

*   Start the server with Nodemon for auto-restarts:
    ```bash
    npm run dev
    ```
*   The API will typically run at `http://localhost:3001`.
*   Test the health check: `GET http://localhost:3001/health`.

## Running Tests

*   Run integration tests (ensure server is stopped first):
    ```bash
    npm test
    ```
*   Tests use the `DATABASE_URL` from your `.env` file and include cleanup steps.

## API Documentation

Base Path: `/api/tasks` (relative to the server's base URL)

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
    *   **Body:** JSON object of the created task.
*   **Error Responses:**
    *   `400 Bad Request`: Missing fields or invalid date format.
    *   `500 Internal Server Error`: Database error.

---

### 2. Get All Tasks

*   **Endpoint:** `/`
*   **Method:** `GET`
*   **Description:** Retrieves all tasks (newest first).
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON array of task objects (`[]` if none).
*   **Error Responses:**
    *   `500 Internal Server Error`: Database error.

---

### 3. Get Task By ID

*   **Endpoint:** `/:id`
*   **Method:** `GET`
*   **Description:** Retrieves a single task by ID.
*   **URL Parameters:** `id` (integer, required).
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON object of the requested task.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid ID format.
    *   `404 Not Found`: Task with ID not found.
    *   `500 Internal Server Error`: Database error.

---

### 4. Update Task Status

*   **Endpoint:** `/:id/status`
*   **Method:** `PATCH`
*   **Description:** Updates the status of a specific task.
*   **URL Parameters:** `id` (integer, required).
*   **Request Body:** JSON object
    ```json
    { "status": "string (required)" }
    ```
*   **Success Response:**
    *   **Code:** `200 OK`
    *   **Body:** JSON object of the updated task.
*   **Error Responses:**
    *   `400 Bad Request`: Missing status or invalid ID format.
    *   `404 Not Found`: Task with ID not found.
    *   `500 Internal Server Error`: Database error.

---

### 5. Delete Task

*   **Endpoint:** `/:id`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific task by ID.
*   **URL Parameters:** `id` (integer, required).
*   **Success Response:**
    *   **Code:** `204 No Content`
    *   **Body:** None
*   **Error Responses:**
    *   `400 Bad Request`: Invalid ID format.
    *   `404 Not Found`: Task with ID not found.
    *   `500 Internal Server Error`: Database error.

---

## Deployment

This API is deployed on **Railway**.

*   Deployment is triggered automatically via pushes to the `main` branch on GitHub.
*   Required environment variables (`DATABASE_URL`, `NODE_ENV=production`) are configured in the Railway service settings.
*   Database migrations (`npx prisma migrate deploy`) must be run against the production database (initially done via a temporary modification to the `npm start` script, now reverted).

## Project Structure
```
hmcts-task-api/
├── tests/ # API integration tests
│ └── tasks.test.js
├── prisma/ # Prisma configuration and migrations
│ ├── migrations/ # Database migration history
│ └── schema.prisma # Prisma schema definition (Task model)
├── src/ # Source code
│ ├── controllers/ # Request handling logic for routes
│ │ └── taskController.js
│ ├── routes/ # API route definitions
│ │ └── taskRoutes.js
│ ├── db.js # Prisma client initialization
│ └── server.js # Express server setup and startup
├── .env # Local environment variables (SECRET, ignored by Git)
├── .env.example # Example environment variables (safe to commit)
├── .gitignore # Files/folders ignored by Git
├── package.json # Project dependencies and scripts
├── package-lock.json # Lockfile for dependencies
└── README.md # This file
```
## Potential Future Improvements

*   User Authentication & Authorization (e.g., JWT)
*   Assigning tasks to specific users
*   More advanced filtering and sorting options for tasks
*   Input validation using a dedicated library (e.g., `express-validator` or Zod)
*   More comprehensive unit testing (e.g., testing controller logic in isolation by mocking Prisma)
*   Swagger/OpenAPI documentation generation
