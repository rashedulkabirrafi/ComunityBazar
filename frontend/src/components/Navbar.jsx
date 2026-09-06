import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Provider/AuthProvider';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router';
import auth from '../firebase/firebase.config';
import UseAxios from '../hooks/UseAxios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const axiosInstance = UseAxios();
  const navigate = useNavigate();

  const {user} = useContext(AuthContext)

  // Fetch role when user logs in
  useEffect(() => {
    if (user?.email) {
      axiosInstance.get(`/users/role/${user.email}`)
        .then(res => setUserRole(res.data?.role))
        .catch(() => setUserRole(null));
    } else {
      setUserRole(null);
    }
  }, [axiosInstance, user]);

  const isAdmin = userRole === 'admin';

  const handleSignout = () => {
    signOut(auth).then(() => {
      navigate('/');
    })
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="navbar py-4">

          {/* Logo */}
          <div className="navbar-start">
            <a href="/" className="flex items-center gap-1.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">C</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800">Comunity</span>
                <span className="text-2xl font-bold text-indigo-600">Bazar</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-2 text-base font-medium text-gray-700">
              <li><a href="/" className="hover:text-indigo-600 transition-colors">Home</a></li>
              <li><a href="/Marketplace" className="hover:text-indigo-600 transition-colors">Marketplace</a></li>
              {user && <li><a href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</a></li>}
            </ul>
          </div>

          {/* Right Side */}
          <div className="navbar-end flex items-center gap-3">

            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 text-sm"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 absolute left-3.5 top-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Login / Profile */}
            {
              user && <button onClick={handleSignout} className="btn btn-outline btn-sm border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white hidden md:flex">
              Logout
            </button>
            }
            {
              !user && <a href="/Login" className="btn btn-outline btn-sm border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white hidden md:flex">
              Login
            </a>
            }
            

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden btn btn-ghost btn-circle"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6h12v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t py-4 px-4 shadow-lg">
            <ul className="flex flex-col gap-4 text-lg font-medium text-gray-700">
              <li><a href="/" className="block py-2 hover:text-indigo-600">Home</a></li>
              <li><a href="/Marketplace" className="block py-2 hover:text-indigo-600">Marketplace</a></li>
              {user && <li><a href="/dashboard" className="block py-2 hover:text-indigo-600">Dashboard</a></li>}
              
              {
                user && <li className="pt-4 border-t">
                <button onClick={handleSignout} className="block py-2 text-indigo-600 font-semibold">Logout</button>
              </li>
              }
              {
                !user && <li className="pt-4 border-t">
                <a href="/Login" className="block py-2 text-indigo-600 font-semibold">Login</a>
              </li>
              }
              

            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;