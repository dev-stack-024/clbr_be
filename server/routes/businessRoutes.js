// src/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// Routes for businesses

router.post('/', authMiddleware, businessController.createBusiness); // Create a new business with auth
router.get('/', businessController.getAllBusinesses); // Get all businesses
router.get('/:id', authMiddleware, businessController.getBusinessById); // Get business by ID
router.put('/:id', authMiddleware, businessController.updateBusiness); // Update business by ID with auth
router.delete('/:id', authMiddleware, businessController.deleteBusiness); // Delete business by ID with auth

module.exports = router;
