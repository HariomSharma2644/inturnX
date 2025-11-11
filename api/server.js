// Vercel serverless function entry point for the backend
const path = require('path');

// Set the correct path for server modules
process.env.NODE_PATH = path.join(__dirname, '../server/node_modules');
require('module').Module._initPaths();

// Load the server API handler
const app = require('../server/api/index.js');

// Export for Vercel
module.exports = app;

