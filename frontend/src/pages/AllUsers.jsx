import React, { useEffect, useState } from 'react'
import UseAxios from '../hooks/UseAxios'

const AllUsers = () => {
  const axiosInstance = UseAxios()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 })

  // Fetch all users
  useEffect(() => {
    axiosInstance.get('/users')
      .then(res => {
        const data = res.data
        setUsers(data)
        setFilteredUsers(data)
        setStats({
          total: data.length,
          admins: data.filter(u => u.role === 'admin').length,
          users: data.filter(u => u.role !== 'admin').length,
        })
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
  }, [axiosInstance])

  // Search & filter logic
  useEffect(() => {
    let result = users

    // Apply role filter
    if (activeFilter === 'admin') {
      result = result.filter(u => u.role === 'admin')
    } else if (activeFilter === 'user') {
      result = result.filter(u => u.role !== 'admin')
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        u =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      )
    }

    setFilteredUsers(result)
  }, [searchTerm, activeFilter, users])

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    axiosInstance.patch(`/users/${userId}`, { role: newRole })
      .then(() => {
        const updated = users.map(u =>
          u._id === userId ? { ...u, role: newRole } : u
        )
        setUsers(updated)
        setStats({
          total: updated.length,
          admins: updated.filter(u => u.role === 'admin').length,
          users: updated.filter(u => u.role !== 'admin').length,
        })
      })
      .catch(err => console.log(err))
  }

  // Handle delete user
  const handleDeleteUser = () => {
    const userId = deleteModal.user?._id
    if (!userId) return

    axiosInstance.delete(`/users/${userId}`)
      .then(() => {
        const updated = users.filter(u => u._id !== userId)
        setUsers(updated)
        setStats({
          total: updated.length,
          admins: updated.filter(u => u.role === 'admin').length,
          users: updated.filter(u => u.role !== 'admin').length,
        })
        setDeleteModal({ open: false, user: null })
      })
      .catch(err => console.log(err))
  }

  const filters = [
    { key: 'all', label: 'All Users', icon: '👥' },
    { key: 'admin', label: 'Admins', icon: '🛡️' },
    { key: 'user', label: 'Users', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <title>All Users — CampusBazar</title>

      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-10 animate-[slideDown_0.6s_ease-out]">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-sm font-medium mb-4">
            👥 User Management
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            All Registered Users
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            Manage all CampusBazar community members. Search, filter, and update user roles.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-[fadeIn_0.6s_ease-out]">
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Regular Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.users}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">

            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all duration-300"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center gap-1.5
                    ${activeFilter === f.key
                      ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results info */}
          <p className="text-xs text-gray-400 mt-3 font-medium">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-40 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Grid */}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-[fadeIn_0.5s_ease-out]">
            {filteredUsers.map((u, index) => (
              <div
                key={u._id || index}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Top Banner */}
                <div className="h-20 bg-linear-to-r from-indigo-600 to-purple-600 relative">
                  {/* Role Badge */}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
                      ${u.role === 'admin'
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-white/90 text-indigo-700'
                      }`}
                  >
                    {u.role || 'user'}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex justify-center -mt-10 relative z-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={u.mainImageUrl || u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=667eea&color=fff&bold=true`}
                      alt={u.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=667eea&color=fff&bold=true`
                      }}
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="px-5 pt-3 pb-5 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-0.5 truncate">
                    {u.name || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 truncate">
                    {u.email}
                  </p>

                  {/* Info Pills */}
                  <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Verified
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between gap-2">

                      {/* Role Selector */}
                      <select
                        value={u.role || 'user'}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="select select-sm bg-gray-50 border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">🛡️ Admin</option>
                      </select>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteModal({ open: true, user: u })}
                        className="btn btn-sm btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Users Found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {searchTerm
                ? `No users match "${searchTerm}". Try a different search term.`
                : 'No users found with the selected filter.'}
            </p>
            <button
              onClick={() => { setSearchTerm(''); setActiveFilter('all') }}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-2">
              You are about to permanently remove:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="font-semibold text-gray-800">{deleteModal.user?.name}</p>
              <p className="text-xs text-gray-400">{deleteModal.user?.email}</p>
            </div>
            <p className="text-xs text-red-400 mb-6">
              ⚠️ This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="flex-1 btn bg-gray-100 text-gray-700 border-none rounded-xl hover:bg-gray-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 btn bg-red-500 text-white border-none rounded-xl hover:bg-red-600 font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations via inline style tag */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default AllUsers
