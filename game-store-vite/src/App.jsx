import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import ConsoleLayout from './layouts/ConsoleLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import GameKeysPage from './pages/GameKeysPage';
import GameDetailPage from './pages/GameDetailPage';
import AllGamesPage from './pages/AllGamesPage';
import StaffRoute from './components/StaffRoute';
import StaffDashboard from './pages/StaffDashboard';
import StaffCategoriesPage from './pages/StaffCategoriesPage';
import StaffGamesPage from './pages/StaffGamesPage';
import StaffGameKeysPage from './pages/StaffGameKeysPage';
import './App.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes with PublicLayout */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="games" element={<AllGamesPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegistrationPage />} />
              <Route path="test-gamekeys" element={<GameKeysPage />} />
              <Route path="game/:gameId" element={<GameDetailPage />} />
            </Route>

            {/* Staff Routes with ConsoleLayout - Protected */}
            <Route path="/staff" element={
              <StaffRoute>
                <ConsoleLayout />
              </StaffRoute>
            }>
              <Route index element={<StaffDashboard />} />
              <Route path="categories" element={<StaffCategoriesPage />} />
              <Route path="games" element={<StaffGamesPage />} />
              <Route path="game-keys" element={<StaffGameKeysPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
