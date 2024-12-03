// src/controllers/reviewController.js
const Review = require('../models/reviewModel');
const Business = require('../models/businessModel');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

exports.createReview = async (req, res) => {
  try {
    const { businessId, reviewText, images } = req.body;
    const userId = req.userId;

    // Fetch business details
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (!req.body.reviewText || req.body.reviewText.trim() === '') {
      return res.status(400).json({ message: 'Review text is required' });
    }

    // Fetch business owner details
    const businessOwner = await User.findById(business.businessOwner);
    if (!businessOwner) {
      return res.status(404).json({ message: 'Business owner not found' });
    }

    // Create a new review
    const newReview = new Review({
      business: businessId,
      user: userId,
      reviewText,
      images: images ? images.split(',').map(image => image.trim()) : [],
    });

    await newReview.save();

    // Send email notification to business owner
    const emailData = {
      to: businessOwner.email,
      subject: `🌟 New Review for ${business.name}!`,
      text: `Hi ${businessOwner.name},\n\nA new review has been posted for your business "${business.name}".\n\nReview:\n${reviewText}\n\nVisit your dashboard to view more details.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">New Review for ${business.name}!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi <strong>${businessOwner.name}</strong>,</p>
            <p>We're excited to let you know that a new review has been posted for your business, <strong>${business.name}</strong>.</p>
            <div style="border-left: 4px solid #4CAF50; padding-left: 10px; margin: 20px 0;">
              <p style="font-style: italic; margin: 0;"><strong>Review:</strong></p>
              <p style="margin: 0; font-style: italic;">"${reviewText}"</p>
            </div>
            <p>Check out more details and respond to reviews on your dashboard:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:3000/my-location/${businessId}" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px;">Go to Dashboard</a>
            </div>
            <p style="font-size: 12px; color: #777;">If you have any questions, feel free to reach out to us at <a href="mailto:support@yourapp.com" style="color: #4CAF50; text-decoration: none;">support@yourapp.com</a>.</p>
          </div>
          <div style="background-color: #f9f9f9; text-align: center; padding: 10px; font-size: 12px; color: #777;">
            <p style="margin: 0;">Thank you for using our platform to grow your business! 🚀</p>
          </div>
        </div>
      `
    };


    console.log('Sending email to:', emailData);

    await sendEmail(emailData);

    return res.status(201).json({ message: 'Review created', review: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};


exports.getReviewsByBusinessId = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find reviews by business ID and populate the user field with user information
    const reviews = await Review.find({ business: businessId })
      .populate('user', 'name profilePictureURL email') // Populate user details (select fields as needed)
      .exec();

    if (!reviews) {
      return res.status(404).json({ message: 'No reviews found for this business.' });
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};
