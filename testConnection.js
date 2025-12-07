const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });
