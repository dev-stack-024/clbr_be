// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

// Upload image (API endpoint)
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
