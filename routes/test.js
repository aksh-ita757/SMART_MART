const express = require('express');
const router = express.Router();
const { Product, User } = require('../models');
const { HTTP_STATUS } = require('../config/constants');
const { addOrderToQueue, getQueueStats, getJobStatus } = require('../services/queueService');

// Health check
router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const productCount = await Product.count();
    const userCount = await User.count();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Database connection successful',
      data: {
        products: productCount,
        users: userCount
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Get sample products
router.get('/sample-products', async (req, res) => {
  try {
    const products = await Product.findAll({
      limit: 5,
      attributes: ['id', 'name', 'price', 'category', 'stock']
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

// Test queue - Add test job
router.post('/queue-test', async (req, res) => {
  try {
    // Test order data
    const testOrderData = {
      orderId: Date.now(),
      userId: 1,
      items: [{ productId: 1, quantity: 2 }],
      totalPrice: 1000,
    };

    const job = await addOrderToQueue(testOrderData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Test job added to queue',
      data: job
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to add test job',
      details: error.message
    });
  }
});

// Get queue statistics
router.get('/queue-stats', async (req, res) => {
  try {
    const stats = await getQueueStats();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to get queue stats',
      details: error.message
    });
  }
});

// Get job status
router.get('/job-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to get job status',
      details: error.message
    });
  }
});

module.exports = router;