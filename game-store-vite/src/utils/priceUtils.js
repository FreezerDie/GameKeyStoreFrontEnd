/**
 * Utility functions for handling game pricing based on available keys
 */

/**
 * Get the best price to display for a game based on available keys
 * Prioritizes Steam keys, then other platforms
 * @param {object} game - Game object with game_keys array
 * @returns {object} Price information with display data
 */
export const getBestGamePrice = (game) => {
  // Default return object for no keys available
  const noKeysResult = {
    hasKeys: false,
    displayPrice: 'No keys available',
    originalPrice: null,
    discountedPrice: null,
    keyType: null,
    savings: null,
    isOnSale: false
  };

  // Check if game has keys
  if (!game || !game.game_keys || !Array.isArray(game.game_keys) || game.game_keys.length === 0) {
    return noKeysResult;
  }

  // Sort keys by priority: Steam first, then others by price (lowest first)
  const sortedKeys = game.game_keys.sort((a, b) => {
    // Prioritize Steam keys
    if (a.key_type?.toLowerCase() === 'steam' && b.key_type?.toLowerCase() !== 'steam') {
      return -1;
    }
    if (b.key_type?.toLowerCase() === 'steam' && a.key_type?.toLowerCase() !== 'steam') {
      return 1;
    }
    
    // If both are Steam or neither is Steam, sort by price
    return (a.price || 0) - (b.price || 0);
  });

  const bestKey = sortedKeys[0];
  
  if (!bestKey || bestKey.price == null) {
    return noKeysResult;
  }

  const currentPrice = bestKey.price;
  const keyType = bestKey.key_type || 'Unknown';

  // For now, we don't have original price data from the API
  // You can extend this logic when original/MSRP price data is available
  return {
    hasKeys: true,
    displayPrice: formatPrice(currentPrice),
    originalPrice: null,
    discountedPrice: currentPrice,
    keyType: keyType,
    savings: null,
    isOnSale: false,
    rawPrice: currentPrice
  };
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) {
    return 'Price unavailable';
  }
  
  return `$${Number(price).toFixed(2)}`;
};

/**
 * Get all available platforms for a game
 * @param {object} game - Game object with game_keys array
 * @returns {Array<string>} Array of available key types/platforms
 */
export const getAvailablePlatforms = (game) => {
  if (!game || !game.game_keys || !Array.isArray(game.game_keys)) {
    return [];
  }

  const platforms = game.game_keys
    .map(key => key.key_type)
    .filter(platform => platform && platform.trim() !== '')
    .filter((platform, index, self) => self.indexOf(platform) === index); // Remove duplicates

  return platforms;
};

/**
 * Check if a game has Steam keys available
 * @param {object} game - Game object with game_keys array
 * @returns {boolean} True if Steam keys are available
 */
export const hasSteamKeys = (game) => {
  if (!game || !game.game_keys || !Array.isArray(game.game_keys)) {
    return false;
  }

  return game.game_keys.some(key => 
    key.key_type?.toLowerCase() === 'steam' && key.price != null
  );
};

/**
 * Get pricing information for all platforms
 * @param {object} game - Game object with game_keys array
 * @returns {Array<object>} Array of pricing info for each platform
 */
export const getAllPlatformPrices = (game) => {
  if (!game || !game.game_keys || !Array.isArray(game.game_keys)) {
    return [];
  }

  return game.game_keys
    .filter(key => key.price != null)
    .map(key => ({
      keyType: key.key_type || 'Unknown',
      price: key.price,
      displayPrice: formatPrice(key.price),
      id: key.id,
      createdAt: key.created_at
    }))
    .sort((a, b) => {
      // Sort Steam first, then by price
      if (a.keyType.toLowerCase() === 'steam' && b.keyType.toLowerCase() !== 'steam') {
        return -1;
      }
      if (b.keyType.toLowerCase() === 'steam' && a.keyType.toLowerCase() !== 'steam') {
        return 1;
      }
      return a.price - b.price;
    });
};
