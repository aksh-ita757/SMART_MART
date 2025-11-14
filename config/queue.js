const Redis = require('ioredis');
require('dotenv').config();

/**
 * PRODUCER-CONSUMER PATTERN: Shared Resource Setup
 * 
 * Redis acts as the SHARED BUFFER (Critical Section) between:
 * - PRODUCERS: API endpoints that create orders
 * - CONSUMERS: Worker processes that process orders
 * 
 * OS CONCEPTS USED:
 * 1. BOUNDED BUFFER: Redis queue has finite capacity
 * 2. SYNCHRONIZATION: Redis ensures atomic operations (no race conditions)
 * 3. MUTUAL EXCLUSION: Only one worker processes a job at a time
 * 4. INTER-PROCESS COMMUNICATION (IPC): Producers and consumers communicate via Redis
 */

// Redis client configuration for Bull
// NOTE: Bull requires specific Redis config - no maxRetriesPerRequest or enableReadyCheck
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    // Exponential backoff: prevents resource exhaustion
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Connection timeout to prevent deadlock scenarios
  connectTimeout: 10000,
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Redis connection events
redisClient.on('connect', () => {
  console.log('✅ Redis connected - Shared buffer initialized');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
  /**
   * ERROR HANDLING: Critical for preventing deadlock
   * If shared buffer (Redis) fails, system must handle gracefully
   */
});

redisClient.on('close', () => {
  console.log('⚠️  Redis connection closed');
});

// Test Redis connection
const testRedisConnection = async () => {
  try {
    await redisClient.ping();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error.message);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  redisConfig,
  testRedisConnection
};