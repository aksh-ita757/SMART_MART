/**
 * PHASE 15: ORDER TRACKING ROUTES
 * File: backend/routes/orderTracking.js
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const orderTrackingController = require('../controllers/orderTrackingController');

router.get('/:orderId/tracking', authMiddleware, orderTrackingController.getOrderTracking);
router.get('/user/all', authMiddleware, orderTrackingController.getUserOrdersWithTracking);
router.get('/:orderId/status-history', authMiddleware, orderTrackingController.getOrderStatusHistory);

module.exports = router;
