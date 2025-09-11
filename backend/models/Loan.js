const mongoose = require('mongoose');

const RepaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  principalAmount: { type: Number, default: 0 },
  interestAmount: { type: Number, default: 0 },
  interestRate: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  paidAt: { type: Date, default: Date.now }
}, { _id: false });

const LoanSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  requestedAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  repayments: { type: [RepaymentSchema], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  interest: { type: Number, default: 0 }, // current interest rate
  penalty: { type: Number, default: 0 },
  totalInterestPaid: { type: Number, default: 0 }
});

module.exports = mongoose.model('Loan', LoanSchema);