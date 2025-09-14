import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriesSection from '../components/CategoriesSection';
import { fetchGames } from '../utils/apiUtils';
import './HomePage.css';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const response = await fetchGames();
        // Take first 6 games for featured section
        setGames(response.data?.slice(0, 6) || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games. Please try again later.');
        // Fallback to empty array if API fails
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);


  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to GameStore</h1>
          <p>Discover the best game keys at unbeatable prices</p>
          <button className="hero-btn">Browse Games</button>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <span>🎮 Gaming Controller</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Games Section */}
      <section className="featured-games">
        <div className="container">
          <div className="featured-games-header">
            <h2>Featured Games</h2>
            <Link to="/games" className="show-all-btn">
              Show All Games →
            </Link>
          </div>
          {loading && (
            <div className="loading-state">
              <p>Loading games...</p>
            </div>
          )}
          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="games-grid">
              {games.length > 0 ? (
                games.map((game, index) => {
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
                })
              ) : (
                <div className="no-games">
                  <p>No games available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Games Available</p>
            </div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Get the latest deals and new releases delivered to your inbox</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
