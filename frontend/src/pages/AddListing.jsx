import { uploadImage } from '../utils/uploadImage';
import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react'

const AddListing = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothes & Fashion',
    productType: 'New',
    price: '',
    location: '',
    description: '',
    image: '',
    date: '',
    email: '' // This should be populated from auth
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('Please select an image for your listing.');
      return;
    }

    try {
      setUploading(true);

      // imgbb api work
      const res = await uploadImage(imageFile);

      if (!res.data.success) {
        alert('Image upload failed. Please try again.');
        setUploading(false);
        return;
      }

      const mainImageUrl = res.data.data.display_url;

      const listingData = {
        ...formData,
        image: mainImageUrl
      };

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      if (response.ok) {
        alert('Listing added successfully!');
        // Reset form
        setFormData({
          name: '',
          category: 'Clothes & Fashion',
          productType: 'New',
          price: '',
          location: '',
          description: '',
          image: '',
          date: '',
          email: ''
        });
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert('Failed to add listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding listing');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <title>Add Listing</title>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full mb-4 text-sm font-medium">
              🏷️ New Listing
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Add a Listing
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Fill in the details below to post your item on CampusBazar
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-3xl p-8 space-y-6">

            {/* Three column row — Name, Category & Product Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. MacBook Air M1"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800"
                >
                  <option value="Clothes & Fashion">Clothes & Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Care Products">Care Products</option>
                  <option value="Automobile">Automobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Condition
                </label>
                <select
                  name="productCondition"
                  value={formData.productCondition}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>
            </div>

            {/* Two column row — Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price (Tk)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhaka University"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your item — condition, age, reason for selling..."
                className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400 h-32 resize-none py-3"
                required
              />
            </div>

            {/* Product Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input file-input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800"
                required
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Two column row — Date & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Listing Date (mm/dd/yyyy)
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-2" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none shadow-md transition-all duration-200 text-base font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '⏳ Uploading & Posting...' : '🚀 Post Listing'}
            </button>

          </form>

          <p className="text-xs text-center text-gray-400 mt-6">
            By posting, you agree to our{' '}
            <a href="#" className="text-indigo-500 hover:underline">Listing Guidelines</a> &{' '}
            <a href="#" className="text-indigo-500 hover:underline">Community Standards</a>
          </p>

        </div>
      </div>
    </div>
  )
}

export default AddListing