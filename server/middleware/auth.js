const jwt = require('jsonwebtoken');
const config = require('dotenv').config();

module.exports = async (req, res, next) => {
  console.log('Auth middleware: Checking token');
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Token decoded:', decoded.user);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};