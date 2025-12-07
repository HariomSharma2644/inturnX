const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'cpp', 'java', 'c', 'go', 'kotlin', 'rust', 'typescript', 'swift']
  },
  type: {
    type: String,
    required: true,
    enum: ['global', 'weekly', 'monthly']
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  rankings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: String,
    score: {
      type: Number,
      required: true
    },
    completedLevels: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    averageTime: {
      type: Number,
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    badges: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  totalParticipants: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
leaderboardSchema.index({ language: 1, type: 1 }, { unique: true });
leaderboardSchema.index({ 'rankings.userId': 1 });

// Pre-save middleware to update ranks
leaderboardSchema.pre('save', function(next) {
  // Sort rankings by score descending, then by completed levels, then by accuracy
  this.rankings.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.completedLevels !== b.completedLevels) return b.completedLevels - a.completedLevels;
    return b.accuracy - a.accuracy;
  });

  // Update ranks
  this.rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });

  this.totalParticipants = this.rankings.length;
  next();
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
