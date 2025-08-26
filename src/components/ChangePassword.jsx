import { useState } from 'react'
import { useForm } from 'react-hook-form'

const ChangePassword = ({ isOpen, onClose, userToken, userRole }) => {
  const [method, setMethod] = useState('password') // 'password' or 'otp'
  const [step, setStep] = useState(1) // 1: choose method, 2: enter details, 3: success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError: setFormError,
  } = useForm()

  const newPassword = watch('newPassword')

  // Timer for OTP countdown
  useState(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const requestOTP = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/password/request-password-change-otp',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setTimeLeft(600) // 10 minutes
        setSuccess('OTP sent to your email address')
        setStep(2)
      } else {
        setError(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async data => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/password/change-password',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setSuccess('Password changed successfully!')
        setStep(3)
        reset()
      } else {
        setError(result.message || 'Failed to change password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitOTP = async data => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/password/change-password-with-otp',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otp: data.otp,
            newPassword: data.newPassword,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setSuccess('Password changed successfully using OTP!')
        setStep(3)
        reset()
      } else {
        setError(result.message || 'Failed to change password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMethod('password')
    setStep(1)
    setError('')
    setSuccess('')
    setOtpSent(false)
    setTimeLeft(0)
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>
              🔐 Change Password
            </h3>
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-md p-3 mb-4'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          {success && (
            <div className='bg-green-50 border border-green-200 rounded-md p-3 mb-4'>
              <p className='text-green-800 text-sm'>{success}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className='text-gray-600 mb-4'>
                Choose how you want to verify your identity:
              </p>

              <div className='space-y-3'>
                <button
                  onClick={() => {
                    setMethod('password')
                    setStep(2)
                  }}
                  className='w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left'
                >
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                      🔑
                    </div>
                    <div>
                      <p className='font-medium'>Use Current Password</p>
                      <p className='text-sm text-gray-500'>
                        Verify with your current password
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod('otp')
                    requestOTP()
                  }}
                  className='w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left'
                >
                  <div className='flex items-center'>
                    <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                      📧
                    </div>
                    <div>
                      <p className='font-medium'>Use Email OTP</p>
                      <p className='text-sm text-gray-500'>
                        Get verification code via email
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && method === 'password' && (
            <form onSubmit={handleSubmit(onSubmitPassword)}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    {...register('oldPassword', {
                      required: 'Current password is required',
                    })}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.oldPassword && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.oldPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    New Password
                  </label>
                  <input
                    type='password'
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.newPassword && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.confirmPassword && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 2 && method === 'otp' && (
            <form onSubmit={handleSubmit(onSubmitOTP)}>
              <div className='space-y-4'>
                {otpSent && (
                  <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
                    <p className='text-blue-800 text-sm'>
                      📧 OTP sent to your email address
                      {timeLeft > 0 && (
                        <span className='block mt-1 font-mono'>
                          ⏰ Expires in: {formatTime(timeLeft)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Enter OTP Code
                  </label>
                  <input
                    type='text'
                    {...register('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits',
                      },
                    })}
                    placeholder='Enter 6-digit code'
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    maxLength='6'
                  />
                  {errors.otp && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    New Password
                  </label>
                  <input
                    type='password'
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.newPassword && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                  {errors.confirmPassword && (
                    <p className='text-red-600 text-sm mt-1'>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                  >
                    Back
                  </button>
                  <button
                    type='button'
                    onClick={requestOTP}
                    disabled={loading || timeLeft > 540} // Disable if recently sent (1 min cooldown)
                    className='px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm'
                  >
                    {loading ? 'Sending...' : 'Resend OTP'}
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                Password Changed Successfully!
              </h4>
              <p className='text-gray-600 mb-4'>
                Your password has been updated successfully.
              </p>
              <button
                onClick={handleClose}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
