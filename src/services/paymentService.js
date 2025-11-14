import api from './api';

/**
 * PAYMENT SERVICE
 * Handles UPI payment generation and verification
 */

const paymentService = {
  /**
   * Generate UPI payment link and QR code
   * @param {number} orderId - Order ID
   * @returns {Promise} - UPI link, QR code, transaction ref
   */
  createUPIPayment: async (orderId) => {
    return await api.post('/payments/create-upi', { orderId });
  },

  /**
   * Verify UPI payment with UTR
   * @param {Object} data - { orderId, utr }
   * @returns {Promise} - Payment verification result
   */
  verifyUPIPayment: async (data) => {
    return await api.post('/payments/verify-upi', data);
  },

  /**
   * Check payment status
   * @param {number} orderId - Order ID
   * @returns {Promise} - Payment status
   */
  getPaymentStatus: async (orderId) => {
    return await api.get(`/payments/status/${orderId}`);
  },

  /**
   * Simulate payment (for testing)
   * @param {number} orderId - Order ID
   * @returns {Promise} - Payment result
   */
  simulatePayment: async (orderId) => {
    return await api.post('/payments/simulate', { orderId });
  },
};

export default paymentService;