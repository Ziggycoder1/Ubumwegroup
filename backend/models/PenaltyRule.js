const mongoose = require('mongoose');

const PenaltyRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true }
});

module.exports = mongoose.model('PenaltyRule', PenaltyRuleSchema); 