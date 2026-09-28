const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDb, writeDb, logActivity } = require('../db');
const { sendTaskNotification } = require('../config/mailer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = function(io) {
  router.get('/users', (req, res) => {
    const db = readDb();
    res.json(db.users || []);
  });

  router.get('/tasks', (req, res) => {
    const db = readDb();
    let tasks = [...db.tasks];
    const { status, priority, label, search } = req.query;
    if (status) tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());
    if (priority) tasks = tasks.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
    if (label) tasks = tasks.filter(t => t.labels && t.labels.map(l => l.toLowerCase()).includes(label.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)) || t.id.toLowerCase().includes(q));
    }
    res.json(tasks);
  });

  router.get('/tasks/:id', (req, res) => {
    const db = readDb();
    const task = db.tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  router.post('/tasks', async (req, res) => {
    const db = readDb();
    const { title, description, priority, labels, assigneeId, dueDate, reporterName } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const nextIndex = db.tasks.length + 101;
    const newId = 'TASK-' + nextIndex;
    const assignee = db.users.find(u => u.id === assigneeId) || null;
    const newTask = {
      id: newId,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: 'To Do',
      priority: priority || 'Medium',
      labels: Array.isArray(labels) ? labels : (labels ? labels.split(',').map(s => s.trim()).filter(Boolean) : []),
      assignee,
      reporter: { name: reporterName || 'Kanika Patil', avatar: 'KP' },
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      comments: []
    };
    db.tasks.unshift(newTask);
    writeDb(db);
    const act = logActivity(newId, reporterName || 'Kanika Patil', 'created task', {
      details: 'Priority: ' + newTask.priority + ', Assignee: ' + (assignee ? assignee.name : 'Unassigned')
    });
    io.emit('task:created', newTask);
    io.emit('activity:created', act);
    if (assignee && assignee.email) {
      sendTaskNotification({ recipientEmail: assignee.email, recipientName: assignee.name, task: newTask, eventType: 'ASSIGNMENT', triggeredBy: reporterName || 'Kanika Patil' });
    }
    res.status(201).json(newTask);
  });

  router.patch('/tasks/:id', async (req, res) => {
    const db = readDb();
    const taskIndex = db.tasks.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    const currentTask = db.tasks[taskIndex];
    const { status, priority, title, description, labels, assigneeId, dueDate, user } = req.body;
    const actor = user || 'Team Member';
    if (status && status !== currentTask.status) {
      const act = logActivity(currentTask.id, actor, 'status changed', { from: currentTask.status, to: status });
      io.emit('activity:created', act);
      currentTask.status = status;
    }
    if (priority && priority !== currentTask.priority) {
      const oldPriority = currentTask.priority;
      currentTask.priority = priority;
      const act = logActivity(currentTask.id, actor, 'priority changed', { from: oldPriority, to: priority });
      io.emit('activity:created', act);
      if ((priority === 'High' || priority === 'Highest') && currentTask.assignee) {
        sendTaskNotification({ recipientEmail: currentTask.assignee.email, recipientName: currentTask.assignee.name, task: currentTask, eventType: 'ESCALATION', triggeredBy: actor });
      }
    }
    if (assigneeId !== undefined) {
      const newAssignee = db.users.find(u => u.id === assigneeId) || null;
      const oldName = currentTask.assignee ? currentTask.assignee.name : 'Unassigned';
      const newName = newAssignee ? newAssignee.name : 'Unassigned';
      if (oldName !== newName) {
        currentTask.assignee = newAssignee;
        const act = logActivity(currentTask.id, actor, 'reassigned task', { from: oldName, to: newName });
        io.emit('activity:created', act);
        if (newAssignee && newAssignee.email) {
          sendTaskNotification({ recipientEmail: newAssignee.email, recipientName: newAssignee.name, task: currentTask, eventType: 'ASSIGNMENT', triggeredBy: actor });
        }
      }
    }
    if (title) currentTask.title = title.trim();
    if (description !== undefined) currentTask.description = description.trim();
    if (dueDate !== undefined) currentTask.dueDate = dueDate;
    if (labels !== undefined) currentTask.labels = Array.isArray(labels) ? labels : labels.split(',').map(s => s.trim()).filter(Boolean);
    currentTask.updatedAt = new Date().toISOString();
    db.tasks[taskIndex] = currentTask;
    writeDb(db);
    io.emit('task:updated', currentTask);
    res.json(currentTask);
  });

  router.delete('/tasks/:id', (req, res) => {
    const db = readDb();
    const taskIndex = db.tasks.findIndex(t => t.id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    const deleted = db.tasks.splice(taskIndex, 1)[0];
    writeDb(db);
    const act = logActivity(deleted.id, req.query.user || 'Team Member', 'deleted task', { details: deleted.title });
    io.emit('task:deleted', { id: deleted.id });
    io.emit('activity:created', act);
    res.json({ message: 'Task deleted successfully', id: deleted.id });
  });

  router.post('/tasks/:id/comments', (req, res) => {
    const db = readDb();
    const task = db.tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { text, authorName, authorAvatar } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is required' });
    const newComment = { id: 'cmt-' + Date.now(), author: { name: authorName || 'Team Member', avatar: authorAvatar || 'TM' }, text: text.trim(), createdAt: new Date().toISOString() };
    if (!task.comments) task.comments = [];
    task.comments.push(newComment);
    writeDb(db);
    const act = logActivity(task.id, authorName || 'Team Member', 'added a comment', { details: text.trim().substring(0, 60) + (text.length > 60 ? '...' : '') });
    io.emit('task:commented', { taskId: task.id, comment: newComment });
    io.emit('activity:created', act);
    res.status(201).json(newComment);
  });

  router.post('/tasks/:id/attachments', upload.single('file'), (req, res) => {
    const db = readDb();
    const task = db.tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const isImage = req.file.mimetype.startsWith('image/');
    const attachment = { id: 'att-' + Date.now(), filename: req.file.filename, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, isImage, url: '/uploads/' + req.file.filename, uploadedBy: req.body.uploadedBy || 'Team Member', uploadedAt: new Date().toISOString() };
    if (!task.attachments) task.attachments = [];
    task.attachments.push(attachment);
    writeDb(db);
    const act = logActivity(task.id, req.body.uploadedBy || 'Team Member', 'attached file', { details: req.file.originalname + ' (' + (req.file.size / 1024).toFixed(1) + ' KB)' });
    io.emit('task:attachment_added', { taskId: task.id, attachment });
    io.emit('activity:created', act);
    res.status(201).json(attachment);
  });

  router.get('/activities', (req, res) => {
    const db = readDb();
    const { taskId } = req.query;
    if (taskId) return res.json(db.activities.filter(a => a.taskId === taskId));
    res.json(db.activities || []);
  });

  router.get('/messages', (req, res) => {
    const db = readDb();
    const room = req.query.room || 'general';
    res.json((db.messages || []).filter(m => (m.room || 'general') === room));
  });

  return router;
};
