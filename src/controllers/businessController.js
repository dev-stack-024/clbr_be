// src/controllers/businessController.js
const Business = require('../models/businessModel');
const Rating = require('../models/ratingModel');

// src/controllers/businessController.js
exports.createBusiness = async (req, res) => {
  try {
    const { name, type, latitude, longitude, address, phone, description, images } = req.body;

    // Validate inputs (Consider using a validation library here)

    // Ensure the businessOwner is the ID of the logged-in user
    const businessOwner = req.userId; // Assuming you have middleware that sets req.userId

    const newBusiness = new Business({
      name,
      type,
      address,
      phone,
      description,
      images: images,
      businessOwner,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    await newBusiness.save();
    return res.status(201).json({ message: 'Business created successfully', business: newBusiness });
  } catch (error) {
    console.error('Error creating business:', error);
    return res.status(400).json({ message: 'Error creating business', error: error.message });
  }
};


exports.getAllBusinesses = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.query;

    let businesses;

    if (userId) {
      // Fetch businesses associated with the userId
      businesses = await Business.find({ businessOwner: userId });
    } else if (latitude && longitude) {
      // Fetch nearby businesses based on current location
      businesses = await Business.find({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 1000 / 3963.2] // 10 miles radius, adjust as needed
          }
        }
      });
    } else {
      businesses = await Business.find();
    }

    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching businesses', error });
  }
};

// Get a single business by ID
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Fetch all ratings for the business
    const ratings = await Rating.find({ business: business._id });

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : null;

    // Fetch the user's rating for this business (if userId is provided)
    const ownRating = req.userId
      ? await Rating.findOne({ business: business._id, user: req.userId })
      : null;

    // Combine business data with ratings
    const businessWithRatings = {
      ...business.toObject(),
      averageRating,
      ownRating: ownRating ? ownRating.rating : null,
    };

    res.status(200).json(businessWithRatings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching business', error });
  }
};


// Update a business by ID
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findByIdAndUpdate(id, req.body, { new: true });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.status(200).json({ message: 'Business updated successfully', business });
  } catch (error) {
    res.status(400).json({ message: 'Error updating business', error });
  }
};

// Delete a business by ID
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting business', error });
  }
};


exports.fetchAllBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const businesses = await Business.find()
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalBusinesses = await Business.countDocuments();
    const totalPages = Math.ceil(totalBusinesses / limit);

    const businessesWithRatings = await Promise.all(
      businesses.map(async (business) => {
        const ratings = await Rating.find({ business: business._id });
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
          : null;

        const ownRating = req.userId
          ? await Rating.findOne({ business: business._id, user: req.userId })
          : null;

        return {
          ...business.toObject(),
          averageRating,
          ownRating: ownRating ? ownRating.rating : null,
        };
      })
    );

    res.status(200).json({
      businesses: businessesWithRatings,
      currentPage: parseInt(page),
      totalPages,
      totalBusinesses,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching businesses', error });
  }
};


// Rest of the controller functions remain the same
