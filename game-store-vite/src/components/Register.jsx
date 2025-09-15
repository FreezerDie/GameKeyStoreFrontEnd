import { useState } from 'react';
import { registerUser } from '../utils/apiUtils';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await registerUser(formData);
      
      setMessage('Registration successful!');
      setFormData({
        name: '',
        username: '',
        email: '',
        password: ''
      });
    } catch (error) {
      // Handle different types of errors
      if (error.message.includes('HTTP error')) {
        setMessage('Registration failed. Please check your information and try again.');
      } else if (error.message.includes('Network')) {
        setMessage('Network error. Please check your connection and try again.');
      } else {
        setMessage(error.message || 'Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-70px)] p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md animate-[fadeInUp_0.6s_ease-out] max-[480px]:p-8">
        <h2 className="text-center mb-8 text-gray-800 text-3xl font-semibold max-[480px]:text-2xl max-[480px]:mb-6">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-gray-600 font-medium text-sm">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 box-border focus:outline-none focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] ${
                errors.name 
                  ? 'border-red-500 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:bg-white'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && <span className="block text-red-500 text-xs mt-1 font-medium">{errors.name}</span>}
          </div>

          <div className="mb-5">
            <label htmlFor="username" className="block mb-2 text-gray-600 font-medium text-sm">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 box-border focus:outline-none focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] ${
                errors.username 
                  ? 'border-red-500 bg-red-50 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:bg-white'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
              placeholder="Choose a username"
              disabled={isLoading}
            />
            {errors.username && <span className="block text-red-500 text-xs mt-1 font-medium">{errors.username}</span>}
          </div>

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
              placeholder="Create a password"
              disabled={isLoading}
            />
            {errors.password && <span className="block text-red-500 text-xs mt-1 font-medium">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2.5 hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-lg hover:not(:disabled):shadow-indigo-500/30 active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>

          {message && (
            <div className={`mt-5 px-4 py-3 rounded-md text-center font-medium text-sm animate-[slideDown_0.3s_ease-out] ${
              message.includes('successful') 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
