import React from 'react';
import { Search, ArrowRight, Users, ShoppingBag } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 overflow-hidden mb-20">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -right-20 bottom-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-medium">
              Made for BRAC University Students
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Buy. Sell.<br />
              <span className="text-yellow-300">Thrive on Campus</span>
            </h1>

            <p className="text-lg md:text-xl text-indigo-100 max-w-lg">
              The smartest student marketplace in Bangladesh. 
              Connect with your campus mates and trade everything — from books to bikes.
            </p>


            {/* Trust Stats */}
            <div className="flex flex-wrap gap-x-10 gap-y-6 pt-4">
              <div>
                <div className="text-3xl font-bold">12,450+</div>
                <div className="text-indigo-100 text-sm">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold">8,200+</div>
                <div className="text-indigo-100 text-sm">Items Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">95%</div>
                <div className="text-indigo-100 text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden md:block">
            <div className="relative z-10">
              {/* Floating Product Cards */}
              <div className="absolute -left-6 top-12 bg-white rounded-3xl p-4 shadow-2xl w-52 rotate-[-8deg]">
                <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl mb-3">
                  📚
                </div>
                <p className="font-semibold text-sm">Engineering Math Book</p>
                <p className="text-indigo-600 font-bold">৳650</p>
              </div>

              <div className="absolute right-8 -bottom-6 bg-white rounded-3xl p-4 shadow-2xl w-52 rotate-6">
                <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl mb-3">
                  💻
                </div>
                <p className="font-semibold text-sm">MacBook Air (Used)</p>
                <p className="text-indigo-600 font-bold">৳42,000</p>
              </div>

              {/* Main Visual */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[3rem] p-8 shadow-2xl">
                <div className="bg-white rounded-3xl p-6 text-center">
                  <div className="w-28 h-28 mx-auto bg-linear-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-6xl mb-6 shadow-inner">
                    🏛️
                  </div>
                  <h3 className="text-gray-800 font-bold text-2xl">CampusBazar</h3>
                  <p className="text-gray-500">Your Campus. Your Market.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave / Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-gray-50 to-transparent"></div>
    </div>
  );
};

export default Hero;