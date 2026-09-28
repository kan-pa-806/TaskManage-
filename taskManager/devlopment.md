# MERN Task Manager

## Development Specification for Antigravity Agent

---

## 1. Project Objective

Build a professional, production-ready **Task Manager web application** using the MERN stack.

The application must allow users to:

* Create tasks
* View tasks
* Edit tasks
* Change task status
* Change task priority
* Delete tasks
* Filter tasks
* View task details
* Use the application responsively on desktop, tablet, and mobile

The application must be functional, clean, maintainable, and visually professional.

Do not build a marketing landing page. The primary experience must be the actual Task Manager dashboard.

---

# 2. Technology Stack

## Backend

Use:

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* dotenv
* cors

Use CommonJS or ES Modules consistently throughout the backend. Do not mix module systems.

## Frontend

Use:

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* lucide-react

Do not introduce additional libraries unless they are genuinely required.

---

# 3. Required Project Structure

Create the following structure:

```text
task-manager/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── taskController.js
│   │
│   ├── models/
│   │   └── Task.js
│   │
│   ├── routes/
│   │   └── taskRoutes.js
│   │
│   ├── middleware/
│   │   └── errorMiddleware.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── DeleteTaskModal.jsx
│   │   │   └── EmptyState.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── Terms.jsx
│   │   │
│   │   ├── services/
│   │   │   └── taskService.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── README.md
└── DEVELOPMENT.md
```

Do not unnecessarily create additional directories or files.

---

# 4. Backend Architecture

The backend must follow this flow:

```text
Request
   ↓
Route
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB Atlas
   ↓
Response
```

Keep database logic out of route files.

Keep business logic out of `server.js`.

---

# 5. MongoDB Configuration

Create:

```text
backend/config/db.js
```

Use Mongoose to connect to MongoDB Atlas.

Environment variable:

```env
MONGODB_URI=your_mongodb_connection_string
```

Never hard-code the MongoDB connection string.

The application should clearly log whether the database connection succeeded or failed.

---

# 6. Task Model

Create:

```text
backend/models/Task.js
```

Task schema:

```js
{
  title: String,
  description: String,
  status: String,
  priority: String,
  createdAt: Date
}
```

Validation requirements:

### title

* Required
* Trim whitespace
* Maximum reasonable length
* Cannot be empty

### description

* Optional
* Trim whitespace
* Maximum reasonable length

### status

Allowed values:

```text
Pending
In Progress
Completed
```

Default:

```text
Pending
```

### priority

Allowed values:

```text
Low
Medium
High
```

Default:

```text
Medium
```

### createdAt

Automatically generated using Mongoose timestamps.

Do not manually request `createdAt` from the frontend when creating a task.

---

# 7. REST API

Implement:

## Create Task

```http
POST /api/tasks
```

Request:

```json
{
  "title": "Learn React",
  "description": "Complete React fundamentals",
  "status": "Pending",
  "priority": "High"
}
```

Response should contain the created task.

HTTP status:

```text
201 Created
```

---

## Get Tasks

```http
GET /api/tasks
```

Return all tasks.

Newest tasks should appear first.

HTTP status:

```text
200 OK
```

---

## Get Single Task

Also implement:

```http
GET /api/tasks/:id
```

Even though the initial specification focuses on CRUD operations, this endpoint makes the backend more complete.

---

## Update Task

```http
PUT /api/tasks/:id
```

Allow updating:

* title
* description
* status
* priority

Return the updated task.

HTTP status:

```text
200 OK
```

---

## Delete Task

```http
DELETE /api/tasks/:id
```

Delete the specified task.

HTTP status:

```text
200 OK
```

Return a clear JSON response.

---

# 8. API Error Handling

Implement centralized error handling.

Use appropriate HTTP status codes:

```text
400 Bad Request
404 Not Found
500 Internal Server Error
```

Example:

```json
{
  "success": false,
  "message": "Task not found"
}
```

Do not expose raw MongoDB errors or stack traces to production users.

---

# 9. CORS

Configure CORS properly.

Development frontend:

```text
http://localhost:5173
```

Production frontend:

```text
https://yourdomain.com
```

Use an environment variable:

```env
CLIENT_URL=http://localhost:5173
```

