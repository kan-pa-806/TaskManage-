const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { readDb, writeDb, logActivity } = require('./db');
const { initMailer } = require('./config/mailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'client')));
// Serve uploaded attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
const apiRouter = require('./routes/api')(io);
app.use('/api', apiRouter);

// Socket.io Real-Time Communications
io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);

  // Join a room (e.g. general, or issue specific TASK-101)
  socket.on('chat:join', (roomName) => {
    socket.join(roomName || 'general');
    console.log(`[Socket.io] User ${socket.id} joined room: ${roomName || 'general'}`);
  });

  // Handle incoming real-time chat messages
  socket.on('chat:send_message', (payload) => {
    const { room, sender, text } = payload;
    if (!text || !text.trim()) return;

    const db = readDb();
    const message = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      room: room || 'general',
      sender: sender || { name: 'Anonymous', avatar: 'AN' },
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    if (!db.messages) db.messages = [];
    db.messages.push(message);
    if (db.messages.length > 500) db.messages = db.messages.slice(0, 500);
    writeDb(db);

    // Broadcast message to everyone in the room
    io.to(room || 'general').emit('chat:new_message', message);
    console.log(`[Socket.io Chat] ${sender ? sender.name : 'Unknown'}: ${text.substring(0, 40)}`);
  });

  // User typing indicator
  socket.on('chat:typing', (payload) => {
    socket.to(payload.room || 'general').emit('chat:user_typing', payload);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.io] Client disconnected:', socket.id);
  });
});

// Start Server and initialize Nodemailer
server.listen(PORT, async () => {
  console.log('========================================================');
  console.log(`?? Jira Task Manager & Issue Tracker Server running!`);
  console.log(`?? Web Dashboard: http://localhost:${PORT}`);
  console.log(`?? Real-Time WebSockets: Active`);
  console.log('========================================================');
  
  // Initialize Nodemailer ethereal demo transport
  await initMailer();
});
