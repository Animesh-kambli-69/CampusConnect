'use strict';

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const connectionRoutes = require('./routes/connection.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const eventRoutes = require('./routes/event.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const resourceRoutes = require('./routes/resource.routes');
const adminRoutes = require('./routes/admin.routes');
const announcementRoutes = require('./routes/announcement.routes');
const activityRoutes = require('./routes/activity.routes');
const campusAdminRoutes = require('./routes/campus-admin.routes');
const projectRoutes = require('./routes/project.routes');
const teamRoutes = require('./routes/team.routes');
const placementRoutes = require('./routes/placement.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const lostFoundRoutes = require('./routes/lost-found.routes');
const studyRoomRoutes = require('./routes/study-room.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://campusconnect-snowy.vercel.app', 'https://campusconnect-dt67.onrender.com']
      : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusConnect API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/campus-admin', campusAdminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/leaderboard', gamificationRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Error Middleware (must be last) ─────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
