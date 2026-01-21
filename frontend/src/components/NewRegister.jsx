import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Mail,
  User,
  ArrowRight,
  CheckCircle,
  Lock,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react'
import config from '../config/config'

const Register = ({ onRegister }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1) // 1: Email/Roll, 2: Verification sent, 3: Set password
  const [studentInfo, setStudentInfo] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  // Step 1: Register with college email and roll number
  const onSubmitStep1 = async data => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${config.api.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeEmail: data.collegeEmail,
          rollNumber: data.rollNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setStudentInfo(result.studentInfo)
        setMessage(result.message)
        setStep(2)
      } else {
        setMessage(result.message || 'Registration failed')
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify email and set password
  const onSubmitStep2 = async data => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${config.api.auth}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.verificationToken,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', result.token)
        onRegister(result.user)
      } else {
        setMessage(result.message || 'Verification failed')
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend verification email
  const resendVerification = async () => {
    if (!studentInfo) return

    setLoading(true)
    try {
      const response = await fetch(`${config.api.auth}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeEmail: studentInfo.collegeEmail,
        }),
      })

      const result = await response.json()
      setMessage(result.message)
    } catch (error) {
      setMessage('Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background'>
        <div className='max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20 hover:scale-110 transition-all duration-300 cursor-pointer'>
              <GraduationCap className='h-6 w-6 text-primary' />
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-foreground'>
              Create your account
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              Use your college email to register
            </p>
          </div>

          <form
            className='mt-8 space-y-6'
            onSubmit={handleSubmit(onSubmitStep1)}
          >
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='collegeEmail'
                  className='block text-sm font-medium text-foreground mb-1'
                >
                  College Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <input
                    {...register('collegeEmail', {
                      required: 'College email is required',
                      pattern: {
                        value: /^[a-zA-Z]+\d{2}[a-zA-Z]+@srishakthi\.ac\.in$/,
                        message:
                          'Please enter a valid college email (e.g., mithrans23it@srishakthi.ac.in)',
                      },
                    })}
                    type='email'
                    className='block w-full pl-10 pr-3 py-2 border border-input rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                    placeholder='yourname23dept@srishakthi.ac.in'
                  />
                </div>
                {errors.collegeEmail && (
                  <p className='mt-1 text-sm text-destructive'>
                    {errors.collegeEmail.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-muted-foreground'>
                  Format: name + admission year + department + @srishakthi.ac.in
                </p>
              </div>

              <div>
                <label
                  htmlFor='rollNumber'
                  className='block text-sm font-medium text-foreground mb-1'
                >
                  Roll Number
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <input
                    {...register('rollNumber', {
                      required: 'Roll number is required',
                      minLength: {
                        value: 3,
                        message: 'Roll number must be at least 3 characters',
                      },
                    })}
                    type='text'
                    className='block w-full pl-10 pr-3 py-2 border border-input rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                    placeholder='Enter your roll number'
                  />
                </div>
                {errors.rollNumber && (
                  <p className='mt-1 text-sm text-destructive'>
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl ${
                  message.includes('error') || message.includes('failed')
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-green-500/10 text-green-600'
                }`}
              >
                <p className='text-sm'>{message}</p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? (
                  <RefreshCw className='h-5 w-5 animate-spin' />
                ) : (
                  <>
                    Send Verification Email
                    <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
                  </>
                )}
              </button>
            </div>

            <div className='text-center'>
              <Link
                to='/login'
                className='font-medium text-primary hover:text-primary/80 transition-colors'
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background'>
        <div className='max-w-md w-full space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-in zoom-in duration-500'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-foreground'>
              Check your email
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              We've sent a verification link to your college email
            </p>
          </div>

          {studentInfo && (
            <div className='bg-primary/5 border border-primary/20 rounded-2xl p-4'>
              <h3 className='text-sm font-medium text-primary mb-2'>
                Extracted Information:
              </h3>
              <div className='text-sm text-foreground/80 space-y-1'>
                <p>
                  <strong>Name:</strong> {studentInfo.name}
                </p>
                <p>
                  <strong>Department:</strong> {studentInfo.department}
                </p>
                <p>
                  <strong>Year:</strong> {studentInfo.year}
                </p>
                <p>
                  <strong>Roll Number:</strong> {studentInfo.rollNumber}
                </p>
              </div>
            </div>
          )}

          <form
            className='mt-8 space-y-6'
            onSubmit={handleSubmit(onSubmitStep2)}
          >
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='verificationToken'
                  className='block text-sm font-medium text-foreground mb-1'
                >
                  Verification Code
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <input
                    {...register('verificationToken', {
                      required: 'Verification code is required',
                    })}
                    type='text'
                    className='block w-full pl-10 pr-3 py-2 border border-input rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                    placeholder='Enter the code from your email'
                  />
                </div>
                {errors.verificationToken && (
                  <p className='mt-1 text-sm text-destructive'>
                    {errors.verificationToken.message}
                  </p>
                )}
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
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type='password'
                    className='block w-full pl-10 pr-3 py-2 border border-input rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                    placeholder='Create a secure password'
                  />
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-destructive'>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl ${
                  message.includes('error') || message.includes('failed')
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-green-500/10 text-green-600'
                }`}
              >
                <p className='text-sm'>{message}</p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? (
                  <RefreshCw className='h-5 w-5 animate-spin' />
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>

            <div className='text-center space-y-2'>
              <button
                type='button'
                onClick={resendVerification}
                disabled={loading}
                className='text-sm text-primary hover:text-primary/80 disabled:opacity-50 transition-colors'
              >
                Resend verification email
              </button>
              <br />
              <button
                type='button'
                onClick={() => setStep(1)}
                className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <ArrowLeft className='mr-1 h-4 w-4' />
                Back to registration
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}

export default Register
