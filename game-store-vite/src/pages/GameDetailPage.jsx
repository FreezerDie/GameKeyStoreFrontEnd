import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGameById, fetchGamesByCategory } from '../utils/apiUtils';
import './GameDetailPage.css';

const GameDetailPage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        let gameData = null;
        
        // Try to fetch game with category details first
        try {
          console.log('Fetching game with category details...');
          const response = await fetchGameById(gameId, { includeCategory: true });
          gameData = response.data || response;
          console.log('Game with category fetched successfully:', gameData);
        } catch (categoryErr) {
          console.warn('Failed to fetch game with category details, trying without category:', categoryErr);
          
          // Fallback: fetch game without category details
          try {
            const response = await fetchGameById(gameId);
            gameData = response.data || response;
            console.log('Game without category fetched successfully:', gameData);
          } catch (basicErr) {
            console.error('Failed to fetch game even without category:', basicErr);
            throw basicErr; // Re-throw if even basic fetch fails
          }
        }
        
        setGame(gameData);
        setError(null);

        // Fetch related games from the same category
        if (gameData && gameData.category_id) {
          try {
            setRelatedLoading(true);
            console.log('Fetching related games for category:', gameData.category_id);
            
            // Try with category details first, then fallback to without
            let relatedResponse;
            try {
              relatedResponse = await fetchGamesByCategory(gameData.category_id, true);
            } catch (relatedCategoryErr) {
              console.warn('Failed to fetch related games with category details, trying without:', relatedCategoryErr);
              relatedResponse = await fetchGamesByCategory(gameData.category_id, false);
            }
            
            // Filter out the current game and limit to 4 related games
            const related = (relatedResponse.data || [])
              .filter(relatedGame => relatedGame.id !== parseInt(gameId))
              .slice(0, 4);
            setRelatedGames(related);
            console.log('Related games fetched successfully:', related.length);
          } catch (relatedErr) {
            console.error('Failed to fetch related games completely:', relatedErr);
            setRelatedGames([]);
          } finally {
            setRelatedLoading(false);
          }
        } else {
          console.log('No category_id found, skipping related games fetch');
        }
      } catch (err) {
        console.error('Failed to fetch game:', err);
        setError('Failed to load game details. Please try again later.');
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  // Generate colors for placeholders
  const getPlaceholderColor = (gameId) => {
    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12'];
    return colors[gameId % colors.length];
  };

  if (loading) {
    return (
      <div className="game-detail-page">
        <div className="container">
          <div className="loading-state">
            <h2>Loading game details...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/" className="back-home-btn">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Game Not Found</h2>
            <p>The game you're looking for doesn't exist.</p>
            <Link to="/" className="back-home-btn">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Defensive data extraction
  const gameName = game.name || `Game ${game.id}`;
  const gameDescription = game.description || 'No description available for this game.';

  return (
    <div className="game-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">{'>'}</span>
          <span>{gameName}</span>
        </nav>

        {/* Game Details */}
        <div className="game-detail-content">
          <div className="game-detail-image">
            {game.image ? (
              <img 
                src={game.image} 
                alt={gameName}
                onError={(e) => {
                  // Replace with placeholder div on error
                  const placeholder = document.createElement('div');
                  placeholder.className = 'game-detail-image-placeholder';
                  placeholder.style.background = `linear-gradient(135deg, ${getPlaceholderColor(game.id)}, #764ba2)`;
                  placeholder.innerHTML = `<span>${gameName}</span>`;
                  e.target.parentNode.replaceChild(placeholder, e.target);
                }}
              />
            ) : (
              <div 
                className="game-detail-image-placeholder"
                style={{
                  background: `linear-gradient(135deg, ${getPlaceholderColor(game.id)}, #764ba2)`
                }}
              >
                <span>{gameName}</span>
              </div>
            )}
          </div>
          
          <div className="game-detail-info">
            <h1 className="game-title">{gameName}</h1>
            
            <div className="game-meta">
              {(game.category_id || game.category) && (
                <div className="game-category">
                  <span className="label">Category:</span>
                  <span className="value">
                    {game.category ? game.category.name : `Category ${game.category_id}`}
                  </span>
                </div>
              )}
              {game.created_at && (
                <div className="game-date">
                  <span className="label">Added:</span>
                  <span className="value">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="game-description">
              <h3>Description</h3>
              <p>{gameDescription}</p>
            </div>

            <div className="game-pricing">
              <div className="price-section">
                <span className="current-price">$19.99</span>
                <span className="original-price">$39.99</span>
                <span className="discount">50% OFF</span>
              </div>
              <button className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>

            <div className="game-features">
              <h3>Game Features</h3>
              <ul>
                <li>Digital Download</li>
                <li>Instant Key Delivery</li>
                <li>24/7 Customer Support</li>
                <li>Money Back Guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-section">
            <h3>System Requirements</h3>
            <div className="requirements">
              <div className="req-column">
                <h4>Minimum</h4>
                <ul>
                  <li><strong>OS:</strong> Windows 10 64-bit</li>
                  <li><strong>Processor:</strong> Intel Core i5-3570K / AMD FX-8310</li>
                  <li><strong>Memory:</strong> 8 GB RAM</li>
                  <li><strong>Graphics:</strong> NVIDIA GeForce GTX 780 / AMD Radeon RX 470</li>
                  <li><strong>Storage:</strong> 70 GB available space</li>
                </ul>
              </div>
              <div className="req-column">
                <h4>Recommended</h4>
                <ul>
                  <li><strong>OS:</strong> Windows 10 64-bit</li>
                  <li><strong>Processor:</strong> Intel Core i7-4790 / AMD Ryzen 3 3200G</li>
                  <li><strong>Memory:</strong> 12 GB RAM</li>
                  <li><strong>Graphics:</strong> NVIDIA GeForce GTX 1060 / AMD Radeon RX 580</li>
                  <li><strong>Storage:</strong> 70 GB available space</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games Section */}
        {(relatedGames.length > 0 || (game && game.category_id)) && (
          <div className="related-games-section">
            <h3>
              More from {game.category ? game.category.name : `Category ${game.category_id || 'Unknown'}`}
            </h3>
            {relatedLoading ? (
              <div className="loading-state">
                <p>Loading related games...</p>
              </div>
            ) : relatedGames.length > 0 ? (
              <div className="related-games-grid">
                {relatedGames.map(relatedGame => {
                  const relatedGameName = relatedGame.name || `Game ${relatedGame.id}`;
                  return (
                    <Link 
                      key={relatedGame.id} 
                      to={`/game/${relatedGame.id}`} 
                      className="related-game-card"
                    >
                      <div className="related-game-image">
                        {relatedGame.image ? (
                          <img 
                            src={relatedGame.image} 
                            alt={relatedGameName}
                            onError={(e) => {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'related-game-placeholder';
                              placeholder.style.background = `linear-gradient(135deg, ${getPlaceholderColor(relatedGame.id)}, #764ba2)`;
                              placeholder.innerHTML = `<span>${relatedGameName.length > 15 ? relatedGameName.substring(0, 15) + '...' : relatedGameName}</span>`;
                              e.target.parentNode.replaceChild(placeholder, e.target);
                            }}
                          />
                        ) : (
                          <div 
                            className="related-game-placeholder"
                            style={{
                              background: `linear-gradient(135deg, ${getPlaceholderColor(relatedGame.id)}, #764ba2)`
                            }}
                          >
                            <span>{relatedGameName.length > 15 ? relatedGameName.substring(0, 15) + '...' : relatedGameName}</span>
                          </div>
                        )}
                      </div>
                      <div className="related-game-info">
                        <h4>{relatedGameName}</h4>
                        <p>{relatedGame.description || 'No description available'}</p>
                        <div className="related-game-price">
                          <span>$19.99</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="no-related-games">
                <p>No related games found in this category.</p>
                <p className="debug-info">
                  {game.category_id ? 
                    `Category: ${game.category ? game.category.name : game.category_id} (Backend may have issues loading related games)` :
                    'No category information available'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div className="back-section">
          <Link to="/" className="back-home-btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