Do not use unrestricted CORS such as:

```js
cors()
```

for the production configuration.

---

# 10. Backend Environment Variables

Create:

```text
backend/.env.example
```

Containing:

```env
PORT=5000
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```

Never commit the real `.env` file.

Add `.env` to `.gitignore`.

---

# 11. Frontend API Configuration

Create:

```text
frontend/.env.example
```

with:

```env
VITE_API_URL=http://localhost:5000/api
```

Production example:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Use Axios through:

```text
src/services/taskService.js
```

Do not scatter Axios calls throughout every component.

---

# 12. Frontend Application

The main application route:

```text
/
```

must display the Task Manager Dashboard.

Additional routes:

```text
/privacy-policy
/terms
```

Use React Router.

Unknown routes should display a simple not-found state rather than a broken page.

---

# 13. Dashboard

The Dashboard is the main application screen.

It should contain:

```text
Sidebar
Navbar
Task controls
Task list
Task cards
```

The dashboard should feel like a real productivity application.

Do not create a traditional marketing hero section.

---

# 14. Sidebar

Desktop sidebar should contain:

```text
Task Manager

Dashboard

Tasks
  All
  Pending
  In Progress
  Completed

Settings
  Privacy Policy
  Terms
```

Only include navigation items that actually work.

Do not add fake sections.

Do not add fake statistics.

Do not add fake account information.

---

# 15. Navbar

Navbar should contain:

```text
Task Manager
Page title
Create Task button
```

Use a Lucide icon for the create action if appropriate.

Do not use emoji icons.

Do not create unnecessary notification bells, fake profile avatars, fake user counters, or decorative controls.

---

# 16. Task Creation

Clicking:

```text
Create Task
```

should open a task form.

Fields:

```text
Title
Description
Status
Priority
```

Status options:

```text
Pending
In Progress
Completed
```

Priority options:

```text
Low
Medium
High
```

The form must validate required fields.

Display useful validation messages.

On successful creation:

1. Send POST request.
2. Update the UI.
3. Close the form.
4. Show a small success message.
5. Do not reload the entire browser page.

---

# 17. Task Card

Each TaskCard should display:

```text
Task title
Description
Status
Priority
Created date
Edit action
Delete action
```

Use Lucide React icons for actions.

Example actions:

```text
Edit
Delete
```

Do not use emoji characters as icons.

Keep the card compact and functional.

---

# 18. Edit Task

Clicking Edit should allow modification of:

```text
Title
Description
Status
Priority
```

Send:

```http
PUT /api/tasks/:id
```

After success:

* Update the UI immediately
* Close the form/modal
* Show a success message

Do not reload the browser.

---

# 19. Delete Task

Clicking Delete should open a confirmation dialog.

Example:

```text
Delete task?

Are you sure you want to delete
"Complete React project"?

Cancel
Delete
```

The delete action should call:

```http
DELETE /api/tasks/:id
```

After successful deletion:

* Remove task from UI
* Close dialog
* Show confirmation message

Do not reload the page.

---

# 20. Filtering

Implement task filtering.

Available filters:

```text
All
Pending
In Progress
Completed
```

Filtering should use actual task state.

Do not display fake task counts.

Optional priority filtering may be implemented:

```text
All priorities
Low
Medium
High
```

---

# 21. Empty State

When there are no tasks, display a useful empty state.

Example:

```text
No tasks found

Create a task to start managing your work.

Create Task
```

Do not use stock images or decorative AI-generated illustrations.

---

# 22. Loading State

While tasks are being fetched:

```text
Loading tasks...
```

Use a simple loading indicator.

Do not create excessive animations.

---

# 23. Error State

If the API fails:

```text
Unable to load tasks.

Try again
```

The Retry action should actually retry the API request.

---

# 24. Success Messages

Use small functional notifications for operations such as:

```text
Task created successfully.
Task updated successfully.
Task deleted successfully.
```

Do not use large decorative notification animations.

---

# 25. Responsive Design

The application must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

On mobile:

* Sidebar should collapse into a mobile navigation mechanism.
* Task cards should fit the viewport.
* Forms should use full available width.
* Buttons should remain accessible.
* No horizontal scrolling should be required.

