const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const verifyAuth = require('../middleware/auth');

/**
 * ORDER ROUTES - Producer Endpoints
 * 
 * These endpoints act as PRODUCERS in the Producer-Consumer pattern
 * They create jobs and add them to the queue for workers to process
 */

// All order routes require authentication
router.use(verifyAuth);

// @route   POST /api/orders
// @desc    Create new order (PRODUCER: adds job to queue)
// @access  Private
router.post('/', createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', cancelOrder);

module.exports = router;