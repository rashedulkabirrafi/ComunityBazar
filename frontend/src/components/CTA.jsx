import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} className="text-yellow-300" /> Start Earning Today
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Got stuff you don't need? <br className="hidden md:block" /> Turn it into cash.
          </h2>
          <p className="text-indigo-100 text-lg mb-10">
            Join thousands of students who are selling their used textbooks, electronics, and dorm essentials on ComunityBazar.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="dashboard/AddListing" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg">
              Post an Ad Now <ArrowRight size={20} />
            </Link>
            <Link to="/Marketplace" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-white/20">
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
