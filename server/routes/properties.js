const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Property = require('../models/Property');

// Create a property (landlord only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ msg: 'Only landlords can create properties' });
  }

  const {
    region,
    district,
    division,
    neighborhood,
    buildingName,
    unitNumber,
    rentPrice,
    purchasePrice,
    photos,
    description,
    type,
  } = req.body;

  try {
    const property = new Property({
      owner: req.user.id,
      region,
      district,
      division,
      neighborhood,
      buildingName,
      unitNumber,
      rentPrice,
      purchasePrice,
      photos,
      description,
      type,
    });
    await property.save();
    res.json(property);
  } catch (err) {
    console.error('Create Property Error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all properties (public)
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'name email phone');
    res.json(properties);
  } catch (err) {
    console.error('Get Properties Error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;