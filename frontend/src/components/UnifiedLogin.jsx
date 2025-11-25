import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'
import config from '../config/config.js'

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

    console.log('Config object:', config); // Debugging config
    console.log('AutoLogin URL:', config.api.autoLogin); // Debugging URL

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(config.api.autoLogin, {
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
    <div className='min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
      {/* Background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-secondary/5 rounded-full blur-3xl'></div>
      </div>

      <div className='max-w-md w-full space-y-8 relative z-10'>
        {/* Header */}
        <div className='text-center'>
          <div className='mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 hover:bg-primary/20 hover:scale-110 transition-all duration-300 cursor-pointer'>
            <GraduationCap size={32} className="text-primary" />
          </div>
          <h2 className='text-3xl font-bold text-foreground mb-2'>
            Welcome Back
          </h2>
          <p className='text-muted-foreground'>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className='bg-card border border-border rounded-xl shadow-sm p-8 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
          {error && (
            <div className='mb-6 p-4 border border-destructive/20 rounded-lg bg-destructive/10 flex items-center gap-3 text-destructive animate-in fade-in duration-300'>
              <AlertCircle size={20} />
              <p className='text-sm font-medium'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-foreground mb-1.5'
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete='email'
                    className='w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200'
                    placeholder='Enter your email'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-foreground mb-1.5'
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete='current-password'
                    className='w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200'
                    placeholder='Enter your password'
                  />
                </div>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='group w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
            >
              {loading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className='flex items-center gap-2'>
                  Sign in
                  <ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
                </span>
              )}
            </button>
          </form>

          <div className='mt-6 text-center pt-6 border-t border-border'>
            <p className='text-sm text-muted-foreground'>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className='font-medium text-primary hover:text-primary/80 transition-colors hover:underline'
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Information */}
        <div className='text-center text-xs text-muted-foreground'>
          <p className='flex items-center justify-center gap-1.5'>
            <Lock size={12} />
            Secure login system with automatic role detection
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
