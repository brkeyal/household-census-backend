console.log('============== SERVER STARTING ==============');


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import householdRoutes from './routes/householdRoutes';

import routes from './routes/index';

console.log('Routes module imported:', typeof routes === 'object' ? 'YES' : 'NO', Object.keys(routes).length > 0 ? 'with handlers' : 'empty');

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

// API routes
app.use('/api/households', householdRoutes);


// Debug route
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Debug route is working' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'API is working', routes: 'Directly registered' });
});

console.log('Routes registered at /api');


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

export default app;