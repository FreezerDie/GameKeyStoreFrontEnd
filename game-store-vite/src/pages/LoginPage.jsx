import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/apiUtils';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Use the new API utility function
      const authData = await loginUser(formData);
      
      // The loginUser function automatically saves to cookies
      // authData contains: { token, refreshToken, user, expiresAt }
      
      // Update auth context with user data
      login(authData);
      
      setMessage('Login successful! Redirecting...');
      
      // Redirect to home page or dashboard after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      // Handle different types of errors
      if (error.message.includes('Authentication failed')) {
        setMessage('Authentication failed. Please log in again.');
      } else if (error.message.includes('HTTP error')) {
        setMessage('Login failed. Please check your credentials.');
      } else if (error.message.includes('Network')) {
        setMessage('Network error. Please check your connection and try again.');
      } else {
        setMessage(error.message || 'Login failed. Please try again.');
      }
      console.error('Login error:', error);

      // Clear the form and reset state after login failure for better UX
      setTimeout(() => {
        setFormData({
          email: '',
          password: ''
        });
        setRememberMe(false);
        setErrors({});
        // Keep the error message visible for a moment before clearing
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-70px)] p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md animate-[fadeInUp_0.6s_ease-out] max-[480px]:p-8">
        <h2 className="text-center mb-2.5 text-gray-800 text-3xl font-semibold max-[480px]:text-2xl max-[480px]:mb-2">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-8 text-sm max-[480px]:mb-6">Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-gray-600 font-medium text-sm">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 box-border focus:outline-none focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] ${
                errors.email 
                  ? 'border-red-500 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:bg-white'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
            {errors.email && <span className="block text-red-500 text-xs mt-1 font-medium">{errors.email}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-gray-600 font-medium text-sm">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 box-border focus:outline-none focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] tracking-wider ${
                errors.password 
                  ? 'border-red-500 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:bg-white'
              } disabled:opacity-70 disabled:cursor-not-allowed placeholder:tracking-normal`}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
            {errors.password && <span className="block text-red-500 text-xs mt-1 font-medium">{errors.password}</span>}
          </div>

          <div className="flex justify-between items-center mb-6 max-[480px]:flex-col max-[480px]:gap-4 max-[480px]:items-start">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="mr-2 w-auto"
              />
              Remember me
            </label>
            <a href="#" className="text-indigo-500 no-underline text-sm font-medium hover:underline">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mb-5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {message && (
            <div className={`px-4 py-3 rounded-lg mt-4 text-center text-sm font-medium animate-[slideDown_0.3s_ease-out] ${
              message.includes('successful') 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center pt-5 border-t border-gray-300 mt-5">
          <p className="m-0 text-gray-600 text-sm">Don't have an account? <Link to="/register" className="text-indigo-500 no-underline font-semibold hover:underline">Sign up</Link></p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
