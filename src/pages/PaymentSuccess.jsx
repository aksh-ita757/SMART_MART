/**
 * PAYMENT SUCCESS PAGE - Order Confirmation with Bill
 * File: frontend/src/pages/PaymentSuccess.jsx
 * 
 * CREATE THIS NEW FILE
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { CheckCircle, Package, Calendar, MapPin, Phone, Download, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Get order details from location state (passed from Payment page)
    const details = location.state?.orderDetails;
    
    if (!details) {
      // If no order details, redirect to products
      navigate('/products');
      return;
    }

    setOrderDetails(details);

    // Clear cart after successful payment
    dispatch(clearCart());

    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  }, [location, navigate, dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days from now
    return deliveryDate;
  };

  const downloadBill = () => {
    // Create a simple bill download
    alert('Bill download feature coming soon!');
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const deliveryDate = calculateDeliveryDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎉', '✨', '🎊', '⭐', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl mb-6 relative">
            <CheckCircle className="w-16 h-16 text-white animate-bounce-once" />
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            Payment Successful! 
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your order! Your payment has been confirmed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6 text-white">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Order Number</p>
                <p className="text-2xl font-bold">{orderDetails.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Order Date</p>
                <p className="text-lg font-semibold">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{formatDate(deliveryDate)}</p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  ✨ Your order will arrive in 5 days!
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Order Items
            </h3>
            <div className="space-y-4 mb-6">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(orderDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (18% GST)</span>
                <span className="font-semibold">{formatCurrency(orderDetails.totalAmount * 0.18)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount Paid</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderDetails.totalAmount * 1.18)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Delivery Address
            </h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">{orderDetails.shippingAddress}</p>
              <div className="mt-2 flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{orderDetails.phone}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 flex flex-wrap gap-4 justify-center">
            <button
              onClick={downloadBill}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all border-2 border-gray-200"
            >
              <Download className="w-5 h-5" />
              Download Bill
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              View My Orders
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-600">We'll prepare your items for shipping</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Delivery</p>
                <p className="text-sm text-gray-600">Your order will arrive by {formatDate(deliveryDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2 group"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-bounce-once {
          animation: bounce-once 1s ease-in-out 1;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;