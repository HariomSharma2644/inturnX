const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  githubLink: {
    type: String,
    default: ''
  },
  zipFile: {
    type: String,
    default: ''
  },
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiFeedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
