// src/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware


router.post('/add-review', authMiddleware, reviewController.createReview);
router.get('/:businessId', authMiddleware, reviewController.getReviewsByBusinessId);


module.exports = router;
