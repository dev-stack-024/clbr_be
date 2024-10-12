// src/controllers/reviewController.js
const Review = require('../models/reviewModel');

// Create a new review for a business
exports.createReview = async (req, res) => {
  try {
    const { businessId, reviewText, images } = req.body;
    const userId = req.userId; // Assuming req.userId is set by authentication middleware

    // Create a new review
    const newReview = new Review({
      business: businessId,
      user: userId,
      reviewText,
      images: images ? images.split(',').map(image => image.trim()) : [], // Split and trim images if provided
    });

    await newReview.save();
    return res.status(201).json({ message: 'Review created', review: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};
