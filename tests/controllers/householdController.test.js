// tests/controllers/householdController.test.js
const mongoose = require('mongoose');

// Create a single, consistent mock for the Household model
const mockHouseholdModel = {
  find: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue([]),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

// Mock for any Household instance methods
const mockHouseholdInstance = {
  _id: 'mock-id-123',
  familyName: '',
  address: '',
  status: 'pending',
  save: jest.fn().mockResolvedValue(this),
  set: jest.fn(),
};

// Mock the Household model constructor and its static methods
jest.mock('../../src/models/Household', () => {
  function MockHousehold(data) {
    Object.assign(mockHouseholdInstance, data);
    return mockHouseholdInstance;
  }
  
  // Attach static methods to the constructor function
  Object.assign(MockHousehold, mockHouseholdModel);
  
  return MockHousehold;
});

// Import the controller that uses our mocked model
const householdController = require('../../src/controllers/householdController');

// Mock express req, res objects
const mockRequest = (params = {}, body = {}, file = null) => {
  const req = { params, body };
  if (file) req.file = file;
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Household Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockHouseholdInstance
    Object.assign(mockHouseholdInstance, {
      _id: 'mock-id-123',
      familyName: '',
      address: '',
      status: 'pending',
      save: jest.fn().mockResolvedValue(mockHouseholdInstance),
    });
    
    // Set up findById mock implementation
    mockHouseholdModel.findById.mockImplementation((id) => {
      if (id === 'valid-id' || id === 'mock-id-123') {
        return Promise.resolve({
          _id: id,
          familyName: 'Test Family',
          address: '123 Test St',
          status: 'pending',
          save: jest.fn().mockResolvedValue({ _id: id, familyName: 'Test Family', address: '123 Test St', status: 'pending' })
        });
      }
      return Promise.resolve(null);
    });
    
    // Set up findByIdAndDelete mock implementation
    mockHouseholdModel.findByIdAndDelete.mockImplementation((id) => {
      if (id === 'valid-id' || id === 'mock-id-123') {
        return Promise.resolve({ _id: id });
      }
      return Promise.resolve(null);
    });
  });

  describe('getHouseholds', () => {
    it('should return empty array when no households exist', async () => {
      // Mock implementation for this specific test
      mockHouseholdModel.find.mockReturnThis();
      mockHouseholdModel.select.mockResolvedValue([]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await householdController.getHouseholds(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
  
  describe('createHousehold', () => {
    it('should create a new household', async () => {
      // Setup mock instance with predefined values
      mockHouseholdInstance.save.mockResolvedValue({
        _id: 'new-id',
        familyName: 'Doe',
        address: '789 Pine Rd',
        status: 'pending'
      });
      
      const householdData = { familyName: 'Doe', address: '789 Pine Rd' };
      const req = mockRequest({}, householdData);
      const res = mockResponse();
      
      await householdController.createHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Missing address
      const req = mockRequest({}, { familyName: 'Doe' });
      const res = mockResponse();
      
      await householdController.createHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('required') })
      );
    });
  });
  
  describe('getHousehold', () => {
    it('should return 404 if household not found', async () => {
      // Set up specific mock for this test case
      mockHouseholdModel.findById.mockResolvedValue(null);
      
      const req = mockRequest({ id: 'invalid-id' });
      const res = mockResponse();
      
      await householdController.getHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Household not found' })
      );
    });
    
    it('should return a household if found', async () => {
      // Set up specific mock for this test case
      mockHouseholdModel.findById.mockResolvedValue({
        _id: 'valid-id',
        familyName: 'Test Family',
        address: '123 Test St'
      });
      
      const req = mockRequest({ id: 'valid-id' });
      const res = mockResponse();
      
      await householdController.getHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('deleteHousehold', () => {
    it('should return 404 if household not found for deletion', async () => {
      // Set up specific mock for this test case
      mockHouseholdModel.findByIdAndDelete.mockResolvedValue(null);
      
      const req = mockRequest({ id: 'invalid-id' });
      const res = mockResponse();
      
      await householdController.deleteHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Household not found' })
      );
    });
    
    it('should delete a household if found', async () => {
      // Set up specific mock for this test case
      mockHouseholdModel.findByIdAndDelete.mockResolvedValue({
        _id: 'valid-id',
        familyName: 'Test Family',
        address: '123 Test St'
      });
      
      const req = mockRequest({ id: 'valid-id' });
      const res = mockResponse();
      
      await householdController.deleteHousehold(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Household deleted successfully' })
      );
    });
  });
});