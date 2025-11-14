const orderQueue = require('../queues/orderQueue');

/**
 * QUEUE SERVICE: Producer Operations
 * 
 * This service implements the PRODUCER side of Producer-Consumer pattern
 * 
 * OS CONCEPTS:
 * 1. PRODUCER: Adds items (jobs) to shared buffer (queue)
 * 2. BUFFER MANAGEMENT: Checks queue capacity before adding
 * 3. SYNCHRONIZATION: Uses atomic operations to prevent race conditions
 */

/**
 * Add order to processing queue
 * 
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} - Job details
 * 
 * OS CONCEPT: PRODUCER ACTION
 * - Producer creates data (order)
 * - Places it in shared buffer (Redis queue)
 * - Notifies consumer (Bull triggers 'waiting' event)
 */
const addOrderToQueue = async (orderData) => {
  try {
    /**
     * CRITICAL SECTION: Adding job to queue
     * Bull ensures atomicity - no race condition possible
     * Multiple producers can add jobs concurrently without conflicts
     */
    const job = await orderQueue.add('process-order', orderData, {
      // Job priority (lower number = higher priority)
      priority: orderData.priority || 1,
      
      /**
       * JOB ID: Prevents duplicate processing
       * Acts as a unique identifier (similar to process ID)
       */
      jobId: `order-${orderData.orderId}`,
      
      /**
       * TIMEOUT: Deadlock prevention
       * Job must complete within this time or fail
       */
      timeout: 60000,
    });

    console.log(`📤 PRODUCER: Added job ${job.id} to queue`);

    return {
      jobId: job.id,
      orderId: orderData.orderId,
      status: 'queued'
    };
  } catch (error) {
    /**
     * ERROR HANDLING: Producer failure handling
     * If queue is full or Redis is down, handle gracefully
     */
    console.error('❌ Failed to add job to queue:', error.message);
    throw new Error('Failed to queue order for processing');
  }
};

/**
 * Get job status
 * 
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} - Job status
 * 
 * OS CONCEPT: MONITORING
 * Check the status of a job in the queue
 */
const getJobStatus = async (jobId) => {
  try {
    const job = await orderQueue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }

    /**
     * JOB STATES (similar to process states):
     * - waiting: In queue, not yet processed (READY state)
     * - active: Being processed by worker (RUNNING state)
     * - completed: Processing finished (TERMINATED state)
     * - failed: Processing failed (TERMINATED with error)
     * - delayed: Scheduled for later (WAITING state)
     * - stuck: Worker died during processing (DEADLOCK/STALLED)
     */
    const state = await job.getState();
    const progress = job.progress();
    const failedReason = job.failedReason;

    return {
      jobId: job.id,
      state,
      progress,
      failedReason,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      data: job.data
    };
  } catch (error) {
    console.error('❌ Failed to get job status:', error.message);
    throw error;
  }
};

/**
 * Get queue statistics
 * 
 * @returns {Promise<Object>} - Queue metrics
 * 
 * OS CONCEPT: RESOURCE MONITORING
 * Monitor queue health and performance
 */
const getQueueStats = async () => {
  try {
    /**
     * QUEUE METRICS (similar to system resource monitoring):
     * - waiting: Number of jobs waiting for processing
     * - active: Number of jobs currently being processed
     * - completed: Number of successfully processed jobs
     * - failed: Number of failed jobs
     */
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      orderQueue.getWaitingCount(),
      orderQueue.getActiveCount(),
      orderQueue.getCompletedCount(),
      orderQueue.getFailedCount(),
      orderQueue.getDelayedCount(),
    ]);

    /**
     * THROUGHPUT CALCULATION
     * Measure system performance (jobs processed per unit time)
     */
    return {
      waiting,    // Jobs in buffer waiting for consumer
      active,     // Jobs in critical section (being processed)
      completed,  // Successfully processed jobs
      failed,     // Failed jobs
      delayed,    // Scheduled jobs
      total: waiting + active + completed + failed + delayed,
      
      /**
       * UTILIZATION: How busy the system is
       * High active/waiting ratio = good utilization
       * High waiting/active ratio = need more consumers (workers)
       */
      utilization: active > 0 ? (active / (waiting + active)) * 100 : 0,
    };
  } catch (error) {
    console.error('❌ Failed to get queue stats:', error.message);
    throw error;
  }
};

/**
 * Remove job from queue
 * 
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 * 
 * OS CONCEPT: RESOURCE CLEANUP
 * Remove job from queue (similar to terminating a process)
 */
const removeJob = async (jobId) => {
  try {
    const job = await orderQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`🗑️  Removed job ${jobId} from queue`);
    }
  } catch (error) {
    console.error('❌ Failed to remove job:', error.message);
    throw error;
  }
};

/**
 * Retry failed job
 * 
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 * 
 * OS CONCEPT: FAULT RECOVERY
 * Retry a failed job (similar to restarting a failed process)
 */
const retryJob = async (jobId) => {
  try {
    const job = await orderQueue.getJob(jobId);
    if (job) {
      await job.retry();
      console.log(`🔄 Retrying job ${jobId}`);
    }
  } catch (error) {
    console.error('❌ Failed to retry job:', error.message);
    throw error;
  }
};

module.exports = {
  addOrderToQueue,
  getJobStatus,
  getQueueStats,
  removeJob,
  retryJob
};