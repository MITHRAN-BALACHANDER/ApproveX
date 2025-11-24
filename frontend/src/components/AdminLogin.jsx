import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, Mail, AlertCircle, ArrowRight, User, Shield, Info } from 'lucide-react'
import config from '../config/config'

const AdminLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async data => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${config.api.admin}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // Store admin token
        localStorage.setItem('adminToken', result.token)
        localStorage.setItem('adminInfo', JSON.stringify(result.admin))

        // Redirect to admin dashboard
        navigate('/admin/dashboard')
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

  return (
    <div className='min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className='max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border'>
        <div className="text-center">
          <div className='mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transform rotate-3'>
            <Shield className='w-8 h-8 text-primary' />
          </div>
          <h2 className='text-3xl font-bold text-foreground tracking-tight'>
            Admin Portal
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            System Administration Access
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-foreground mb-1.5'>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type='email'
                  className='block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 sm:text-sm'
                  placeholder='admin@example.com'
                />
              </div>
              {errors.email && (
                <p className='mt-1.5 text-sm text-destructive flex items-center gap-1'>
                  <AlertCircle size={14} />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-foreground mb-1.5'>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type='password'
                  className='block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 sm:text-sm'
                  placeholder='••••••••'
                />
              </div>
              {errors.password && (
                <p className='mt-1.5 text-sm text-destructive flex items-center gap-1'>
                  <AlertCircle size={14} />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
              <p className='text-sm text-destructive font-medium'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md'
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign in as Admin
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-card text-muted-foreground'>Or continue as</span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <button
              type='button'
              onClick={() => navigate('/student/login')}
              className='flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors'
            >
              <User size={16} />
              Student
            </button>
            <button
              type='button'
              onClick={() => navigate('/teacher/login')}
              className='flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors'
            >
              <Shield size={16} />
              Teacher
            </button>
          </div>

          <div className='bg-muted/50 border border-border rounded-lg p-4 mt-6'>
            <div className='flex gap-3'>
              <Info className='h-5 w-5 text-primary shrink-0' />
              <div className='text-xs text-muted-foreground space-y-1'>
                <p className="font-medium text-foreground">Default Credentials</p>
                <p>Email: admin@srishakthi.ac.in</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
