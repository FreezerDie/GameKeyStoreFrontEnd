import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchGames, apiGet } from '../utils/apiUtils';
import './AllGamesPage.css';

const AllGamesPage = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryId = searchParams.get('category');
  const selectedCategoryId = categoryId ? parseInt(categoryId) : null;

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        
        // Call the API endpoint (same as CategoriesSection)
        const response = await apiGet('categories');
        console.log('Categories API Response:', response);
        
        // Handle the nested data structure
        if (response && response.data && Array.isArray(response.data)) {
          // Filter only active categories and limit to show 8 categories
          const activeCategories = response.data
            .filter(category => category.is_active)
            .slice(0, 8);
          setCategories(activeCategories);
        } else if (Array.isArray(response)) {
          // Fallback if API returns direct array
          const activeCategories = response
            .filter(category => category.is_active)
            .slice(0, 8);
          setCategories(activeCategories);
        } else {
          setCategories([]);
          console.warn('Unexpected API response format:', response);
        }
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array to prevent render issues
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load games based on selected category
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        let response;
        
        if (selectedCategoryId) {
          // Load games for specific category with fallback
          try {
            response = await fetchGames({ categoryId: selectedCategoryId, includeCategory: true });
          } catch (categoryErr) {
            console.warn('Failed to fetch games with category details, trying without:', categoryErr);
            response = await fetchGames({ categoryId: selectedCategoryId });
          }
        } else {
          // Load all games
          response = await fetchGames();
        }
        
        setGames(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games. Please try again later.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [selectedCategoryId]);

  // Helper functions
  const handleCategorySelect = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId.toString() });
    } else {
      setSearchParams({});
    }
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return null;
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : `Category ${selectedCategoryId}`;
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('shooter') || name.includes('fps')) return '🔫';
    if (name.includes('action')) return '⚡';
    if (name.includes('fighting') || name.includes('combat')) return '🥊';
    if (name.includes('adventure')) return '🗺️';
    if (name.includes('rpg') || name.includes('role')) return '⚔️';
    if (name.includes('strategy')) return '🧠';
    if (name.includes('sports')) return '⚽';
    if (name.includes('racing') || name.includes('driving')) return '🏎️';
    if (name.includes('puzzle')) return '🧩';
    if (name.includes('simulation')) return '🛠️';
    if (name.includes('horror') || name.includes('survival')) return '👻';
    if (name.includes('fantasy') || name.includes('magic')) return '🧙';
    if (name.includes('sci-fi') || name.includes('space')) return '🚀';
    if (name.includes('indie')) return '💎';
    if (name.includes('casual')) return '🎲';
    return '🎮'; // Default game icon
  };

  if (loading) {
    return (
      <div className="all-games-page">
        <div className="container">
          <div className="loading-state">
            <h2>Loading all games...</h2>
            <p>Please wait while we fetch the complete game catalog.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-games-page">
        <div className="container">
          <div className="error-state">
            <h2>Error Loading Games</h2>
            <p>{error}</p>
            <Link to="/" className="back-home-btn">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-games-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">{'>'}</span>
            <Link to="/games">Games</Link>
            {selectedCategoryId && (
              <>
                <span className="separator">{'>'}</span>
                <span>{getSelectedCategoryName()}</span>
              </>
            )}
          </nav>
          <h1>{selectedCategoryId ? `${getSelectedCategoryName()} Games` : 'All Games'}</h1>
          <p className="games-count">
            {games.length === 0 
              ? 'No games available' 
              : `${games.length} game${games.length !== 1 ? 's' : ''} available`
            }
          </p>
        </div>

        {/* Category Filter Cards */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="category-filter-section">
            <h3>Filter by Category</h3>
            <div className="category-filter-grid">
              {/* All Games Card */}
              <div 
                className={`category-filter-card ${!selectedCategoryId ? 'active' : ''}`}
                onClick={() => handleCategorySelect(null)}
              >
                <div className="category-filter-icon">🕹️</div>
                <div className="category-filter-info">
                  <h4>All Games</h4>
                  <p>View all</p>
                </div>
              </div>
              
              {/* Individual Category Cards */}
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`category-filter-card ${selectedCategoryId === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-filter-icon">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="category-filter-info">
                    <h4>{category.name}</h4>
                    <p>{category.name.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="all-games-grid">
            {games.map((game, index) => {
              // Defensive check for game data
              if (!game || !game.id) {
                console.warn('Invalid game data:', game);
                return null;
              }
              
              const gameName = game.name || `Game ${game.id}`;
              const gameDescription = game.description || 'No description available';
              
              return (
                <div key={game.id} className="game-card">
                  <Link to={`/game/${game.id}`} className="game-link">
                    <div className="game-image">
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={gameName}
                          onError={(e) => {
                            // Replace with placeholder div on error
                            const placeholder = document.createElement('div');
                            placeholder.className = 'game-image-placeholder';
                            placeholder.innerHTML = `<span>${gameName.length > 20 ? gameName.substring(0, 20) + '...' : gameName}</span>`;
                            e.target.parentNode.replaceChild(placeholder, e.target);
                          }}
                        />
                      ) : (
                        <div className="game-image-placeholder">
                          <span>{gameName.length > 20 ? gameName.substring(0, 20) + '...' : gameName}</span>
                        </div>
                      )}
                    </div>
                    <div className="game-info">
                      <h3>{gameName}</h3>
                      <div className="game-description">
                        <p>{gameDescription}</p>
                      </div>
                      <div className="price-info">
                        <span className="current-price">$19.99</span>
                        <span className="original-price">$39.99</span>
                      </div>
                    </div>
                  </Link>
                  <div className="game-actions">
                    <button className="add-to-cart-btn">Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-games">
            <div className="no-games-content">
              <h3>No Games Available</h3>
              <p>There are currently no games in the catalog. Please check back later!</p>
              <Link to="/" className="back-home-btn">
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="back-section">
          <Link to="/" className="back-home-btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllGamesPage;
