require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

// Initialize database
const { connectDB } = require('./database');
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const battlesRoutes = require('./routes/battles');
const aiRoutes = require('./routes/ai');
const projectsRoutes = require('./routes/projects');
const internshipsRoutes = require('./routes/internships');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const quizRoutes = require('./routes/quiz');
const codeRoutes = require('./routes/code');
const leaderboardRoutes = require('./routes/leaderboard');

// Import battle manager
const BattleManager = require('./utils/battleManager');

// Initialize Passport
require('./config/passport');

const app = express();
const server = http.createServer(app);

// Configure allowed origins
// For Railway-only deployment, CLIENT_URL can be same as SERVER_URL or not set
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    process.env.CLIENT_URL,
    process.env.SERVER_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null
  ].filter(Boolean)
  : [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://192.168.17.156:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://10.239.52.112:5173"
  ];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/battles', battlesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InturnX Server is running' });
});

// Serve static files from the React app build directory (for Railway full-stack deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Initialize Battle Manager
const battleManager = new BattleManager(io);

// Socket.io for real-time coding battles
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join matchmaking queue
  socket.on('join-queue', async (data) => {
    await battleManager.joinQueue(socket, data);
  });

  // Leave queue
  socket.on('leave-queue', (data) => {
    battleManager.leaveQueue(socket, data);
  });

  // Join battle room
  socket.on('join-battle', (battleId) => {
    socket.join(battleId);
    console.log(`Player ${socket.id} joined battle ${battleId}`);
  });

  // Code updates
  socket.on('code-update', (data) => {
    battleManager.updateCode(socket, data);
  });

  // Submit solution
  socket.on('submit-solution', async (data) => {
    await battleManager.submitSolution(socket, data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    battleManager.handleDisconnect(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`For network access, use your local IP address`);
});

module.exports = app;
