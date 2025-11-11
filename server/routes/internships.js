const express = require('express');
const { auth } = require('../middleware/auth');
const Internship = require('../models/Internship');
const User = require('../models/User');

const router = express.Router();

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ internships });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
});

// Get internship by ID
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship || !internship.isActive) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ internship });
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({ message: 'Failed to fetch internship' });
  }
});

// Apply for internship
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship || !internship.isActive) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if user already applied
    if (internship.applicants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already applied for this internship' });
    }

    internship.applicants.push(req.user.id);
    await internship.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply for internship error:', error);
    res.status(500).json({ message: 'Failed to apply for internship' });
  }
});

// Create internship (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json({ internship });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Failed to create internship' });
  }
});

// Update internship (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json({ internship });
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({ message: 'Failed to update internship' });
  }
});

// Delete internship (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({ message: 'Failed to delete internship' });
  }
});

// Get internships by company (for company dashboard)
router.get('/company/:companyId', auth, async (req, res) => {
  try {
    // This would need to be implemented based on company structure
    // For now, return empty array
    res.json({ internships: [] });
  } catch (error) {
    console.error('Get company internships error:', error);
    res.status(500).json({ message: 'Failed to fetch company internships' });
  }
});

module.exports = router;
