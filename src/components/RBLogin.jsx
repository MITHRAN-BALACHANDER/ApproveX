import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function RBLogin({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const navigate = useNavigate()
  const location = useLocation()

  // Initialize role from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get('role')
    if (roleParam && ['student', 'teacher', 'admin'].includes(roleParam)) {
      setSelectedRole(roleParam)
    }
  }, [location])

  const roleConfig = {
    student: {
      title: 'Student Login',
      subtitle: 'Access your OD requests and academic information',
      icon: '🎓',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      redirectPath: '/student/dashboard',
      tokenKey: 'userToken',
      infoKey: 'userInfo',
    },
    teacher: {
      title: 'Teacher Login',
      subtitle: 'Review and approve student OD requests',
      icon: '👨‍🏫',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      redirectPath: '/teacher/dashboard',
      tokenKey: 'teacherToken',
      infoKey: 'teacherInfo',
    },
    admin: {
      title: 'Admin Login',
      subtitle: 'Manage system users and configurations',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      redirectPath: '/admin/dashboard',
      tokenKey: 'adminToken',
      infoKey: 'adminInfo',
    },
  }

  const currentConfig = roleConfig[selectedRole]

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

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      // Use unified endpoint for all roles
      const response = await fetch(
        'http://localhost:5000/api/role-auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: selectedRole,
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        // Store role-specific tokens and user info
        localStorage.setItem(currentConfig.tokenKey, result.token)
        localStorage.setItem(currentConfig.infoKey, JSON.stringify(result.user))

        // Clear other role tokens to prevent conflicts
        Object.keys(roleConfig).forEach(role => {
          if (role !== selectedRole) {
            localStorage.removeItem(roleConfig[role].tokenKey)
            localStorage.removeItem(roleConfig[role].infoKey)
          }
        })

        // Call parent login handler with role information
        onLogin(result.user, selectedRole)

        // Redirect to role-specific dashboard (use API response for consistency)
        navigate(result.redirectTo || currentConfig.redirectPath)
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = role => {
    setSelectedRole(role)
    setError('')
    setFormData({ email: '', password: '' })
    // Update URL without triggering navigation
    navigate(`/login?role=${role}`, { replace: true })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Role Selection */}
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 mb-6'>
            OD Provider Login
          </h2>

          <div className='flex justify-center space-x-2 mb-8'>
            {Object.keys(roleConfig).map(role => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedRole === role
                    ? `bg-gradient-to-r ${roleConfig[role].color} text-white shadow-lg transform scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className='mr-2'>{roleConfig[role].icon}</span>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div
          className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-2 rounded-xl shadow-xl p-8`}
        >
          <div className='text-center mb-6'>
            <div
              className={`mx-auto h-16 w-16 bg-gradient-to-r ${currentConfig.color} rounded-full flex items-center justify-center text-2xl mb-4`}
            >
              {currentConfig.icon}
            </div>
            <h3 className='text-2xl font-bold text-gray-900'>
              {currentConfig.title}
            </h3>
            <p className='text-gray-600 mt-2'>{currentConfig.subtitle}</p>
          </div>

          {error && (
            <div className='mb-4 p-4 border border-red-300 rounded-md bg-red-50'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <span className='text-red-400'>⚠️</span>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email Address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete='email'
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete='current-password'
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Enter your password'
              />
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r ${currentConfig.color} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                )}
              </button>
            </div>
          </form>

          {selectedRole === 'student' && (
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Role-specific Information */}
        <div className='text-center text-sm text-gray-600'>
          <div className='space-y-2'>
            {selectedRole === 'student' && (
              <p>
                Use your college email and password to access your OD requests
              </p>
            )}
            {selectedRole === 'teacher' && (
              <p>
                Use your teacher credentials to review and approve OD requests
              </p>
            )}
            {selectedRole === 'admin' && (
              <p>Administrative access for system management</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RBLogin
