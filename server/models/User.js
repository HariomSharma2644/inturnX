const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: function() {
      return !this.oauthProvider || this.oauthProvider === 'local';
    },
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider || this.oauthProvider === 'local';
    }
  },
  role: {
    type: String,
    enum: ['student', 'developer', 'mentor', 'recruiter'],
    default: 'student'
  },
  xp: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  completedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  progress: {
    type: Map,
    of: Number, // courseId -> percentage
    default: new Map()
  },
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  resumeLink: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  github: {
    type: String
  },
  linkedin: {
    type: String
  },
  portfolio: {
    type: String
  },
  location: {
    type: String
  },
  // OAuth fields
  githubId: {
    type: String,
    sparse: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  linkedinId: {
    type: String,
    sparse: true
  },
  oauthProvider: {
    type: String,
    enum: ['local', 'github', 'google', 'linkedin']
  },
  avatar: {
    type: String
  },
  // Battle Arena fields
  rating: {
    type: Number,
    default: 1200
  },
  battleStats: {
    totalBattles: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    bestStreak: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in seconds
    },
    averageSolveTime: {
      type: Number,
      default: 0 // in seconds
    }
  },
  rank: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Grandmaster'],
    default: 'Beginner'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
