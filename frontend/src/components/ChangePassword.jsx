import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import config from '../config/config.js'
import {
  Key,
  Mail,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react'

const ChangePassword = ({ isOpen, onClose, userToken, userRole }) => {
  const [method, setMethod] = useState('password')
  const [step, setStep] = useState(1)
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

  useEffect(() => {
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
        config.api.requestPasswordChangeOtp,
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
        setTimeLeft(600)
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
        config.api.changePassword,
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
        config.api.changePasswordWithOtp,
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
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
      <div className='relative w-full max-w-md bg-card border border-border shadow-lg rounded-xl overflow-hidden animate-in zoom-in duration-300'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-xl font-bold text-foreground flex items-center gap-2'>
              <ShieldCheck className='w-6 h-6 text-primary' />
              Change Password
            </h3>
            <button
              onClick={handleClose}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <X className='w-6 h-6' />
            </button>
          </div>

          {error && (
            <div className='bg-destructive/10 border border-destructive/20 rounded-2xl p-3 mb-4 flex items-center gap-2 text-destructive text-sm'>
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className='bg-green-500/10 border border-green-500/20 rounded-2xl p-3 mb-4 flex items-center gap-2 text-green-600 text-sm'>
              <CheckCircle size={16} />
              <p>{success}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className='text-muted-foreground mb-4'>
                Choose how you want to verify your identity:
              </p>

              <div className='space-y-3'>
                <button
                  onClick={() => {
                    setMethod('password')
                    setStep(2)
                  }}
                  className='w-full p-4 border border-border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]'
                >
                  <div className='flex items-center'>
                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors'>
                      <Key className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>Use Current Password</p>
                      <p className='text-sm text-muted-foreground'>
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
                  className='w-full p-4 border border-border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]'
                >
                  <div className='flex items-center'>
                    <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors'>
                      <Mail className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>Use Email OTP</p>
                      <p className='text-sm text-muted-foreground'>
                        Get verification code via email
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && method === 'password' && (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
                  Current Password
                </label>
                <input
                  type='password'
                  {...register('oldPassword', {
                    required: 'Current password is required',
                  })}
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.oldPassword && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
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
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.newPassword && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.confirmPassword && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setStep(1)}
                  className='px-4 py-2 border border-input bg-background text-foreground rounded-2xl hover:bg-muted transition-colors text-sm font-medium'
                >
                  Back
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium'
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && method === 'otp' && (
            <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-4">
              {otpSent && (
                <div className='bg-primary/5 border border-primary/10 rounded-2xl p-3'>
                  <p className='text-primary text-sm flex items-center'>
                    <Mail className='w-4 h-4 mr-2' />
                    OTP sent to your email address
                  </p>
                  {timeLeft > 0 && (
                    <p className='text-xs text-muted-foreground mt-1 ml-6 flex items-center'>
                      <Clock className='w-3 h-3 mr-1' />
                      Expires in: {formatTime(timeLeft)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
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
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors font-mono tracking-widest text-center text-lg'
                  maxLength='6'
                />
                {errors.otp && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.otp.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
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
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.newPassword && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  className='w-full px-3 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.confirmPassword && (
                  <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                    <AlertCircle size={12} />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setStep(1)}
                  className='px-4 py-2 border border-input bg-background text-foreground rounded-2xl hover:bg-muted transition-colors text-sm font-medium'
                >
                  Back
                </button>
                <button
                  type='button'
                  onClick={requestOTP}
                  disabled={loading || timeLeft > 540}
                  className='px-4 py-2 bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/80 disabled:opacity-50 transition-all duration-300 text-sm font-medium hover:scale-105 active:scale-95'
                >
                  {loading ? 'Sending...' : 'Resend OTP'}
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium'
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className='text-center py-6'>
              <div className='w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>
              <h4 className='text-lg font-bold text-foreground mb-2'>
                Password Changed Successfully!
              </h4>
              <p className='text-muted-foreground mb-6'>
                Your password has been updated successfully.
              </p>
              <button
                onClick={handleClose}
                className='px-6 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors font-medium'
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
