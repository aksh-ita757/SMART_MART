/**
 * FIXED ORDER TRACKING CONTROLLER
 * File: backend/controllers/orderTrackingController.js
 */

const { Order, OrderItem, Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET DETAILED ORDER TRACKING
 */
const getOrderTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    console.log(`📊 Fetching tracking for order ${orderId}`);

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ]
    });

    if (!order) throw new AppError('Order not found', 404);

    const statusTimeline = getStatusTimeline(order);

    const trackingData = {
      orderId: order.id,
      orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
      status: order.status,
      totalPrice: order.total_price,
      shippingAddress: order.shipping_address,
      phone: order.phone,
      items: order.items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.product.image_url
      })),
      statusTimeline,
      estimatedDelivery: calculateEstimatedDelivery(order),
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.json({ success: true, data: trackingData });
  } catch (error) {
    console.error('❌ Error fetching order tracking:', error);
    next(error);
  }
};

/**
 * GET USER'S ORDERS WITH TRACKING
 */
const getUserOrdersWithTracking = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    console.log(`📋 Fetching all orders for user ${userId}`);

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const ordersWithTracking = orders.map(order => ({
      orderId: order.id,
      orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
      status: order.status,
      totalPrice: order.total_price,
      itemsCount: order.items.length,
      items: order.items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.product.image_url
      })),
      statusInfo: getStatusInfo(order.status),
      estimatedDelivery: calculateEstimatedDelivery(order),
      createdAt: order.created_at,
      canCancel: order.status === 'pending' || order.status === 'paid'
    }));

    res.json({
      success: true,
      count: ordersWithTracking.length,
      data: ordersWithTracking
    });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    next(error);
  }
};

/**
 * GET ORDER STATUS HISTORY
 */
const getOrderStatusHistory = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId }
    });

    if (!order) throw new AppError('Order not found', 404);

    const statusTimeline = getStatusTimeline(order);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        currentStatus: order.status,
        timeline: statusTimeline
      }
    });
  } catch (error) {
    console.error('❌ Error fetching status history:', error);
    next(error);
  }
};

/**
 * HELPER FUNCTIONS
 */
function getStatusTimeline(order) {
  const timeline = [];

  timeline.push({
    status: 'pending',
    label: 'Order Placed',
    description: 'Your order has been received',
    timestamp: order.created_at,
    completed: true
  });

  if (['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'paid',
      label: 'Payment Confirmed',
      description: 'Payment has been verified',
      timestamp: order.updated_at,
      completed: true
    });
  }

  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'processing',
      label: 'Processing',
      description: 'Your order is being prepared',
      timestamp: order.updated_at,
      completed: true
    });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'shipped',
      label: 'Shipped',
      description: 'Your order is on the way',
      timestamp: order.updated_at,
      completed: true
    });
  }

  if (order.status === 'delivered') {
    timeline.push({
      status: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered',
      timestamp: order.updated_at,
      completed: true
    });
  }

  if (order.status === 'cancelled') {
    timeline.push({
      status: 'cancelled',
      label: 'Cancelled',
      description: 'Order has been cancelled',
      timestamp: order.updated_at,
      completed: true
    });
  }

  if (order.status === 'failed') {
    timeline.push({
      status: 'failed',
      label: 'Failed',
      description: 'Order processing failed',
      timestamp: order.updated_at,
      completed: true
    });
  }

  return timeline;
}

function getStatusInfo(status) {
  const statusMap = {
    pending: { label: 'Pending', description: 'Awaiting payment', color: 'yellow', icon: 'clock' },
    paid: { label: 'Paid', description: 'Payment confirmed', color: 'blue', icon: 'check-circle' },
    processing: { label: 'Processing', description: 'Being prepared', color: 'blue', icon: 'package' },
    shipped: { label: 'Shipped', description: 'On the way', color: 'purple', icon: 'truck' },
    delivered: { label: 'Delivered', description: 'Completed', color: 'green', icon: 'check-circle' },
    cancelled: { label: 'Cancelled', description: 'Order cancelled', color: 'red', icon: 'x-circle' },
    failed: { label: 'Failed', description: 'Processing failed', color: 'red', icon: 'alert-circle' }
  };
  return statusMap[status] || statusMap.pending;
}

function calculateEstimatedDelivery(order) {
  if (order.status === 'delivered') return order.updated_at;
  if (['cancelled', 'failed'].includes(order.status)) return null;

  const baseDate = ['processing', 'shipped'].includes(order.status)
    ? new Date(order.updated_at)
    : new Date(order.created_at);
  const daysToAdd = ['processing', 'shipped'].includes(order.status) ? 3 : 5;

  const estimatedDate = new Date(baseDate);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
  return estimatedDate;
}

module.exports = {
  getOrderTracking,
  getUserOrdersWithTracking,
  getOrderStatusHistory
};