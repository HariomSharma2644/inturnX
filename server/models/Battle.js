const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 1200
    },
    socketId: String,
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    submitted: {
      type: Boolean,
      default: false
    },
    submissionTime: Date,
    score: {
      type: Number,
      default: 0
    }
  }],
  problem: {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    category: String,
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    constraints: [String],
    testCases: [{
      input: mongoose.Schema.Types.Mixed,
      expectedOutput: mongoose.Schema.Types.Mixed
    }],
    languages: {
      javascript: {
        template: String,
        testRunner: String
      },
      python: {
        template: String,
        testRunner: String
      },
      java: {
        template: String,
        testRunner: String
      },
      cpp: {
        template: String,
        testRunner: String
      }
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  timeLimit: {
    type: Number,
    default: 1800 // 30 minutes in seconds
  },
  startTime: Date,
  endTime: Date,
  winner: {
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    score: Number
  },
  battleType: {
    type: String,
    enum: ['competitive', 'practice', 'tournament'],
    default: 'competitive'
  },
  roomId: String
}, {
  timestamps: true
});

// Index for efficient queries
battleSchema.index({ status: 1, createdAt: -1 });
battleSchema.index({ 'players.userId': 1 });

module.exports = mongoose.model('Battle', battleSchema);
