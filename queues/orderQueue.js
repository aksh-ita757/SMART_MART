const Queue = require('bull');
const { redisConfig } = require('../config/queue');

/**
 * ORDER QUEUE - PRODUCER-CONSUMER IMPLEMENTATION
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 
 * 1. PRODUCER-CONSUMER PROBLEM:
 *    - Producers (API) add jobs to queue
 *    - Consumers (Workers) process jobs from queue
 *    - Queue acts as bounded buffer
 * 
 * 2. SYNCHRONIZATION PRIMITIVES:
 *    - Bull uses Redis locks (similar to semaphores/mutexes)
 *    - Prevents race conditions when multiple workers access same job
 * 
 * 3. MUTUAL EXCLUSION:
 *    - Only ONE worker processes a specific job at a time
 *    - Redis distributed locks ensure atomicity
 * 
 * 4. DEADLOCK PREVENTION:
 *    - Jobs have timeouts (lockDuration)
 *    - Prevents indefinite waiting
 *    - Failed jobs are retried or moved to failed queue
 * 
 * 5. STARVATION PREVENTION:
 *    - FIFO (First-In-First-Out) processing
 *    - Priority queues available if needed
 * 
 * 6. CRITICAL SECTION MANAGEMENT:
 *    - Job processing is the critical section
 *    - Only one process executes critical section per job
 */

const orderQueue = new Queue('order-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    /**
     * TIMEOUT MECHANISM: Deadlock prevention
     * If job takes longer than timeout, it's marked as failed
     * Prevents infinite waiting (one of four deadlock conditions)
     */
    timeout: 60000, // 60 seconds
    
    /**
     * RETRY STRATEGY: Fault tolerance
     * Handles transient failures without data loss
     */
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    
    /**
     * JOB REMOVAL: Memory management
     * Prevents unbounded growth of completed jobs
     */
    removeOnComplete: {
      age: 24 * 3600, // Keep for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
    },
  },
  settings: {
    /**
     * LOCK DURATION: Mutual exclusion timeout
     * If worker crashes, lock is released after this duration
     * Prevents permanent resource holding (deadlock condition)
     */
    lockDuration: 30000, // 30 seconds
    
    /**
     * STALLEDCHECKINTERVAL: Detects stuck jobs
     * Regularly checks for stalled jobs and releases locks
     * Another deadlock prevention mechanism
     */
    stalledInterval: 30000, // Check every 30 seconds
    
    /**
     * MAX_STALLED_COUNT: Prevents infinite retry loops
     * After max stalls, job is marked as failed
     */
    maxStalledCount: 3,
  }
});

/**
 * QUEUE EVENT HANDLERS
 * Monitor the producer-consumer system
 */

// Job added to queue (PRODUCER action)
orderQueue.on('waiting', (jobId) => {
  console.log(`📥 Job ${jobId} waiting in queue (PRODUCER added job)`);
});

// Job picked by worker (CONSUMER action - entering critical section)
orderQueue.on('active', (job) => {
  console.log(`⚙️  Job ${job.id} active - Worker processing (CONSUMER in critical section)`);
});

// Job completed successfully (CONSUMER exited critical section)
orderQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed - Order ${result.orderId} processed`);
});

// Job failed (CONSUMER encountered error)
orderQueue.on('failed', (job, err) => {
  console.log(`❌ Job ${job.id} failed: ${err.message}`);
  /**
   * DEADLOCK RECOVERY: Failed jobs don't hold resources
   * Worker releases lock and moves to next job
   */
});

// Job stalled (DEADLOCK DETECTION)
orderQueue.on('stalled', (job) => {
  console.log(`⚠️  Job ${job.id} stalled - Possible deadlock or worker crash`);
  /**
   * STALLED JOB: Worker died or hung while processing
   * Bull will reassign job to another worker (automatic recovery)
   */
});

// Queue error
orderQueue.on('error', (error) => {
  console.error('❌ Queue error:', error.message);
});

/**
 * GRACEFUL SHUTDOWN: Resource cleanup
 * Ensures no jobs are lost during shutdown
 */
process.on('SIGTERM', async () => {
  console.log('📴 Shutting down queue gracefully...');
  await orderQueue.close();
  /**
   * GRACEFUL TERMINATION:
   * - Waits for active jobs to complete
   * - Prevents data loss
   * - Releases all locks properly
   */
});

module.exports = orderQueue;