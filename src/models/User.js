const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String },
  passwordHash: { type: String, required: true },
  profilePictureURL: { type: String },
  bio: { type: String },
  joinedDate: { type: Date, default: Date.now },
  badges: { type: Array, default: [] },
  favorites: { type: Array, default: [] },
  role: {
    type: String,
    enum: ['user', 'businessOwner', 'admin'],
    default: 'user',
    required: true
  },
  isActive: { type: Boolean, default: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpiry: { type: Date }
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

