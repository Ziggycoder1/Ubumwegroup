const express = require('express');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const router = express.Router();

// Add new contribution
router.post('/', async (req, res) => {
  try {
    const { member, amount, month, year, status } = req.body;
    // Optionally validate user exists
    const userExists = await User.findById(member);
    if (!userExists) return res.status(404).json({ message: 'User not found' });
    const contribution = new Contribution({ member, amount, month, year, status });
    await contribution.save();
    res.status(201).json(contribution);
  } catch (err) {
    res.status(400).json({ message: 'Error creating contribution', error: err.message });
  }
});

// Get all contributions
router.get('/', async (req, res) => {
  try {
    const contributions = await Contribution.find().populate('member');
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get contributions for a member
router.get('/:memberId', async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.params.memberId });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a contribution
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contribution.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Contribution not found' });
    res.json({ message: 'Contribution deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting contribution', error: err.message });
  }
});

// Reminders: Get members with unpaid contributions for a given month/year
router.get('/reminders/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const allUsers = await User.find({ status: 'active' });
    const paid = await Contribution.find({ year, month }).distinct('member');
    const unpaidUsers = allUsers.filter(u => !paid.map(id => id.toString()).includes(u._id.toString()));
    res.json(unpaidUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error generating reminders', error: err.message });
  }
});

// Monthly report: total contributions for a given month/year
router.get('/report/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const total = await Contribution.aggregate([
      { $match: { year: parseInt(year), month: parseInt(month) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({ year, month, total: total[0]?.total || 0, count: total[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error generating monthly report', error: err.message });
  }
});

// Historical report: total contributions by month/year
router.get('/report/historical', async (req, res) => {
  try {
    const history = await Contribution.aggregate([
      { $group: { _id: { year: '$year', month: '$month' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error generating historical report', error: err.message });
  }
});

module.exports = router; 