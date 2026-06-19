# TaskPulse - Mini Project Management Portal

A premium, full-stack project task management portal built with **React**, **Node.js + Express**, and **MongoDB**. 
This portal features user registration, JWT authentication, task statistics, task searching/filtering, pagination, and a toggleable dark mode theme.

---

## Technical Stack
- **Frontend**: React.js (Vite, React Router Dom, Axios, Lucide Icons, Vanilla CSS with custom glassmorphism styling)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (using Mongoose schemas)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Testing**: Jest + Supertest (API Integration Testing)

---

## Features
- **Secure Authentication**: User sign up and login with passwords hashed using bcrypt, issuing signed JWTs.
- **Protected Session Handling**: Route protection ensures users can only access their personal dashboard and task lists.
- **Dynamic Task Dashboard**:
  - Task creation with validations (minimum 20 characters description check).
  - Quick-action controls to cycle task statuses (`Pending` ➔ `In Progress` ➔ `Completed`).
  - Task search bar with real-time text matching.
  - Filtering by status (All, Pending, In Progress, Completed).
  - Sorting (Newest First, Oldest First, Alphabetical).
  - Pagination (sets limit of 6 tasks per page).
  - Real-time dashboard statistics.
- **Interactive Dark Mode**: Responsive UI design with an immersive Dark Mode toggle.

---

## Database Design

### Users Collection (`users`)
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated user identifier |
| `name` | String | User's full name (required) |
| `email` | String | Unique email address (required, regex validated) |
| `password` | String | Hashed password string (required, minimum length: 6) |
| `created_at` | Date | Creation timestamp |

### Tasks Collection (`tasks`)
| Field | Type | Description |
|---|---|---|
| `_id`/`id` | ObjectId | Task identifier (serialized to `id` in JSON output) |
| `user_id` | ObjectId | Foreign key reference to the owner in `users` |
| `title` | String | Task title (required) |
| `description` | String | Description text (required, minimum length: 20) |
| `status` | String | Enum: `Pending`, `In Progress`, `Completed` (default: `Pending`) |
| `created_at` | Date | Task creation timestamp |

---

## API Documentation

All endpoints are prefixed with `/api`. Task endpoints require a valid JWT token sent in the headers as: `Authorization: Bearer <your_jwt_token>`

### Authentication Endpoints
- **POST `/api/auth/register`**
  - Register a new user account.
  - Body: `{ "name": "...", "email": "...", "password": "..." }`
- **POST `/api/auth/login`**
  - Sign in and receive a session token.
  - Body: `{ "email": "...", "password": "..." }`
- **GET `/api/auth/profile`**
  - Retrieve authenticated user's profile details. *(Protected)*

### Task Endpoints (All Protected)
- **GET `/api/tasks`**
  - Fetch all tasks for the logged-in user.
  - Query parameters:
    - `search` (String): Search keyword matching titles or descriptions.
    - `status` (String): Filter status (`Pending`, `In Progress`, `Completed`).
    - `sort` (String): Sort order (`newest`, `oldest`, `alphabetical`).
    - `page` (Number): Page index (default: `1`).
  - Response includes: `tasks` array, `pagination` metrics, and user task `stats` summary.
- **POST `/api/tasks`**
  - Create a new task.
  - Body: `{ "title": "...", "description": "...", "status": "..." }`
- **PUT `/api/tasks/:id`**
  - Update task details (title, description, status).
- **DELETE `/api/tasks/:id`**
  - Remove a task permanently.

---

## Setup Steps

### Prerequisites
Make sure **Node.js** (v18+ recommended) and **MongoDB** are installed and running on your local machine.

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Mini Project Management Portal"
```

### 2. Configure Environment variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project_management
JWT_SECRET=supersecretjwtkeyforprojectmanagementportal123!
```

### 3. Install & Run Backend
Navigate to the `backend` directory, install packages, and start the API:
```bash
cd backend
npm install
npm start
```
*To run tests:* `npm test`

### 4. Install & Run Frontend
Open a new terminal window, navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser to view the application.

---

## Assumptions Made
1. **User Scoping**: In accordance with JWT and login requirements, task items are scoped strictly to the authenticated user. A user cannot view, edit, or delete another user's tasks.
2. **Task Deletion Warning**: The application uses a standard window confirmation alert before deleting tasks to prevent accidental actions.
3. **Database Configuration**: Standard local MongoDB connection is set as the default database connection.
