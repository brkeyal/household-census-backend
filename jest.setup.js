// jest.setup.js

// Mock environment variables that would normally be loaded from .env.test
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.AWS_ACCESS_KEY_ID = 'test-key-id';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.FORCE_S3 = 'false';

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockS3Instance = {
    upload: jest.fn().mockImplementation((params, callback) => {
      callback(null, { Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg' });
    }),
    listBuckets: jest.fn().mockImplementation((callback) => {
      callback(null, { Buckets: [{ Name: 'test-bucket' }] });
    }),
    listObjects: jest.fn().mockImplementation((params, callback) => {
      callback(null, { Contents: [] });
    })
  };
  
  return {
    S3: jest.fn(() => mockS3Instance),
    config: {
      update: jest.fn()
    }
  };
});

// Mock mongoose to prevent actual database connections
jest.mock('mongoose', () => {
  const mongoose = jest.requireActual('mongoose');

  // Override the connect method to return a resolved promise
  mongoose.connect = jest.fn().mockResolvedValue(true);
  
  return mongoose;
});

// Set higher Jest timeout for all tests
jest.setTimeout(15000);

// Silence console logs during tests
// Uncomment these lines to reduce console noise during tests
/*
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
*/