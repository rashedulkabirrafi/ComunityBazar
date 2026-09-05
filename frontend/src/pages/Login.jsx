import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import auth from '../firebase/firebase.config';
import { AuthContext } from '../Provider/AuthProvider';

const Login = () => {

  const {setUser} = useContext(AuthContext)

  const location = useLocation()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;

    signInWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      const user = userCredential.user;
      setUser(user)
      navigate(location.state ? location.state : '/')
    })
    .catch((error) => {
      console.log(error)
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Panel */}
        <div className="hidden md:flex flex-col items-center justify-center bg-linear-to-br from-indigo-600 to-purple-600 p-12 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-indigo-600 text-3xl font-bold">C</span>
          </div>
          <h2 className="text-3xl font-bold mb-3">
            Campus<span className="text-yellow-300">Bazar</span>
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-8">
            Welcome back! Login to explore deals, manage your listings, and connect with campus mates.
          </p>
          <div className="space-y-4 w-full text-left">
            {[
              { icon: "🛒", text: "Browse thousands of listings" },
              { icon: "💬", text: "Chat with sellers instantly" },
              { icon: "📦", text: "Track your orders easily" },
              { icon: "⭐", text: "Save your favourite items" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-sm">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              Campus<span className="text-indigo-600">Bazar</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mb-8">Login to your CampusBazar account</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="example@gmail.com"
                required
                className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to={'/Register'} className="text-indigo-600 hover:underline font-medium">
                New here? Register now
              </Link>
              <a href="" className="text-gray-400 hover:text-indigo-600 hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            <button className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none shadow-md transition-all duration-200 text-base font-semibold">
              Login
            </button>

          </form>

          <p className="text-xs text-center text-gray-400 mt-8">
            By logging in, you agree to our{' '}
            <a href="#" className="text-indigo-500 hover:underline">Terms</a> &{' '}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login