
// src/models/businessModel.js
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., restaurant, shop, service
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
});

// Create a 2D index on the location field
businessSchema.index({ location: '2dsphere' });

// Create a Business model
const Business = mongoose.model('Business', businessSchema);
module.exports = Business;

