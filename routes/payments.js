const express = require('express');
const router = express.Router();
const {
  createUPIPayment,
  verifyUPIPayment,
  checkUPIPaymentStatus,
  adminVerifyPayment
} = require('../controllers/upiPaymentController');
const { simulatePayment } = require('../controllers/mockPaymentController');
const verifyAuth = require('../middleware/auth');

/**
 * UPI PAYMENT ROUTES - No KYC Required!
 */

// @route   POST /api/payments/simulate
// @desc    Simulate payment (for testing)
// @access  Private
router.post('/simulate', verifyAuth, simulatePayment);

// @route   POST /api/payments/create-upi
// @desc    Generate UPI payment link and QR code
// @access  Private
router.post('/create-upi', verifyAuth, createUPIPayment);

// @route   POST /api/payments/verify-upi
// @desc    Verify UPI payment with UTR
// @access  Private
router.post('/verify-upi', verifyAuth, verifyUPIPayment);

// @route   GET /api/payments/status/:orderId
// @desc    Check payment status
// @access  Private
router.get('/status/:orderId', verifyAuth, checkUPIPaymentStatus);

// @route   POST /api/payments/admin/verify
// @desc    Admin manually verify payment
// @access  Admin (TODO: add admin middleware)
router.post('/admin/verify', adminVerifyPayment);

module.exports = router;