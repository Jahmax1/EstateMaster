const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'land', 'commercial'],
    required: [true, 'Type is required'],
  },
  rentPrice: {
    type: Number,
  },
  purchasePrice: {
    type: Number,
  },
  photos: [{
    type: String,
    required: [true, 'At least one photo is required'],
  }],
  videos: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'sold'],
    default: 'available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);