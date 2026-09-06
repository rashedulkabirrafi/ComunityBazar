import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Provider/AuthProvider';
import { Link } from 'react-router-dom';

const MyListing = () => {
  const { user } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/listings/${user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch your listings');
        }
        const data = await response.json();
        setMyListings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full mb-4 text-sm font-medium">
            📦 My Listings
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Products You're Selling
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Manage and view all the items you have listed on ComunityBazar
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm">
            {error}
          </div>
        ) : myListings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Listings Yet</h3>
            <p className="text-gray-500">You haven't posted any items for sale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {myListings.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
              >
                {/* Image container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'}}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm">
                    {product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <span>📍</span>
                    <span className="truncate">{product.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  {/* Price & Date */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 mb-4">
                    <span className="text-lg font-bold text-indigo-600">
                      Tk {(Number(product.price) || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.date || new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* View Details Button */}
                  <Link 
                    to={`/ViewDetails/${product._id}`} 
                    state={{ product }}
                    className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold rounded-xl transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListing;
