import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ConsoleLayout.css';

const ConsoleLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/staff',
      icon: '🏠'
    },
    {
      name: 'Games',
      path: '/staff/games',
      icon: '🎮'
    },
    {
      name: 'Game Keys',
      path: '/staff/game-keys',
      icon: '🔑'
    },
    {
      name: 'Categories',
      path: '/staff/categories',
      icon: '📂'
    },
    {
      name: 'Users',
      path: '/staff/users',
      icon: '👥'
    },
    {
      name: 'Orders',
      path: '/staff/orders',
      icon: '📋'
    },
    {
      name: 'Settings',
      path: '/staff/settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="console-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`console-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎮</span>
            <h2>Admin Console</h2>
          </div>
          <button 
            className="sidebar-close"
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path === '/staff' && location.pathname === '/staff/');
              
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <div className="sidebar-actions">
            <Link to="/" className="action-btn view-site">
              <span>🌐</span>
              View Site
            </Link>
            <button onClick={handleLogout} className="action-btn logout">
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="console-main">
        {/* Top Header */}
        <header className="console-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={toggleSidebar}
            >
              ☰
            </button>
            <h1 className="page-title">Staff Console</h1>
          </div>
          
          <div className="header-right">
            <div className="header-user">
              <div className="user-avatar small">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="user-greeting">
                Hello, {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="console-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsoleLayout;
