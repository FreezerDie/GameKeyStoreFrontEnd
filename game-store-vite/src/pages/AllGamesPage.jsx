import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchGames, apiGet } from '../utils/apiUtils';

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
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg mx-auto max-w-2xl">
            <h2 className="text-indigo-500 text-3xl font-semibold mb-4">Loading all games...</h2>
            <p className="text-gray-600 text-lg leading-relaxed">Please wait while we fetch the complete game catalog.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg mx-auto max-w-2xl">
            <h2 className="text-red-500 text-3xl font-semibold mb-4">Error Loading Games</h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{error}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 max-md:py-5">
      <div className="max-w-6xl mx-auto px-5 max-[480px]:px-4">
        {/* Page Header */}
        <div className="mb-10 text-center max-md:mb-8">
          <nav className="flex items-center justify-center gap-2 mb-5 text-sm max-md:text-xs">
            <Link to="/" className="text-indigo-500 no-underline transition-colors duration-200 hover:text-purple-600">Home</Link>
            <span className="text-gray-600">{'>'}</span>
            <Link to="/games" className="text-indigo-500 no-underline transition-colors duration-200 hover:text-purple-600">Games</Link>
            {selectedCategoryId && (
              <>
                <span className="text-gray-600">{'>'}</span>
                <span className="text-gray-800 font-medium">{getSelectedCategoryName()}</span>
              </>
            )}
          </nav>
          <h1 className="text-5xl font-bold text-gray-800 mb-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent max-md:text-4xl max-[480px]:text-3xl">
            {selectedCategoryId ? `${getSelectedCategoryName()} Games` : 'All Games'}
          </h1>
          <p className="text-lg text-gray-600 m-0">
            {games.length === 0 
              ? 'No games available' 
              : `${games.length} game${games.length !== 1 ? 's' : ''} available`
            }
          </p>
        </div>

        {/* Category Filter Cards */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="mb-10 bg-white p-8 rounded-2xl shadow-lg max-md:p-5 max-md:mb-8 max-[480px]:p-4 max-[480px]:mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center max-md:text-xl max-md:mb-5 max-[480px]:text-lg max-[480px]:mb-4">Filter by Category</h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fit,minmax(120px,1fr))] max-md:gap-3 max-[480px]:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] max-[480px]:gap-2.5">
              {/* All Games Card */}
              <div 
                className={`bg-gray-50 border-2 border-transparent rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:bg-white hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-md max-md:p-3 max-[480px]:p-2.5 ${
                  !selectedCategoryId 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white -translate-y-0.5 shadow-md shadow-indigo-500/30' 
                    : ''
                }`}
                onClick={() => handleCategorySelect(null)}
              >
                <div className="text-3xl mb-2 max-md:text-2xl max-md:mb-1.5 max-[480px]:text-xl max-[480px]:mb-1">🕹️</div>
                <div>
                  <h4 className={`text-sm font-semibold m-0 mb-1 max-md:text-xs ${!selectedCategoryId ? 'text-white' : ''}`}>All Games</h4>
                  <p className={`text-xs m-0 opacity-80 max-[480px]:text-[10px] ${!selectedCategoryId ? 'text-white' : ''}`}>View all</p>
                </div>
              </div>
              
              {/* Individual Category Cards */}
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`bg-gray-50 border-2 border-transparent rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:bg-white hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-md max-md:p-3 max-[480px]:p-2.5 ${
                    selectedCategoryId === category.id 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white -translate-y-0.5 shadow-md shadow-indigo-500/30' 
                      : ''
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="text-3xl mb-2 max-md:text-2xl max-md:mb-1.5 max-[480px]:text-xl max-[480px]:mb-1">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold m-0 mb-1 max-md:text-xs max-[480px]:text-[10px] ${selectedCategoryId === category.id ? 'text-white' : ''}`}>{category.name}</h4>
                    <p className={`text-xs m-0 opacity-80 max-[480px]:text-[9px] ${selectedCategoryId === category.id ? 'text-white' : ''}`}>{category.name.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mb-16 max-md:grid-cols-1 max-md:gap-5 max-md:mb-10 max-[480px]:gap-4 max-[480px]:mb-8">
            {games.map((game, index) => {
              // Defensive check for game data
              if (!game || !game.id) {
                console.warn('Invalid game data:', game);
                return null;
              }
              
              const gameName = game.name || `Game ${game.id}`;
              const gameDescription = game.description || 'No description available';
              
              return (
                <div key={game.id} className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/game/${game.id}`} className="no-underline text-inherit flex-1 flex flex-col">
                    <div className="relative overflow-hidden">
                      {game.cover ? (
                        <img 
                          src={`https://s3.tebi.io/game-key-store/games/${game.cover}`} 
                          alt={gameName}
                          className="w-full h-52 object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // Replace with placeholder div on error
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-52 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-center p-5 box-border';
                            placeholder.innerHTML = `<span class="text-sm leading-tight break-words">${gameName.length > 20 ? gameName.substring(0, 20) + '...' : gameName}</span>`;
                            e.target.parentNode.replaceChild(placeholder, e.target);
                          }}
                        />
                      ) : (
                        <div className="w-full h-52 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-center p-5 box-border">
                          <span className="text-sm leading-tight break-words">{gameName.length > 20 ? gameName.substring(0, 20) + '...' : gameName}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold mb-2.5 text-gray-800">{gameName}</h3>
                      <div className="my-2.5 flex-1">
                        <p className="text-gray-600 text-sm leading-relaxed overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{gameDescription}</p>
                      </div>
                      <div className="flex items-center gap-2.5 mt-auto">
                        <span className="text-2xl font-bold text-green-600">$19.99</span>
                        <span className="text-base text-gray-500 line-through">$39.99</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5">
                    <button className="w-full py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/30">Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center bg-white py-16 px-10 rounded-3xl shadow-lg max-md:py-12 max-md:px-8 max-[480px]:py-10 max-[480px]:px-5">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4 max-md:text-2xl">No Games Available</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed max-md:text-base">There are currently no games in the catalog. Please check back later!</p>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-10 max-md:mt-8">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllGamesPage;
