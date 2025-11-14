const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const verifyAuth = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', verifyAuth, getProfile);

module.exports = router;