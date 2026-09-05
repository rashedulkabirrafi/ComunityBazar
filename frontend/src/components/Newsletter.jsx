import React, { useState } from 'react';
import { Mail, Gift } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      // Here you can later connect with your backend
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 2500);
    }
  };

  return (
    <div className="bg-linear-to-br from-indigo-600 to-purple-700 py-16 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[30px_30px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl">
            <Gift className="w-10 h-10 text-yellow-300" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Stay Updated with CampusBazar
        </h2>
        
        <p className="text-indigo-100 text-lg md:text-xl max-w-md mx-auto mb-8">
          Get weekly deals, new arrivals, campus events, and exclusive student offers straight to your inbox.
        </p>

        {/* Newsletter Form */}
        <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-200 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@campus.edu"
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder:text-white/60 focus:outline-none focus:border-white text-base"
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-10 py-4 bg-white text-indigo-700 font-semibold rounded-2xl hover:bg-yellow-300 hover:text-indigo-700 transition-all duration-300 whitespace-nowrap shadow-lg"
            >
              {subscribed ? "Subscribed ✓" : "Subscribe Now"}
            </button>
          </div>
        </form>

        <p className="text-indigo-200 text-sm mt-5">
          Join <span className="font-semibold text-white">12,458+</span> students getting smarter deals every week
        </p>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 mt-10 opacity-75">
          <div className="text-xs text-indigo-200 flex items-center gap-1.5">
            🔒 Secure & Private
          </div>
          <div className="text-xs text-indigo-200 flex items-center gap-1.5">
            ✉️ One-click unsubscribe
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;