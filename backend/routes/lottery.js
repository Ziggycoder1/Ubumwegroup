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
    const { member, months } = req.body;
    
    // Validate request
    if (!member || !months || !Array.isArray(months) || months.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Member ID and months array are required.'
      });
    }

    // Process multiple months
    const results = await Promise.all(months.map(async ({ month, year }) => {
      try {
        // Validate month and year
        if (!month || !year) {
          return { 
            month: month || 'invalid', 
            year: year || 'invalid', 
            success: false, 
            message: 'Month and year are required' 
          };
        }

        // Check if lottery already exists for this month
        const existingLottery = await Lottery.findOne({ month: Number(month), year: Number(year) });
        if (existingLottery) {
          return { 
            month: Number(month), 
            year: Number(year), 
            success: false, 
            message: 'Lottery already exists for this month' 
          };
        }

        // Create new lottery entry
        const lottery = new Lottery({
          month: Number(month),
          year: Number(year),
          boughtBy: member,
          status: 'bought',
          buyoutDate: new Date(),
          drawDate: null
        });
        
        await lottery.save();
        return { 
          month: Number(month), 
          year: Number(year), 
          success: true, 
          lotteryId: lottery._id 
        };
      } catch (err) {
        console.error('Error processing month:', { month, year, error: err });
        return { 
          month: month, 
          year: year, 
          success: false, 
          message: err.message || 'Error processing this month' 
        };
      }
    }));

    // Check if any operations were successful
    const hasSuccess = results.some(r => r.success);
    
    res.status(hasSuccess ? 200 : 400).json({ 
      success: hasSuccess,
      message: hasSuccess 
        ? 'Lottery buyout processed' 
        : 'Failed to process any lottery buyouts',
      results 
    });
  } catch (err) {
    console.error('Error in buyout endpoint:', err);
    res.status(400).json({ 
      success: false,
      message: 'Error processing lottery buyout', 
      error: err.message 
    });
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