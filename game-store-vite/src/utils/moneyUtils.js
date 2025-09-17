/**
 * Utility functions for precise monetary calculations
 * Handles floating-point precision issues for financial calculations
 */

/**
 * Convert price to cents (integer) to avoid floating-point arithmetic
 * @param {number|string} price - Price in dollars (e.g., 19.99)
 * @returns {number} Price in cents (e.g., 1999)
 */
export const toCents = (price) => {
  if (price == null || price === '') return 0;
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return 0;
  return Math.round(numPrice * 100);
};

/**
 * Convert cents back to dollars
 * @param {number} cents - Price in cents (e.g., 1999)
 * @returns {number} Price in dollars (e.g., 19.99)
 */
export const fromCents = (cents) => {
  if (cents == null || isNaN(cents)) return 0;
  return cents / 100;
};

/**
 * Add two monetary values with precision
 * @param {number} price1 - First price in dollars
 * @param {number} price2 - Second price in dollars
 * @returns {number} Sum in dollars
 */
export const addPrices = (price1, price2) => {
  return fromCents(toCents(price1) + toCents(price2));
};

/**
 * Multiply price by quantity with precision
 * @param {number} price - Price per unit in dollars
 * @param {number} quantity - Quantity
 * @returns {number} Total in dollars
 */
export const multiplyPrice = (price, quantity) => {
  if (quantity == null || quantity === 0) return 0;
  return fromCents(toCents(price) * quantity);
};

/**
 * Calculate cart total with precision
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Total price in dollars
 */
export const calculateCartTotal = (cartItems) => {
  if (!Array.isArray(cartItems)) return 0;
  
  let totalCents = 0;
  
  for (const item of cartItems) {
    const price = item.game_key?.price || item.game_key?.game?.price || item.price || 0;
    const quantity = item.quantity || 1;
    totalCents += toCents(price) * quantity;
  }
  
  return fromCents(totalCents);
};

/**
 * Format price for display with proper precision
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) {
    return 'Price unavailable';
  }
  
  // Use cents-based calculation to ensure proper rounding
  const cents = toCents(price);
  const dollars = fromCents(cents);
  
  return `$${dollars.toFixed(2)}`;
};

/**
 * Compare two prices for equality (within 1 cent tolerance)
 * @param {number} price1 - First price
 * @param {number} price2 - Second price
 * @returns {boolean} Whether prices are equal
 */
export const pricesEqual = (price1, price2) => {
  return Math.abs(toCents(price1) - toCents(price2)) <= 1; // 1 cent tolerance
};

/**
 * Round price to nearest cent
 * @param {number} price - Price to round
 * @returns {number} Rounded price
 */
export const roundToCents = (price) => {
  return fromCents(toCents(price));
};
