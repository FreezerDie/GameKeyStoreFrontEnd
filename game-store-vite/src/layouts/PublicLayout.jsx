import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12 px-0 mt-auto max-md:py-8">
        <div className="max-w-6xl mx-auto px-8 max-md:px-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 mb-8 max-md:grid-cols-1 max-md:gap-6">
            <div>
              <h4 className="text-blue-400 text-xl font-semibold mb-4">GameStore</h4>
              <p className="text-gray-300 leading-relaxed mb-4">Your trusted gaming marketplace for the best deals on game keys.</p>
            </div>
            <div>
              <h4 className="text-blue-400 text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="list-none p-0">
                <li className="mb-2"><a href="/" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Home</a></li>
                <li className="mb-2"><a href="/games" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">All Games</a></li>
                <li className="mb-2"><a href="/categories" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Categories</a></li>
                <li className="mb-2"><a href="/support" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-blue-400 text-xl font-semibold mb-4">Customer Service</h4>
              <ul className="list-none p-0">
                <li className="mb-2"><a href="/contact" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Contact Us</a></li>
                <li className="mb-2"><a href="/faq" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">FAQ</a></li>
                <li className="mb-2"><a href="/refund-policy" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Refund Policy</a></li>
                <li className="mb-2"><a href="/terms" className="text-gray-300 no-underline transition-colors duration-300 hover:text-blue-400">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-blue-400 text-xl font-semibold mb-4">Connect With Us</h4>
              <div className="flex gap-4 max-md:justify-center">
                <a href="#" aria-label="Facebook" className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full no-underline text-xl transition-all duration-300 hover:bg-blue-500/20 hover:-translate-y-0.5">📘</a>
                <a href="#" aria-label="Twitter" className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full no-underline text-xl transition-all duration-300 hover:bg-blue-500/20 hover:-translate-y-0.5">🐦</a>
                <a href="#" aria-label="Instagram" className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full no-underline text-xl transition-all duration-300 hover:bg-blue-500/20 hover:-translate-y-0.5">📷</a>
                <a href="#" aria-label="Discord" className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full no-underline text-xl transition-all duration-300 hover:bg-blue-500/20 hover:-translate-y-0.5">💬</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-4 text-center text-gray-400">
            <p>&copy; 2024 GameStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
