import CategoriesSection from '../components/CategoriesSection';
import './HomePage.css';

const HomePage = () => {
  const featuredGames = [
    {
      id: 1,
      title: "Cyberpunk 2077",
      price: "$29.99",
      originalPrice: "$59.99",
      discount: "50%",
      image: "https://via.placeholder.com/300x200/667eea/ffffff?text=Cyberpunk+2077",
      rating: 4.2
    },
    {
      id: 2,
      title: "The Witcher 3",
      price: "$19.99",
      originalPrice: "$39.99",
      discount: "50%",
      image: "https://via.placeholder.com/300x200/764ba2/ffffff?text=The+Witcher+3",
      rating: 4.8
    },
    {
      id: 3,
      title: "Red Dead Redemption 2",
      price: "$39.99",
      originalPrice: "$59.99",
      discount: "33%",
      image: "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=RDR2",
      rating: 4.6
    },
    {
      id: 4,
      title: "Grand Theft Auto V",
      price: "$14.99",
      originalPrice: "$29.99",
      discount: "50%",
      image: "https://via.placeholder.com/300x200/4ecdc4/ffffff?text=GTA+V",
      rating: 4.4
    },
    {
      id: 5,
      title: "Assassin's Creed Valhalla",
      price: "$24.99",
      originalPrice: "$49.99",
      discount: "50%",
      image: "https://via.placeholder.com/300x200/45b7d1/ffffff?text=AC+Valhalla",
      rating: 4.1
    },
    {
      id: 6,
      title: "FIFA 24",
      price: "$34.99",
      originalPrice: "$69.99",
      discount: "50%",
      image: "https://via.placeholder.com/300x200/f39c12/ffffff?text=FIFA+24",
      rating: 3.9
    }
  ];

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
          <img src="https://via.placeholder.com/600x400/667eea/ffffff?text=Gaming+Controller" alt="Gaming" />
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Games Section */}
      <section className="featured-games">
        <div className="container">
          <h2>Featured Games</h2>
          <div className="games-grid">
            {featuredGames.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-image">
                  <img src={game.image} alt={game.title} />
                  <div className="discount-badge">{game.discount} OFF</div>
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="rating">
                    <span className="stars">★★★★☆</span>
                    <span className="rating-score">{game.rating}</span>
                  </div>
                  <div className="price-info">
                    <span className="current-price">{game.price}</span>
                    <span className="original-price">{game.originalPrice}</span>
                  </div>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
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
