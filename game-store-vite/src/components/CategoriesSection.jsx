import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/apiUtils';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Call the API endpoint
        const response = await apiGet('categories');
        console.log('Categories API Response:', response);
        
        // Handle the nested data structure
        if (response && response.data && Array.isArray(response.data)) {
          // Filter only active categories and limit to show 8 categories
          const activeCategories = response.data
            .filter(category => category.is_active)
            .slice(0, 8);
          setCategories(activeCategories);
        } else if (Array.isArray(response)) {
          // Fallback if API returns direct array
          const activeCategories = response
            .filter(category => category.is_active)
            .slice(0, 8);
          setCategories(activeCategories);
        } else {
          setCategories([]);
          console.warn('Unexpected API response format:', response);
        }
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(`Failed to fetch categories: ${error.message}`);
        setCategories([]); // Set empty array to prevent render issues
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getImageUrl = (cover) => {
    return `https://s3.tebi.io/game-key-store/categories/${cover}`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Loading Categories...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center text-gray-600">
            <h2 className="text-2xl font-semibold mb-2">Categories</h2>
            <p>Categories are temporarily unavailable.</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Don't render section if no categories
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            Game Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your favorite games by browsing through our carefully curated categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/games?category=${category.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl block no-underline text-inherit"
            >
              {/* Category Image */}
              <div className="h-44 overflow-hidden relative bg-gradient-to-br from-indigo-400 via-purple-500 to-purple-600">
                <img 
                  src={getImageUrl(category.cover)} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div class="flex items-center justify-center h-full text-white text-xl font-bold shadow-text">
                        ${category.name}
                      </div>
                    `;
                  }}
                />
              </div>
              
              {/* Category Info */}
              <div className="p-5">
                <h3 className="m-0 mb-2.5 text-gray-800 text-xl font-semibold leading-snug">
                  {category.name}
                </h3>
                <p className="m-0 text-gray-600 text-sm leading-relaxed overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;
