import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, RefreshCw, Key } from 'lucide-react'
import config from '../config/config'

const EmailVerification = ({ onRegister }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const handleVerification = async e => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${config.api.auth}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', result.token)
        setMessage('Email verified successfully! Redirecting...')

        setTimeout(() => {
          onRegister(result.user)
          navigate('/')
        }, 2000)
      } else {
        setMessage(result.message || 'Verification failed')
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background'>
      <div className='max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10'>
            <CheckCircle className='h-6 w-6 text-primary' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-foreground'>
            Verify Your Email
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Complete your registration by setting a password
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleVerification}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='token'
                className='block text-sm font-medium text-foreground mb-1'
              >
                Verification Token
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Key className='h-5 w-5 text-muted-foreground' />
                </div>
                <input
                  type='text'
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                  placeholder='Enter verification token'
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-foreground mb-1'
              >
                Set Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-muted-foreground' />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                  placeholder='Create a secure password'
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-foreground mb-1'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-muted-foreground' />
                </div>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                  placeholder='Confirm your password'
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes('successfully')
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              <p className='text-sm'>{message}</p>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors'
            >
              {loading ? (
                <RefreshCw className='h-5 w-5 animate-spin' />
              ) : (
                'Verify Email & Set Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailVerification
