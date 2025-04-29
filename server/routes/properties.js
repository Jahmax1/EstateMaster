const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).array('photos', 5);

router.post('/', auth, upload, async (req, res) => {
  console.log('POST /api/properties received:', req.body, req.files);
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
    description,
    type,
  } = req.body;
  const photos = req.files.map((file) => file.path);

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
    console.log('Property created:', property._id);
    res.json(property);
  } catch (err) {
    console.error('Create Property Error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/', async (req, res) => {
  console.log('GET /api/properties received with query:', req.query);
  try {
    const { region, type, maxPrice } = req.query;
    const query = {};
    if (region) query.region = new RegExp(region, 'i');
    if (type) query.type = type;
    if (maxPrice) query.rentPrice = { $lte: Number(maxPrice) };
    console.log('MongoDB query:', query);
    const properties = await Property.find(query).populate('owner', 'name email phone');
    console.log('Properties found:', properties.length);
    res.json(properties);
  } catch (err) {
    console.error('Get Properties Error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;