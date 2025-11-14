import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import Navbar from '../components/Navbar';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Copy,
  ArrowLeft,
  Heart,
  Sparkles,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Timer,
  Banknote,
  Truck,
  Package,
  Clock
} from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderData, cartItems, cartTotal } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [step, setStep] = useState('select');
  const [orderId, setOrderId] = useState(null);
  const [upiData, setUpiData] = useState(null);
  const [error, setError] = useState(null);
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderData || !cartItems) {
      navigate('/cart');
    }
  }, [orderData, cartItems, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 'cod') {
      createCODOrder();
    } else if (method === 'upi') {
      createUPIOrder();
    }
  };

  const createCODOrder = async () => {
    try {
      setStep('creating');
      setError(null);

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: orderData.address,
        phone: orderData.phone,
        paymentMethod: 'COD',
      };

      console.log('📤 PRODUCER: Creating COD order...');

      const response = await orderService.createOrder(orderPayload);

      console.log('✅ COD Order created:', response.data.order.id);

      setOrderId(response.data.order.id);
      
      dispatch(clearCart());
      
      setStep('success');

      setTimeout(() => {
        navigate('/orders');
      }, 3000);

    } catch (err) {
      console.error('❌ Error creating COD order:', err);
      setError(err.message || 'Failed to create order');
      setStep('error');
    }
  };

  const createUPIOrder = async () => {
    try {
      setStep('creating');
      setError(null);

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: orderData.address,
        phone: orderData.phone,
        paymentMethod: 'UPI',
      };

      console.log('📤 PRODUCER: Creating order and sending to backend...');

      const response = await orderService.createOrder(orderPayload);

      console.log('✅ Order created! Backend Producer added to queue:', response.data.jobId);

      setOrderId(response.data.order.id);

      await generateUPIPayment(response.data.order.id);

    } catch (err) {
      console.error('❌ Error creating order:', err);
      setError(err.message || 'Failed to create order');
      setStep('error');
    }
  };

  const generateUPIPayment = async (orderId) => {
    try {
      console.log('💳 Generating UPI payment for order:', orderId);

      const response = await paymentService.createUPIPayment(orderId);

      console.log('✅ UPI payment generated');

      setUpiData(response.data);
      setStep('payment');

    } catch (err) {
      console.error('❌ Error generating UPI payment:', err);
      setError(err.message || 'Failed to generate payment');
      setStep('error');
    }
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();

    if (!utr || utr.length < 12) {
      setError('Please enter a valid 12-digit UTR');
      return;
    }

    try {
      setStep('verifying');
      setError(null);

      console.log('🔍 Verifying payment with UTR:', utr);

      const response = await paymentService.verifyUPIPayment({
        orderId,
        utr,
      });

      console.log('✅ Payment verified! Worker will now process the order.');
      console.log('🔄 CONSUMER: Worker processing order in background...');

      dispatch(clearCart());

      setStep('success');

      setTimeout(() => {
        navigate('/orders');
      }, 3000);

    } catch (err) {
      console.error('❌ Payment verification failed:', err);
      setError(err.message || 'Payment verification failed');
      setStep('payment');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (step === 'creating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <Navbar transparent={true} />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400 rounded-full filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-30"></div>
            
            <div className="relative">
              <Loader className="w-20 h-20 text-purple-600 animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Creating Your Order...
              </h2>
              <p className="text-gray-600 text-lg">
                {paymentMethod === 'cod' ? '📦 Setting up Cash on Delivery' : '🎯 Setting up your payment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900">
        <Navbar transparent={true} />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 p-5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-8 text-lg">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="btn-primary text-lg px-8 py-4"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-800">
        <Navbar transparent={true} />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                🎉 Order Placed Successfully!
              </h2>
              <p className="text-gray-600 mb-4 text-lg">
                {paymentMethod === 'cod' ? 'Cash on Delivery confirmed' : 'Your order is being processed'}
              </p>
              <div className="inline-flex items-center gap-2 bg-purple-100 px-6 py-3 rounded-full mb-6">
                <span className="text-sm font-bold text-purple-900">Order ID: {orderId}</span>
              </div>
              {paymentMethod === 'cod' ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    💰 Pay {formatPrice(cartTotal)} in cash when your order arrives
                    <br />
                    📦 Keep exact change ready
                    <br />
                    🚚 Estimated delivery: 3-5 business days
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    💡 Your order is being processed in the background:
                    <br />
                    ✓ Checking stock availability
                    <br />
                    ✓ Reserving inventory
                    <br />
                    ✓ Updating order status
                    <br />✓ You'll see real-time updates in Orders page!
                  </p>
                </div>
              )}
              <p className="text-gray-500 flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Redirecting to orders...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verifying state
  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <Navbar transparent={true} />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <Loader className="w-20 h-20 text-purple-600 animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 text-lg">Please wait while we confirm your transaction</p>
          </div>
        </div>
      </div>
    );
  }

  // UPI Payment state
  if (step === 'payment' && paymentMethod === 'upi') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        <div className="relative z-50">
          <Navbar transparent={true} />
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button
            onClick={() => {
              setStep('select');
              setPaymentMethod(null);
            }}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Payment Options</span>
          </button>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">Secure UPI Payment</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">Complete Payment</h1>
            <p className="text-white/80 text-lg">Order ID: <span className="font-mono bg-white/10 px-3 py-1 rounded-lg">{orderId}</span></p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    Scan & Pay with UPI
                  </h2>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-3xl filter blur-xl opacity-50"></div>
                    <div className="relative bg-white p-8 rounded-3xl shadow-xl border-4 border-white">
                      <img
                        src={upiData?.qrCode}
                        alt="UPI QR Code"
                        className="w-full max-w-sm mx-auto rounded-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <a
                        href={upiData?.upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-5 h-5" />
                        Pay with UPI App
                        <Zap className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(upiData?.upiLink)}
                        className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all transform hover:scale-105"
                      >
                        <Copy className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>
                    {copied && (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Link copied to clipboard!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl filter blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-4 border-white rounded-3xl p-8 text-center shadow-xl">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Star className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
                        <h3 className="font-bold text-purple-900 text-xl">Total Amount</h3>
                        <Star className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
                      </div>
                      <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-3 animate-pulse">
                        {formatPrice(upiData?.amount)}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-700">100% Secure Payment</span>
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden sticky top-24">
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    After Payment
                  </h2>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer className="w-5 h-5 text-orange-600" />
                      <h3 className="font-bold text-yellow-900">Quick Steps:</h3>
                    </div>
                    <ol className="text-sm text-yellow-900 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">1.</span>
                        <span>Scan QR or click UPI link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">2.</span>
                        <span>Complete payment in your app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">3.</span>
                        <span>Copy 12-digit UTR/Transaction ID</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">4.</span>
                        <span>Enter below to verify</span>
                      </li>
                    </ol>
                  </div>

                  <form onSubmit={handleVerifyPayment} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Transaction ID (UTR) *
                      </label>
                      <input
                        type="text"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 placeholder-gray-400 font-mono text-lg"
                        placeholder="123456789012"
                        maxLength={12}
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        12-digit number from your UPI app
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Verify Payment
                      <Sparkles className="w-6 h-6" />
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-semibold">Secure</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold">Instant</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-semibold">Trusted</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-pink-600" />
                        </div>
                        <span className="font-semibold">Rated 4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Method Selection Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <div className="relative z-50">
        <Navbar transparent={true} />
      </div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Checkout</span>
        </button>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold">Choose Payment Method</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Complete Your Order</h1>
          <p className="text-white/80 text-lg">Total: <span className="font-bold text-2xl">{formatPrice(cartTotal)}</span></p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cash on Delivery */}
          <button
            onClick={() => handlePaymentMethodSelect('cod')}
            className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-green-400 relative overflow-hidden text-left"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-400 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Banknote className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Cash on Delivery</h2>
              <p className="text-gray-600 mb-6 text-lg text-center">Pay when you receive your order</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">Pay at doorstep</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">Inspect before paying</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">3-5 business days</span>
                </div>
              </div>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800 font-semibold">
                  💰 No advance payment required
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-bold group-hover:scale-110 transition-transform">
                  <span>Select COD</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </div>
          </button>

          {/* UPI Payment */}
          <button
            onClick={() => handlePaymentMethodSelect('upi')}
            className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-purple-400 relative overflow-hidden text-left"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400 rounded-full filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">UPI Payment</h2>
              <p className="text-gray-600 mb-6 text-lg text-center">Instant & secure digital payment</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">Instant payment</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">100% secure</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="font-medium">All UPI apps supported</span>
                </div>
              </div>
              
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-800 font-semibold">
                  ⚡ Get instant order confirmation
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold group-hover:scale-110 transition-transform">
                  <span>Pay with UPI</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8" />
              <span className="text-sm font-semibold">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-8 h-8" />
              <span className="text-sm font-semibold">Trusted by 1M+</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 fill-current" />
              <span className="text-sm font-semibold">Rated 4.8/5</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="w-8 h-8" />
              <span className="text-sm font-semibold">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;