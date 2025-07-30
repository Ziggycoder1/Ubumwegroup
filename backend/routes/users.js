const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get all users (with role Member, Admin, or Finance)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['Member', 'Admin', 'Finance'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by email (for login/profile linking)
router.get('/', async (req, res) => {
  try {
    if (req.query.email) {
      const user = await User.find({ email: req.query.email });
      return res.json(user);
    }
    const users = await User.find({ role: { $in: ['Member', 'Admin', 'Finance'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add new user
router.post('/', async (req, res) => {
  try {
    const { username, email, phone, role, password, status } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({
      username,
      email,
      phone,
      role: role || 'Member',
      status: status || 'active',
      password
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

module.exports = router; 