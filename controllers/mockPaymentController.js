const { Order, Payment } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

/**
 * MOCK PAYMENT CONTROLLER - For Testing Without Payment Gateway
 * 
 * Simulates payment processing without actual payment gateway
 * Use this for development/testing
 */

/**
 * Simulate payment (marks order as paid immediately)
 * 
 * @route   POST /api/payments/simulate
 * @access  Private
 */
const simulatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    if (!orderId) {
      throw new AppError('Order ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify order belongs to user
    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: userId 
      }
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new AppError('Order is not in pending state', HTTP_STATUS.BAD_REQUEST);
    }

    console.log(`💳 Simulating payment for order ${orderId}`);

    // Create or update payment record
    const [payment, created] = await Payment.findOrCreate({
      where: { order_id: orderId },
      defaults: {
        order_id: orderId,
        razorpay_order_id: `mock_order_${orderId}_${Date.now()}`,
        razorpay_payment_id: `mock_payment_${orderId}_${Date.now()}`,
        amount: order.total_price,
        status: PAYMENT_STATUS.SUCCESS
      }
    });

    if (!created) {
      await payment.update({
        razorpay_payment_id: `mock_payment_${orderId}_${Date.now()}`,
        status: PAYMENT_STATUS.SUCCESS
      });
    }

    // Update order status to paid
    await order.update({
      status: ORDER_STATUS.PAID
    });

    console.log(`✅ Order ${orderId} marked as PAID (simulated)`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment simulated successfully',
      data: {
        orderId: order.id,
        paymentId: payment.razorpay_payment_id,
        status: PAYMENT_STATUS.SUCCESS,
        note: 'This is a simulated payment for testing'
      }
    });

  } catch (error) {
    console.error('❌ Payment simulation error:', error.message);
    next(error);
  }
};

module.exports = {
  simulatePayment
};