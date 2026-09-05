import { API_BASE_URL } from '../config/api';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Provider/AuthProvider';

const AllOrders = () => {
  const { user, loading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    fetch(`${API_BASE_URL}/all-orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setFetching(false);
      })
      .catch((error) => {
        console.error('Error fetching all orders:', error);
        setFetching(false);
      });
  }, [loading, user]);

  const handleStatusChange = (orderId, newStatus) => {
    fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.modifiedCount > 0) {
          // Update the local state
          const updatedOrders = orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          );
          setOrders(updatedOrders);
          alert('Order status updated to: ' + newStatus);
        }
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  };

  const handleDeleteOrder = (orderId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!isConfirmed) return;

    fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.deletedCount > 0) {
          const updatedOrders = orders.filter((order) => order._id !== orderId);
          setOrders(updatedOrders);
          alert('Order deleted successfully.');
        }
      })
      .catch((error) => {
        console.error('Error deleting order:', error);
      });
  };

  if (loading || fetching) {
    return <div className="p-6 text-gray-600 font-medium text-lg">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <title>All Orders - Admin</title>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              All Orders Management
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              View and update the status of all user orders across the platform.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800">No orders yet</h3>
            <p className="text-gray-500 mt-2">When users place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Header of the Order Card */}
                <div className="bg-indigo-600 text-white p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-mono text-indigo-50">
                      ID: {order._id}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium text-indigo-100">
                      <p>👤 {order.name}</p>
                      <p>✉️ {order.email}</p>
                      <p>📱 {order.mobile}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:text-right">
                    <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                      <p className="text-xs text-indigo-200 uppercase tracking-wider">Total Value</p>
                      <p className="font-bold text-lg">
                        Tk {order.totalPrice?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>

                    {/* Status Dropdown & Delete Action */}
                    <div className="flex flex-col w-full sm:w-auto">
                      <label className="text-xs text-indigo-200 uppercase tracking-wider mb-1 lg:text-right">Actions</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || 'placed'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-white text-indigo-900 text-sm font-bold rounded-lg px-4 py-2 border-0 outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm cursor-pointer h-9.5"
                        >
                          <option value="placed">Placed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm h-9.5 flex items-center justify-center"
                          title="Delete Order"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body of the Order Card */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Delivery Information</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-900">Location:</span> {order.location}</p>
                        {order.extraNote && (
                          <p><span className="font-medium text-gray-900">Note:</span> <span className="italic text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{order.extraNote}</span></p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Payment Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-900">Method:</span> {order.paymentMethod}</p>
                        {order.paymentMethod === 'Mobile Banking' && (
                          <>
                            <p><span className="font-medium text-gray-900">Number:</span> {order.paymentNumber}</p>
                            <p><span className="font-medium text-gray-900">TrxID:</span> <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">{order.transactionId}</span></p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b border-gray-100 text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Product Name</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        <th className="px-6 py-4 font-semibold text-center">Qty</th>
                        <th className="px-6 py-4 font-semibold text-right">Unit Price</th>
                        <th className="px-6 py-4 font-semibold text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {order.items?.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-indigo-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{item.category}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700 font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            Tk {item.price.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-indigo-700">
                            Tk {(item.quantity * item.price).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
