// src/controllers/businessController.js
const Business = require('../models/businessModel');
const Rating = require('../models/ratingModel');

// src/controllers/businessController.js
exports.createBusiness = async (req, res) => {
  try {
    const { name, type, latitude, longitude, address, phone, description, images, amenities } = req.body;

    // Validate inputs (Consider using a validation library here)

    // Ensure the businessOwner is the ID of the logged-in user
    const businessOwner = req.userId; // Assuming you have middleware that sets req.userId

    console.log(name, amenities)
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
      amenities
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
      businesses = await Business.find({ businessOwner: userId });
    } else if (latitude && longitude) {
      businesses = await Business.find({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 1000 / 3963.2]
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

exports.getAllBusinessesOptm = async (req, res) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      search,
      parking,
      wheelchairAccessible,
      petFriendly,
      wifi,
      outdoorSeating,
      creditCardAccepted,
      delivery,
      sort,
      type,
      page = 1,
      limit = 10
    } = req.query;

    // If only latitude and longitude are provided
    if (latitude && longitude && !search && !type && !parking && !wheelchairAccessible &&
      !petFriendly && !wifi && !outdoorSeating && !creditCardAccepted && !delivery && !userId) {
      const nearbyBusinesses = await Business.find({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 1000 / 3963.2]
          }
        }
      })
        .sort({ averageRating: -1 })
        .limit(parseInt(limit));

      return res.status(200).json({
        businesses: nearbyBusinesses,
        pagination: {
          total: nearbyBusinesses.length,
          page: 1,
          pages: 1
        }
      });
    }

    // Build query based on provided filters
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (userId) query.businessOwner = userId;
    if (type) query.type = type;

    if (latitude && longitude) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 1000 / 3963.2]
        }
      };
    }

    // Add amenities filters if provided
    // Only add amenity filters when they are explicitly set to true
    const amenitiesFilter = {};
    if (parking === 'true') amenitiesFilter['amenities.parking'] = true;
    if (wheelchairAccessible === 'true') amenitiesFilter['amenities.wheelchairAccessible'] = true;
    if (petFriendly === 'true') amenitiesFilter['amenities.petFriendly'] = true;
    if (wifi === 'true') amenitiesFilter['amenities.wifi'] = true;
    if (outdoorSeating === 'true') amenitiesFilter['amenities.outdoorSeating'] = true;
    if (creditCardAccepted === 'true') amenitiesFilter['amenities.creditCardAccepted'] = true;
    if (delivery === 'true') amenitiesFilter['amenities.delivery'] = true;


    Object.assign(query, amenitiesFilter);

    let sortOption = sort === 'rating' ? { averageRating: -1 } :
      sort === 'newest' ? { createdAt: -1 } :
        { averageRating: -1 }; // Default sort by rating

    const skip = (page - 1) * limit;

    const businesses = await Business.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('businessOwner', 'name email');

    const total = await Business.countDocuments(query);

    res.status(200).json({
      businesses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

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
    // const averageRating = ratings.length > 0
    //   ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
    //   : null;

    // Fetch the user's rating for this business (if userId is provided)
    const ownRating = req.userId
      ? await Rating.findOne({ business: business._id, user: req.userId })
      : null;

    const businessWithRatings = {
      ...business.toObject(),
      // averageRating,
      ownRating: ownRating ? ownRating.rating : null,
    };

    res.status(200).json(businessWithRatings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching business', error });
  }
};


exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagesToRemove, images, ...updateData } = req.body;

    const currentBusiness = await Business.findById(id);

    if (!currentBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    let updatedImages = [...currentBusiness.images];

    if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
      updatedImages = updatedImages.filter(
        image => !imagesToRemove.includes(image)
      );
    }

    if (Array.isArray(images)) {
      updatedImages = images;
    }

    updateData.images = updatedImages;

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: 'Business updated successfully',
      business: updatedBusiness
    });

  } catch (error) {
    res.status(400).json({ message: 'Error updating business', error });
  }
};



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

