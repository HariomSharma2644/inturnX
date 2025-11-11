const express = require('express');
const axios = require('axios');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,    // Python 3
  cpp: 54,       // C++
  java: 62,      // Java
  c: 50,         // C
  go: 60,        // Go
  kotlin: 78,    // Kotlin
  rust: 73,      // Rust
  typescript: 74, // TypeScript
  swift: 83      // Swift
};

// Execute code
router.post('/execute', auth, async (req, res) => {
  try {
    const { language, code, input = '' } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: 'Language and code are required' });
    }

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    // Prepare submission for Judge0
    const submission = {
      language_id: languageId,
      source_code: code,
      stdin: input,
      expected_output: null,
      cpu_time_limit: 2, // 2 seconds
      cpu_extra_time: 0.5,
      wall_time_limit: 5,
      memory_limit: 128000, // 128MB
      stack_limit: 64000,   // 64MB
      max_file_size: 1024   // 1KB
    };

    // Submit code to Judge0
    const submitResponse = await axios.post(`${JUDGE0_API_URL}/submissions`, submission, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    const token = submitResponse.data.token;

    // Wait for execution result
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      result = resultResponse.data;

      if (result.status.id > 2) { // Status > 2 means execution finished
        break;
      }

      attempts++;
    }

    if (!result || result.status.id <= 2) {
      return res.status(408).json({ message: 'Code execution timeout' });
    }

    // Format response
    const executionResult = {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      status: {
        id: result.status.id,
        description: result.status.description
      },
      time: result.time,
      memory: result.memory,
      success: result.status.id === 3 // Accepted
    };

    res.json(executionResult);

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ message: 'Code execution failed' });
  }
});

// Run test cases
router.post('/test', auth, async (req, res) => {
  try {
    const { language, code, testCases } = req.body;

    if (!language || !code || !Array.isArray(testCases)) {
      return res.status(400).json({ message: 'Language, code, and test cases are required' });
    }

    const results = [];
    let passed = 0;
    let total = testCases.length;

    for (const testCase of testCases) {
      try {
        const executionResult = await executeCode(language, code, testCase.input);

        const isPassed = executionResult.success &&
          executionResult.stdout.trim() === testCase.expectedOutput.trim();

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: executionResult.stdout,
          passed: isPassed,
          time: executionResult.time,
          memory: executionResult.memory,
          error: executionResult.stderr || executionResult.compile_output
        });

        if (isPassed) passed++;

      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          error: 'Execution failed'
        });
      }
    }

    res.json({
      results,
      summary: {
        passed,
        total,
        successRate: (passed / total) * 100
      }
    });

  } catch (error) {
    console.error('Test execution error:', error);
    res.status(500).json({ message: 'Test execution failed' });
  }
});

// Helper function to execute code
async function executeCode(language, code, input = '') {
  const languageId = LANGUAGE_IDS[language];

  const submission = {
    language_id: languageId,
    source_code: code,
    stdin: input,
    expected_output: null,
    cpu_time_limit: 2,
    cpu_extra_time: 0.5,
    wall_time_limit: 5,
    memory_limit: 128000,
    stack_limit: 64000,
    max_file_size: 1024
  };

  const submitResponse = await axios.post(`${JUDGE0_API_URL}/submissions`, submission, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  });

  const token = submitResponse.data.token;

  // Wait for result
  let attempts = 0;
  while (attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    const result = resultResponse.data;
    if (result.status.id > 2) {
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compile_output: result.compile_output || '',
        status: result.status,
        time: result.time,
        memory: result.memory,
        success: result.status.id === 3
      };
    }

    attempts++;
  }

  throw new Error('Execution timeout');
}

module.exports = router;
