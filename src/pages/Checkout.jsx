// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { selectCartItems, selectCartTotal } from '../store/cartSlice';
import Navbar from '../components/Navbar';
import {
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Mail,
  Sparkles,
  Shield,
  Truck,
  Gift,
  Star
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const { user } = useSelector((state) => state.auth);

  // Initialize formData with user info if available
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Format price as INR currency
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  // Handle form input changes and clear error on input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form fields and set errors if invalid
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Shipping address is required';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Please enter a complete address';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // On form submit, validate and navigate to payment page if valid
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Navigate to payment page with order data & cart info
    navigate('/payment', { state: { orderData: formData, cartItems, cartTotal } });
  };

  // Avoid rendering if cart is empty (redirect happens in useEffect)
  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold group transition-all"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Cart</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Checkout</h1>
          </div>
          <p className="text-gray-600 text-lg ml-17">Complete your order securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Shipping Information */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Shipping Information
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="John Doe"
                          autoComplete="name"
                        />
                      </div>
                      {errors.name && <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-semibold"><span>⚠️</span>{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="john@example.com"
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-semibold"><span>⚠️</span>{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-semibold"><span>⚠️</span>{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Shipping Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none text-gray-900 ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                        placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                        autoComplete="street-address"
                      />
                      {errors.address && <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-semibold"><span>⚠️</span>{errors.address}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Review */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Order Items ({cartItems.length})
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 pb-4 border-b last:border-b-0"
                      >
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-xl shadow-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{item.product.name}</h3>
                          <p className="text-sm text-purple-600 font-semibold mb-2">Quantity: {item.quantity}</p>
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all text-xl flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-7 h-7" />
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  <Sparkles className="w-7 h-7" />
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-20 border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-200 rounded-full filter blur-3xl opacity-30"></div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-7 h-7 text-yellow-500 fill-current" />
                  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Shipping</span>
                    <span className="text-green-600 font-bold flex items-center gap-1 text-lg">
                      <Truck className="w-5 h-5" />
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Tax</span>
                    <span className="text-green-600 font-bold">Included</span>
                  </div>
                  <div className="border-t-2 border-dashed pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">Total</span>
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-md">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Easy returns within 30 days</span>
                  </div>
                </div>

                {/* Mobile Submit Button */}
                <div className="lg:hidden mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-5 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-6 h-6" />
                    {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;