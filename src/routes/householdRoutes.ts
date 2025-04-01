// src/routes/householdRoutes.ts
import express from 'express';
import {
  getHouseholds,
  getHousehold,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  submitSurvey
} from '../controllers/householdController';
import upload from '../middlewares/fileUpload';

const router = express.Router();

// Household CRUD routes
router.get('/', getHouseholds);
router.get('/:id', getHousehold);
router.post('/', createHousehold);
router.put('/:id', updateHousehold);
router.delete('/:id', deleteHousehold);

// Survey submission route (with file upload)
router.post('/:id/survey', upload.single('focalPointImage'), submitSurvey);

export default router;