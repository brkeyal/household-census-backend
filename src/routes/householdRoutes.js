const express = require('express');
const householdController = require('../controllers/householdController');
const upload = require('../middlewares/fileUpload');

const router = express.Router();

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'Household routes are working' });
});

// Household CRUD routes
router.get('/', householdController.getHouseholds);
router.get('/:id', householdController.getHousehold);
router.post('/', householdController.createHousehold);
router.put('/:id', householdController.updateHousehold);
router.delete('/:id', householdController.deleteHousehold);

// Survey submission route (with file upload)
router.post('/:id/survey', upload.single('focalPointImage'), householdController.submitSurvey);

module.exports = router;