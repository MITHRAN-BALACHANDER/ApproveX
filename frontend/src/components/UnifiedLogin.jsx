import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, AlertTriangle } from 'lucide-react'

function UnifiedLogin({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const navigate = useNavigate()

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
      // Use the auto-login endpoint that detects role automatically
      const API_BASE_URL =
        import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_BASE_URL}/role-auth/auto-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store role-specific tokens and user info
        const tokenKeys = {
          admin: 'adminToken',
          teacher: 'teacherToken',
          student: 'userToken',
        }

        const infoKeys = {
          admin: 'adminInfo',
          teacher: 'teacherInfo',
          student: 'userInfo',
        }

        const tokenKey = tokenKeys[result.role]
        const infoKey = infoKeys[result.role]

        localStorage.setItem(tokenKey, result.token)
        localStorage.setItem(infoKey, JSON.stringify(result.user))

        // Clear other role tokens to prevent conflicts
        Object.entries(tokenKeys).forEach(([role, key]) => {
          if (role !== result.role) {
            localStorage.removeItem(key)
            localStorage.removeItem(infoKeys[role])
          }
        })

        // Call parent login handler with role information
        onLogin(result.user, result.role)

        // Redirect to role-specific dashboard
        navigate(result.redirectTo)
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='max-w-md w-full space-y-8 relative z-10'>
        {/* Header */}
        <div className='text-center'>
          <div className='mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300 hover:rotate-3'>
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3'>
            OD Provider System
          </h2>
          <p className='text-gray-600 text-lg'>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className='bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:bg-white/90'>
          {error && (
            <div className='mb-6 p-4 border border-red-200 rounded-xl bg-red-50/80 backdrop-blur-sm animate-shake'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-red-700 font-medium'>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <div className='group'>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors'
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
                  className='appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white group-hover:shadow-md'
                  placeholder='Enter your email'
                />
              </div>

              <div className='group'>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors'
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
                  className='appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white group-hover:shadow-md'
                  placeholder='Enter your password'
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Signing in...
                  </div>
                ) : (
                  <span className='flex items-center'>
                    Sign in
                    <svg
                      className='ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className='font-semibold text-blue-600 hover:text-blue-800 transition-colors hover:underline'
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Information */}
        <div className='text-center text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30'>
          <p className='font-medium'>🔒 Secure login system</p>
          <p className='mt-1'>System automatically detects your role</p>
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
