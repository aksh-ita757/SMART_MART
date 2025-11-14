/**
 * PHASE 15: UPDATED SERVER.JS
 * File: backend/server.js
 * 
 * REPLACE YOUR EXISTING server.js WITH THIS
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { testRedisConnection } = require('./config/queue');
const { initializeSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const orderTrackingRoutes = require('./routes/orderTracking'); // 🆕 PHASE 15

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files (for WebSocket test page)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/test/health',
      dbTest: '/api/test/db-test',
      sampleProducts: '/api/test/sample-products',
      signup: '/api/auth/signup',
      login: '/api/auth/login',
      profile: '/api/auth/me',
      products: '/api/products',
      categories: '/api/products/categories/list',
      createOrder: '/api/orders',
      myOrders: '/api/orders',
      allOrders: '/api/orders/user/all', // 🆕 PHASE 15
      orderTracking: '/api/orders/:orderId/tracking', // 🆕 PHASE 15
      statusHistory: '/api/orders/:orderId/status-history', // 🆕 PHASE 15
      queueTest: '/api/test/queue-test',
      queueStats: '/api/test/queue-stats',
      websocketTest: '/websocket-test.html'
    }
  });
});

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderTrackingRoutes); // 🆕 PHASE 15: Order tracking routes

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Test Redis connection
    await testRedisConnection();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO (for real-time updates)
    initializeSocket(server); // 🆕 PHASE 15: Initialize Socket.IO

    // Initialize WebSocket Server (existing)
    const wss = new WebSocket.Server({ server });

    // 🆕 PHASE 15: Store WebSocket globally for worker access
    global.wss = wss;

    // WebSocket connection handling
    wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      console.log(`🔌 New WebSocket connection ${userId ? `(User: ${userId})` : ''}`);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        userId: userId,
        timestamp: new Date().toISOString()
      }));
      
      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📥 Received:', data);
          
          // Echo back with confirmation
          ws.send(JSON.stringify({
            type: 'response',
            originalMessage: data,
            status: 'received',
            timestamp: new Date().toISOString()
          }));

          // Broadcast to all connected clients (except sender)
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'broadcast',
                data: data,
                from: userId || 'anonymous',
                timestamp: new Date().toISOString()
              }));
            }
          });
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        console.log(`🔌 WebSocket disconnected ${userId ? `(User: ${userId})` : ''}`);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });

    // Store wss for later use (for broadcasting from API routes)
    app.set('wss', wss);

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server initialized`);
      console.log(`🔌 Socket.IO initialized`); // 🆕 PHASE 15
      console.log(`✅ Phase 15: Order tracking enabled`); // 🆕 PHASE 15
      console.log(`🧪 Test endpoints:`);
      console.log(`   - http://localhost:${PORT}/api/test/health`);
      console.log(`   - http://localhost:${PORT}/api/test/db-test`);
      console.log(`   - http://localhost:${PORT}/api/test/sample-products`);
      console.log(`   - http://localhost:${PORT}/websocket-test.html`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;