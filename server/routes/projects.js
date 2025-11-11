const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const unzipper = require('unzipper');

const analyzeProject = async (project) => {
  const tempDir = path.join(__dirname, '..', 'temp', project._id.toString());
  let codeToAnalyze = '';
  let language = 'javascript'; // Default language, should be determined from course

  try {
    await fs.mkdir(tempDir, { recursive: true });

    if (project.githubLink) {
      await simpleGit().clone(project.githubLink, tempDir);
    } else if (project.zipFile) {
      await fs.createReadStream(path.join(__dirname, '..', project.zipFile))
        .pipe(unzipper.Extract({ path: tempDir }))
        .promise();
    }

    const files = await fs.readdir(tempDir, { recursive: true });
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stat = await fs.stat(filePath);
      if (!stat.isDirectory()) {
        // A simple way to filter for source code files.
        // This can be improved to be more specific based on the course language.
        if (/\.(js|py|java|cpp|c|h|html|css)$/.test(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            codeToAnalyze += `\n--- ${file} ---\n${content}`;
        }
      }
    }

    if (codeToAnalyze) {
        const pythonProcess = spawn('python', [
            path.join(__dirname, '..', '..', 'ai_service', 'code_eval.py'),
            language,
        ]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        let errorOutput = '';
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code === 0) {
                try {
                    const analysis = JSON.parse(output);
                    await Project.findByIdAndUpdate(project._id, {
                        aiScore: analysis.overall_score,
                        aiFeedback: analysis.feedback,
                        status: 'reviewed',
                    });
                    console.log(`AI analysis completed for project ${project._id}`);
                } catch (error) {
                    console.error('Error updating project with AI analysis:', error);
                }
            } else {
                console.error(`Python script exited with code ${code}. Error: ${errorOutput}`);
            }
            // Clean up the temp directory
            await fs.rm(tempDir, { recursive: true, force: true });
        });

        pythonProcess.stdin.write(codeToAnalyze);
        pythonProcess.stdin.end();
    } else {
        // No code found to analyze, clean up
        await fs.rm(tempDir, { recursive: true, force: true });
    }

  } catch (error) {
    console.error('Error analyzing project:', error);
    // Clean up the temp directory in case of error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error(`Failed to remove temp dir: ${err}`));
  }
};

// Submit project
router.post('/submit', auth, upload.single('zipFile'), async (req, res) => {
  try {
    const { courseId, githubLink } = req.body;
    const userId = req.user.id;

    if (!courseId || (!githubLink && !req.file)) {
      return res.status(400).json({ message: 'Course ID and either GitHub link or ZIP file are required' });
    }

    const project = new Project({
      userId,
      courseId,
      githubLink: githubLink || '',
      zipFile: req.file ? req.file.path : ''
    });

    await project.save();

    analyzeProject(project);

    res.status(201).json({
      message: 'Project submitted successfully',
      project: {
        id: project._id,
        status: 'submitted'
      }
    });
  } catch (error) {
    console.error('Project submission error:', error);
    res.status(500).json({ message: 'Failed to submit project' });
  }
});

// Get user projects
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own projects or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projects = await Project.find({ userId })
      .populate('courseId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get all projects (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const projects = await Project.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Update project status (admin only)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, aiScore, aiFeedback } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status, aiScore, aiFeedback },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

module.exports = router;
