import api from './api';

/**
 * PRODUCT SERVICE
 * Handles all product-related API calls
 */

const productService = {
  /**
   * Get all products with optional filters
   * @param {Object} params - { category, search, minPrice, maxPrice, page, limit }
   * @returns {Promise} - Products array
   */
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products?${queryString}`);
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise} - Product object
   */
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  /**
   * Get all categories
   * @returns {Promise} - Categories array
   */
  getCategories: async () => {
    return await api.get('/products/categories/list');
  },

  /**
   * Get featured products
   * @returns {Promise} - Featured products array
   */
  getFeaturedProducts: async () => {
    return await api.get('/products/featured');
  },
};

export default productService;