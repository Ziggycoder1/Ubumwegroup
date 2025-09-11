const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Lottery = require('../models/Lottery');
const Penalty = require('../models/Penalty');
const User = require('../models/User');

// Get earnings summary
router.get('/summary', async (req, res) => {
  try {
    // Get current date for filtering
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Calculate earnings from contributions (only paid contributions)
    const contributionEarnings = await Contribution.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          currentMonth: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$month', currentMonth] },
                  { $eq: ['$year', currentYear] }
                ]},
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Calculate earnings from loan interests and penalties
    const loanEarnings = await Loan.aggregate([
      { $match: { status: { $in: ['approved', 'paid'] } } },
      {
        $group: {
          _id: null,
          totalInterest: { $sum: '$totalInterestPaid' },
          totalPenalty: { $sum: '$penalty' },
          currentMonthInterest: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: [{ $month: '$approvedAt' }, currentMonth] },
                  { $eq: [{ $year: '$approvedAt' }, currentYear] }
                ]},
                '$totalInterestPaid',
                0
              ]
            }
          },
          currentMonthPenalty: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: [{ $month: '$approvedAt' }, currentMonth] },
                  { $eq: [{ $year: '$approvedAt' }, currentYear] }
                ]},
                '$penalty',
                0
              ]
            }
          }
        }
      }
    ]);

    // Calculate earnings from lottery sales
    const lotteryEarnings = await Lottery.aggregate([
      { $match: { status: 'bought' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }, // Use actual totalAmount from lottery records
          currentMonth: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: [{ $month: '$buyoutDate' }, currentMonth] },
                  { $eq: [{ $year: '$buyoutDate' }, currentYear] }
                ]},
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Calculate earnings from penalties (only paid penalties)
    const penaltyEarnings = await Penalty.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          currentMonth: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: [{ $month: '$paidAt' }, currentMonth] },
                  { $eq: [{ $year: '$paidAt' }, currentYear] }
                ]},
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Calculate monthly breakdown for the current year
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const contributions = await Contribution.aggregate([
        { $match: { 
          status: 'paid',
          month: month,
          year: currentYear
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const loans = await Loan.aggregate([
        { $match: { 
          status: { $in: ['approved', 'paid'] },
          $expr: {
            $and: [
              { $eq: [{ $month: '$approvedAt' }, month] },
              { $eq: [{ $year: '$approvedAt' }, currentYear] }
            ]
          }
        }},
        { $group: { 
          _id: null, 
          interest: { $sum: '$totalInterestPaid' },
          penalty: { $sum: '$penalty' }
        }}
      ]);

      const lotteries = await Lottery.aggregate([
        { $match: { 
          status: 'bought',
          $expr: {
            $and: [
              { $eq: [{ $month: '$buyoutDate' }, month] },
              { $eq: [{ $year: '$buyoutDate' }, currentYear] }
            ]
          }
        }},
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const penalties = await Penalty.aggregate([
        { $match: { 
          status: 'paid',
          $expr: {
            $and: [
              { $eq: [{ $month: '$paidAt' }, month] },
              { $eq: [{ $year: '$paidAt' }, currentYear] }
            ]
          }
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      monthlyBreakdown.push({
        month,
        contributions: contributions[0]?.total || 0,
        loanInterest: loans[0]?.interest || 0,
        loanPenalty: loans[0]?.penalty || 0,
        lottery: lotteries[0]?.total || 0,
        penalties: penalties[0]?.total || 0,
        total: (contributions[0]?.total || 0) + 
               (loans[0]?.interest || 0) + 
               (loans[0]?.penalty || 0) + 
               (lotteries[0]?.total || 0) + 
               (penalties[0]?.total || 0)
      });
    }

    // Prepare response data
    const summary = {
      totalEarnings: {
        contributions: contributionEarnings[0]?.total || 0,
        loanInterest: loanEarnings[0]?.totalInterest || 0,
        loanPenalty: loanEarnings[0]?.totalPenalty || 0,
        lottery: lotteryEarnings[0]?.total || 0,
        penalties: penaltyEarnings[0]?.total || 0,
        overall: (contributionEarnings[0]?.total || 0) + 
                (loanEarnings[0]?.totalInterest || 0) + 
                (loanEarnings[0]?.totalPenalty || 0) + 
                (lotteryEarnings[0]?.total || 0) + 
                (penaltyEarnings[0]?.total || 0)
      },
      currentMonthEarnings: {
        contributions: contributionEarnings[0]?.currentMonth || 0,
        loanInterest: loanEarnings[0]?.currentMonthInterest || 0,
        loanPenalty: loanEarnings[0]?.currentMonthPenalty || 0,
        lottery: lotteryEarnings[0]?.currentMonth || 0,
        penalties: penaltyEarnings[0]?.currentMonth || 0,
        overall: (contributionEarnings[0]?.currentMonth || 0) + 
                (loanEarnings[0]?.currentMonthInterest || 0) + 
                (loanEarnings[0]?.currentMonthPenalty || 0) + 
                (lotteryEarnings[0]?.currentMonth || 0) + 
                (penaltyEarnings[0]?.currentMonth || 0)
      },
      monthlyBreakdown
    };

    res.json(summary);
  } catch (error) {
    console.error('Error calculating earnings:', error);
    res.status(500).json({ message: 'Error calculating earnings' });
  }
});

// Get earnings by date range
router.get('/by-date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate earnings from contributions
    const contributionEarnings = await Contribution.aggregate([
      { $match: { 
        status: 'paid',
        paidAt: { $gte: start, $lte: end }
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate earnings from loans
    const loanEarnings = await Loan.aggregate([
      { $match: { 
        status: { $in: ['approved', 'paid'] },
        approvedAt: { $gte: start, $lte: end }
      }},
      { $group: { 
        _id: null, 
        interest: { $sum: '$totalInterestPaid' },
        penalty: { $sum: '$penalty' }
      }}
    ]);

    // Calculate earnings from lottery
    const lotteryEarnings = await Lottery.aggregate([
      { $match: { 
        status: 'bought',
        drawDate: { $gte: start, $lte: end }
      }},
      { $group: { _id: null, total: { $sum: 1000 } } }
    ]);

    // Calculate earnings from penalties
    const penaltyEarnings = await Penalty.aggregate([
      { $match: { 
        status: 'paid',
        paidAt: { $gte: start, $lte: end }
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const summary = {
      contributions: contributionEarnings[0]?.total || 0,
      loanInterest: loanEarnings[0]?.interest || 0,
      loanPenalty: loanEarnings[0]?.penalty || 0,
      lottery: lotteryEarnings[0]?.total || 0,
      penalties: penaltyEarnings[0]?.total || 0,
      overall: (contributionEarnings[0]?.total || 0) + 
              (loanEarnings[0]?.interest || 0) + 
              (loanEarnings[0]?.penalty || 0) + 
              (lotteryEarnings[0]?.total || 0) + 
              (penaltyEarnings[0]?.total || 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error calculating earnings by date range:', error);
    res.status(500).json({ message: 'Error calculating earnings by date range' });
  }
});

module.exports = router;
