const express = require('express');
const Lottery = require('../models/Lottery');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get current lottery status
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Find current month lottery
    const currentLottery = await Lottery.findOne({ 
      month: currentMonth, 
      year: currentYear 
    }).populate('winner').populate('boughtBy').populate('requestedBy').populate('approvedBy');
    
    // Get all lotteries for the year to determine available months
    const yearLotteries = await Lottery.find({ year: currentYear });
    const boughtMonths = yearLotteries.filter(l => l.status === 'bought').map(l => l.month);
    
    res.json({
      currentLottery,
      currentMonth,
      currentYear,
      boughtMonths,
      totalFund: yearLotteries.reduce((sum, l) => sum + (l.totalAmount || 10000), 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching current lottery', error: err.message });
  }
});

// Buyout lottery months directly (no approval needed) - handles bulk purchases
router.post('/buyout', auth, async (req, res) => {
  try {
    const { member, months } = req.body;
    
    // Handle new payload format from LotteryParticipation
    if (member && months && Array.isArray(months)) {
      const results = [];
      
      for (const { month, year } of months) {
        try {
          // Check if lottery already exists for this month/year
          const existingLottery = await Lottery.findOne({ month, year });
          if (existingLottery) {
            results.push({
              month,
              year,
              success: false,
              message: 'Lottery already exists for this month/year'
            });
            continue;
          }
          
          // Create new lottery with bought status - members pay 10000 RWF to buy lottery months
          const lottery = new Lottery({
            month,
            year,
            status: 'bought',
            totalAmount: 10000, // Members pay 10000 RWF to buy lottery months
            boughtBy: member,
            buyoutDate: new Date(),
            createdAt: new Date()
          });
          
          await lottery.save();
          
          results.push({
            month,
            year,
            success: true,
            message: 'Lottery buyout completed successfully',
            lottery
          });
        } catch (error) {
          results.push({
            month,
            year,
            success: false,
            message: error.message || 'Failed to process lottery buyout'
          });
        }
      }
      
      const successfulCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      res.json({
        success: successfulCount > 0,
        message: `Processed ${months.length} months: ${successfulCount} successful, ${failedCount} failed`,
        results
      });
      return;
    }
    
    // Handle legacy single month format
    const { month, year, totalAmount = 0 } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }
    
    // Check if lottery already exists for this month/year
    const existingLottery = await Lottery.findOne({ month, year });
    if (existingLottery) {
      return res.status(400).json({ success: false, message: 'Lottery already exists for this month/year' });
    }
    
    // Create new lottery with bought status - members pay 10000 RWF to buy lottery months
    const lottery = new Lottery({
      month,
      year,
      status: 'bought',
      totalAmount: 10000, // Members pay 10000 RWF to buy lottery months
      boughtBy: req.user._id,
      buyoutDate: new Date(),
      createdAt: new Date()
    });
    
    await lottery.save();
    
    res.json({
      success: true,
      message: 'Lottery buyout completed successfully',
      lottery
    });
  } catch (error) {
    console.error('Error processing lottery buyout:', error);
    res.status(500).json({ success: false, message: 'Failed to process lottery buyout' });
  }
});

// Draw the monthly lottery (admin)
router.post('/draw', async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Check if lottery already exists for this month
    const existingLottery = await Lottery.findOne({ month: Number(month), year: Number(year) });
    if (existingLottery) {
      return res.status(400).json({ success: false, message: 'Lottery already exists for this month' });
    }
    
    // Check if month is bought
    const boughtLottery = await Lottery.findOne({ 
      month: Number(month), 
      year: Number(year),
      status: 'bought'
    });
    
    if (boughtLottery) {
      return res.status(400).json({ 
        success: false, 
        message: 'This month has been bought out and cannot be drawn' 
      });
    }
    
    // Get all members for lottery pool
    const members = await User.find({ role: 'Member' });
    
    if (members.length === 0) {
      return res.status(400).json({ success: false, message: 'No members available for lottery' });
    }
    
    // Select random winner
    const randomIndex = Math.floor(Math.random() * members.length);
    const winner = members[randomIndex];
    
    // Create lottery record with 0 amount since money is for needy people only
    const lottery = new Lottery({
      month: Number(month),
      year: Number(year),
      winner: winner._id,
      status: 'active',
      totalAmount: 0, // No money for lottery winners - for needy people only
      participants: members.map(m => m._id),
      drawDate: new Date(),
      createdAt: new Date()
    });
    
    await lottery.save();
    
    res.json({
      success: true,
      message: 'Lottery drawn successfully',
      winner: winner.username,
      lottery
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: 'Error drawing lottery', 
      error: err.message 
    });
  }
});

// Legacy endpoints for backward compatibility - return empty arrays
router.get('/pending', auth, async (req, res) => {
  res.json([]);
});

router.get('/approved', auth, async (req, res) => {
  res.json([]);
});

// Get lottery history
router.get('/history', async (req, res) => {
  try {
    const history = await Lottery.find()
      .populate('winner')
      .populate('boughtBy')
      .populate('requestedBy')
      .populate('approvedBy')
      .sort({ year: -1, month: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lottery history', error: err.message });
  }
});

// Get lottery statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const stats = await Lottery.aggregate([
      { $match: { year: currentYear } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalFund = await Lottery.aggregate([
      { $match: { year: currentYear, status: 'bought' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    res.json({
      byStatus: stats,
      totalFund: totalFund[0]?.total || 0,
      year: currentYear
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lottery statistics', error: err.message });
  }
});

module.exports = router; 