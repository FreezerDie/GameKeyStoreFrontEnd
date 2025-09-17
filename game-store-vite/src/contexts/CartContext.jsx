// Cart Context for managing cart state throughout the app

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  addGameKeyToCart, 
  fetchUserCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart as clearCartAPI,
  fetchCartCount 
} from '../utils/apiUtils';
import { useAuth } from './AuthContext';
import { calculateCartTotal } from '../utils/moneyUtils';

const CartContext = createContext({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  loading: false,
  error: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  fetchCart: () => {}
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authenticated } = useAuth();

  // Calculate derived state
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartTotal = calculateCartTotal(cartItems);

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (authenticated) {
      fetchCart();
    } else {
      // Clear cart if not authenticated
      setCartItems([]);
      setError(null);
    }
  }, [authenticated]);

  // Fetch cart from API
  const fetchCart = async () => {
    if (!authenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetchUserCart();
      const items = response?.data || response || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (gameKeyId, quantity = 1) => {
    if (!authenticated) {
      setError('Please login to add items to cart');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await addGameKeyToCart(gameKeyId, quantity);
      
      // The new API response includes the cart item data with game and game_key info
      if (response?.data) {
        const newItem = response.data;
        
        // Update cart items immediately for better UX
        // Check if item already exists (in case of quantity update)
        setCartItems(prev => {
          const existingIndex = prev.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            // Update existing item
            const updated = [...prev];
            updated[existingIndex] = newItem;
            return updated;
          } else {
            // Add new item
            return [...prev, newItem];
          }
        });
      }
      
      // Still refresh cart to ensure consistency
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setError(err.message || 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!authenticated) return false;

    try {
      setLoading(true);
      setError(null);
      
      await removeCartItem(cartItemId);
      
      // Update local state immediately for better UX
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      return true;
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError(err.message || 'Failed to remove item from cart');
      // Refresh cart to ensure consistency
      await fetchCart();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  // NOTE: This function may need to be updated if the backend no longer supports cart item updates
  // Consider implementing with remove + add approach if updateCartItem endpoint is removed
  const updateQuantity = async (cartItemId, quantity) => {
    if (!authenticated || quantity < 1) return false;

    try {
      setLoading(true);
      setError(null);
      
      await updateCartItem(cartItemId, { quantity });
      
      // Update local state immediately for better UX
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
      return true;
    } catch (err) {
      console.error('Failed to update cart item:', err);
      setError(err.message || 'Failed to update item quantity');
      // Refresh cart to ensure consistency
      await fetchCart();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!authenticated) return false;

    try {
      setLoading(true);
      setError(null);
      
      await clearCartAPI();
      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message || 'Failed to clear cart');
      // Refresh cart to ensure consistency
      await fetchCart();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
