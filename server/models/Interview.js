const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Software Engineer', 'Web Developer', 'Data Analyst', 'Full Stack Developer', 'Data Scientist', 'Product Manager']
  },
  personality: {
    type: String,
    enum: ['technical', 'hr', 'behavioral'],
    default: 'technical'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    transcript: String,
    evaluation: {
      clarity: { type: Number, min: 0, max: 100 },
      confidence: { type: Number, min: 0, max: 100 },
      technicalAccuracy: { type: Number, min: 0, max: 100 },
      communication: { type: Number, min: 0, max: 100 },
      feedback: {
        strengths: [String],
        weaknesses: [String]
      }
    },
    visualAnalysis: {
      eyeContact: { type: Number, min: 0, max: 100 },
      facialExpression: String,
      gestureFrequency: { type: Number, min: 0 },
      bodyPosture: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  visualAnalytics: {
    avgEyeContact: { type: Number, min: 0, max: 100 },
    dominantExpression: String,
    avgGestureFrequency: Number,
    bodyPosture: String
  },
  communicationAnalysis: {
    clarity: String,
    tone: String,
    confidence: String,
    pacing: String
  },
  recommendations: [String],
  duration: Number, // in minutes
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Index for efficient queries
InterviewSchema.index({ userId: 1, createdAt: -1 });
InterviewSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('Interview', InterviewSchema);
