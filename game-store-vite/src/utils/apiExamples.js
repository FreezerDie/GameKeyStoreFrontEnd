// Examples of how to use the API utilities for different types of requests
// This file serves as documentation and examples for developers

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiUtils';

// ==========================================
// AUTHENTICATION EXAMPLES (already implemented)
// ==========================================

/*
// Login example (already implemented in LoginPage.jsx)
import { loginUser } from './apiUtils';

const handleLogin = async (email, password) => {
  try {
    const authData = await loginUser({ email, password });
    // Token and user data are automatically saved to cookies
    console.log('Login successful:', authData.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Register example (already implemented in Register.jsx)
import { registerUser } from './apiUtils';

const handleRegister = async (userData) => {
  try {
    const response = await registerUser(userData);
    console.log('Registration successful:', response);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
*/

// ==========================================
// GENERAL API EXAMPLES
// ==========================================

// GET request examples
export const fetchUserProfile = async () => {
  try {
    const profile = await apiGet('/user/profile');
    console.log('User profile:', profile);
    return profile;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

export const fetchGames = async (page = 1, limit = 10) => {
  try {
    const games = await apiGet(`/games?page=${page}&limit=${limit}`);
    console.log('Games:', games);
    return games;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    throw error;
  }
};

export const fetchGameById = async (gameId) => {
  try {
    const game = await apiGet(`/games/${gameId}`);
    console.log('Game details:', game);
    return game;
  } catch (error) {
    console.error('Failed to fetch game:', error);
    throw error;
  }
};

// POST request examples
export const createGame = async (gameData) => {
  try {
    const newGame = await apiPost('/games', gameData);
    console.log('Game created:', newGame);
    return newGame;
  } catch (error) {
    console.error('Failed to create game:', error);
    throw error;
  }
};

export const purchaseGame = async (gameId, paymentData) => {
  try {
    const purchase = await apiPost('/purchases', {
      gameId,
      ...paymentData
    });
    console.log('Purchase successful:', purchase);
    return purchase;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

// PUT request examples
export const updateUserProfile = async (profileData) => {
  try {
    const updatedProfile = await apiPut('/user/profile', profileData);
    console.log('Profile updated:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

export const updateGame = async (gameId, gameData) => {
  try {
    const updatedGame = await apiPut(`/games/${gameId}`, gameData);
    console.log('Game updated:', updatedGame);
    return updatedGame;
  } catch (error) {
    console.error('Failed to update game:', error);
    throw error;
  }
};

// PATCH request examples
export const updateUserSettings = async (settings) => {
  try {
    const updatedSettings = await apiPatch('/user/settings', settings);
    console.log('Settings updated:', updatedSettings);
    return updatedSettings;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

// DELETE request examples
export const deleteGame = async (gameId) => {
  try {
    const response = await apiDelete(`/games/${gameId}`);
    console.log('Game deleted:', response);
    return response;
  } catch (error) {
    console.error('Failed to delete game:', error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    const response = await apiDelete('/user/account');
    console.log('Account deleted:', response);
    return response;
  } catch (error) {
    console.error('Failed to delete account:', error);
    throw error;
  }
};

// ==========================================
// ADVANCED USAGE EXAMPLES
// ==========================================

// Example with custom headers
export const uploadUserAvatar = async (formData) => {
  try {
    // For file uploads, don't set Content-Type - let the browser set it
    const response = await apiPost('/user/avatar', formData, {
      headers: {
        // Don't set Content-Type for FormData
      }
    });
    console.log('Avatar uploaded:', response);
    return response;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    throw error;
  }
};

// Example with query parameters
export const searchGames = async (query, filters = {}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });
  
  try {
    const results = await apiGet(`/games/search?${params.toString()}`);
    console.log('Search results:', results);
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// ==========================================
// USAGE IN REACT COMPONENTS
// ==========================================

/*
// Example usage in a React component
import { useState, useEffect } from 'react';
import { fetchGames, purchaseGame } from '../utils/apiExamples';

const GamesComponent = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesData = await fetchGames();
        setGames(gamesData);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  const handlePurchase = async (gameId) => {
    try {
      await purchaseGame(gameId, { method: 'card' });
      alert('Purchase successful!');
    } catch (error) {
      alert('Purchase failed: ' + error.message);
    }
  };

  if (loading) return <div>Loading games...</div>;

  return (
    <div>
      {games.map(game => (
        <div key={game.id}>
          <h3>{game.title}</h3>
          <button onClick={() => handlePurchase(game.id)}>
            Buy for ${game.price}
          </button>
        </div>
      ))}
    </div>
  );
};
*/
