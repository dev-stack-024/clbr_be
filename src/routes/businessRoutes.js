// src/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware



router.post('/', authMiddleware, businessController.createBusiness);
router.get('/', authMiddleware, businessController.getAllBusinesses);
router.get('/:id', authMiddleware, businessController.getBusinessById);
router.put('/:id', authMiddleware, businessController.updateBusiness);
router.delete('/:id', authMiddleware, businessController.deleteBusiness);

module.exports = router;
