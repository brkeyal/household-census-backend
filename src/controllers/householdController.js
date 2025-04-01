const Household = require('../models/Household');
const path = require('path');
const fs = require('fs');

// Get all households
exports.getHouseholds = async (req, res) => {
  try {
    console.log('Getting all households');
    const households = await Household.find().select('-survey'); // Exclude detailed survey data
    console.log(`Found ${households.length} households`);
    res.status(200).json(households);
  } catch (error) {
    console.error('Error getting households:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single household by ID
exports.getHousehold = async (req, res) => {
  try {
    console.log(`Getting household with ID: ${req.params.id}`);
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      console.log(`Household with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Household not found' });
    }
    
    res.status(200).json(household);
  } catch (error) {
    console.error(`Error getting household ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new household
exports.createHousehold = async (req, res) => {
  try {
    console.log('Creating new household:', req.body);
    const { familyName, address } = req.body;
    
    if (!familyName || !address) {
      return res.status(400).json({ message: 'Family name and address are required' });
    }
    
    const newHousehold = new Household({
      familyName,
      address,
      status: 'pending',
      dateSurveyed: null,
      survey: null
    });
    
    const savedHousehold = await newHousehold.save();
    console.log('Household created successfully:', savedHousehold._id);
    res.status(201).json(savedHousehold);
  } catch (error) {
    console.error('Error creating household:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a household
exports.updateHousehold = async (req, res) => {
  try {
    console.log(`Updating household with ID: ${req.params.id}`, req.body);
    const { familyName, address } = req.body;
    
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      console.log(`Household with ID ${req.params.id} not found for update`);
      return res.status(404).json({ message: 'Household not found' });
    }
    
    if (familyName) household.familyName = familyName;
    if (address) household.address = address;
    
    const updatedHousehold = await household.save();
    console.log('Household updated successfully');
    res.status(200).json(updatedHousehold);
  } catch (error) {
    console.error(`Error updating household ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a household
exports.deleteHousehold = async (req, res) => {
  try {
    console.log(`Deleting household with ID: ${req.params.id}`);
    const result = await Household.findByIdAndDelete(req.params.id);
    
    if (!result) {
      console.log(`Household with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: 'Household not found' });
    }
    
    console.log('Household deleted successfully');
    res.status(200).json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error(`Error deleting household ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit a survey for a household
exports.submitSurvey = async (req, res) => {
  try {
    console.log(`Submitting survey for household with ID: ${req.params.id}`);
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      console.log(`Household with ID ${req.params.id} not found for survey submission`);
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Process file upload if present
    let focalPointImagePath = null;
    if (req.file) {
      focalPointImagePath = `/uploads/${req.file.filename}`;
      console.log(`Uploaded image: ${focalPointImagePath}`);
    }
    
    console.log('Survey data received:', req.body);
    
    // Process form data
    const { 
      focalPoint, 
      familyMembers, 
      carCount, 
      hasPets, 
      petCount, 
      housingType, 
      environmentalPractices 
    } = req.body;
    
    // Parse JSON strings if they came from FormData
    const parsedFamilyMembers = typeof familyMembers === 'string' 
      ? JSON.parse(familyMembers) 
      : familyMembers;
      
    const parsedPractices = typeof environmentalPractices === 'string' 
      ? JSON.parse(environmentalPractices) 
      : environmentalPractices;
    
    // Update household properties individually instead of creating a new survey object
    if (!household.survey) {
      // Initialize survey subdocument if it doesn't exist
      household.set('survey', {});
    }
    
    // Set each field individually
    household.set('survey.focalPoint', focalPoint);
    if (focalPointImagePath) {
      household.set('survey.focalPointImage', focalPointImagePath);
    }
    household.set('survey.familyMembers', parsedFamilyMembers);
    household.set('survey.carCount', parseInt(carCount));
    household.set('survey.hasPets', hasPets === 'yes');
    household.set('survey.petCount', parseInt(petCount || '0'));
    household.set('survey.housingType', housingType);
    household.set('survey.environmentalPractices', parsedPractices);
    
    // Update household status
    household.status = 'completed';
    household.dateSurveyed = new Date();
    
    const updatedHousehold = await household.save();
    console.log('Survey submitted successfully');
    res.status(200).json(updatedHousehold);
  } catch (error) {
    console.error(`Error submitting survey for household ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};