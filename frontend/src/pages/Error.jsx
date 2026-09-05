import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';

const Error = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <title>404 Error!!</title>
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-bold text-gray-200 select-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl md:text-7xl font-bold text-indigo-600 animate-bounce">
              😵‍💫
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-gray-600 text-lg md:text-xl max-w-md mx-auto mb-10">
          Looks like this page got lost on another campus. 
          Don't worry, let's get you back to the marketplace!
        </p>

        {/* Illustration */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-52 h-52 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-[120px] animate-[spin_20s_linear_infinite]">
              🏛️
            </div>
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 text-5xl animate-bounce">
              📚
            </div>
            <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl p-4 text-4xl animate-bounce delay-300">
              💻
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/"
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Back to Homepage
          </a>

        </div>

        

      </div>
    </div>
  );
};

export default Error;