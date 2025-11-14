// controllers/orderController.js
const { Order, OrderItem, Product } = require('../models');
const { addOrderToQueue } = require('../services/queueService');
const { AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, ORDER_STATUS } = require('../config/constants');
const { sequelize } = require('../config/database');

/**
 * ======================
 * Create New Order (Producer)
 * ======================
 */
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, shippingAddress, phone } = req.body;
    const userId = req.user.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item', HTTP_STATUS.BAD_REQUEST);
    }

    if (!shippingAddress || !phone) {
      throw new AppError('Shipping address and phone are required', HTTP_STATUS.BAD_REQUEST);
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new AppError('Invalid item format', HTTP_STATUS.BAD_REQUEST);
      }

      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, HTTP_STATUS.NOT_FOUND);
      }

      const itemPrice = parseFloat(product.price);
      const itemTotal = itemPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice
      });

      totalPrice += itemTotal;
    }

    const order = await Order.create({
      user_id: userId,
      total_price: totalPrice,
      status: ORDER_STATUS.PENDING,
      shipping_address: shippingAddress,
      phone: phone
    }, { transaction });

    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction });
    }

    await transaction.commit();

    const queueJob = await addOrderToQueue({
      orderId: order.id,
      userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      phone
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order placed successfully and is being processed',
      data: {
        order: {
          id: order.id,
          totalPrice,
          status: order.status,
          items: orderItems.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price
          })),
          shippingAddress,
          phone,
          createdAt: order.created_at
        },
        jobId: queueJob.jobId
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * ======================
 * Get All Orders for a User
 * ======================
 */
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items', // must match Order.hasMany(OrderItem, { as: 'items' })
          include: [
            {
              model: Product,
              as: 'product', // must match OrderItem.belongsTo(Product, { as: 'product' })
              attributes: ['id', 'name', 'image_url', 'price']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * Get Single Order by ID
 * ======================
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items', // alias must match model association
          include: [
            {
              model: Product,
              as: 'product', // alias must match model association
              attributes: ['id', 'name', 'description', 'image_url', 'price']
            }
          ]
        }
      ]
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * Cancel Order
 * ======================
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: { id, user_id: userId }
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!['pending', 'paid'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', HTTP_STATUS.BAD_REQUEST);
    }

    await order.update({ status: ORDER_STATUS.CANCELLED });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
