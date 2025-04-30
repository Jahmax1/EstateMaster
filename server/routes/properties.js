const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Property = require('../models/Property');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) and videos (mp4) allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Get all properties with filters
router.get('/', async (req, res) => {
  console.log('GET /api/properties received with query:', req.query);
  try {
    const query = {};
    if (req.query.region) {
      query.region = { $regex: req.query.region, $options: 'i' };
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.maxPrice) {
      query.rentPrice = { $lte: parseInt(req.query.maxPrice) };
    }
    if (req.query.lat && req.query.lng && req.query.radius) {
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(req.query.lng), parseFloat(req.query.lat)],
            parseFloat(req.query.radius) / 6378.1, // Radius in kilometers
          ],
        },
      };
    }

    const properties = await Property.find(query).populate('owner', 'name email');
    console.log('MongoDB query:', query);
    console.log('Properties found:', properties.length);
    res.json(properties);
  } catch (err) {
    console.error('Get Properties Error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  console.log('GET /api/properties/:id:', req.params.id);
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (!property) {
      console.log('Property not found:', req.params.id);
      return res.status(404).json({ msg: 'Property not found' });
    }
    console.log('Property fetched:', property._id);
    res.json(property);
  } catch (err) {
    console.error('Get Property Error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add new property
router.post('/', [auth, upload.array('files', 5)], async (req, res) => {
  console.log('POST /api/properties Request Body:', req.body);
  console.log('Uploaded Files:', req.files);
  try {
    const { title, description, region, district, address, type, rentPrice, purchasePrice, latitude, longitude } = req.body;

    // Validate required fields
    if (!title || !description || !region || !district || !address || !type || !req.files.length) {
      console.log('Missing Fields:', { title, description, region, district, address, type, files: req.files.length });
      return res.status(400).json({ msg: 'All fields and at least one file are required' });
    }

    // Separate photos and videos
    const photos = req.files
      .filter(file => file.mimetype.startsWith('image'))
      .map(file => `/uploads/${file.filename}`);
    const videos = req.files
      .filter(file => file.mimetype.startsWith('video'))
      .map(file => `/uploads/${file.filename}`);

    // Create property
    const property = new Property({
      title,
      description,
      region,
      district,
      address,
      type,
      rentPrice: rentPrice ? parseInt(rentPrice) : undefined,
      purchasePrice: purchasePrice ? parseInt(purchasePrice) : undefined,
      photos,
      videos,
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      } : undefined,
      owner: req.user.id,
    });

    await property.save();
    console.log('Property Saved:', property._id);
    res.json(property);
  } catch (err) {
    console.error('Add Property Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;