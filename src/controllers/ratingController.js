// src/controllers/ratingController.js
const Rating = require('../models/ratingModel');

// Create or update a rating for a business
exports.rateBusiness = async (req, res) => {
  try {
    const { businessId, rating } = req.body;
    const userId = req.userId; // Assuming req.userId is set by authentication middleware

    // Find the existing rating or create a new one
    const updatedRating = await Rating.findOneAndUpdate(
      { business: businessId, user: userId }, // Find the rating by business and user
      { rating }, // Update the rating value
      { new: true, upsert: true } // Create if not found (upsert: true)
    );

    return res.status(200).json({ message: 'Rating saved', rating: updatedRating });
  } catch (error) {
    console.error('Error saving rating:', error);
    return res.status(500).json({ message: 'Error saving rating', error: error.message });
  }
};