---

# 26. Design System

Use a minimalist professional design.

### Typography

Use a clean system font stack.

Example:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Do not use decorative fonts.

### Borders

Use subtle borders.

### Border radius

Use:

```text
rounded-md
rounded-lg
```

Maximum.

Do not use excessive rounded cards.

### Buttons

Buttons should have normal rectangular proportions.

Do not make every button pill-shaped.

### Shadows

Use subtle shadows only where they improve hierarchy.

---

# 27. Strict Visual Restrictions

The following are completely prohibited:

```text
NO purple gradients
NO fake reviews
NO fake testimonials
NO fake customer logos
NO fake customer counts
NO fake user counts
NO fake metrics
NO fake revenue numbers
NO fake productivity statistics
NO pill-shaped buttons
NO emoji icons
NO unnecessary stock photos
NO AI-generated decorative photos
NO generic hero illustrations
NO vague hero copy
NO "Revolutionize your productivity" type copy
NO "Powered by AI" marketing language
NO fake dashboard data
NO cursor-following animations
NO complex scroll animations
NO parallax effects
NO excessive hover animations
NO animated backgrounds
NO excessive glassmorphism
NO unnecessary gradients
NO third-party builder badges
NO "Made with AI" labels
NO builder branding
NO fake notifications
NO fake activity feeds
NO fake user avatars
NO fake online indicators
NO fake counters
NO lorem ipsum
```

Do not add any of these even if they are commonly used in generated website templates.

---

# 28. No AI Slop Design

The website must look like a deliberately designed software product, not an AI-generated landing page.

Avoid:

```text
Huge headline
Huge gradient background
Three floating cards
Random dashboard screenshots
Fake statistics
Fake testimonials
Decorative blobs
Floating glass panels
Excessive rounded elements
Random illustrations
AI-generated people
Generic startup copy
```

The interface should prioritize actual functionality.

---

# 29. Icons

Use:

```text
lucide-react
```

Examples:

```text
Plus
Edit
Trash2
Check
Clock
Circle
Menu
X
Filter
```

Do not use:

```text
😀
🔥
🚀
✅
📋
```

as interface icons.

---

# 30. Legal Pages

Create:

```text
/privacy-policy
/terms
```

The pages must contain readable, straightforward legal-style content.

Do not invent claims such as:

```text
GDPR certified
SOC 2 certified
ISO certified
100% secure
```

unless the project actually has those certifications.

These pages should be functional and accessible through the application navigation.

---

# 31. Favicon

Create a custom favicon:

```text
frontend/public/favicon.ico
```

Update:

```text
frontend/index.html
```

so the favicon is correctly referenced.

Do not use a default Vite favicon.

Do not use an unrelated stock icon.

The favicon should visually relate to the Task Manager application.

---

# 32. Robots.txt

Create:

```text
frontend/public/robots.txt
```

Use a simple production configuration.

Example:

```text
User-agent: *
Allow: /
```

---

# 33. Remove Third-Party Branding

The final application must not contain:

```text
Made with AI
Made with Lovable
Made with Bolt
Made with Antigravity
Vite branding
Template branding
Builder badges
Third-party watermarks
```

Do not add any third-party branding to the visible application UI.

---

# 34. Custom Domain

The application must be deployment-ready for a custom domain.

Target architecture:

```text
https://yourdomain.com
        |
        v
React frontend

https://api.yourdomain.com
        |
        v
Node/Express backend
        |
        v
MongoDB Atlas
```

Do not hard-code the domain into application logic.

Use environment variables.

The README must explain where the production frontend and backend URLs should be configured.

DNS records must follow the hosting provider's current instructions.

Do not assume a particular A record or CNAME target without verifying the hosting provider.

---

# 35. Production Security

Implement basic production-safe practices:

* Environment variables for secrets
* CORS restrictions
* Input validation
* Proper HTTP status codes
* No database credentials in frontend code
* No API secrets in frontend code
* No stack traces in production responses
* `.env` excluded from Git

Do not implement authentication unless explicitly requested later.

Do not create fake login functionality.

---

# 36. Git Configuration

Create appropriate `.gitignore` files.

Backend should ignore:

```text
node_modules/
.env
```

Frontend should ignore:

