const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

// I am replacing `<database>` with `InturnX`. You can change it to your database name.
const dbURI = mongoURI.replace('<database>', 'InturnX');

mongoose.connect(dbURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });
