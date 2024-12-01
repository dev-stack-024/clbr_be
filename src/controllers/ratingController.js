// src/controllers/ratingController.js
const Rating = require('../models/ratingModel');
const Business = require('../models/businessModel');

// Create or update a rating for a business
exports.rateBusiness = async (req, res) => {
  try {
    const { businessId, rating } = req.body;
    const userId = req.userId;
    // Find the existing rating or create a new one
    const updatedRating = await Rating.findOneAndUpdate(
      { business: businessId, user: userId }, // Find the rating by business and user
      { rating }, // Update the rating value
      { new: true, upsert: true } // Create if not found (upsert: true)
    );

    const ratings = await Rating.find({ business: businessId });

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : null;

    await Business.findOneAndUpdate({ _id: businessId }, { averageRating });
    console.log('Average Rating:', averageRating);

    return res.status(200).json({ message: 'Rating saved', rating: updatedRating });
  } catch (error) {
    console.error('Error saving rating:', error);
    return res.status(500).json({ message: 'Error saving rating', error: error.message });
  }
};
