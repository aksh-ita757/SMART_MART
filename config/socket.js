const { Server } = require('socket.io');

/**
 * SOCKET.IO CONFIGURATION - Real-Time Communication
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 
 * 1. INTER-PROCESS COMMUNICATION (IPC):
 *    - Server communicates with multiple clients in real-time
 *    - Asynchronous message passing
 * 
 * 2. EVENT-DRIVEN ARCHITECTURE:
 *    - Events trigger actions (similar to interrupts in OS)
 *    - Non-blocking communication
 * 
 * 3. PUBLISH-SUBSCRIBE PATTERN:
 *    - Server publishes events
 *    - Clients subscribe to specific events
 * 
 * 4. BROADCAST COMMUNICATION:
 *    - One-to-many message delivery
 *    - Similar to IPC in distributed systems
 */

let io;

/**
 * Initialize Socket.IO server
 * 
 * @param {Object} server - HTTP server instance
 * @returns {Object} - Socket.IO instance
 * 
 * OS CONCEPT: INITIALIZATION
 * Set up communication channel between processes
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    /**
     * CONNECTION TIMEOUT: Prevent indefinite waiting
     * Similar to socket timeout in networking
     */
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  /**
   * CONNECTION EVENT HANDLER
   * 
   * OS CONCEPT: PROCESS CREATION
   * New client connects = new communication channel established
   */
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    /**
     * JOIN USER ROOM
     * 
     * OS CONCEPT: PROCESS GROUPING
     * Group clients by user ID for targeted messaging
     * Similar to process groups in Unix
     */
    socket.on('join', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    /**
     * JOIN ORDER ROOM
     * 
     * OS CONCEPT: TOPIC-BASED SUBSCRIPTION
     * Client subscribes to specific order updates
     */
    socket.on('track-order', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`📦 Client tracking order ${orderId}`);
    });

    /**
     * DISCONNECTION EVENT
     * 
     * OS CONCEPT: PROCESS TERMINATION
     * Client disconnects = communication channel closed
     */
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    /**
     * ERROR HANDLING
     * 
     * OS CONCEPT: EXCEPTION HANDLING
     * Handle communication errors gracefully
     */
    socket.on('error', (error) => {
      console.error(`⚠️  Socket error for ${socket.id}:`, error.message);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * 
 * @returns {Object} - Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit order update to user
 * 
 * @param {number} userId - User ID
 * @param {Object} orderData - Order update data
 * 
 * OS CONCEPT: MESSAGE PASSING
 * Send message to specific process (user)
 * Similar to send() in message passing IPC
 */
const emitOrderUpdate = (userId, orderData) => {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit event');
    return;
  }

  /**
   * TARGETED BROADCAST
   * Send to all sockets in user's room
   * Similar to multicast in networking
   */
  io.to(`user-${userId}`).emit('order:update', orderData);
  
  console.log(`📤 Emitted order update to user ${userId}:`, {
    orderId: orderData.orderId,
    status: orderData.status
  });
};

/**
 * Emit order status change
 * 
 * @param {number} orderId - Order ID
 * @param {Object} statusData - Status change data
 * 
 * OS CONCEPT: EVENT NOTIFICATION
 * Notify all interested processes about state change
 */
const emitOrderStatusChange = (orderId, statusData) => {
  if (!io) return;

  /**
   * ROOM-BASED BROADCAST
   * Send to all clients tracking this specific order
   */
  io.to(`order-${orderId}`).emit('order:status', statusData);
  
  console.log(`📡 Emitted status change for order ${orderId}: ${statusData.status}`);
};

/**
 * Emit payment update
 * 
 * @param {number} userId - User ID
 * @param {Object} paymentData - Payment data
 * 
 * OS CONCEPT: ASYNCHRONOUS NOTIFICATION
 * Notify user about payment status without blocking
 */
const emitPaymentUpdate = (userId, paymentData) => {
  if (!io) return;

  io.to(`user-${userId}`).emit('payment:update', paymentData);
  
  console.log(`💳 Emitted payment update to user ${userId}`);
};

/**
 * Broadcast system notification
 * 
 * @param {Object} notification - Notification data
 * 
 * OS CONCEPT: BROADCAST MESSAGE
 * Send message to all connected clients
 * Similar to broadcast IPC mechanism
 */
const broadcastNotification = (notification) => {
  if (!io) return;

  /**
   * GLOBAL BROADCAST
   * Send to ALL connected clients
   */
  io.emit('notification', notification);
  
  console.log('📢 Broadcast notification to all users');
};

/**
 * Get connected clients count
 * 
 * @returns {number} - Number of connected clients
 * 
 * OS CONCEPT: RESOURCE MONITORING
 * Track active communication channels
 */
const getConnectedClientsCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

module.exports = {
  initializeSocket,
  getIO,
  emitOrderUpdate,
  emitOrderStatusChange,
  emitPaymentUpdate,
  broadcastNotification,
  getConnectedClientsCount
};