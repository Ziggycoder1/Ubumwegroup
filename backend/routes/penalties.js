const express = require('express');
const Penalty = require('../models/Penalty');
const PenaltyRule = require('../models/PenaltyRule');
const User = require('../models/User');
const router = express.Router();

// Assign penalty
router.post('/', async (req, res) => {
  try {
    const { member, reason, amount, rule } = req.body;
    const userExists = await User.findById(member);
    if (!userExists) return res.status(404).json({ message: 'User not found' });
    const penalty = new Penalty({ member, reason, amount, rule });
    await penalty.save();
    res.status(201).json(penalty);
  } catch (err) {
    res.status(400).json({ message: 'Error assigning penalty', error: err.message });
  }
});

// Mark penalty as paid
router.put('/pay/:penaltyId', async (req, res) => {
  try {
    const penalty = await Penalty.findById(req.params.penaltyId);
    if (!penalty) return res.status(404).json({ message: 'Penalty not found' });
    penalty.status = 'paid';
    penalty.paidAt = new Date();
    await penalty.save();
    res.json(penalty);
  } catch (err) {
    res.status(400).json({ message: 'Error marking penalty as paid', error: err.message });
  }
});

// List all penalties (optionally filter by member/status)
router.get('/', async (req, res) => {
  try {
    const { member, status } = req.query;
    const filter = {};
    if (member) filter.member = member;
    if (status) filter.status = status;
    const penalties = await Penalty.find(filter).populate('member').populate('rule');
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching penalties', error: err.message });
  }
});

// List preset rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await PenaltyRule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rules', error: err.message });
  }
});

// Add preset rule
router.post('/rules', async (req, res) => {
  try {
    const { name, description, amount } = req.body;
    const rule = new PenaltyRule({ name, description, amount });
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: 'Error creating rule', error: err.message });
  }
});

module.exports = router; 