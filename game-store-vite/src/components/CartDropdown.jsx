import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartDropdown = ({ isOpen, onClose }) => {
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
    onClose(); // Close the dropdown
    navigate('/checkout'); // Navigate to checkout page
  };

  // Format price helper
  const formatPrice = (priceInCents) => {
    return `$${((priceInCents || 0) / 100).toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-600">Loading cart...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-6 py-4">
            <div className="text-red-600 text-sm bg-red-50 rounded-lg p-3">
              {error}
            </div>
          </div>
        )}

        {/* Empty Cart */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <div className="text-gray-600 font-medium mb-2">Your cart is empty</div>
            <div className="text-gray-400 text-sm">Add some games to get started!</div>
          </div>
        )}

        {/* Cart Items */}
        {!loading && !error && cartItems.length > 0 && (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-96">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const gameKey = item.game_key || {};
                  const game = gameKey.game || {};
                  const price = gameKey.price || 0;
                  const quantity = item.quantity || 1;
                  const isRemoving = removingItems.has(item.id);
                  const isUpdating = updatingItems.has(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg transition-opacity ${
                        isRemoving ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Game Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
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
                          {game.name?.substring(0, 8) || 'Game'}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">
                          {game.name || 'Unknown Game'}
                        </h4>
                        <div className="text-xs text-gray-500 mt-1">
                          {gameKey.key_type && (
                            <span className="bg-gray-200 px-2 py-0.5 rounded text-xs mr-2">
                              {gameKey.key_type}
                            </span>
                          )}
                          {formatPrice(price)}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, quantity - 1)}
                            disabled={quantity <= 1 || isUpdating}
                            className="w-6 h-6 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium min-w-[1.5rem] text-center">
                            {isUpdating ? '...' : quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, quantity + 1)}
                            disabled={isUpdating}
                            className="w-6 h-6 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving}
                        className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
                        title="Remove from cart"
                      >
                        {isRemoving ? '...' : '×'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={handleClearCart}
                  className="w-full text-gray-600 hover:text-red-600 py-2 text-sm transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDropdown;
