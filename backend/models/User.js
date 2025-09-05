const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member', 'Finance'], default: 'Member' },
  phone: { type: String },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  token: { type: String },
  tokenExpires: { type: Date }
}, { timestamps: true });

// Generate auth token
UserSchema.methods.generateAuthToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.token = token;
  this.tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema); 