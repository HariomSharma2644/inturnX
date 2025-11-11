const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  includes: {
    type: String,
    required: true
  },
  certificate: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  videos: {
    type: Number,
    default: 0
  },
  project: {
    type: String,
    default: ''
  },
  modules: [{
    title: String,
    content: String,
    type: {
      type: String,
      enum: ['video', 'quiz', 'project', 'reading'],
      default: 'reading'
    },
    duration: Number, // in minutes
    xpReward: {
      type: Number,
      default: 10
    }
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  xpReward: {
    type: Number,
    default: 100
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
