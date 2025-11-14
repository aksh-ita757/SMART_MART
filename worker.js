require('dotenv').config();
const orderQueue = require('./queues/orderQueue');
const processOrder = require('./jobs/processOrder');
const { testConnection } = require('./config/database');
const { testRedisConnection } = require('./config/queue');

/**
 * WORKER PROCESS - Consumer in Producer-Consumer Pattern
 * 
 * This is a SEPARATE PROCESS from the main API server
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 
 * 1. MULTI-PROCESSING:
 *    - API Server (Producer) runs in one process
 *    - Worker (Consumer) runs in separate process(es)
 *    - Can scale horizontally (multiple worker processes)
 * 
 * 2. INTER-PROCESS COMMUNICATION (IPC):
 *    - Producer and Consumer communicate via Redis (shared memory)
 *    - Message passing through queue
 * 
 * 3. PROCESS ISOLATION:
 *    - Worker crash doesn't affect API server
 *    - Failures are contained
 * 
 * 4. CONCURRENT PROCESSING:
 *    - Multiple workers can process different jobs simultaneously
 *    - Bull handles job distribution and locking
 * 
 * 5. RESOURCE MANAGEMENT:
 *    - Worker has its own memory space
 *    - Can set resource limits (CPU, memory)
 */

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 WORKER PROCESS STARTING');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Initialize Worker
 * Connect to database and Redis before processing jobs
 */
const startWorker = async () => {
  try {
    /**
     * INITIALIZATION: Connect to shared resources
     * - Database: For order and inventory management
     * - Redis: For queue communication with producer
     */
    console.log('📡 Connecting to database...');
    await testConnection();

    console.log('📡 Connecting to Redis queue...');
    await testRedisConnection();

    console.log('✅ Worker initialized successfully');
    console.log('👷 Worker is ready to process jobs');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    /**
     * REGISTER JOB PROCESSOR - Consumer Logic
     * 
     * OS CONCEPT: EVENT-DRIVEN PROCESSING
     * - Worker waits for jobs (similar to process waiting for CPU)
     * - When job arrives, worker picks it up (scheduling)
     * - Processes it (enters running state)
     * - Returns result and waits for next job
     * 
     * CONCURRENCY CONTROL:
     * - 'concurrency: 5' means this worker can process 5 jobs simultaneously
     * - Similar to multi-core CPU processing multiple processes
     * - Each job gets its own "thread" of execution
     */
    orderQueue.process('process-order', 5, async (job) => {
      /**
       * CONSUMER PICKS JOB FROM QUEUE
       * 
       * OS ANALOGY: Process scheduler picks process from ready queue
       * 
       * Bull ensures:
       * - Only ONE worker processes a specific job
       * - If worker crashes, job is reassigned (fault tolerance)
       * - Jobs are locked during processing (mutual exclusion)
       */
      console.log(`\n👷 WORKER: Picked up job ${job.id} from queue`);
      console.log(`📋 Order ID: ${job.data.orderId}`);
      
      /**
       * PROCESS THE JOB - Enter Critical Section
       * This is where actual work happens
       */
      const result = await processOrder(job);
      
      return result;
    });

    console.log('✅ Worker is now listening for jobs...');
    console.log('💡 Waiting for Producer to add jobs to queue...');
    
  } catch (error) {
    console.error('❌ Failed to start worker:', error.message);
    process.exit(1);
  }
};

/**
 * GRACEFUL SHUTDOWN - Resource Cleanup
 * 
 * OS CONCEPT: PROCESS TERMINATION
 * - Wait for active jobs to complete
 * - Release all locks
 * - Close connections
 * - Prevent data loss
 */
const shutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
  
  try {
    /**
     * GRACEFUL QUEUE CLOSE
     * - Waits for active jobs to complete
     * - Rejects new jobs
     * - Releases Redis connections
     */
    await orderQueue.close();
    console.log('✅ Queue closed gracefully');
    
    console.log('👋 Worker shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

/**
 * SIGNAL HANDLERS - Process Control
 * 
 * OS CONCEPT: SIGNAL HANDLING
 * - SIGTERM: Termination signal (graceful)
 * - SIGINT: Interrupt signal (Ctrl+C)
 * - Handle these to cleanup properly
 */
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * UNHANDLED ERROR HANDLERS
 * 
 * OS CONCEPT: EXCEPTION HANDLING AT PROCESS LEVEL
 * Last line of defense to prevent worker crashes
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let worker continue for other jobs
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // For uncaught exceptions, better to restart worker
  shutdown('UNCAUGHT_EXCEPTION');
});

/**
 * START THE WORKER
 * 
 * OS CONCEPT: PROCESS CREATION
 * Creates worker process and starts listening for jobs
 */
startWorker();

/**
 * WORKER PROCESS SUMMARY
 * 
 * PRODUCER-CONSUMER IMPLEMENTATION:
 * ┌─────────────┐         ┌───────────────┐         ┌─────────────┐
 * │   Producer  │ ──────> │  Redis Queue  │ ──────> │  Consumer   │
 * │ (API Server)│  Adds   │ (Shared Buffer│  Picks  │  (Worker)   │
 * └─────────────┘  Jobs   └───────────────┘  Jobs   └─────────────┘
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 
 * 1. PROCESS STATES:
 *    - Worker starts in NEW state
 *    - Moves to READY when initialized
 *    - Enters RUNNING when processing job
 *    - Returns to READY after job completion
 *    - Enters WAITING when queue is empty
 * 
 * 2. SYNCHRONIZATION:
 *    - Bull uses Redis locks (distributed mutex)
 *    - Database transactions for inventory (local mutex)
 *    - Prevents race conditions
 * 
 * 3. DEADLOCK PREVENTION:
 *    - Transaction timeouts
 *    - Job timeouts
 *    - Lock ordering in inventory service
 *    - No circular waits
 * 
 * 4. CONCURRENCY:
 *    - Multiple workers can run simultaneously
 *    - Each processes different jobs
 *    - Proper locking ensures no conflicts
 * 
 * 5. FAULT TOLERANCE:
 *    - Job retries on failure
 *    - Graceful shutdown
 *    - Error handling and logging
 * 
 * HOW TO RUN:
 * 1. Start API server: npm run dev
 * 2. Start worker (separate terminal): node worker.js
 * 3. Create order via API (Producer)
 * 4. Worker picks and processes it (Consumer)
 */