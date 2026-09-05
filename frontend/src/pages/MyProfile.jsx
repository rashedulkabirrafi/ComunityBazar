import { uploadImage } from '../utils/uploadImage';
import { updateProfile } from 'firebase/auth'
import React, { useContext, useState } from 'react'
import auth from '../firebase/firebase.config'
import { AuthContext } from '../Provider/AuthProvider'
import MyListing from '../components/MyListing'
import UseAxios from '../hooks/UseAxios'

const Profile = () => {

  const {setUser, user} = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const axiosInstance = UseAxios()

  React.useEffect(() => {
    if (user?.email) {
      axiosInstance.get(`/users/role/${user.email}`)
        .then(res => {
          setUserRole(res.data?.role)
        })
        .catch(err => console.error("Failed to fetch role", err))
    }
  }, [user, axiosInstance])

  const handleUpdateform = () => {
    setIsOpen(!isOpen)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    const name = e.target.name.value;
    const fileInput = e.target.imageurl;
    const file = fileInput.files[0];

    setUploading(true)

    let imageUrl = user?.photoURL;

    // If a new file was selected, upload to imgbb
    if (file) {
      try {
        const res = await uploadImage(file)
        imageUrl = res.data.data.display_url;
      } catch (err) {
        console.log(err)
        alert('Image upload failed. Please try again.')
        setUploading(false)
        return
      }
    }

    // Update Firebase profile
    updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: imageUrl
    }).then(() => {
      setUser({ ...user, photoURL: imageUrl, displayName: name })

      // Also update in the backend database
      axiosInstance.patch(`/users/profile/${user.email}`, {
        name,
        mainImageUrl: imageUrl
      }).catch(err => console.log(err))

      setUploading(false)
      setPreviewUrl(null)
      setIsOpen(false)
    }).catch((error) => {
      console.log(error)
      setUploading(false)
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <title>My Profile</title>
      <div className="w-full max-w-2xl space-y-6">

        {/* Header Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-sm font-medium">
            👤 My Profile
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Top Banner */}
          <div className="h-28 bg-linear-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                <img
                  src={user?.photoURL}
                  alt="User Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="pt-16 pb-8 px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {user?.displayName}
            </h2>
            <p className="text-indigo-500 font-medium text-sm mb-6">
              {user?.email}
            </p>

            {/* Account Info */}
            <div className="text-left space-y-3 mb-8">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3.5">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm font-semibold text-gray-800">{user?.displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3.5">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3.5">
                <span className="text-xl">{userRole === 'admin' ? '👑' : '✅'}</span>
                <div>
                  <p className="text-xs text-gray-400">Account Status</p>
                  <p className="text-sm font-semibold text-green-600 capitalize">
                    {userRole ? userRole : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Update Button */}
            <button
              onClick={handleUpdateform}
              className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none shadow-md transition-all duration-200 text-base font-semibold"
            >
              {isOpen ? '✕ Cancel Update' : '✏️ Update Profile'}
            </button>
          </div>
        </div>

        {/* Update Form Card */}
        {isOpen && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Edit Profile Info</h3>
            <p className="text-gray-400 text-sm mb-6">Update your display name and profile photo</p>

            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  defaultValue={user?.displayName}
                  name='name'
                  type="text"
                  placeholder="Enter new name"
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Profile Photo
                </label>
                {/* Preview */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img
                      src={previewUrl || user?.photoURL}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Select a new image to change your photo</p>
                </div>
                <input
                  name='imageurl'
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-800"
                />
              </div>

              <div className="border-t border-gray-100 pt-2" />

              <button
                type="submit"
                disabled={uploading}
                className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none shadow-md transition-all duration-200 text-base font-semibold disabled:opacity-50"
              >
                {uploading ? '⏳ Uploading...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  )
}

export default Profile