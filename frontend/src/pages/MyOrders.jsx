import { API_BASE_URL } from '../config/api';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../Provider/AuthProvider'

const MyOrders = () => {
  const { user, loading } = useContext(AuthContext)
  const userEmail = user?.email

  const [orders, setOrders] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [reviewInfo, setReviewInfo] = useState({
    rating: 5,
    review: '',
  })

  useEffect(() => {
    if (loading || !userEmail) return

    fetch(`${API_BASE_URL}/orders/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Orders from backend:', data)
        setOrders(data)
      })
      .catch((error) => {
        console.error('Error fetching orders:', error)
      })
  }, [loading, userEmail])

  const handleOpenReviewForm = (order, item) => {
    setSelectedOrder(order)
    setSelectedProduct(item)
    setReviewInfo({
      rating: 5,
      review: '',
    })
    setShowReviewForm(true)
  }

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target

    setReviewInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()

    if (!selectedOrder || !selectedProduct) {
      alert('No product selected for review.')
      return
    }

    if (!reviewInfo.review.trim()) {
      alert('Please write your review.')
      return
    }

    const reviewData = {
      orderId: selectedOrder._id,
      productId: selectedProduct.productId || selectedProduct._id,
      productName: selectedProduct.name,
      productCategory: selectedProduct.category,
      userEmail: userEmail,
      userName: user?.displayName || selectedOrder.name,
      rating: Number(reviewInfo.rating),
      review: reviewInfo.review,
    }

    fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Review submit failed with status ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Review submitted:', data)

        if (data.insertedId) {
          alert('Review submitted successfully!')
          setShowReviewForm(false)
          setSelectedOrder(null)
          setSelectedProduct(null)
          setReviewInfo({
            rating: 5,
            review: '',
          })
        }
      })
      .catch((error) => {
        console.error('Error submitting review:', error)
        alert('Failed to submit review. Please check backend and console.')
      })
  }

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  if (!user) {
    return <p className="p-6">Please login to view your orders.</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <title>My Orders</title>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          My Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderStatus = order.status || 'placed'
              const statusLower = orderStatus.toLowerCase()
              const isDelivered = statusLower === 'delivered'

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="bg-purple-600 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold">
                        Order ID: {order._id}
                      </h3>

                      <p className="text-sm flex items-center gap-2 mt-1">
                        Status:
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            statusLower === 'placed'
                              ? 'bg-yellow-400 text-yellow-900'
                              : statusLower === 'shipped'
                              ? 'bg-blue-400 text-blue-900'
                              : statusLower === 'delivered'
                              ? 'bg-green-400 text-green-900'
                              : 'bg-gray-400 text-gray-900'
                          }`}
                        >
                          {orderStatus}
                        </span>
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-semibold">
                        Total: Tk {order.totalPrice?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm">
                        Payment: {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 border-b">
                    <p>
                      <span className="font-semibold">Name:</span> {order.name}
                    </p>
                    <p>
                      <span className="font-semibold">Mobile:</span>{' '}
                      {order.mobile}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{' '}
                      {order.email}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span>{' '}
                      {order.location}
                    </p>

                    {order.extraNote && (
                      <p>
                        <span className="font-semibold">Note:</span>{' '}
                        {order.extraNote}
                      </p>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-6 py-4">Product Name</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Quantity</th>
                          <th className="px-6 py-4">Unit Price</th>
                          <th className="px-6 py-4">Total Price</th>
                          <th className="px-6 py-4">Review</th>
                        </tr>
                      </thead>

                      <tbody>
                        {order.items?.map((item) => (
                          <tr
                            key={item._id}
                            className="border-b hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 font-medium">
                              {item.name}
                            </td>

                            <td className="px-6 py-4">
                              {item.category}
                            </td>

                            <td className="px-6 py-4">
                              {item.quantity}
                            </td>

                            <td className="px-6 py-4">
                              Tk {item.price.toLocaleString('en-IN')}
                            </td>

                            <td className="px-6 py-4 font-semibold text-purple-700">
                              Tk {(item.quantity * item.price).toLocaleString('en-IN')}
                            </td>

                            <td className="px-6 py-4">
                              {isDelivered ? (
                                <button
                                  onClick={() => handleOpenReviewForm(order, item)}
                                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                  Give Rating & Review
                                </button>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  Available after delivery
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-bold text-gray-800">
                Give Rating & Review
              </h3>

              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 bg-gray-50 p-4 rounded-xl">
              <p className="font-semibold">
                Product: {selectedProduct?.name}
              </p>
              <p className="text-sm text-gray-600">
                Order ID: {selectedOrder?._id}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <label className="block">
                Rating
                <select
                  name="rating"
                  value={reviewInfo.rating}
                  onChange={handleReviewInputChange}
                  className="w-full border p-3 rounded-lg mt-1"
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>
              </label>

              <label className="block">
                Review
                <textarea
                  name="review"
                  value={reviewInfo.review}
                  onChange={handleReviewInputChange}
                  placeholder="Write your review about this product"
                  className="w-full border p-3 rounded-lg mt-1"
                  rows="4"
                  required
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-5 py-2 rounded-lg border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders