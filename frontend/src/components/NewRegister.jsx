import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

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
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: data.verificationToken,
            password: data.password,
          }),
        }
      )

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
      const response = await fetch(
        'http://localhost:5000/api/auth/resend-verification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collegeEmail: studentInfo.collegeEmail,
          }),
        }
      )

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
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Create your account
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
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
                  className='block text-sm font-medium text-gray-700'
                >
                  College Email Address
                </label>
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
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='yourname23dept@srishakthi.ac.in'
                />
                {errors.collegeEmail && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.collegeEmail.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-gray-500'>
                  Format: name + admission year + department + @srishakthi.ac.in
                </p>
              </div>

              <div>
                <label
                  htmlFor='rollNumber'
                  className='block text-sm font-medium text-gray-700'
                >
                  Roll Number
                </label>
                <input
                  {...register('rollNumber', {
                    required: 'Roll number is required',
                    minLength: {
                      value: 3,
                      message: 'Roll number must be at least 3 characters',
                    },
                  })}
                  type='text'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter your roll number'
                />
                {errors.rollNumber && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${message.includes('error') || message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
              >
                <p className='text-sm'>{message}</p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
              >
                {loading ? 'Processing...' : 'Send Verification Email'}
              </button>
            </div>

            <div className='text-center'>
              <Link
                to='/login'
                className='font-medium text-indigo-600 hover:text-indigo-500'
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
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Check your email
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              We've sent a verification link to your college email
            </p>
          </div>

          {studentInfo && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-blue-800 mb-2'>
                Extracted Information:
              </h3>
              <div className='text-sm text-blue-700 space-y-1'>
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
                  className='block text-sm font-medium text-gray-700'
                >
                  Verification Code
                </label>
                <input
                  {...register('verificationToken', {
                    required: 'Verification code is required',
                  })}
                  type='text'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter the code from your email'
                />
                {errors.verificationToken && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.verificationToken.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Set Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type='password'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Create a secure password'
                />
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${message.includes('error') || message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
              >
                <p className='text-sm'>{message}</p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
              >
                {loading ? 'Verifying...' : 'Complete Registration'}
              </button>
            </div>

            <div className='text-center space-y-2'>
              <button
                type='button'
                onClick={resendVerification}
                disabled={loading}
                className='text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50'
              >
                Resend verification email
              </button>
              <br />
              <button
                type='button'
                onClick={() => setStep(1)}
                className='text-sm text-gray-600 hover:text-gray-500'
              >
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
