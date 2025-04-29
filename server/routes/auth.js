const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  console.log('Register Request Body:', JSON.stringify(req.body, null, 2));
  const { name, email, phone, password, role } = req.body;

  // Log raw input
  console.log('Raw Input:', { name, email, phone, password, role, roleType: typeof role });

  // Validate required fields
  if (!name || !email || !phone || !password || !role) {
    console.log('Missing Fields:', { name, email, phone, password, role });
    return res.status(400).json({ msg: 'All fields are required', missingFields: { name, email, phone, password, role } });
  }

  // Log role validation
  const validRoles = ['tenant', 'landlord', 'broker', 'admin'];
  console.log('Valid Roles:', validRoles);
  console.log('Received Role:', role);
  console.log('Role Check:', validRoles.includes(role));

  // Temporarily bypass role validation
  // if (!validRoles.includes(role)) {
  //   console.log('Role Validation Failed:', { receivedRole: role, validRoles });
  //   return res.status(400).json({ error: 'Invalid role', receivedRole: role, validRoles });
  // }

  try {
    // Check for existing user
    console.log('Checking User:', email);
    let user = await User.findOne({ email });
    if (user) {
      console.log('User Exists:', email);
      return res.status(400).json({ msg: 'User already exists', email });
    }

    // Create user
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
    if (err.message.includes('role')) {
      return res.status(400).json({ msg: 'Invalid role', error: err.message, receivedRole: role });
    }
    return res.status(400).json({ msg: 'Registration failed', error: err.message });
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

    // Verify password
    console.log('Verifying Password for:', email);
    const isMatch = await user.matchPassword(password);
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

router.get('/me', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Me Error:', { message: err.message, stack: err.stack });
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;