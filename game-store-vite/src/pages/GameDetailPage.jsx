import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGameById, fetchGamesByCategory } from '../utils/apiUtils';

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
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center py-20">
            <h2 className="text-indigo-500 text-3xl font-semibold">Loading game details...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center py-20">
            <h2 className="text-red-500 text-3xl font-semibold mb-4">Error</h2>
            <p className="text-gray-600 text-lg mb-6">{error}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center py-20">
            <h2 className="text-red-500 text-3xl font-semibold mb-4">Game Not Found</h2>
            <p className="text-gray-600 text-lg mb-6">The game you're looking for doesn't exist.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
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
    <div className="min-h-screen bg-gray-50 py-10 max-md:py-5">
      <div className="max-w-6xl mx-auto px-5 max-[480px]:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/" className="text-indigo-500 no-underline transition-colors duration-200 hover:text-purple-600">Home</Link>
          <span className="text-gray-600">{'>'}</span>
          <span className="text-gray-800 font-medium">{gameName}</span>
        </nav>

        {/* Game Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16 bg-white p-10 rounded-3xl shadow-lg max-md:gap-10 max-md:p-8 max-[480px]:p-5">
          <div>
            {game.image ? (
              <img 
                src={game.image} 
                alt={gameName}
                className="w-full h-auto max-h-96 object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  // Replace with placeholder div on error
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-96 rounded-2xl shadow-lg flex items-center justify-center text-white font-semibold text-center p-10 box-border';
                  placeholder.style.background = `linear-gradient(135deg, ${getPlaceholderColor(game.id)}, #764ba2)`;
                  placeholder.innerHTML = `<span class="text-xl leading-tight break-words">${gameName}</span>`;
                  e.target.parentNode.replaceChild(placeholder, e.target);
                }}
              />
            ) : (
              <div 
                className="w-full h-96 rounded-2xl shadow-lg flex items-center justify-center text-white font-semibold text-center p-10 box-border"
                style={{
                  background: `linear-gradient(135deg, ${getPlaceholderColor(game.id)}, #764ba2)`
                }}
              >
                <span className="text-xl leading-tight break-words">{gameName}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-gray-800 m-0 leading-tight max-md:text-3xl max-[480px]:text-2xl">{gameName}</h1>
            
            <div className="flex flex-col gap-3 p-5 bg-gray-50 rounded-xl border-l-4 border-indigo-500">
              {(game.category_id || game.category) && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600 text-sm">Category:</span>
                  <span className="font-medium text-gray-800 text-sm">
                    {game.category ? game.category.name : `Category ${game.category_id}`}
                  </span>
                </div>
              )}
              {game.created_at && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600 text-sm">Added:</span>
                  <span className="font-medium text-gray-800 text-sm">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed text-base">{gameDescription}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-3xl font-bold">$19.99</span>
                <span className="text-lg line-through opacity-80">$39.99</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">50% OFF</span>
              </div>
              <button className="w-full py-4 bg-white text-indigo-500 border-none rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                Add to Cart
              </button>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Game Features</h3>
              <ul className="list-none p-0">
                <li className="py-2 text-gray-600 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold">Digital Download</li>
                <li className="py-2 text-gray-600 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold">Instant Key Delivery</li>
                <li className="py-2 text-gray-600 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold">24/7 Customer Support</li>
                <li className="py-2 text-gray-600 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold">Money Back Guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white p-10 rounded-3xl shadow-lg mb-10 max-md:p-8 max-[480px]:p-5">
          <div>
            <h3 className="text-3xl font-semibold text-gray-800 mb-6 max-md:text-2xl">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-md:gap-8">
              <div>
                <h4 className="text-xl font-semibold text-indigo-500 mb-4 pb-2 border-b-2 border-indigo-500">Minimum</h4>
                <ul className="list-none p-0">
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">OS:</strong> Windows 10 64-bit</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Processor:</strong> Intel Core i5-3570K / AMD FX-8310</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Memory:</strong> 8 GB RAM</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Graphics:</strong> NVIDIA GeForce GTX 780 / AMD Radeon RX 470</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Storage:</strong> 70 GB available space</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-500 mb-4 pb-2 border-b-2 border-indigo-500">Recommended</h4>
                <ul className="list-none p-0">
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">OS:</strong> Windows 10 64-bit</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Processor:</strong> Intel Core i7-4790 / AMD Ryzen 3 3200G</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Memory:</strong> 12 GB RAM</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Graphics:</strong> NVIDIA GeForce GTX 1060 / AMD Radeon RX 580</li>
                  <li className="py-2 text-gray-600 text-sm border-b border-gray-200 last:border-b-0"><strong className="text-gray-800 font-semibold">Storage:</strong> 70 GB available space</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games Section */}
        {(relatedGames.length > 0 || (game && game.category_id)) && (
          <div className="bg-white p-10 rounded-3xl shadow-lg mb-10 max-md:p-8 max-[480px]:p-5">
            <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center max-md:text-2xl">
              More from {game.category ? game.category.name : `Category ${game.category_id || 'Unknown'}`}
            </h3>
            {relatedLoading ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600 font-medium">Loading related games...</p>
              </div>
            ) : relatedGames.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 max-md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] max-md:gap-5 max-[480px]:grid-cols-1 max-[480px]:gap-4">
                {relatedGames.map(relatedGame => {
                  const relatedGameName = relatedGame.name || `Game ${relatedGame.id}`;
                  return (
                    <Link 
                      key={relatedGame.id} 
                      to={`/game/${relatedGame.id}`} 
                      className="no-underline text-inherit bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative w-full h-36 overflow-hidden">
                        {relatedGame.image ? (
                          <img 
                            src={relatedGame.image} 
                            alt={relatedGameName}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-36 flex items-center justify-center text-white font-semibold text-center p-4 box-border';
                              placeholder.style.background = `linear-gradient(135deg, ${getPlaceholderColor(relatedGame.id)}, #764ba2)`;
                              placeholder.innerHTML = `<span class="text-xs leading-tight break-words">${relatedGameName.length > 15 ? relatedGameName.substring(0, 15) + '...' : relatedGameName}</span>`;
                              e.target.parentNode.replaceChild(placeholder, e.target);
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-36 flex items-center justify-center text-white font-semibold text-center p-4 box-border"
                            style={{
                              background: `linear-gradient(135deg, ${getPlaceholderColor(relatedGame.id)}, #764ba2)`
                            }}
                          >
                            <span className="text-xs leading-tight break-words">{relatedGameName.length > 15 ? relatedGameName.substring(0, 15) + '...' : relatedGameName}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">{relatedGameName}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{relatedGame.description || 'No description available'}</p>
                        <div className="flex items-center justify-start">
                          <span className="text-lg font-bold text-green-600">$19.99</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="my-2.5 text-gray-600">No related games found in this category.</p>
                <p className="text-xs text-gray-500 italic bg-white px-3 py-2 rounded border border-gray-200 inline-block">
                  {game.category_id ? 
                    `Category: ${game.category ? game.category.name : game.category_id} (Backend may have issues loading related games)` :
                    'No category information available'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
