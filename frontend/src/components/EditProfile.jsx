import { useState } from 'react'

const EditProfile = ({ userInfo, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: userInfo?.profile?.fullName || userInfo?.fullName || '',
    registerNumber:
      userInfo?.profile?.registerNumber || userInfo?.registerNumber || '',
    department: userInfo?.profile?.department || userInfo?.department || '',
    year: userInfo?.profile?.year || userInfo?.year || '',
    section: userInfo?.profile?.section || userInfo?.section || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const userToken = localStorage.getItem('userToken')
      const response = await fetch(
        'http://localhost:5000/api/auth/update-profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(formData),
        }
      )

      const result = await response.json()

      if (result.success) {
        setSuccess('Profile updated successfully!')

        // Update localStorage with new user info
        const currentUserInfo = JSON.parse(
          localStorage.getItem('userInfo') || '{}'
        )
        const updatedUserInfo = {
          ...currentUserInfo,
          profile: {
            ...currentUserInfo.profile,
            ...formData,
          },
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))

        // Call the parent update function
        onUpdate(updatedUserInfo)

        // Close the modal after a short delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(result.message || 'Failed to update profile')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Profile update error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-gray-900'>Edit Profile</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <span className='text-2xl'>&times;</span>
            </button>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Full Name
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Register Number
              </label>
              <input
                type='text'
                name='registerNumber'
                value={formData.registerNumber}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </label>
              <select
                name='department'
                value={formData.department}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select Department</option>
                <option value='Computer Science Engineering'>
                  Computer Science Engineering
                </option>
                <option value='Information Technology'>
                  Information Technology
                </option>
                <option value='Electronics and Communication Engineering'>
                  Electronics and Communication Engineering
                </option>
                <option value='Electrical and Electronics Engineering'>
                  Electrical and Electronics Engineering
                </option>
                <option value='Mechanical Engineering'>
                  Mechanical Engineering
                </option>
                <option value='Civil Engineering'>Civil Engineering</option>
                <option value='Biomedical Engineering'>
                  Biomedical Engineering
                </option>
                <option value='Chemical Engineering'>
                  Chemical Engineering
                </option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Year
              </label>
              <select
                name='year'
                value={formData.year}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select Year</option>
                <option value='1'>1st Year</option>
                <option value='2'>2nd Year</option>
                <option value='3'>3rd Year</option>
                <option value='4'>4th Year</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Section
              </label>
              <select
                name='section'
                value={formData.section}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select Section</option>
                <option value='A'>Section A</option>
                <option value='B'>Section B</option>
                <option value='C'>Section C</option>
                <option value='D'>Section D</option>
              </select>
            </div>

            <div className='flex space-x-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
