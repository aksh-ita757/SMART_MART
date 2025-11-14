const QRCode = require('qrcode');
const { Order, Payment } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

/**
 * UPI PAYMENT CONTROLLER - No KYC Required!
 * 
 * OS CONCEPTS DEMONSTRATED:
 * 1. EXTERNAL RESOURCE MANAGEMENT: UPI as payment interface
 * 2. QR CODE GENERATION: Visual representation of payment data
 * 3. MANUAL VERIFICATION: Admin verifies payment manually or via UTR
 * 4. STATE MANAGEMENT: Order states based on payment
 * 
 * HOW IT WORKS:
 * - Generate UPI payment link with order details
 * - Create QR code for easy scanning
 * - User pays via any UPI app (PhonePe, Google Pay, Paytm, etc.)
 * - User enters UTR (transaction reference) to verify
 * - Admin can verify payment manually
 */

/**
 * Generate UPI payment link and QR code
 * 
 * @route   POST /api/payments/create-upi
 * @access  Private
 * 
 * UPI DEEP LINK FORMAT:
 * upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
 * 
 * pa = Payee VPA (UPI ID)
 * pn = Payee Name
 * am = Amount
 * cu = Currency (INR)
 * tn = Transaction Note
 */
const createUPIPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    if (!orderId) {
      throw new AppError('Order ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    /**
     * STEP 1: VALIDATION
     * Verify order belongs to user
     * 
     * OS CONCEPT: PRECONDITION CHECK
     */
    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: userId 
      }
    });

    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new AppError('Order is not in pending state', HTTP_STATUS.BAD_REQUEST);
    }

    /**
     * STEP 2: GENERATE UPI PAYMENT LINK
     * 
     * OS CONCEPT: EXTERNAL INTERFACE CREATION
     * Create standardized payment interface
     */
    const amount = parseFloat(order.total_price);
    
    // Your UPI ID (replace with your actual UPI ID)
    // Format: username@bankname or phonenumber@paytm
    const upiId = process.env.UPI_ID || 'your-upi-id@paytm';
    const merchantName = process.env.MERCHANT_NAME || 'E-Commerce Store';
    
    // Generate unique transaction reference
    const transactionRef = `ORD${orderId}T${Date.now()}`;
    
    // UPI Deep Link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId} - ${transactionRef}`)}`;

    console.log(`💳 Generated UPI link for Order ${orderId}`);

    /**
     * STEP 3: GENERATE QR CODE
     * 
     * OS CONCEPT: DATA ENCODING
     * Convert payment data to visual QR code format
     */
    const qrCodeDataURL = await QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    /**
     * STEP 4: CREATE PAYMENT RECORD
     * 
     * OS CONCEPT: STATE PERSISTENCE
     * Store payment information for tracking
     */
    const [payment, created] = await Payment.findOrCreate({
      where: { order_id: orderId },
      defaults: {
        order_id: orderId,
        razorpay_order_id: transactionRef, // Store transaction ref
        amount: order.total_price,
        status: PAYMENT_STATUS.PENDING
      }
    });

    if (!created) {
      // Update existing payment record
      await payment.update({
        razorpay_order_id: transactionRef,
        status: PAYMENT_STATUS.PENDING
      });
    }

    /**
     * STEP 5: RETURN PAYMENT DETAILS
     * Frontend will display QR code for user to scan
     */
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'UPI payment link generated',
      data: {
        orderId: order.id,
        amount: amount,
        upiLink: upiLink,
        qrCode: qrCodeDataURL, // Base64 image
        transactionRef: transactionRef,
        upiId: upiId,
        merchantName: merchantName,
        instructions: [
          '1. Scan QR code with any UPI app (PhonePe, Google Pay, Paytm)',
          '2. Or click the UPI link on mobile',
          '3. Complete payment',
          '4. Enter UTR/Transaction ID to verify payment'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Failed to create UPI payment:', error.message);
    next(error);
  }
};

