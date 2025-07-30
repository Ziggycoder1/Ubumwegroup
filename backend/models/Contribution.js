const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' }
});

module.exports = mongoose.model('Contribution', ContributionSchema); 