```text
node_modules/
dist/
.env
```

Do not commit:

```text
node_modules
.env
database credentials
API secrets
build artifacts
```

---

# 37. README

Create a complete `README.md`.

Include:

```text
Project overview
Features
Technology stack
Project structure
Prerequisites
Installation
Backend setup
Frontend setup
Environment variables
Running locally
API endpoints
MongoDB Atlas setup
Production deployment
Custom domain configuration
Troubleshooting
```

Include commands such as:

```bash
npm install
npm run dev
npm start
```

Use the actual scripts defined in package.json.

Do not document commands that do not exist.

---

# 38. Backend Package Scripts

Provide useful scripts.

Example:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Install `nodemon` as a development dependency if using the `dev` script.

---

# 39. Frontend Package Scripts

Use the standard Vite scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

# 40. Development Requirements

Before considering the project complete, verify:

### Backend

```text
MongoDB connection works
POST /api/tasks works
GET /api/tasks works
GET /api/tasks/:id works
PUT /api/tasks/:id works
DELETE /api/tasks/:id works
Invalid task IDs are handled
Missing tasks return 404
Invalid input returns 400
Server errors return 500
```

### Frontend

```text
Dashboard loads
Tasks are fetched
Tasks can be created
Tasks can be edited
Tasks can be deleted
Status can be changed
Priority can be changed
Filtering works
Loading state works
Empty state works
Error state works
Responsive layout works
Privacy Policy route works
Terms route works
Favicon works
```

---

# 41. Final Quality Check

Before finishing, inspect the complete application.

Check for:

```text
Broken imports
Unused imports
Console errors
Network errors
Incorrect API URLs
Missing environment variables
Responsive layout problems
Overflow
Broken routes
Broken buttons
Broken forms
Incorrect HTTP methods
Incorrect status codes
Missing favicon
Vite branding
AI/builder branding
Fake content
Placeholder text
Lorem ipsum
Emoji icons
Excessive animations
Purple gradients
Pill-shaped buttons
Fake metrics
Fake testimonials
```

Run the frontend production build:

```bash
npm run build
```

Fix all build errors.

Run the backend and verify the API manually.

---

# 42. Implementation Principle

Do not optimize for visual complexity.

Optimize for:

```text
Functionality
Clarity
Maintainability
Responsive design
Real application state
Correct API behavior
Production readiness
```

Every UI element must have a purpose.

Every displayed metric must come from real application data.

Every button must perform a real action.

Every navigation item must lead somewhere meaningful.

Do not create UI merely to make the page look fuller.

---

# 43. Final Acceptance Criteria

The project is considered complete only when:

1. The MERN application runs locally.
2. MongoDB Atlas stores real tasks.
3. Complete task CRUD works.
4. React communicates with Express through Axios.
5. Filtering works using actual task data.
6. Loading, empty, error, success, and delete states work.
7. The UI is responsive.
8. `/privacy-policy` works.
9. `/terms` works.
10. Custom favicon is installed.
11. Default Vite branding is removed.
12. Third-party builder/AI badges are absent.
13. No fake content exists.
14. No prohibited visual patterns exist.
15. Environment variables are correctly separated.
16. Production build succeeds.
17. Custom-domain deployment configuration is documented.
18. README contains complete setup instructions.

---

# 44. Important Agent Instruction

Build the application incrementally.

Do not generate a fake frontend first and leave the backend disconnected.

Implement the system in this order:

```text
1. Project setup
2. Backend configuration
3. MongoDB connection
4. Task model
5. Controllers
6. Routes
7. Error handling
8. API testing
9. React/Vite setup
10. Tailwind setup
11. Axios/API service
12. Dashboard
13. Task list
14. Task creation
15. Task editing
16. Task deletion
17. Filtering
18. Loading/error/empty states
19. Responsive navigation
20. Privacy Policy
21. Terms
22. Favicon
23. Production configuration
24. Final testing
25. README
```

Do not skip backend functionality in order to focus on visual design.

Do not replace real functionality with mock data.

Do not mark a feature complete until it has been connected to the actual API.

If an implementation decision is not explicitly specified, choose the simplest maintainable solution that fits the existing architecture and does not violate this document.
