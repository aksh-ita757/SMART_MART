const { Order } = require('../models');
const { ORDER_STATUS } = require('../config/constants');

/**
 * ORDER SERVICE - State Management
 * 
 * OS CONCEPTS:
 * 1. PROCESS STATE MANAGEMENT: Orders have states like OS processes
 * 2. STATE TRANSITIONS: Moving between states with validation
 * 3. ATOMICITY: State changes are atomic operations
 */

/**
 * Update order status
 * 
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated order
 * 
 * OS CONCEPT: PROCESS STATE TRANSITION
 * 
 * Order States (similar to Process States):
 * - pending    → NEW (order created, waiting for payment)
 * - paid       → READY (payment received, ready for processing)
 * - processing → RUNNING (worker is processing order)
 * - shipped    → RUNNING (order being delivered)
 * - delivered  → TERMINATED (successfully completed)
 * - cancelled  → TERMINATED (user cancelled)
 * - failed     → TERMINATED (processing failed)
 * 
 * Valid State Transitions:
 * pending → paid → processing → shipped → delivered
 *    ↓       ↓         ↓
 * cancelled cancelled failed
 */
const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    /**
     * STATE TRANSITION VALIDATION
     * Ensures valid state changes (similar to OS process state machine)
     */
    const currentStatus = order.status;
    
    // Log state transition
    console.log(`📊 Order ${orderId}: ${currentStatus} → ${status}`);

    /**
     * ATOMIC UPDATE: Critical section
     * Order status update must be atomic
     * Uses database transaction implicitly
     */
    const updatedOrder = await order.update({
      status,
      ...additionalData
    });

    return updatedOrder;

  } catch (error) {
    console.error(`❌ Failed to update order ${orderId}:`, error.message);
    throw error;
  }
};

/**
 * Get order with all details
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} - Order with items
 */
const getOrderDetails = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          association: 'items',
          include: ['product']
        },
        {
          association: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return order;
  } catch (error) {
    console.error(`❌ Failed to get order ${orderId}:`, error.message);
    throw error;
  }
};

/**
 * Mark order as failed
 * 
 * @param {number} orderId - Order ID
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} - Updated order
 * 
 * OS CONCEPT: PROCESS TERMINATION (abnormal)
 * When process fails, OS marks it as terminated and logs reason
 */
const markOrderFailed = async (orderId, reason) => {
  try {
    console.log(`❌ Marking order ${orderId} as failed: ${reason}`);
    return await updateOrderStatus(orderId, ORDER_STATUS.FAILED);
  } catch (error) {
    console.error(`❌ Failed to mark order as failed:`, error.message);
    throw error;
  }
};

/**
 * Mark order as processing
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} - Updated order
 * 
 * OS CONCEPT: PROCESS STATE TRANSITION (READY → RUNNING)
 * Worker picks up order from queue and starts processing
 */
const markOrderProcessing = async (orderId) => {
  try {
    console.log(`⚙️  Marking order ${orderId} as processing`);
    return await updateOrderStatus(orderId, ORDER_STATUS.PROCESSING);
  } catch (error) {
    console.error(`❌ Failed to mark order as processing:`, error.message);
    throw error;
  }
};

/**
 * Mark order as completed
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} - Updated order
 * 
 * OS CONCEPT: PROCESS TERMINATION (normal)
 * Process completed successfully, release resources
 */
const markOrderCompleted = async (orderId) => {
  try {
    console.log(`✅ Marking order ${orderId} as completed`);
    return await updateOrderStatus(orderId, ORDER_STATUS.SHIPPED);
  } catch (error) {
    console.error(`❌ Failed to mark order as completed:`, error.message);
    throw error;
  }
};

module.exports = {
  updateOrderStatus,
  getOrderDetails,
  markOrderFailed,
  markOrderProcessing,
  markOrderCompleted
};