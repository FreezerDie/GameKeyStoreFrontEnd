import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { authenticated, user, isStaff, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Show loading state while auth is initializing
  if (loading) {
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
            <div className="auth-loading">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

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
          {authenticated && isStaff && (
            <Link to="/staff" className="nav-link" style={{color: '#10b981', fontWeight: '600'}}>
              Staff Console
            </Link>
          )}
          <Link to="/test-gamekeys" className="nav-link" style={{color: '#ff6b6b'}}>Test Keys</Link>
        </nav>
        <div className="auth-buttons">
          {authenticated ? (
            <div className="user-menu">
              <span className="user-welcome">
                Welcome, {user?.name}!
                {isStaff && (
                  <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Staff
                  </span>
                )}
              </span>
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
