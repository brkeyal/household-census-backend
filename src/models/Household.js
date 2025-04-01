const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Family member sub-schema
const FamilyMemberSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  }
});

// Survey schema
const SurveySchema = new Schema({
  focalPoint: {
    type: String,
    required: true,
    trim: true
  },
  focalPointImage: {
    type: String, // This will store the file path or URL
    default: null
  },
  familyMembers: [FamilyMemberSchema],
  carCount: {
    type: Number,
    required: true,
    min: 0
  },
  hasPets: {
    type: Boolean,
    required: true
  },
  petCount: {
    type: Number,
    min: 0,
    default: 0
  },
  housingType: {
    type: String,
    required: true,
    enum: ['Apartment', 'House', 'Condominium', 'Duplex', 'Mobile home', 'Other']
  },
  environmentalPractices: [{
    type: String,
    enum: [
      'Recycling',
      'Composting food scraps',
      'Conserving water',
      'Reducing plastic use',
      'Using reusable shopping bags',
      'Participating in local environmental initiatives'
    ]
  }]
});

// Household schema
const HouseholdSchema = new Schema({
  familyName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  dateSurveyed: {
    type: Date,
    default: null
  },
  survey: {
    type: SurveySchema,
    default: null
  }
}, { timestamps: true });

const Household = mongoose.model('Household', HouseholdSchema);

module.exports = Household;