import { uploadImage } from '../utils/uploadImage';
import { API_BASE_URL } from '../config/api';
import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../Provider/AuthProvider'
import { updateProfile } from 'firebase/auth';
import auth from '../firebase/firebase.config';
import axios from 'axios';

const Regisger = () => {

  const {registerWithEmailPassword, setUser, user} = useContext(AuthContext);

  const location = useLocation()
  const navigate = useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault()
    const email = e.target.email.value;
    const pass = e.target.password.value;
    const name = e.target.name.value;
    const imageurl = e.target.imageurl;
    const file = imageurl.files[0]

    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;           
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if(pass.length < 6){
      return alert("Password length can not be less than 6!!!")
    }
    if(!uppercase.test(pass)){
      return alert("You must use uppercase letters in your password.")
    }
    if(!lowercase.test(pass)){
      return alert("You must use lowercase letters in your password.")
    }
    if (!number.test(pass)) {
      return alert("You must include at least one number.");
    }
    if (!specialChar.test(pass)) {
      return alert("You must include at least one special character.");
    }


    // imgbb api work
    const res = await uploadImage(file)

    const mainImageUrl = res.data.data.display_url

    // creating an object to post data to database
    const formData = {
      email,
      pass,
      name,
      mainImageUrl,
      
    }

    if (res.data.success == true){
      // firebase authentication with email

      registerWithEmailPassword(email, pass)
      .then((userCredential) => {
        updateProfile(auth.currentUser, {
          displayName: name, photoURL: mainImageUrl
        }).then(() => {
          setUser(userCredential.user)

          // sending user info to database
          axios.post(`${API_BASE_URL}/users`,formData)
          .then(res => {
            console.log(res.data)
          })
          .catch(err => {
            console.log(err)
          })
          
          navigate(location.state ? location.state : '/')
        }).catch((error) => {
          console.log(error)
        });
      })
      .catch(err => {
        console.log(err);
        })
    }


    
  }

  return (
    <div>
      <title>Sign up to CampusBazar</title>
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
              Your trusted campus marketplace. Buy, sell and connect with fellow students.
            </p>
            <div className="space-y-4 w-full text-left">
              {[
                { icon: "📚", text: "Trade textbooks & notes" },
                { icon: "💻", text: "Buy & sell electronics" },
                { icon: "🤝", text: "Connect with campus mates" },
                { icon: "🔒", text: "Safe & verified students only" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-sm">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="p-8 md:p-10">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Campus<span className="text-indigo-600">Bazar</span></span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm mb-7">Join CampusBazar newtwork to buy and sell your used goods with your fellows.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  name='name'
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image</label>
                <input
                  name='imageurl'
                  type="file"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  name='email'
                  type="email"
                  placeholder="example@gmail.com"
                  required
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  name='password'
                  type="password"
                  placeholder="Min 6 chars, upper, lower, number, special"
                  required
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="text-right">
                <Link to={'/Login'} className="text-indigo-600 hover:underline text-sm font-medium">
                  Already have an account? Login
                </Link>
              </div>

              <button className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none shadow-md transition-all duration-200 text-base font-semibold mt-2">
                Create Account
              </button>

            </form>

            <p className="text-xs text-center text-gray-400 mt-6">
              By signing up, you agree to our{' '}
              <a href="#" className="text-indigo-500 hover:underline">Terms</a> &{' '}
              <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Regisger