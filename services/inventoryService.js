const { Product } = require('../models');
const { sequelize } = require('../config/database');
const { Transaction } = require('sequelize');

/**
 * INVENTORY SERVICE - Critical Section Management
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 
 * 1. CRITICAL SECTION: Stock checking and updating
 *    - Only one transaction can modify stock at a time
 *    - Database locks prevent race conditions
 * 
 * 2. RACE CONDITION PREVENTION:
 *    - Using database transactions with locks
 *    - Pessimistic locking (SELECT FOR UPDATE)
 * 
 * 3. DEADLOCK PREVENTION:
 *    - Transaction timeouts
 *    - Proper lock ordering (always lock products in same order)
 * 
 * 4. ATOMICITY: All-or-nothing operations
 *    - Either all items are reserved or none
 *    - Transaction rollback on failure
 */

/**
 * Check if sufficient stock is available for all items
 * 
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Promise<Object>} - { available: boolean, insufficientItems: [] }
 * 
 * OS CONCEPT: READ OPERATION (Non-blocking check)
 * - Multiple processes can read simultaneously
 * - No locks needed for reading
 */
const checkStockAvailability = async (items) => {
  try {
    const insufficientItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      if (!product) {
        insufficientItems.push({
          productId: item.productId,
          reason: 'Product not found',
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      if (product.stock < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          productName: product.name,
          reason: 'Insufficient stock',
          requested: item.quantity,
          available: product.stock
        });
      }
    }

    return {
      available: insufficientItems.length === 0,
      insufficientItems
    };
  } catch (error) {
    console.error('❌ Error checking stock:', error.message);
    throw error;
  }
};

/**
 * Reserve stock for order items (Decrease inventory)
 * 
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Promise<boolean>} - Success status
 * 
 * OS CONCEPTS:
 * 
 * 1. CRITICAL SECTION: Stock modification
 *    - Must be protected from concurrent access
 *    - Uses database transaction with locks
 * 
 * 2. PESSIMISTIC LOCKING: SELECT FOR UPDATE
 *    - Locks rows being read until transaction commits
 *    - Prevents other transactions from modifying same rows
 *    - Similar to mutex lock in OS
 * 
 * 3. DEADLOCK PREVENTION STRATEGIES:
 *    a) Lock Ordering: Always acquire locks in same order (by productId)
 *    b) Timeout: Transaction times out if takes too long
 *    c) No Hold-and-Wait: Acquire all locks at once
 * 
 * 4. ATOMICITY (ACID property):
 *    - All stock updates succeed or all fail
 *    - No partial updates
 *    - Transaction rollback ensures consistency
 */
const reserveStock = async (items) => {
  /**
   * DATABASE TRANSACTION: Critical Section Protection
   * 
   * Transaction ensures:
   * - Isolation: Other processes see old or new state, never intermediate
   * - Atomicity: All operations succeed or all fail
   * - Consistency: Database constraints always satisfied
   * - Durability: Changes persist after commit
   */
  /**
   * Import Transaction from sequelize for isolation levels
   */
  const { Transaction } = require('sequelize');
  
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    /**
     * TRANSACTION TIMEOUT: Deadlock prevention
     * If transaction takes longer than timeout, it's rolled back
     * Prevents indefinite waiting (deadlock condition)
     */
    timeout: 10000, // 10 seconds
  });

  try {
    /**
     * LOCK ORDERING: Deadlock prevention strategy
     * Always lock products in ascending order of productId
     * This prevents circular wait condition (deadlock)
     */
    const sortedItems = [...items].sort((a, b) => a.productId - b.productId);

    for (const item of sortedItems) {
      /**
       * SELECT FOR UPDATE: Pessimistic locking
       * 
       * OS ANALOGY: Similar to acquiring a mutex
       * - Locks the row until transaction commits/rollbacks
       * - Other transactions wait if they try to access same row
       * - Prevents race condition: two orders can't reduce same stock simultaneously
       * 
       * RACE CONDITION SCENARIO (without lock):
       * Time | Process A              | Process B              | Stock
       * -----|------------------------|------------------------|-------
       * t1   | Read stock = 10        |                        | 10
       * t2   |                        | Read stock = 10        | 10
       * t3   | Update stock = 10-5=5  |                        | 5
       * t4   |                        | Update stock = 10-5=5  | 5  ❌ WRONG! Should be 0
       * 
       * WITH SELECT FOR UPDATE:
       * t1   | Lock & Read stock = 10 |                        | 10
       * t2   |                        | Wait for lock...       | 10
       * t3   | Update stock = 5       |                        | 5
       * t4   | Commit & Release lock  |                        | 5
       * t5   |                        | Acquire lock, read = 5 | 5
       * t6   |                        | Update stock = 0       | 0  ✅ CORRECT!
       */
      const product = await Product.findByPk(item.productId, {
        lock: transaction.LOCK.UPDATE, // Pessimistic lock
        transaction
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      /**
       * CRITICAL SECTION: Stock modification
       * Protected by transaction lock
       * No other process can modify this product's stock right now
       */
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      /**
       * ATOMIC OPERATION: Stock decrement
       * Decrement operation is atomic at database level
       */
      await product.decrement('stock', {
        by: item.quantity,
        transaction
      });

      console.log(`📦 Reserved ${item.quantity} units of ${product.name} (Stock: ${product.stock} → ${product.stock - item.quantity})`);
    }

    /**
     * COMMIT: Release all locks
     * Makes changes permanent and visible to other transactions
     * Similar to releasing mutex after exiting critical section
     */
    await transaction.commit();
    console.log('✅ Stock reserved successfully');
    return true;

  } catch (error) {
    /**
     * ROLLBACK: Error recovery
     * 
     * OS CONCEPT: Exception handling in critical section
     * - Releases all locks immediately
     * - Undoes all changes (restores stock)
     * - Prevents partial updates
     * - Similar to releasing mutex on error
     */
    await transaction.rollback();
    console.error('❌ Failed to reserve stock:', error.message);
    throw error;
  }
};

/**
 * Restore stock for cancelled/failed orders
 * 
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Promise<boolean>} - Success status
 * 
 * OS CONCEPT: COMPENSATION / ROLLBACK
 * When order fails, restore reserved inventory
 * Similar to releasing resources after process termination
 */
const restoreStock = async (items) => {
  const transaction = await sequelize.transaction();

  try {
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (product) {
        await product.increment('stock', {
          by: item.quantity,
          transaction
        });
        console.log(`📦 Restored ${item.quantity} units of ${product.name}`);
      }
    }

    await transaction.commit();
    console.log('✅ Stock restored successfully');
    return true;

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Failed to restore stock:', error.message);
    throw error;
  }
};

module.exports = {
  checkStockAvailability,
  reserveStock,
  restoreStock
};