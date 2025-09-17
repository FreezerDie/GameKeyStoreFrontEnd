import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/moneyUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartTotal, 
    loading, 
    error, 
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();

  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Handle quantity change
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set([...prev, cartItemId]));
    const success = await updateQuantity(cartItemId, newQuantity);
    setUpdatingItems(prev => {
      const updated = new Set(prev);
      updated.delete(cartItemId);
      return updated;
    });
  };

  // Handle item removal
  const handleRemoveItem = async (cartItemId) => {
    setRemovingItems(prev => new Set([...prev, cartItemId]));
    const success = await removeFromCart(cartItemId);
    setRemovingItems(prev => {
      const updated = new Set(prev);
      updated.delete(cartItemId);
      return updated;
    });
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    navigate('/checkout');
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <Link 
              to="/games" 
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-600 text-lg">Loading cart...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-red-600 bg-red-50 rounded-lg p-4">
              {error}
            </div>
          </div>
        )}

        {/* Empty Cart */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some games to get started!</p>
            <Link 
              to="/games" 
              className="inline-block bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              Browse Games
            </Link>
          </div>
        )}

        {/* Cart Items */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Items ({cartItems.length})
                </h2>
                <button 
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
              
              {cartItems.map((item) => {
                // Handle both new structure (game and game_key directly on item) 
                // and old structure (game nested in game_key)
                const gameKey = item.game_key || {};
                const game = item.game || gameKey.game || {};
                const price = item.game_key?.price || gameKey.price || 0;
                const quantity = item.quantity || 1;
                const isRemoving = removingItems.has(item.id);
                const isUpdating = updatingItems.has(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-lg shadow-md p-6 transition-opacity ${
                      isRemoving ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Game Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {game.cover ? (
                          <>
                            <img 
                              src={`https://s3.tebi.io/game-key-store/games/${game.cover}`}
                              alt={game.name || 'Game'}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.fallback-text').style.display = 'flex';
                              }}
                            />
                            <div className="fallback-text absolute inset-0 text-white font-semibold text-xs text-center leading-tight items-center justify-center px-1 hidden">
                              {game.name?.substring(0, 8) || 'Game'}
                            </div>
                          </>
                        ) : (
                          <div className="text-white font-semibold text-xs text-center leading-tight px-1">
                            {game.name?.substring(0, 8) || 'Game'}
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">
                          {game.name || 'Unknown Game'}
                        </h3>
                        <div className="text-sm text-gray-600 mb-4">
                          {gameKey.key_type && (
                            <span className="bg-gray-200 px-2 py-1 rounded text-xs mr-2">
                              {gameKey.key_type}
                            </span>
                          )}
                          <span className="font-medium text-green-600">
                            {formatPrice(price)}
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, quantity - 1)}
                              disabled={quantity <= 1 || isUpdating}
                              className="w-8 h-8 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-medium min-w-[2rem] text-center">
                              {isUpdating ? '...' : quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, quantity + 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right">
                        <div className="font-semibold text-lg text-gray-800 mb-2">
                          {formatPrice(price * quantity)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove from cart"
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 mb-4"
                >
                  Proceed to Checkout
                </button>

                <div className="text-center text-sm text-gray-600">
                  <p>Secure checkout with SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
