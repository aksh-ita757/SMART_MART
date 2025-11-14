/**
 * PHASE 15: ORDER TRACKING PAGE
 * File: frontend/src/pages/OrderTracking.jsx
 * 
 * CREATE THIS NEW FILE
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch tracking data
  useEffect(() => {
    fetchTrackingData();
  }, [orderId]);

  // Setup WebSocket
  useEffect(() => {
    if (!user || !orderId) return;

    console.log(`🔌 Connecting WebSocket for order ${orderId}...`);

    const ws = new WebSocket(`ws://localhost:3000?userId=${user.id}&orderId=${orderId}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connected for tracking');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 Received:', data);
        
        if (data.type === 'order:status' && data.orderId === parseInt(orderId)) {
          console.log(`📦 Order ${orderId} status: ${data.status}`);
          
          // Refresh tracking data
          fetchTrackingData();
          
          // Show notification
          showStatusNotification(data);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [orderId, user]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/orders/${orderId}/tracking`);

      if (response.data.success) {
        setTrackingData(response.data.data);
      }

    } catch (err) {
      console.error('Error fetching tracking:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const showStatusNotification = (data) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">🎉</span>
        <div>
          <p class="font-semibold">Status Updated!</p>
          <p class="text-sm">${data.message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'shipped':
        return <Truck className="w-8 h-8 text-purple-500" />;
      case 'processing':
        return <Package className="w-8 h-8 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-8 h-8 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tracking information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Tracking Not Found</h2>
            <p className="text-gray-500 mt-2">{error || 'Unable to load tracking information'}</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
              <p className="text-gray-600 mt-1">Order #{trackingData.orderNumber}</p>
            </div>

            <div className="flex items-center gap-3">
              {wsConnected && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Live Updates
                </div>
              )}
              <button
                onClick={fetchTrackingData}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(trackingData.status)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
              </h2>
              <p className="text-gray-600 mb-3">
                {trackingData.status === 'pending' && 'Your order is awaiting payment confirmation'}
                {trackingData.status === 'paid' && 'Payment confirmed. Order will be processed soon'}
                {trackingData.status === 'processing' && 'Your order is being prepared for shipping'}
                {trackingData.status === 'shipped' && 'Your order is on the way!'}
                {trackingData.status === 'delivered' && 'Your order has been delivered'}
                {trackingData.status === 'cancelled' && 'This order has been cancelled'}
                {trackingData.status === 'failed' && 'Order processing failed'}
              </p>
              {trackingData.estimatedDelivery && trackingData.status !== 'delivered' && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Estimated Delivery: <strong>{formatDate(trackingData.estimatedDelivery)}</strong>
                  </span>
                </div>
              )}
              {trackingData.status === 'delivered' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Delivered on: <strong>{formatDate(trackingData.estimatedDelivery)}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
          
          <div className="space-y-4">
            {trackingData.statusTimeline.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      step.completed ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                  {index < trackingData.statusTimeline.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      step.completed ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
                    {step.timestamp && (
                      <span className="text-sm text-gray-500">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    step.completed ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h3>
          <p className="text-gray-700 whitespace-pre-line">{trackingData.shippingAddress}</p>
          <div className="mt-2 flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{trackingData.phone}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          
          <div className="space-y-3">
            {trackingData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 pb-3 border-b last:border-b-0">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(trackingData.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;