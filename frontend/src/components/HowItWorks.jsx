import React from 'react';
import { UserPlus, ImagePlus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up with your university email to verify your student status.',
    icon: UserPlus,
    color: 'from-blue-400 to-blue-600',
    link: '/Register',
    linkText: 'Join Now'
  },
  {
    title: 'List Your Item',
    description: 'Snap some photos, set a fair price, and publish your ad in minutes.',
    icon: ImagePlus,
    color: 'from-purple-400 to-purple-600',
    link: 'dashboard/AddListing',
    linkText: 'Post an Ad'
  },
  {
    title: 'Buy items from your mates',
    description: 'Browse what others are selling and find great deals right on campus.',
    icon: ShoppingBag,
    color: 'from-indigo-400 to-indigo-600',
    link: '/Marketplace',
    linkText: 'Browse Marketplace'
  },
];

const HowItWorks = () => {
  return (
    <div className="bg-gray-50 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How CampusBazar Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Trading with your campus mates has never been easier. Follow these simple steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 text-center z-10 group flex flex-col h-full">
                {/* Step Number Background */}
                <div className="absolute -top-6 -right-6 text-9xl font-black text-gray-50 opacity-50 z-0 select-none group-hover:scale-110 transition-transform duration-500">
                  {idx + 1}
                </div>
                
                <div className="relative z-10 grow flex flex-col">
                  <div className={`w-20 h-20 mx-auto bg-linear-to-tr ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 grow">{step.description}</p>
                  
                  {step.link && (
                    <Link to={step.link} className="inline-flex items-center justify-center gap-2 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-auto">
                      {step.linkText} <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
