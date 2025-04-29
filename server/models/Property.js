const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  region: { type: String, required: [true, 'Region is required'], trim: true },
  district: { type: String, required: [true, 'District is required'], trim: true },
  division: { type: String, trim: true },
  neighborhood: { type: String, trim: true },
  buildingName: { type: String, trim: true },
  unitNumber: { type: String, trim: true },
  rentPrice: { type: Number, min: 0 },
  purchasePrice: { type: Number, min: 0 },
  photos: [{ type: String }],
  description: { type: String, trim: true },
  availability: {
    type: String,
    enum: ['available', 'taken'],
    default: 'available',
  },
  type: {
    type: String,
    enum: ['house', 'apartment', 'condo', 'land', 'commercial'],
    required: [true, 'Property type is required'],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Property', PropertySchema);