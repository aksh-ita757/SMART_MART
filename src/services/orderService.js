import api from './api';

/**
 * ORDER SERVICE
 * Handles all order-related API calls
 * 
 * PRODUCER-CONSUMER: This is where we trigger the backend Producer!
 */

const orderService = {
  /**
   * Create order - TRIGGERS PRODUCER-CONSUMER FLOW!
   * Backend creates order and pushes to Redis queue
   * Worker (Consumer) picks it up and processes
   * 
   * @param {Object} orderData - { items, shippingAddress, phone }
   * @returns {Promise} - Order object with jobId
   */
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  /**
   * Get all user orders
   * @returns {Promise} - Array of orders
   */
  getUserOrders: async () => {
    return await api.get('/orders');
  },

  /**
   * Get single order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise} - Order object
   */
  getOrderById: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  /**
   * Cancel order
   * @param {number} orderId - Order ID
   * @returns {Promise} - Updated order
   */
  cancelOrder: async (orderId) => {
    return await api.put(`/orders/${orderId}/cancel`);
  },
};

export default orderService;