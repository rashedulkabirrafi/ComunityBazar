import React, { useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { AuthContext } from '../Provider/AuthProvider'
import UseAxios from '../hooks/UseAxios'

const AdminRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  const axiosInstance = UseAxios()
  const location = useLocation()
  const [role, setRole] = useState(null)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user?.email) {
      setRole(null)
      setCheckingRole(false)
      return
    }

    setCheckingRole(true)
    axiosInstance
      .get(`/users/role/${user.email}`)
      .then((res) => setRole(res.data?.role || null))
      .catch(() => setRole(null))
      .finally(() => setCheckingRole(false))
  }, [axiosInstance, loading, user])

  if (loading || checkingRole) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    )
  }

  if (!user) {
    return <Navigate state={location.pathname} to="/Login" />
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard/MyProfile" replace />
  }

  return children
}

export default AdminRoutes
