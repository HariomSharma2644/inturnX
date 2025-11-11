const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    required: true
  }],
  stipend: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  type: {
    type: String,
    enum: ['traditional', 'project-based'],
    default: 'traditional'
  },
  collaborationWithCompany: {
    type: Boolean,
    default: false
  },
  projectDetails: {
    type: String,
    default: ''
  },
  collaborationFeatures: [{
    type: String
  }],
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
