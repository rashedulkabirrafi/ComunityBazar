import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import '../styles/Marketplace.css'

const Marketplace = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20); // 5 rows x 4 columns
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Fetch listings from MongoDB
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/listings`);
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setAllProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(allProducts.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allProducts]);

  // Get visible products
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  return (
    <div className='marketplace-container'>
      {/* Header */}
      <div className='marketplace-header'>
        <h1>Marketplace</h1>
        <p>Explore our wide range of daily essentials and products</p>
      </div>

      {/* Search Bar */}
      <div className='search-filter-section'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search by product name, description, or location...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(20); // Reset to first page on search
            }}
          />
          <span className='search-icon'>🔍</span>
        </div>

        {/* Category Filter */}
        <div className='category-filter'>
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(20); // Reset to first page on filter
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className='results-info'>
        <p>Showing {visibleProducts.length} of {filteredProducts.length} products</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='no-products'>
          <p>Loading products from database...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className='no-products'>
          <p>Error loading products: {error}</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && visibleProducts.length > 0 ? (
        <div className='products-grid'>
          {visibleProducts.map((product, index) => (
            <div key={product._id || index} className='product-card'>
              <div className='product-image'>
                <img src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} alt={product.name} onError={(e) => {e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'}} />
              </div>
              <div className='product-info'>
                <h3 className='product-name'>{product.name}</h3>
                <p className='product-brand'>Location: <span>{product.location}</span></p>
                <p className='product-color'>Seller: <span>{product.email}</span></p>
                <p className='product-description'>{product.description}</p>
                <div className='product-footer'>
                  <p className='product-price'>Tk {(product.price || 0).toLocaleString('en-IN')}</p>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button 
                      className='add-to-cart-btn' 
                      style={{backgroundColor: '#4f46e5'}}
                      onClick={() => navigate(`/ViewDetails/${product._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error && visibleProducts.length === 0 ? (
        <div className='no-products'>
          <p>No products found matching your criteria.</p>
        </div>
      ) : null
      }

      {/* Show More Button */}
      {visibleCount < filteredProducts.length && (
        <div className='show-more-container'>
          <button className='show-more-btn' onClick={handleShowMore}>
            Show More Products
          </button>
        </div>
      )}

      {/* All loaded message */}
      {visibleCount >= filteredProducts.length && filteredProducts.length > 0 && (
        <div className='all-loaded'>
          <p>All products loaded!</p>
        </div>
      )}
    </div>
  )
}

export default Marketplace