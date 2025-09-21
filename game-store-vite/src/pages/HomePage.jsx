import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoriesSection from '../components/CategoriesSection';
import { fetchGames } from '../utils/apiUtils';
import { getBestGamePrice } from '../utils/priceUtils';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const response = await fetchGames({ includeGameKeys: true });
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-500 to-purple-600 py-20 px-5 flex items-center justify-between max-w-6xl mx-auto gap-16 max-md:flex-col max-md:text-center max-md:py-12 max-md:gap-10">
        <div className="flex-1 text-white">
          <h1 className="text-6xl font-bold mb-5 leading-tight max-md:text-5xl max-[480px]:text-4xl">Your Digital Game Key Store</h1>
          <p className="text-xl mb-8 opacity-90 max-md:text-lg">Instant game key delivery • Best prices guaranteed • Secure digital downloads</p>
          <Link 
            to="/games" 
            className="inline-block bg-white text-indigo-500 px-8 py-4 border-none rounded-lg text-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 no-underline"
          >
            Browse Games
          </Link>
        </div>
        <div className="flex-1 text-center">
          <div className="w-full max-w-[600px] h-[400px] bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white p-8 max-md:h-80">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl mb-2">🔑</div>
                <span className="text-sm">Instant Keys</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <span className="text-sm">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl mb-2">🛡️</div>
                <span className="text-sm">Secure</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Digital Game Keys</h3>
              <p className="text-sm opacity-80">Activate instantly on your favorite platforms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Games Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center mb-12 max-md:flex-col max-md:gap-5 max-md:text-center">
            <h2 className="text-4xl font-bold text-gray-800 m-0 max-md:text-3xl">Featured Games</h2>
            <Link to="/games" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white no-underline rounded-lg font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
              Show All Games →
            </Link>
          </div>
          {loading && (
            <div className="text-center py-16">
              <p className="text-xl text-indigo-500 font-medium">Loading games...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-16">
              <p className="text-lg text-red-500 font-medium">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-md:grid-cols-1 max-md:gap-5">
              {games.length > 0 ? (
                games.map((game, index) => {
                  // Defensive check for game data
                  if (!game || !game.id) {
                    console.warn('Invalid game data:', game);
                    return null;
                  }
                  
                  const gameName = game.name || `Game ${game.id}`;
                  const gameDescription = game.description || 'No description available';
                  const priceInfo = getBestGamePrice(game);
                  
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
                          <div className="flex items-center gap-2.5 mb-4">
                            {priceInfo.hasKeys ? (
                              <>
                                <span className="text-2xl font-bold text-green-600">{priceInfo.displayPrice}</span>
                                {priceInfo.keyType && (
                                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                    {priceInfo.keyType}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-lg font-medium text-orange-600">No keys available</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="px-5 pb-5">
                        <button
                          onClick={() => navigate(`/game/${game.id}`)}
                          className="w-full py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/30"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-600 font-medium">No games available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 text-center max-md:grid-cols-2 max-md:gap-8 max-[480px]:grid-cols-1">
            <div>
              <h3 className="text-5xl font-bold text-indigo-500 mb-2.5 max-md:text-4xl">10,000+</h3>
              <p className="text-lg text-gray-600 font-medium">Games Available</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold text-indigo-500 mb-2.5 max-md:text-4xl">50,000+</h3>
              <p className="text-lg text-gray-600 font-medium">Happy Customers</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold text-indigo-500 mb-2.5 max-md:text-4xl">99.9%</h3>
              <p className="text-lg text-gray-600 font-medium">Uptime</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold text-indigo-500 mb-2.5 max-md:text-4xl">24/7</h3>
              <p className="text-lg text-gray-600 font-medium">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4 max-md:text-3xl">Stay Updated</h2>
            <p className="text-lg mb-8 opacity-90">Get the latest deals and new releases delivered to your inbox</p>
            <div className="flex max-w-lg mx-auto gap-4 max-md:flex-col">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 py-4 px-5 border-none rounded-lg text-base outline-none"
              />
              <button 
                type="submit"
                className="py-4 px-8 bg-white text-indigo-500 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
