import React from 'react';
import { BookOpen, Laptop, Bike, Sofa, Shirt, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router';

const categories = [
  { name: 'Books & Notes', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { name: 'Electronics', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
  { name: 'Bicycles', icon: Bike, color: 'bg-green-100 text-green-600' },
  { name: 'Furniture', icon: Sofa, color: 'bg-orange-100 text-orange-600' },
  { name: 'Clothing', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
  { name: 'Others', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
];

const Categories = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Browse by Category</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Find exactly what you need from our wide range of campus essentials.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link to={`/marketplace`} key={idx} className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-indigo-100 hover:-translate-y-2">
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                <Icon size={32} />
              </div>
              <h3 className="font-semibold text-gray-700 text-center">{cat.name}</h3>
            </Link>
          )
        })}
      </div>
    </div>
  );
};

export default Categories;
