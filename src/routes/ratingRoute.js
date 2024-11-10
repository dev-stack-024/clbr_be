// src/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware


router.post('/business',authMiddleware, ratingController.rateBusiness);


module.exports = router;
