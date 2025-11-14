import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from '../store/cartSlice';
import Navbar from '../components/Navbar';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, CheckCircle, Shield, Truck, Gift } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleIncrement = (productId) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecrement = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <p className="text-gray-600 text-lg ml-15">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full filter blur-3xl opacity-30"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-10 rounded-full shadow-xl">
                  <ShoppingBag className="w-24 h-24 text-purple-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 text-xl">
                Discover amazing products and add them to your cart!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
              >
                <Sparkles className="w-6 h-6" />
                Start Shopping
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl shadow-xl p-6 flex gap-6 border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden group"
                >
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-32 h-32 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {item.product.category}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-purple-600 font-semibold">{item.product.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-1.5 shadow-md">
                        <button
                          onClick={() => handleDecrement(item.product.id)}
                          className="p-2 rounded-lg bg-white hover:bg-purple-200 transition-colors shadow-sm"
                        >
                          <Minus className="w-5 h-5 text-purple-600" />
                        </button>
                        <span className="text-xl font-bold w-14 text-center text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.product.id)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 rounded-lg bg-white hover:bg-purple-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5 text-purple-600" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {formatPrice(item.product.price)} each
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.product.stock && (
                      <div className="flex items-center gap-2 mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                        <Shield className="w-4 h-4 text-orange-600" />
                        <p className="text-sm text-orange-600 font-semibold">
                          Maximum stock reached
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-20 border border-gray-100 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-7 h-7 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600 text-lg">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-lg">Shipping</span>
                      <span className="text-green-600 font-bold flex items-center gap-1 text-lg">
                        <Truck className="w-5 h-5" />
                        FREE
                      </span>
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

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-5 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 mb-4 text-lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold transition-all"
                  >
                    Continue Shopping
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-8 pt-8 border-t space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="font-semibold">100% Secure payment</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="font-semibold">Free shipping worldwide</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shadow-md">
                        <Gift className="w-6 h-6 text-pink-600" />
                      </div>
                      <span className="font-semibold">Special offers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;