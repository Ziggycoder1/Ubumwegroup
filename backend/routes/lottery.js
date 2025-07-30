const express = require('express');
const Lottery = require('../models/Lottery');
const User = require('../models/User');
const router = express.Router();

// Draw the monthly lottery (admin)
router.post('/draw', async (req, res) => {
  try {
    const { month, year } = req.body;
    // Find users who have not won in the current cycle
    const pastLotteries = await Lottery.find({ year });
    const winners = pastLotteries.map(l => l.winner?.toString()).filter(Boolean);
    const eligibleUsers = await User.find({ status: 'active', _id: { $nin: winners } });
    if (eligibleUsers.length === 0) {
      // Reset cycle if all have won
      const allActive = await User.find({ status: 'active' });
      eligibleUsers.push(...allActive);
    }
    // Pick a random winner
    const winner = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const lottery = new Lottery({
      month,
      year,
      winner: winner._id,
      participants: eligibleUsers.map(u => u._id),
      status: 'active',
      drawDate: new Date(),
    });
    await lottery.save();
    res.json({ winner: winner.username, lottery });
  } catch (err) {
    res.status(400).json({ message: 'Error drawing lottery', error: err.message });
  }
});

// Buyout (user)
router.post('/buyout', async (req, res) => {
  try {
    const { member, month, year } = req.body;
    // Mark lottery as bought for this month
    const lottery = new Lottery({
      month,
      year,
      boughtBy: member,
      status: 'bought',
      drawDate: new Date(),
    });
    await lottery.save();
    res.json({ message: 'Lottery bought out', lottery });
  } catch (err) {
    res.status(400).json({ message: 'Error buying out lottery', error: err.message });
  }
});

// Get lottery history
router.get('/history', async (req, res) => {
  try {
    const history = await Lottery.find().populate('winner').populate('boughtBy').sort({ year: -1, month: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lottery history', error: err.message });
  }
});

module.exports = router; 