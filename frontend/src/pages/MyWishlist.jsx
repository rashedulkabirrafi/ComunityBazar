import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../Provider/AuthProvider'
import UseAxios from '../hooks/UseAxios'

const MyWishlist = () => {
  const { user, loading } = useContext(AuthContext)
  const axiosInstance = UseAxios()
  const navigate = useNavigate()

  const [wishlistItems, setWishlistItems] = useState([])
  const [loadingWishlist, setLoadingWishlist] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.email) {
        setWishlistItems([])
        setLoadingWishlist(false)
        return
      }

      try {
        setLoadingWishlist(true)
        const response = await axiosInstance.get(`/wishlist/${user.email}`)
        setWishlistItems(response.data)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoadingWishlist(false)
      }
    }

    fetchWishlist()
  }, [user, axiosInstance])

  const updateQuantity = async (id, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta
    if (newQuantity < 1) return

    try {
      const response = await axiosInstance.patch(`/wishlist/${id}`, { quantity: newQuantity })
      if (response.data.modifiedCount > 0) {
        setWishlistItems((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, quantity: newQuantity } : item
          )
        )
      }
    } catch (error) {
      console.error('Error updating wishlist quantity:', error)
    }
  }

  const removeWishlistItem = async (id) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/${id}`)
      if (response.data.deletedCount > 0) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== id))
      }
    } catch (error) {
      console.error('Error removing wishlist item:', error)
    }
  }

  const handleMoveToCart = async (item) => {
    if (!user) {
      alert('Please login to add items to your cart.')
      navigate('/login')
      return
    }

    try {
      const userCartResponse = await axiosInstance.get(`/cart/${user.email}`)
      const existingCart = userCartResponse.data
      const existingItem = existingCart.find((cartItem) => cartItem.productId === item.productId)

      if (existingItem) {
        await axiosInstance.patch(`/cart/${existingItem._id}`, {
          quantity: existingItem.quantity + item.quantity,
        })
      } else {
        await axiosInstance.post('/cart', {
          productId: item.productId,
          email: user.email,
          name: item.name,
          category: item.category,
          price: item.price,
          location: item.location,
          image: item.image,
          quantity: item.quantity || 1,
          sellerEmail: item.sellerEmail || '',
        })
      }

      await removeWishlistItem(item._id)
      navigate('/dashboard/MyCart')
    } catch (error) {
      console.error('Error moving wishlist item to cart:', error)
      alert('Failed to move item to cart.')
    }
  }

  if (loading || loadingWishlist) {
    return <p className="p-6">Loading wishlist...</p>
  }

  if (!user) {
    return <p className="p-6">Please login to view your wishlist.</p>
  }

  return (
    <div className="min-h-screen bg-purple-50 px-6 py-10">
      <title>My Wishlist</title>
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-md p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="text-5xl text-pink-500">❤️</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Wishlist</h2>
            <p className="text-gray-500">Save items you want to buy later.</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p>Your wishlist is empty.</p>
            <button
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full"
              onClick={() => navigate('/Marketplace')}
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6 border rounded-3xl shadow-sm"
              >
                <div className="rounded-3xl overflow-hidden bg-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                    <p className="text-lg font-bold text-gray-900">Tk {Number(item.price).toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 mt-2">{item.location || 'Unknown location'}</p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 bg-gray-200 rounded-full"
                        onClick={() => updateQuantity(item._id, item.quantity, -1)}
                      >
                        -
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        className="px-3 py-1 bg-gray-200 rounded-full"
                        onClick={() => updateQuantity(item._id, item.quantity, 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="px-5 py-2 rounded-full bg-purple-600 text-white"
                        onClick={() => handleMoveToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="px-5 py-2 rounded-full bg-red-100 text-red-700"
                        onClick={() => removeWishlistItem(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyWishlist;
