// src/controllers/householdController.ts
import { Request, Response } from 'express';
import Household from '../models/Household'; // Remove .js extension
import path from 'path';
import fs from 'fs';

// Get all households
export const getHouseholds = async (req: Request, res: Response) => {
  try {
    const households = await Household.find().select('-survey'); // Exclude detailed survey data
    res.status(200).json(households);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single household by ID
export const getHousehold = async (req: Request, res: Response) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    res.status(200).json(household);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new household
export const createHousehold = async (req: Request, res: Response) => {
  try {
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
    res.status(201).json(savedHousehold);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a household
export const updateHousehold = async (req: Request, res: Response) => {
  try {
    const { familyName, address } = req.body;
    
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    if (familyName) household.familyName = familyName;
    if (address) household.address = address;
    
    const updatedHousehold = await household.save();
    res.status(200).json(updatedHousehold);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a household
export const deleteHousehold = async (req: Request, res: Response) => {
  try {
    const result = await Household.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    res.status(200).json({ message: 'Household deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit a survey for a household
export const submitSurvey = async (req: Request, res: Response) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Process file upload if present
    let focalPointImagePath = null;
    if (req.file) {
      focalPointImagePath = `/uploads/${req.file.filename}`;
    }
    
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
    household.set('survey.focalPointImage', focalPointImagePath);
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
    res.status(200).json(updatedHousehold);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};