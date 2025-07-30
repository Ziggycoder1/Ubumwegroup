const express = require('express');
const Loan = require('../models/Loan');
const User = require('../models/User');
const router = express.Router();

// Member requests a loan
router.post('/', async (req, res) => {
  try {
    const { member, amount } = req.body;
    const userExists = await User.findById(member);
    if (!userExists) return res.status(404).json({ message: 'User not found' });
    const loan = new Loan({ member, amount });
    await loan.save();
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ message: 'Error requesting loan', error: err.message });
  }
});

// Admin approves a loan
router.put('/approve/:loanId', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.approved) return res.status(400).json({ message: 'Loan already approved' });
    loan.approved = true;
    loan.approvedAt = new Date();
    loan.status = 'approved';
    loan.interest = 5; // 5% for first 3 months
    await loan.save();
    res.json(loan);
  } catch (err) {
    res.status(400).json({ message: 'Error approving loan', error: err.message });
  }
});

// Member repays a loan (partial or full)
router.post('/repay/:loanId', async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (!loan.approved) return res.status(400).json({ message: 'Loan not approved' });
    loan.repayments.push({ amount });
    // Calculate total repaid
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
    // Calculate months since approval
    const months = Math.floor((Date.now() - new Date(loan.approvedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
    let interestRate = 5;
    if (months >= 3) interestRate = 10;
    loan.interest = interestRate;
    // If fully paid
    if (totalRepaid >= loan.amount) {
      loan.status = 'paid';
    }
    await loan.save();
    res.json(loan);
  } catch (err) {
    res.status(400).json({ message: 'Error repaying loan', error: err.message });
  }
});

// Get all loans (admin)
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().populate('member');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get loans for a member
router.get('/:memberId', async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.params.memberId });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 