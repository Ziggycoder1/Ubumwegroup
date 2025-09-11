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
    const loan = new Loan({ 
      member, 
      amount,
      originalAmount: amount,
      remainingBalance: amount
    });
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

// Admin adds repayment with interest calculation
router.post('/admin-repay/:loanId', async (req, res) => {
  try {
    const { amount } = req.body;
    console.log('Processing repayment:', { loanId: req.params.loanId, amount });
    
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      console.log('Loan not found:', req.params.loanId);
      return res.status(404).json({ message: 'Loan not found' });
    }
    if (!loan.approved) {
      console.log('Loan not approved:', loan._id);
      return res.status(400).json({ message: 'Loan not approved' });
    }
    if (loan.status === 'paid') {
      console.log('Loan already paid:', loan._id);
      return res.status(400).json({ message: 'Loan already paid' });
    }
    if (amount <= 0) {
      console.log('Invalid payment amount:', amount);
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }
    
    // Backward compatibility: Initialize missing fields for existing loans
    if (!loan.originalAmount) {
      loan.originalAmount = loan.amount;
      console.log('Set originalAmount:', loan.originalAmount);
    }
    if (!loan.remainingBalance) {
      // Calculate remaining balance from existing repayments
      const totalRepaid = loan.repayments?.reduce((sum, r) => sum + (r.principalAmount || r.amount), 0) || 0;
      loan.remainingBalance = Math.max(0, loan.originalAmount - totalRepaid);
      console.log('Calculated remainingBalance:', loan.remainingBalance, 'from totalRepaid:', totalRepaid);
    }
    if (!loan.totalInterestPaid) {
      loan.totalInterestPaid = loan.repayments?.reduce((sum, r) => sum + (r.interestAmount || 0), 0) || 0;
      console.log('Set totalInterestPaid:', loan.totalInterestPaid);
    }
    
    // Calculate months since approval
    const approvalDate = new Date(loan.approvedAt);
    const currentDate = new Date();
    const monthsDiff = Math.floor((currentDate - approvalDate) / (1000 * 60 * 60 * 24 * 30));
    
    // Calculate interest based on duration
    let interestRate = 5; // Default 5% for loans under 3 months
    if (monthsDiff >= 3) {
      interestRate = 10; // 10% for loans 3 months or older
    }
    
    // Calculate interest for this payment
    const interestAmount = (amount * interestRate) / 100;
    const totalPaymentAmount = amount + interestAmount;
    
    // Calculate how much of the payment goes to principal vs interest
    let principalAmount = amount;
    let actualInterestAmount = interestAmount;
    
    // If remaining balance is less than payment amount, adjust
    if (principalAmount > loan.remainingBalance) {
      principalAmount = loan.remainingBalance;
      actualInterestAmount = (principalAmount * interestRate) / 100;
    }
    
    // Update remaining balance
    const newRemainingBalance = Math.max(0, loan.remainingBalance - principalAmount);
    
    // Add repayment with detailed breakdown
    loan.repayments.push({ 
      amount: totalPaymentAmount,
      principalAmount: principalAmount,
      interestAmount: actualInterestAmount,
      interestRate: interestRate,
      remainingBalance: newRemainingBalance,
      paidAt: new Date()
    });
    
    // Update loan fields
    loan.interest = interestRate;
    loan.remainingBalance = newRemainingBalance;
    loan.totalInterestPaid += actualInterestAmount;
    
    // Check if loan is fully paid
    if (newRemainingBalance === 0) {
      loan.status = 'paid';
    }
    
    console.log('Saving loan with new repayment:', {
      paymentAmount: totalPaymentAmount,
      principalAmount: principalAmount,
      interestAmount: actualInterestAmount,
      newRemainingBalance: newRemainingBalance,
      totalInterestPaid: loan.totalInterestPaid
    });
    
    await loan.save();
    console.log('Loan saved successfully');
    
    res.json({
      loan,
      paymentAmount: totalPaymentAmount,
      principalAmount: principalAmount,
      interestAmount: actualInterestAmount,
      interestRate: interestRate,
      remainingBalance: newRemainingBalance,
      totalInterestPaid: loan.totalInterestPaid
    });
  } catch (err) {
    console.error('Error processing repayment:', err);
    res.status(400).json({ message: 'Error processing repayment', error: err.message });
  }
});

// Get all loans (admin)
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find().populate('member');
    
    // Add backward compatibility for existing loans
    const processedLoans = loans.map(loan => {
      if (!loan.originalAmount) {
        loan.originalAmount = loan.amount;
      }
      if (!loan.remainingBalance) {
        const totalRepaid = loan.repayments?.reduce((sum, r) => sum + (r.principalAmount || r.amount), 0) || 0;
        loan.remainingBalance = Math.max(0, loan.originalAmount - totalRepaid);
      }
      if (!loan.totalInterestPaid) {
        loan.totalInterestPaid = loan.repayments?.reduce((sum, r) => sum + (r.interestAmount || 0), 0) || 0;
      }
      return loan;
    });
    
    res.json(processedLoans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get loans for a member
router.get('/:memberId', async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.params.memberId });
    
    // Add backward compatibility for existing loans
    const processedLoans = loans.map(loan => {
      if (!loan.originalAmount) {
        loan.originalAmount = loan.amount;
      }
      if (!loan.remainingBalance) {
        const totalRepaid = loan.repayments?.reduce((sum, r) => sum + (r.principalAmount || r.amount), 0) || 0;
        loan.remainingBalance = Math.max(0, loan.originalAmount - totalRepaid);
      }
      if (!loan.totalInterestPaid) {
        loan.totalInterestPaid = loan.repayments?.reduce((sum, r) => sum + (r.interestAmount || 0), 0) || 0;
      }
      return loan;
    });
    
    res.json(processedLoans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 