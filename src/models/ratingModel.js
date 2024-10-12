const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }, // Reference to the Business model
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating value (1-5 stars)
  createdAt: { type: Date, default: Date.now },
});

// Ensure a user can rate a business only once
ratingSchema.index({ business: 1, user: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;