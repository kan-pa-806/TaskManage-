const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.json');

const initialData = {
  users: [
    { id: 'usr-1', name: 'Kanika Patil', email: 'kanika.patil@example.com', avatar: 'KP', role: 'Project Lead' },
    { id: 'usr-2', name: 'Alex Johnson', email: 'alex.j@example.com', avatar: 'AJ', role: 'Full Stack Dev' },
    { id: 'usr-3', name: 'Sarah Chen', email: 'sarah.c@example.com', avatar: 'SC', role: 'UI/UX Designer' },
    { id: 'usr-4', name: 'Rohan Sharma', email: 'rohan.s@example.com', avatar: 'RS', role: 'Backend Engineer' }
  ],
  tasks: [
    {
      id: 'TASK-101',
      title: 'Architect Real-Time Notification & WebSocket layer',
      description: 'Implement bidirectional WebSocket pipeline using Socket.io to push task updates, chat communications, and system broadcast alerts.',
      status: 'In Progress',
      priority: 'High',
      labels: ['backend', 'websockets', 'architecture'],
      assignee: { id: 'usr-1', name: 'Kanika Patil', email: 'kanika.patil@example.com', avatar: 'KP' },
      reporter: { id: 'usr-2', name: 'Alex Johnson', email: 'alex.j@example.com', avatar: 'AJ' },
      dueDate: '2026-10-05',
      createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      attachments: [],
      comments: [
        {
          id: 'cmt-1',
          author: { id: 'usr-2', name: 'Alex Johnson', avatar: 'AJ' },
          text: 'Socket handshake authenticated with session tokens. Ready for client integration.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
        }
      ]
    },
    {
      id: 'TASK-102',
      title: 'Design Jira-grade Kanban board UI with responsive columns',
      description: 'Draft pixel-perfect Jira board styling with status columns, color badges, drag indicators, and quick filters by priority and labels.',
      status: 'Done',
      priority: 'Medium',
      labels: ['frontend', 'ui/ux', 'css'],
      assignee: { id: 'usr-3', name: 'Sarah Chen', email: 'sarah.c@example.com', avatar: 'SC' },
      reporter: { id: 'usr-1', name: 'Kanika Patil', email: 'kanika.patil@example.com', avatar: 'KP' },
      dueDate: '2026-09-30',
      createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
      attachments: [],
      comments: []
    },
    {
      id: 'TASK-103',
      title: 'Configure Nodemailer automated triggers on assignment & priority alerts',
      description: 'Send instant email notifications to assignees with HTML card templates when tasks are created or escalated to High priority.',
      status: 'To Do',
      priority: 'High',
      labels: ['backend', 'email', 'notifications'],
      assignee: { id: 'usr-4', name: 'Rohan Sharma', email: 'rohan.s@example.com', avatar: 'RS' },
      reporter: { id: 'usr-1', name: 'Kanika Patil', email: 'kanika.patil@example.com', avatar: 'KP' },
      dueDate: '2026-10-08',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      comments: []
    },
    {
      id: 'TASK-104',
      title: 'Implement Multi-part File Attachment handler with Multer',
      description: 'Enable drag-and-drop file uploads for issue attachments with mime validation, size limits, and instant preview modal.',
      status: 'In Progress',
      priority: 'Medium',
      labels: ['backend', 'storage', 'api'],
      assignee: { id: 'usr-2', name: 'Alex Johnson', email: 'alex.j@example.com', avatar: 'AJ' },
      reporter: { id: 'usr-4', name: 'Rohan Sharma', email: 'rohan.s@example.com', avatar: 'RS' },
      dueDate: '2026-10-03',
      createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      attachments: [],
      comments: []
    }
  ],
  activities: [
    {
      id: 'act-1',
      taskId: 'TASK-101',
      user: 'Kanika Patil',
      action: 'changed status',
      from: 'To Do',
      to: 'In Progress',
      timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
    },
    {
      id: 'act-2',
      taskId: 'TASK-102',
      user: 'Sarah Chen',
      action: 'moved issue to Done',
      from: 'In Review',
      to: 'Done',
      timestamp: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
    },
    {
      id: 'act-3',
      taskId: 'TASK-103',
      user: 'Kanika Patil',
      action: 'created task',
      details: 'Assigned to Rohan Sharma with Priority High',
      timestamp: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: 'msg-1',
      room: 'general',
      sender: { id: 'usr-1', name: 'Kanika Patil', avatar: 'KP' },
      text: 'Welcome team! The project tracker and real-time sprint board are live. Please review your active tasks.',
      timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString()
    },
    {
      id: 'msg-2',
      room: 'general',
      sender: { id: 'usr-2', name: 'Alex Johnson', avatar: 'AJ' },
      text: 'Working on file uploads and socket events now. Testing looks solid!',
      timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString()
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Helper to log user action in activity history
function logActivity(taskId, user, action, details = {}) {
  const db = readDb();
  const activity = {
    id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    taskId,
    user: user || 'Team Member',
    action,
    ...details,
    timestamp: new Date().toISOString()
  };
  db.activities.unshift(activity);
  // Keep last 300 activities
  if (db.activities.length > 300) db.activities = db.activities.slice(0, 300);
  writeDb(db);
  return activity;
}

module.exports = {
  readDb,
  writeDb,
  logActivity
};
