const mongoose = require('mongoose');

const PenaltySchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  assignedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  rule: { type: mongoose.Schema.Types.ObjectId, ref: 'PenaltyRule' }
});

module.exports = mongoose.model('Penalty', PenaltySchema); 