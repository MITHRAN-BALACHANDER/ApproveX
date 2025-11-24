import { useState } from 'react'
import config from '../config/config.js'
import { X, User, Hash, BookOpen, Calendar, Layers, AlertCircle, CheckCircle, Save } from 'lucide-react'

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
        config.api.updateProfile,
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
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-card border border-border rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-foreground flex items-center gap-2'>
              <User className="w-5 h-5 text-primary" />
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 text-sm'>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className='mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg flex items-center gap-2 text-sm'>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-foreground mb-1.5'>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User size={16} />
                </div>
                <input
                  type='text'
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className='w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-foreground mb-1.5'>
                Register Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Hash size={16} />
                </div>
                <input
                  type='text'
                  name='registerNumber'
                  value={formData.registerNumber}
                  onChange={handleInputChange}
                  required
                  className='w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder="Enter register number"
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-foreground mb-1.5'>
                Department
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <BookOpen size={16} />
                </div>
                <select
                  name='department'
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className='w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors appearance-none'
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
                  Year
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Calendar size={16} />
                  </div>
                  <select
                    name='year'
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className='w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors appearance-none'
                  >
                    <option value=''>Select Year</option>
                    <option value='1'>1st Year</option>
                    <option value='2'>2nd Year</option>
                    <option value='3'>3rd Year</option>
                    <option value='4'>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
                  Section
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Layers size={16} />
                  </div>
                  <select
                    name='section'
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    className='w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors appearance-none'
                  >
                    <option value=''>Select Section</option>
                    <option value='A'>Section A</option>
                    <option value='B'>Section B</option>
                    <option value='C'>Section C</option>
                    <option value='D'>Section D</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='flex gap-3 pt-4 mt-6 border-t border-border'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium text-sm flex items-center justify-center gap-2'
              >
                {loading ? (
                  'Updating...'
                ) : (
                  <>
                    <Save size={16} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
