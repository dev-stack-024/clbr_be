
// src/models/businessModel.js
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  description: { type: String },
  images: { type: [String], default: [] }, // Array of image URLs
  createdAt: { type: Date, default: Date.now },
  businessOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true }, // GeoJSON type
    coordinates: { type: [Number], required: true } // Array of [longitude, latitude]
  },
  averageRating: { type: Number, default: 0, min: 0, max: 5, get: v => Math.round(v * 10) / 10 },
  amenities: {
    parking: { type: Boolean, default: false, required: true },
    wheelchairAccessible: { type: Boolean, default: false, required: true },
    petFriendly: { type: Boolean, default: false, required: true },
    wifi: { type: Boolean, default: false, required: true },
    outdoorSeating: { type: Boolean, default: false, required: true },
    creditCardAccepted: { type: Boolean, default: false, required: true },
    delivery: { type: Boolean, default: false, required: true }
  }
});

// Create a 2D index on the location field
businessSchema.index({ location: '2dsphere' });

// Create a Business model
const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

