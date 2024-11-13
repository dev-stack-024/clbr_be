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
    // console.log(req)
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
      // If neither userId nor location is provided, return all businesses
      businesses = await Business.find();
    }

    // Add ratings information (average rating and own rating if userId is provided)
    const businessesWithRatings = await Promise.all(
      businesses.map(async (business) => {
        // Fetch all ratings for the business
        const ratings = await Rating.find({ business: business._id });

        // console.log(ratings)

        // Calculate the average rating
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
          : null;

        // Fetch the user's rating for this business (if userId is provided)
        const ownRating = req.userId
          ? await Rating.findOne({ business: business._id, user: req.userId })
          : null;

        // Return the business with the added rating information
        return {
          ...business.toObject(),
          averageRating,  // Include the average rating
          ownRating: ownRating ? ownRating.rating : null,  // Include the user's rating if available
        };
      })
    );

    // Send the response with the businesses including the ratings
    res.status(200).json(businessesWithRatings);
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
    res.status(200).json(business);
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




// Rest of the controller functions remain the same
