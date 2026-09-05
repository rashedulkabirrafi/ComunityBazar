import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../Provider/AuthProvider'
import { useLocation, useNavigate, useParams } from 'react-router'
import UseAxios from '../hooks/UseAxios'
import '../styles/ViewDetails.css'

const ViewDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const axiosInstance = UseAxios()
  const { user } = useContext(AuthContext)

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [wishlistAdded, setWishlistAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        let productData

        if (id) {
          const response = await axiosInstance.get(`/listing/${id}`)
          productData = response.data
        } else if (location.state?.product) {
          productData = location.state.product
        }

        setProduct(productData)
        setError(null)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, location.state, axiosInstance])

  useEffect(() => {
    const productId = id || product?._id || product?.id

    if (!productId) return

    fetch(`${API_BASE_URL}/reviews/product/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Reviews from backend:', data)
        setReviews(data)
      })
      .catch((err) => {
        console.error('Error fetching reviews:', err)
      })
  }, [id, product])

  const handleAddToCart = async () => {
    if (!product) return

    if (!user) {
      alert('Please login to add items to your cart.')
      navigate('/login')
      return
    }

    const itemId = product._id || product.id

    const cartItem = {
      productId: itemId,
      email: user.email,
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      location: product.location || '',
      image: product.image,
      quantity: 1,
      sellerEmail: product.email || product.sellerName || '',
    }

    try {
      const response = await axiosInstance.get(`/cart/${user.email}`)
      const existingCart = response.data
      const existingItem = existingCart.find(
        (item) => item.productId === itemId
      )

      if (existingItem) {
        await axiosInstance.patch(`/cart/${existingItem._id}`, {
          quantity: existingItem.quantity + 1,
        })
      } else {
        await axiosInstance.post('/cart', cartItem)
      }

      setCartAdded(true)
      alert(`${product.name} has been added to cart.`)
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert('Failed to add to cart.')
    }
  }

  const handleAddToWishlist = async () => {
    if (!product) return

    if (!user) {
      alert('Please login to add items to your wishlist.')
      navigate('/login')
      return
    }

    const itemId = product._id || product.id

    const wishlistItem = {
      productId: itemId,
      email: user.email,
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      location: product.location || '',
      image: product.image,
      quantity: 1,
      sellerEmail: product.email || product.sellerName || '',
    }

    try {
      const response = await axiosInstance.post('/wishlist', wishlistItem)

      if (response.data.duplicate) {
        alert('This item is already in your wishlist.')
      } else {
        setWishlistAdded(true)
        alert(`${product.name} has been added to your wishlist.`)
      }

      navigate('/dashboard/MyWishlist')
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      alert('Failed to add to wishlist.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'

    const dateObject = new Date(dateString)

    if (Number.isNaN(dateObject.getTime())) return dateString

    return dateObject.toLocaleDateString('en-US')
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : 0

  if (loading) {
    return (
      <div className="view-details-container">
        <div className="view-details-card">
          <div className="text-center py-8">Loading product details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-details-container">
        <div className="view-details-card">
          <h2>Product not found</h2>
          <p className="text-red-500">{error}</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="view-details-container">
        <div className="view-details-card">
          <h2>Product not found</h2>
          <p>There was a problem loading the product details.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="view-details-container">
      <div className="view-details-card">
        <div className="view-details-grid">
          <div className="view-image-panel">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="view-info-panel">
            <h1>{product.name}</h1>

            <p className="view-category">
              Category: <span>{product.category}</span>
            </p>

            <p className="view-detail">
              <strong>Condition:</strong>{' '}
              {product.productCondition || product.productType || 'Not specified'}
            </p>

            <p className="view-description">Description:</p>

            <p className="view-description-text">
              {product.description || 'No description available for this product.'}
            </p>

            <p className="view-detail">
              <strong>Seller Name:</strong>{' '}
              {product.sellerName || 'Not provided'}
            </p>

            <p className="view-detail">
              <strong>Provider Email:</strong>{' '}
              {product.email || 'Not provided'}
            </p>

            <p className="view-detail">
              <strong>Location:</strong> {product.location || 'Not provided'}
            </p>

            <p className="view-detail">
              <strong>Listed at:</strong>{' '}
              {formatDate(product.date || product.createdAt)}
            </p>
          </div>

          <div className="view-order-panel">
            <div className="price-card">
              <p className="price-label">Price</p>
              <p className="price-value">
                Tk {Number(product.price).toLocaleString('en-IN')}
              </p>
            </div>

            <button
              className="order-btn"
              onClick={handleAddToCart}
              disabled={cartAdded}
            >
              {cartAdded ? 'Added to Cart' : 'Add to Cart'}
            </button>

            <button
              className="order-btn wishlist-btn"
              onClick={handleAddToWishlist}
              disabled={wishlistAdded}
            >
              {wishlistAdded ? 'Added to Wishlist' : 'Add to Wishlist'}
            </button>

            <button className="back-btn" onClick={() => navigate(-1)}>
              Back to Marketplace
            </button>
          </div>
        </div>

        <div className="mt-12 border-t pt-10 px-4 md:px-6 pb-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                  Ratings & Reviews
                </h2>

                <p className="text-gray-500 mt-2 text-base">
                  See what other buyers are saying about this product
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <div className="bg-purple-100 text-purple-700 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap">
                  {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                </div>

                {reviews.length > 0 && (
                  <div className="bg-yellow-100 text-yellow-700 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap">
                    Average {averageRating}/5
                  </div>
                )}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-10 md:p-12 text-center">
                <div className="text-6xl mb-4">⭐</div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No reviews yet
                </h3>

                <p className="text-gray-600 text-lg">
                  This product has not received any ratings or reviews yet.
                </p>

                <p className="text-sm text-gray-500 mt-3">
                  Reviews from delivered orders will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => {
                  const rating = Number(review.rating || 0)

                  return (
                    <div
                      key={review._id}
                      className="bg-gray-50 border border-gray-200 rounded-3xl p-6 md:p-7 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                              {(review.userName || review.userEmail || 'U')
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {review.userName || review.userEmail}
                              </h3>

                              <p className="text-sm text-gray-500">
                                Product: {review.productName}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 mt-5 text-lg leading-relaxed">
                            {review.review}
                          </p>

                          {review.createdAt && (
                            <p className="text-xs text-gray-400 mt-4">
                              Reviewed on{' '}
                              {new Date(review.createdAt).toLocaleDateString('en-US')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2 min-w-fit">
                          <div className="flex items-center text-2xl">
                            <span className="text-yellow-500">
                              {'★'.repeat(rating)}
                            </span>
                            <span className="text-gray-300">
                              {'★'.repeat(5 - rating)}
                            </span>
                          </div>

                          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
                            {rating}/5
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDetails