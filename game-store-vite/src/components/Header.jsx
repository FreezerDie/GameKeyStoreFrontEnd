import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { authenticated, user, isStaff, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <header className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-[70px]">
          <div className="logo">
            <Link to="/" className="no-underline">
              <h1 className="text-white m-0 text-2xl font-bold">GameStore</h1>
            </Link>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-white no-underline font-medium text-base transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/10 hover:-translate-y-0.5">Home</Link>
            <Link to="/games" className="text-white no-underline font-medium text-base transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/10 hover:-translate-y-0.5">Games</Link>
          </nav>
          <div className="flex gap-4 items-center">
            <div className="text-gray-600 text-sm px-4 py-2">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-[70px]">
        <div className="logo">
          <Link to="/" className="no-underline">
            <h1 className="text-white m-0 text-2xl font-bold">GameStore</h1>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-white no-underline font-medium text-base transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/10 hover:-translate-y-0.5">Home</Link>
          <Link to="/games" className="text-white no-underline font-medium text-base transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/10 hover:-translate-y-0.5">Games</Link>
          {authenticated && isStaff && (
            <Link to="/staff" className="text-emerald-500 no-underline font-semibold text-base transition-all duration-300 px-4 py-2 rounded-md hover:bg-white/10 hover:-translate-y-0.5">
              Staff Console
            </Link>
          )}
        </nav>


        <div className="flex gap-4 items-center max-md:gap-2.5">
          {authenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-white font-medium text-sm px-4 py-2 rounded-md transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="whitespace-nowrap">
                  {user?.name || user?.username || user?.email?.split('@')[0] || 'User'}
                  {isStaff && (
                    <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Staff
                    </span>
                  )}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="inline-block w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <svg className="inline-block w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4 items-center max-md:gap-2.5">
              <Link
                to="/login"
                className="text-white border-2 border-white bg-transparent px-5 py-2.5 rounded-md no-underline font-medium text-sm transition-all duration-300 border-transparent text-center min-w-[80px] hover:bg-white hover:text-indigo-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 max-md:px-4 max-md:py-2 max-md:text-xs max-md:min-w-[70px]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-500 border-2 border-white px-5 py-2.5 rounded-md no-underline font-medium text-sm transition-all duration-300 text-center min-w-[80px] hover:bg-transparent hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 max-md:px-4 max-md:py-2 max-md:text-xs max-md:min-w-[70px]"
              >
                Register
              </Link>
            </div>
          )}

          {/* Cart Button */}
          {authenticated && (
            <Link
              to="/cart"
              className="relative text-white p-2 rounded-md transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 mr-4"
              title="Shopping Cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0H17M7 18a2 2 0 11-4 0 2 2 0 014 0zM21 18a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
