# Jira-Style Issue Tracker & Project Management

A production-grade MERN stack project management and issue-tracking platform inspired by modern engineering workflows.

## Features

- **Project Management**: Create and manage multiple projects with custom keys (`WEB`, `MOB`, `API`), descriptions, and lead assignees.
- **Sequential Issue Keys**: Backend-generated issue keys (e.g. `WEB-1`, `WEB-2`) using atomic project counters.
- **Issue Types & Priorities**: Supports `Task`, `Bug`, `Story`, and `Epic` with 5 priority levels (`Lowest`, `Low`, `Medium`, `High`, `Highest`) and Lucide icons.
- **Interactive Kanban Board**: 4-column workflow (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`) with native HTML5 drag-and-drop, optimistic UI updates, and backend persistence.
- **Backlog & Sprint Planning**: Product Backlog management, create Sprints, move issues into sprints, start sprints, and mark sprints complete.
- **Issue Details View**: Live in-place editing for summary, description, status, priority, type, sprint, and assignee.
- **Real Comments Thread**: Commenting system with author, timestamps, and delete controls persisted in MongoDB.
- **Global Search**: Search bar in navigation across issue keys (`WEB-1`), issue titles, and project names.
- **JWT Authentication**: Secure user registration, login, and session persistence with password hashing (`bcryptjs`).
- **Responsive Navigation**: Desktop sticky sidebar + mobile drawer, project-scoped navigation, and global **+ Create** issue modal.
- **Legal Pages & Custom Branding**: Functional `/privacy-policy` and `/terms` pages, custom SVG favicon, zero builder/AI branding.

---

## Technology Stack

| Layer          | Technology                                   |
|----------------|----------------------------------------------|
| Frontend       | React, Vite, Tailwind CSS, Axios             |
| Routing        | React Router                                 |
| Authentication | JWT, bcryptjs, React Auth Context            |
| Icons          | lucide-react                                 |
| Backend        | Node.js, Express.js                          |
| Database       | MongoDB (Atlas or Local) + Mongoose          |
| Config         | dotenv                                       |

---

## Project Structure

```text
task-manager/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── issueController.js
│   │   ├── sprintController.js
│   │   ├── commentController.js
│   │   ├── searchController.js
│   │   ├── migrationController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Issue.js
│   │   ├── Sprint.js
│   │   ├── Comment.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── sprintRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── migrationRoutes.js
│   │   └── taskRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppNavbar.jsx
│   │   │   │   └── AppSidebar.jsx
│   │   │   ├── IssueBadge.jsx
│   │   │   ├── ProjectModal.jsx
│   │   │   ├── CreateIssueModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectOverview.jsx
│   │   │   ├── ProjectBoard.jsx
│   │   │   ├── ProjectBacklog.jsx
│   │   │   ├── ProjectIssues.jsx
│   │   │   ├── Sprints.jsx
│   │   │   ├── IssuePage.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── Terms.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── projectService.js
│   │   │   ├── issueService.js
│   │   │   ├── sprintService.js
│   │   │   ├── commentService.js
│   │   │   ├── searchService.js
│   │   │   └── taskService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskmanager
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

Start backend:

```bash
node server.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the active port reported by Vite) in your browser.

---

## API Endpoints

### Projects
- `GET /api/projects` - List all projects with issue counts
- `GET /api/projects/:id` - Project details with real completion metrics
- `POST /api/projects` - Create project (`name`, `key`, `description`, `lead`)
- `PUT /api/projects/:id` - Update project details
- `DELETE /api/projects/:id` - Delete project, issues, sprints, and comments

### Issues
- `GET /api/issues` - Filter issues by project, sprint, status, priority, type, search
- `GET /api/issues/:id` - Single issue with full comments thread (supports `_id` or `WEB-1` key)
- `POST /api/issues` - Create issue (atomic project-key assignment)
- `PUT /api/issues/:id` - In-place update or drag-and-drop status update
- `DELETE /api/issues/:id` - Delete issue and comments

### Sprints
- `GET /api/sprints` - List sprints by project
- `POST /api/sprints` - Create new sprint
- `PUT /api/sprints/:id` - Update sprint (e.g. status `ACTIVE` / `COMPLETED`)
- `DELETE /api/sprints/:id` - Delete sprint and return issues to backlog

### Comments
- `GET /api/issues/:id/comments` - List comments for issue
- `POST /api/issues/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Search & Migration
- `GET /api/search?q=...` - Global search across projects and issues
- `POST /api/migration/migrate-tasks` - Safely migrate legacy tasks to Jira issues

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current session
