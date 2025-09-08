const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, role } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'Member' } = req.body;
    
    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user - let Mongoose handle the password hashing via pre-save hook
    const user = new User({
      email,
      username,
      password, // This will be hashed by the pre-save hook
      role,
      status: 'active'
    });

    await user.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    // Find user by email and explicitly include the password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password using the model method
    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${email}: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    try {
      // Generate JWT
      const token = jwt.sign(
        { 
          userId: user._id, 
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Increased expiry to 7 days for testing
      );

      // Success response
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
      
    } catch (jwtError) {
      console.error('JWT Error:', jwtError);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: jwtError.message
      });
    }

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Protected route example
router.get('/protected', auth, (req, res) => {
  res.json({ message: `Hello, ${req.user.role}! You are authenticated.` });
});

// Admin-only route example
router.get('/admin', auth, role('Admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // In a real app, send this token via email to the user
    // e.g., sendEmail(user.email, `Reset link: https://yourapp.com/reset-password?token=${resetToken}`)
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ message: 'No token provided' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test route to create a test user (remove in production)
router.post('/test/create-user', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user - let Mongoose handle the password hashing via pre-save hook
    const user = new User({
      email,
      username,
      password, // This will be hashed by the pre-save hook
      role: 'Admin',
      status: 'active'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test user',
      error: error.message
    });
  }
});

module.exports = router; 
