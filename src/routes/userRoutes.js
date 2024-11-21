const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, resetPassword, getAllUsers } = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/get-profile', authMiddleware, getProfile);
router.get('/get-all-users', authMiddleware, getAllUsers);
router.put('/update-profile', authMiddleware, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;
