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
      {/* Background elements with floating animation */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-secondary/5 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}></div>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/3 rounded-full blur-3xl animate-pulse' style={{animationDelay: '2s'}}></div>
      </div>

      <div className='max-w-md w-full space-y-8 relative z-10'>
        {/* Header with slide-in animation */}
        <div className='text-center animate-in slide-in-from-top duration-500'>
          <div className='mx-auto h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mb-6 hover:from-primary/30 hover:to-primary/10 hover:scale-110 hover:rotate-6 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-xl'>
            <GraduationCap size={36} className="text-primary drop-shadow-sm" />
          </div>
          <h2 className='text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text'>
            Welcome Back
          </h2>
          <p className='text-muted-foreground text-lg'>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form with slide-up animation */}
        <div className='bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:border-primary/40 transition-all duration-500 animate-in slide-in-from-bottom-[20px]'>
          {error && (
            <div className='mb-6 p-4 border border-destructive/20 rounded-2xl bg-destructive/10 flex items-center gap-3 text-destructive animate-in slide-in-from-top fade-in duration-300'>
              <AlertCircle size={20} className='animate-pulse' />
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
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
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
                    className='w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50'
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
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
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
                    className='w-full pl-10 pr-3 py-3 bg-background border-2 border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50'
                    placeholder='Enter your password'
                  />
                </div>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700'
            >
              {loading ? (
                <div className='flex items-center gap-2 relative z-10'>
                  <div className='h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className='flex items-center gap-2 relative z-10'>
                  Sign in
                  <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform duration-300' />
                </span>
              )}
            </button>
          </form>

          <div className='mt-6 text-center pt-6 border-t border-border'>
            <p className='text-sm text-muted-foreground'>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className='font-semibold text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4'
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Information */}
        <div className='text-center animate-in fade-in duration-1000 delay-500'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border rounded-full text-xs text-muted-foreground shadow-sm'>
            <Lock size={12} className='text-primary' />
            <span>Secure login with automatic role detection</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
