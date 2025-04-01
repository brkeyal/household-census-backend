const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const householdRoutes = require('./routes/householdRoutes');

// Configure environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route
app.get('/', (req, res) => {
  res.send('Household Census API is running');
});

// Debug routes
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Debug route is working' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'API is working', routes: 'Directly registered' });
});

// API routes
app.use('/api/households', householdRoutes);

console.log('Routes registered at /api/households');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/household-census')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

module.exports = app;