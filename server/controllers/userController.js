const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    // Save user to database - password will be hashed via mongoose middleware
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret123',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in user registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret123',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in user login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting current user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
