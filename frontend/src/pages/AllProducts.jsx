import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Filter,
  MapPin,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { AuthContext } from '../Provider/AuthProvider'
import UseAxios from '../hooks/UseAxios'

const AllProducts = () => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const axiosInstance = UseAxios()
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null })
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user?.email) {
      setRole(null)
      setRoleLoading(false)
      return
    }

    setRoleLoading(true)
    axiosInstance
      .get(`/users/role/${user.email}`)
      .then((res) => setRole(res.data?.role || null))
      .catch(() => setRole(null))
      .finally(() => setRoleLoading(false))
  }, [authLoading, axiosInstance, user])

  const fetchProducts = useCallback(() => {
    if (!user?.email || role !== 'admin') {
      setLoadingProducts(false)
      return
    }

    setLoadingProducts(true)
    setError('')

    axiosInstance
      .get('/admin/listings', {
        headers: {
          'x-user-email': user.email,
        },
      })
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load products from the database.')
        setProducts([])
      })
      .finally(() => setLoadingProducts(false))
  }, [axiosInstance, role, user])

  useEffect(() => {
    if (!roleLoading) {
      fetchProducts()
    }
  }, [fetchProducts, roleLoading])

  const categories = useMemo(() => {
    const values = products.map((product) => product.category).filter(Boolean)
    return ['all', ...new Set(values)]
  }, [products])

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const searchableText = [
        product.name,
        product.description,
        product.email,
        product.location,
        product.category,
        product.productCondition,
        product.productType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && (!term || searchableText.includes(term))
    })
  }, [products, searchTerm, selectedCategory])

  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + (Number(product.price) || 0), 0)
    const sellers = new Set(products.map((product) => product.email).filter(Boolean)).size

    return {
      totalProducts: products.length,
      categories: categories.length - 1,
      sellers,
      totalValue,
    }
  }, [categories, products])

  const handleDeleteProduct = () => {
    const productId = deleteModal.product?._id

    if (!productId || !user?.email) return

    setDeletingId(productId)

    axiosInstance
      .delete(`/listings/${productId}`, {
        headers: {
          'x-user-email': user.email,
        },
      })
      .then((res) => {
        if (res.data?.deletedCount > 0) {
          setProducts((currentProducts) => currentProducts.filter((product) => product._id !== productId))
          setDeleteModal({ open: false, product: null })
        } else {
          setError('The product was not found in the database.')
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to delete this product.'))
      .finally(() => setDeletingId(''))
  }

  const formatDate = (product) => {
    const value = product.date || product.createdAt
    if (!value) return 'Not provided'

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10 flex items-center justify-center">
        <title>Admin Products - CampusBazar</title>
        <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access Required</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Product management is only available to CampusBazar administrators.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-8">
      <title>All Products - CampusBazar Admin</title>

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              <ShieldCheck size={16} />
              Admin product control
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">All Products</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review every listing posted by users and remove products directly from the database.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            className="btn border-none bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <Boxes className="text-indigo-600" size={22} />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <Filter className="text-sky-600" size={22} />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.categories}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Sellers</p>
              <UserRound className="text-emerald-600" size={22} />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.sellers}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Listed Value</p>
              <CircleDollarSign className="text-amber-600" size={22} />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              Tk {stats.totalValue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-gray-50 lg:flex-1">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                className="grow text-sm"
                placeholder="Search product, seller, category, or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-xl">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <PackageSearch className="mx-auto text-gray-300" size={54} />
            <h2 className="mt-4 text-xl font-bold text-gray-900">No products found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Try clearing the search or selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className="flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-col"
              >
                <div className="h-auto w-32 shrink-0 bg-gray-100 sm:aspect-4/3 sm:w-full">
                  <img
                    src={product.image || 'https://via.placeholder.com/500x375?text=No+Image'}
                    alt={product.name || 'CampusBazar product'}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = 'https://via.placeholder.com/500x375?text=No+Image'
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-bold text-gray-900 sm:text-lg">
                        {product.name || 'Untitled product'}
                      </h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {product.category || 'Uncategorized'}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Tk {(Number(product.price) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-gray-500">
                    {product.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-gray-500">
                    <p className="flex min-w-0 items-center gap-2">
                      <UserRound size={16} className="shrink-0 text-gray-400" />
                      <span className="truncate">{product.email || 'Seller email missing'}</span>
                    </p>
                    <p className="flex min-w-0 items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-gray-400" />
                      <span className="truncate">{product.location || 'Location missing'}</span>
                    </p>
                    <p className="flex min-w-0 items-center gap-2">
                      <CalendarDays size={16} className="shrink-0 text-gray-400" />
                      <span>{formatDate(product)}</span>
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
                      {product.productCondition || product.productType || 'Condition not set'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ open: true, product })}
                      className="btn btn-sm border-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-center text-xl font-bold text-gray-900">Delete Product?</h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              This will permanently remove the listing from the database.
            </p>
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">{deleteModal.product?.name}</p>
              <p className="mt-1 text-xs text-gray-500">{deleteModal.product?.email}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, product: null })}
                className="btn border-none bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="btn border-none bg-red-600 text-white hover:bg-red-700"
                disabled={deletingId === deleteModal.product?._id}
              >
                {deletingId === deleteModal.product?._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllProducts
