import express from 'express';
import householdRoutes from './householdRoutes';

const router = express.Router();

// Mount sub-routers
router.use('/households', householdRoutes);

// Add this debug route
router.get('/test', (req, res) => {
  res.json({ message: 'Routes index is working' });
});

export default router;