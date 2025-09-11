const mongoose = require('mongoose');

const LotterySchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  boughtBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'bought', 'active', 'skipped'], default: 'pending' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  drawDate: { type: Date },
  totalAmount: { type: Number, default: 1000 }, // Default lottery amount
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  buyoutDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update updatedAt
LotterySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Lottery', LotterySchema);