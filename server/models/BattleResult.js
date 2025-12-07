const mongoose = require('mongoose');

const battleResultSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true
  },
  battle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    required: true
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
    ratingBefore: {
      type: Number,
      required: true
    },
    ratingAfter: {
      type: Number,
      required: true
    },
    ratingChange: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    testsPassed: {
      type: Number,
      default: 0
    },
    totalTests: {
      type: Number,
      default: 0
    },
    submissionTime: Date,
    code: String,
    language: String,
    result: {
      type: String,
      enum: ['win', 'loss', 'draw', 'timeout', 'abandoned'],
      required: true
    }
  }],
  winner: {
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    score: Number
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  problem: {
    id: String,
    title: String,
    difficulty: String
  },
  battleType: {
    type: String,
    enum: ['competitive', 'practice', 'tournament'],
    default: 'competitive'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
battleResultSchema.index({ 'players.userId': 1, createdAt: -1 });
battleResultSchema.index({ battleType: 1, createdAt: -1 });

module.exports = mongoose.model('BattleResult', battleResultSchema);
