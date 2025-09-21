import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-gradient-to-b from-slate-800 to-slate-900 text-white fixed top-0 left-0 h-screen z-[1000] transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 max-[640px]:w-full max-[640px]:max-w-80`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <h2 className="text-xl font-bold text-blue-400 m-0">Admin Console</h2>
          </div>
          <button 
            className="bg-none border-none text-slate-300 text-2xl cursor-pointer p-1 rounded transition-colors duration-200 hover:bg-white/10 lg:hidden"
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="list-none p-0 m-0">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path === '/staff' && location.pathname === '/staff/');
              
              return (
                <li key={item.path} className="mb-1">
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 py-3 px-6 text-slate-300 no-underline transition-all duration-200 border-l-3 border-transparent hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 ${
                      isActive ? 'bg-blue-500/20 text-blue-400 border-blue-500' : ''
                    }`}
                    onClick={closeSidebar}
                  >
                    <span className="text-xl w-5 text-center">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center font-semibold text-base">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white m-0 text-sm">{user?.name}</p>
              <p className="text-slate-400 m-0 text-xs uppercase">{user?.role}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 py-2 px-3 bg-none border border-white/20 text-slate-300 no-underline rounded-md text-sm font-medium cursor-pointer transition-all duration-200 justify-center hover:bg-white/10 hover:border-white/30 hover:text-white">
              <span>🌐</span>
              View Site
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-3 bg-none border border-white/20 text-slate-300 no-underline rounded-md text-sm font-medium cursor-pointer transition-all duration-200 justify-center hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400">
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-[100] shadow-sm max-lg:px-4">
          <div className="flex items-center gap-4">
            <button 
              className="bg-none border-none text-xl text-slate-600 cursor-pointer p-2 rounded transition-colors duration-200 hover:bg-slate-100 lg:hidden"
              onClick={toggleSidebar}
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-slate-800 m-0 max-lg:text-xl">Staff Console</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-slate-600 font-medium max-lg:hidden">
                Hello, {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto max-lg:p-4 max-[640px]:p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ConsoleLayout;
