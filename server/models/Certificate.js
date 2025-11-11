const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  verificationUrl: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  grade: {
    type: String,
    enum: ['Pass', 'Merit', 'Distinction'],
    default: 'Pass'
  },
  xpEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one certificate per user-course
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
