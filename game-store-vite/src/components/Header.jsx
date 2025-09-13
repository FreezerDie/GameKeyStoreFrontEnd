import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { authenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>GameStore</h1>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/games" className="nav-link">Games</Link>
          <Link to="/deals" className="nav-link">Deals</Link>
          <Link to="/test-gamekeys" className="nav-link" style={{color: '#ff6b6b'}}>Test Keys</Link>
        </nav>
        <div className="auth-buttons">
          {authenticated ? (
            <div className="user-menu">
              <span className="user-welcome">Welcome, {user?.name}!</span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
