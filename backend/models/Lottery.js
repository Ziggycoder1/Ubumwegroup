const mongoose = require('mongoose');

const LotterySchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  boughtBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'skipped', 'bought'], default: 'active' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  drawDate: { type: Date },
});

module.exports = mongoose.model('Lottery', LotterySchema); 