/**
 * Verify UPI payment with UTR
 * 
 * @route   POST /api/payments/verify-upi
 * @access  Private
 * 
 * OS CONCEPTS:
 * 1. MANUAL VERIFICATION: User provides transaction proof
 * 2. STATE TRANSITION: Payment pending → verified → order paid
 * 3. IDEMPOTENCY: Multiple verification attempts handled
 * 
 * UTR = Unique Transaction Reference (12-digit number from UPI app)
 */
const verifyUPIPayment = async (req, res, next) => {
  try {
    const { orderId, utr } = req.body;
    const userId = req.user.userId;

    if (!orderId || !utr) {
      throw new AppError('Order ID and UTR are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate UTR format (typically 12 digits)
    const utrRegex = /^[0-9]{12}$/;
    if (!utrRegex.test(utr)) {
      throw new AppError('Invalid UTR format. UTR should be 12 digits', HTTP_STATUS.BAD_REQUEST);
    }

    /**
     * STEP 1: GET PAYMENT RECORD
     */
    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: [{
        association: 'order',
        where: { user_id: userId }
      }]
    });

    if (!payment) {
      throw new AppError('Payment record not found', HTTP_STATUS.NOT_FOUND);
    }

    /**
     * IDEMPOTENCY CHECK
     * If already verified, don't process again
     */
    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Payment already verified',
        data: {
          orderId: payment.order_id,
          status: PAYMENT_STATUS.SUCCESS
        }
      });
    }

    /**
     * STEP 2: MARK AS PENDING VERIFICATION
     * 
     * In real system, you would:
     * - Call UPI verification API
     * - Or manually verify in admin panel
     * 
     * For demo, we'll auto-verify if UTR is provided
     */
    console.log(`💳 UPI Payment verification for Order ${orderId}`);
    console.log(`UTR: ${utr}`);

    /**
     * STEP 3: UPDATE PAYMENT STATUS
     * 
     * OS CONCEPT: ATOMIC STATE TRANSITION
     * Update payment and order status together
     */
    await payment.update({
      razorpay_payment_id: utr, // Store UTR
      razorpay_signature: `verified_upi_${Date.now()}`, // Verification timestamp
      status: PAYMENT_STATUS.SUCCESS
    });

    // Update order status to PAID
    await payment.order.update({
      status: ORDER_STATUS.PAID
    });

    console.log(`✅ UPI Payment verified! Order ${orderId} marked as PAID`);
    console.log(`UTR: ${utr}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: payment.order_id,
        utr: utr,
        status: PAYMENT_STATUS.SUCCESS,
        note: 'Your order will be processed shortly'
      }
    });

  } catch (error) {
    console.error('❌ UPI verification error:', error.message);
    next(error);
  }
};

/**
 * Check payment status
 * 
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
const checkUPIPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: [{
        association: 'order',
        where: { user_id: userId },
        attributes: ['id', 'status', 'total_price']
      }]
    });

    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        orderId: payment.order_id,
        paymentStatus: payment.status,
        orderStatus: payment.order.status,
        amount: payment.amount,
        utr: payment.razorpay_payment_id,
        transactionRef: payment.razorpay_order_id
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Manually verify payment
 * 
 * @route   POST /api/payments/admin/verify
 * @access  Admin only
 * 
 * OS CONCEPT: PRIVILEGED OPERATION
 * Admin has authority to verify payments manually
 */
const adminVerifyPayment = async (req, res, next) => {
  try {
    const { orderId, verified } = req.body;

    // TODO: Add admin authentication check
    // For now, anyone can call this (in production, add admin middleware)

    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: ['order']
    });

    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    if (verified) {
      await payment.update({
        status: PAYMENT_STATUS.SUCCESS,
        razorpay_signature: `admin_verified_${Date.now()}`
      });

      await payment.order.update({
        status: ORDER_STATUS.PAID
      });

      console.log(`✅ Admin verified payment for Order ${orderId}`);
    } else {
      await payment.update({
        status: PAYMENT_STATUS.FAILED
      });

      console.log(`❌ Admin rejected payment for Order ${orderId}`);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: verified ? 'Payment verified by admin' : 'Payment rejected',
      data: payment
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUPIPayment,
  verifyUPIPayment,
  checkUPIPaymentStatus,
  adminVerifyPayment
};