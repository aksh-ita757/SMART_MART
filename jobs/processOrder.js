/**
 * PHASE 15: UPDATED PROCESS ORDER
 * File: backend/jobs/processOrder.js
 * 
 * REPLACE YOUR EXISTING processOrder.js WITH THIS
 */

const { checkStockAvailability, reserveStock, restoreStock } = require('../services/inventoryService');
const { markOrderProcessing, markOrderFailed, markOrderCompleted, getOrderDetails } = require('../services/orderService');
const { ORDER_STATUS } = require('../config/constants');
const { emitOrderStatusChange } = require('../config/socket'); // 🆕 PHASE 15

const processOrder = async (job) => {
  const { orderId, items } = job.data;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔄 CONSUMER: Processing order ${orderId}`);
  console.log(`📦 Items: ${JSON.stringify(items)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // STEP 0: Get order details and check payment status
    const orderDetails = await getOrderDetails(orderId);
    
    if (!orderDetails) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (orderDetails.status === ORDER_STATUS.PENDING) {
      console.log(`⏸️  Order ${orderId} is pending payment. Skipping processing.`);
      return {
        success: false,
        orderId,
        message: 'Order is pending payment',
        skipped: true
      };
    }

    if (['shipped', 'delivered', 'cancelled'].includes(orderDetails.status)) {
      console.log(`⏭️  Order ${orderId} already in final state: ${orderDetails.status}`);
      return {
        success: true,
        orderId,
        message: 'Order already processed',
        skipped: true
      };
    }

    // STEP 1: Mark order as processing
    await markOrderProcessing(orderId);
    job.progress(20);

    console.log(`⚙️  Step 1: Order ${orderId} marked as PROCESSING`);

    // 🆕 PHASE 15: Emit real-time update - PROCESSING
    try {
      emitOrderStatusChange(orderId, {
        orderId,
        status: 'processing',
        message: 'Your order is being processed',
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Real-time update sent: Order ${orderId} - PROCESSING`);
    } catch (socketError) {
      console.error('⚠️  Failed to send Socket.IO update:', socketError.message);
    }

    // STEP 2: Check stock availability
    console.log(`📊 Step 2: Checking stock availability...`);
    const stockCheck = await checkStockAvailability(items);
    job.progress(40);

    if (!stockCheck.available) {
      const errorMsg = `Insufficient stock: ${JSON.stringify(stockCheck.insufficientItems)}`;
      console.log(`❌ ${errorMsg}`);
      
      await markOrderFailed(orderId, errorMsg);
      
      // 🆕 PHASE 15: Emit real-time update - FAILED
      try {
        emitOrderStatusChange(orderId, {
          orderId,
          status: 'failed',
          message: 'Order failed due to insufficient stock',
          timestamp: new Date().toISOString()
        });
        console.log(`📡 Real-time update sent: Order ${orderId} - FAILED`);
      } catch (socketError) {
        console.error('⚠️  Failed to send Socket.IO update:', socketError.message);
      }
      
      return {
        success: false,
        orderId,
        error: errorMsg,
        insufficientItems: stockCheck.insufficientItems
      };
    }

    console.log(`✅ Stock available for all items`);
    job.progress(60);

    // STEP 3: Reserve stock (CRITICAL SECTION)
    console.log(`🔒 Step 3: Entering CRITICAL SECTION - Reserving stock...`);
    await reserveStock(items);
    console.log(`🔓 Exiting CRITICAL SECTION - Stock reserved`);
    job.progress(80);

    // STEP 4: Simulate payment processing
    console.log(`💳 Step 4: Processing payment...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`✅ Payment processed`);
    job.progress(90);

    // STEP 5: Mark order as completed
    console.log(`✅ Step 5: Finalizing order...`);
    await markOrderCompleted(orderId);
    job.progress(100);

    // 🆕 PHASE 15: Emit real-time update - SHIPPED
    try {
      emitOrderStatusChange(orderId, {
        orderId,
        status: 'shipped',
        message: 'Your order has been shipped!',
        timestamp: new Date().toISOString()
      });
      console.log(`📡 Real-time update sent: Order ${orderId} - SHIPPED`);
    } catch (socketError) {
      console.error('⚠️  Failed to send Socket.IO update:', socketError.message);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ CONSUMER: Order ${orderId} processed successfully`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      orderId,
      message: 'Order processed successfully',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ CONSUMER: Error processing order ${orderId}`);
    console.error(`Error: ${error.message}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      await markOrderFailed(orderId, error.message);
      
      // 🆕 PHASE 15: Emit real-time update - FAILED
      try {
        emitOrderStatusChange(orderId, {
          orderId,
          status: 'failed',
          message: 'Order processing failed',
          timestamp: new Date().toISOString()
        });
        console.log(`📡 Real-time update sent: Order ${orderId} - FAILED`);
      } catch (socketError) {
        console.error('⚠️  Failed to send Socket.IO update:', socketError.message);
      }
    } catch (updateError) {
      console.error(`❌ Failed to update order status: ${updateError.message}`);
    }

    throw error;
  }
};

module.exports = processOrder;