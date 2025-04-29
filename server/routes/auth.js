const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  console.log('Register Request Body:', JSON.stringify(req.body, null, 2));
  const { name, email, phone, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password || !role) {
    console.log('Missing Fields:', { name, email, phone, password, role });
    return res.status(400).json({ msg: 'All fields are required', missingFields: { name, email, phone, password, role } });
  }

  // Validate role
  const validRoles = ['tenant', 'landlord', 'broker', 'admin'];
  console.log('Valid Roles:', validRoles);
  console.log('Received Role:', role);
  console.log('Role Check:', validRoles.includes(role));
  if (!validRoles.includes(role)) {
    console.log('Role Validation Failed:', { receivedRole: role, validRoles });
    return res.status(400).json({ msg: 'Invalid role', receivedRole: role, validRoles });
  }

  try {
    // Check for existing user
    console.log('Checking User:', email);
    let user = await User.findOne({ email });
    if (user) {
      console.log('User Exists:', email);
      return res.status(400).json({ msg: 'User already exists', email });
    }

    // Create user (password will be hashed in User.js pre('save'))
    console.log('Creating User:', { name, email, phone, role });
    user = new User({ name, email, phone, password, role });
    await user.save();
    console.log('User Saved:', user._id);

    // Generate JWT
    console.log('Generating JWT');
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT Generated');

    res.json({ token, role });
  } catch (err) {
    console.error('Register Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      validationErrors: err.errors ? Object.values(err.errors).map(e => e.message) : null,
    });
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login Request Body:', JSON.stringify(req.body, null, 2));
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    console.log('Missing Fields:', { email, password });
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    // Check for user
    console.log('Checking User:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User Not Found:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Log stored password hash (for debugging)
    console.log('Stored Password Hash:', user.password);

    // Verify password
    console.log('Verifying Password for:', email);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match Result:', isMatch);
    if (!isMatch) {
      console.log('Password Mismatch:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    console.log('Generating JWT for:', email);
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT Generated for:', email);

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  console.log('GET /api/auth/me: Fetching user:', req.user.id);
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('GET /api/auth/me: User not found:', req.user.id);
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('GET /api/auth/me: User fetched:', user.email);
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Get Me Error:', { message: err.message, stack: err.stack });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;