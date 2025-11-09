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

// Initialize Passport
require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://192.168.17.156:5173", "http://localhost:5173", "http://127.0.0.1:5173", "http://10.239.52.112:5173"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://192.168.17.156:5173", "http://localhost:5173", "http://127.0.0.1:5173", "http://10.239.52.112:5173"],
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InturnX Server is running' });
});

// Socket.io for real-time coding battles
const battles = new Map();
const matchmakingQueue = new Map(); // For 1v1 matchmaking

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-battle', (battleId) => {
    socket.join(battleId);
    if (!battles.has(battleId)) {
      battles.set(battleId, { players: [], code: '' });
    }
    const battle = battles.get(battleId);
    battle.players.push(socket.id);

    socket.emit('battle-joined', { battleId, code: battle.code });
    socket.to(battleId).emit('player-joined', { playerId: socket.id });
  });

  socket.on('join-1v1-queue', (data) => {
    const { userId, userName, battleType, rating, timestamp } = data;
    console.log('User joined 1v1 queue:', { userId, userName, battleType, rating });

    // Add user to matchmaking queue
    const queueKey = battleType;
    if (!matchmakingQueue.has(queueKey)) {
      matchmakingQueue.set(queueKey, []);
    }

    const queue = matchmakingQueue.get(queueKey);
    const playerData = {
      socketId: socket.id,
      userId,
      userName,
      rating,
      timestamp,
      battleType
    };

    queue.push(playerData);

    // Try to find a match
    findMatch(queue, socket, battleType);
  });

  socket.on('leave-queue', (data) => {
    const { userId } = data;
    console.log('User left queue:', userId);

    // Remove from all queues
    for (const [queueKey, queue] of matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.userId === userId);
      if (index > -1) {
        queue.splice(index, 1);
        socket.emit('queue-left');
        break;
      }
    }
  });

  socket.on('code-update', (data) => {
    const { battleId, code } = data;
    const battle = battles.get(battleId);
    if (battle) {
      battle.code = code;
      socket.to(battleId).emit('code-updated', { code, from: socket.id });
    }
  });

  socket.on('submit-solution', (data) => {
    const { battleId, solution, testResults } = data;
    console.log('Solution submitted for battle:', battleId);

    // Check if solution is correct
    const allPassed = testResults.every(result => result.status === 'accepted');

    if (allPassed) {
      // Notify all players in the battle that someone won
      io.to(battleId).emit('battle-ended', {
        winner: socket.id,
        solution: solution,
        timeRemaining: data.timeRemaining
      });

      // Clean up battle
      battles.delete(battleId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from matchmaking queue
    for (const [queueKey, queue] of matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.socketId === socket.id);
      if (index > -1) {
        queue.splice(index, 1);
        break;
      }
    }

    // Remove from battles
    for (const [battleId, battle] of battles.entries()) {
      const index = battle.players.indexOf(socket.id);
      if (index > -1) {
        battle.players.splice(index, 1);
        if (battle.players.length === 0) {
          battles.delete(battleId);
        } else {
          // Notify remaining players
          socket.to(battleId).emit('player-disconnected', { playerId: socket.id });
        }
      }
    }
  });
});

// Matchmaking function
function findMatch(queue, socket, battleType) {
  if (queue.length < 2) {
    socket.emit('matchmaking-status', { status: 'searching', playersInQueue: queue.length });
    return;
  }

  // Sort queue by rating difference and wait time
  queue.sort((a, b) => {
    const ratingDiff = Math.abs(a.rating - b.rating);
    const timeDiff = Math.abs(a.timestamp - b.timestamp);
    return ratingDiff - timeDiff; // Prioritize similar rating, then wait time
  });

  // Find best match (within 200 rating points)
  const player1 = queue[0];
  let bestMatch = null;

  for (let i = 1; i < queue.length; i++) {
    const ratingDiff = Math.abs(player1.rating - queue[i].rating);
    if (ratingDiff <= 200) { // Max rating difference
      bestMatch = queue[i];
      break;
    }
  }

  if (bestMatch) {
    // Remove both players from queue
    queue.splice(queue.indexOf(bestMatch), 1);
    queue.splice(queue.indexOf(player1), 1);

    // Create battle
    const battleId = `battle-1v1-${Date.now()}`;
    const battle = {
      id: battleId,
      players: [player1, bestMatch],
      type: battleType,
      createdAt: Date.now(),
      timeLimit: 1800, // 30 minutes
      status: 'active'
    };

    battles.set(battleId, battle);

    // Get random problem
    const problems = [
      { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
      { id: 'reverse-string', title: 'Reverse String', difficulty: 'Easy' },
      { id: 'palindrome-number', title: 'Palindrome Number', difficulty: 'Easy' },
      { id: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy' },
      { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy' }
    ];

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    // Notify both players
    const player1Socket = io.sockets.sockets.get(player1.socketId);
    const player2Socket = io.sockets.sockets.get(bestMatch.socketId);

    if (player1Socket) {
      player1Socket.emit('match-found', {
        battleId,
        opponent: {
          userId: bestMatch.userId,
          userName: bestMatch.userName,
          rating: bestMatch.rating
        },
        problem: randomProblem,
        yourTurn: true
      });
    }

    if (player2Socket) {
      player2Socket.emit('match-found', {
        battleId,
        opponent: {
          userId: player1.userId,
          userName: player1.userName,
          rating: player1.rating
        },
        problem: randomProblem,
        yourTurn: false
      });
    }

    console.log('Match created:', battleId, 'between', player1.userName, 'and', bestMatch.userName);
  } else {
    // No suitable match found, continue searching
    socket.emit('matchmaking-status', { status: 'searching', playersInQueue: queue.length });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`For network access, use your local IP address`);
});

module.exports = app;
