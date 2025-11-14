const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getCategories,
  getFeaturedProducts
} = require('../controllers/productController');

// Get categories (must be before /:id route)
router.get('/categories/list', getCategories);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get all products (with filters)
router.get('/', getAllProducts);

// Get single product by ID
router.get('/:id', getProductById);

module.exports = router;