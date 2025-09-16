import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../utils/apiUtils';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
  const { authenticated, user } = useAuth();

  // Form states - simplified (no billing/payment info needed)
  const [comment, setComment] = useState('');

  // UI states
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
      return;
    }
  }, [authenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/');
      return;
    }
  }, [cartItems.length, cartLoading, navigate]);

  // No need to pre-fill user info since we removed billing forms

  // Simplified validation - no form fields to validate
  const validateForm = () => {
    // Since we removed billing/payment forms, just check if cart has items
    if (cartItems.length === 0) {
      setErrors({ submit: 'Cart is empty' });
      return false;
    }
    setErrors({});
    return true;
  };

  // No input handlers needed since we removed all form fields

  // Process order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setErrors({});

    try {
      // Prepare simplified order data
      const orderPayload = {
        cartItems: cartItems.map(item => ({
          game_key_id: item.game_key?.id,
          quantity: item.quantity || 1,
          price: item.game_key?.price || 0
        })),
        totalAmount: cartTotal,
        userEmail: user?.email, // Use logged in user's email
        comment: comment.trim() || null // Include comment if provided
      };

      console.log('Submitting order:', orderPayload);

      // Submit order to API
      const response = await createOrder(orderPayload);
      
      console.log('Order response:', response);
      
      // Clear cart after successful order
      await clearCart();
      
      // Set order complete state
      setOrderData(response);
      setOrderComplete(true);

    } catch (error) {
      console.error('Order submission failed:', error);
      setErrors({ submit: error.message || 'Failed to process order. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  // Format price helper
  const formatPrice = (priceInCents) => {
    return `$${((priceInCents || 0) / 100).toFixed(2)}`;
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center py-20">
            <h2 className="text-indigo-500 text-3xl font-semibold">Loading checkout...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Order complete state
  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">Order Complete!</h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your purchase! Your game keys will be delivered to your email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span className="text-gray-600">#{orderData.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Paid:</span>
                  <span className="font-bold text-green-600">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-600">{user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase to get your game keys</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const gameKey = item.game_key || {};
                  const game = gameKey.game || {};
                  const price = gameKey.price || 0;
                  const quantity = item.quantity || 1;
                  
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {game.cover ? (
                          <img 
                            src={`https://s3.tebi.io/game-key-store/games/${game.cover}`}
                            alt={game.name || 'Game'}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="text-white font-semibold text-xs text-center leading-tight">
                          {game.name?.substring(0, 6) || 'Game'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">
                          {game.name || 'Unknown Game'}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {gameKey.key_type && (
                            <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs mr-2">
                              {gameKey.key_type}
                            </span>
                          )}
                          Qty: {quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {formatPrice(price * quantity)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(cartTotal)}</span>
                </div>
            </div>
          </div>

          {/* Checkout Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {errors.submit && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to checkout?</h2>
                <p className="text-gray-600">Your game keys will be delivered instantly to your email: <strong>{user?.email || 'N/A'}</strong></p>
              </div>

              {/* Comment Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Add any special instructions or comments for your order..."
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 characters
                </div>
              </div>

              <form onSubmit={handleSubmitOrder}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-50"
                    disabled={processing}
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="submit"
                    disabled={processing || cartItems.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      `Complete Order • ${formatPrice(cartTotal)}`
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>🚀 Instant delivery • No payment details required</p>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
