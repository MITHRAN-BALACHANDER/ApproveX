import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authAPI, setAuthToken } from '../services/api'

const Register = ({ onRegister }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const watchRole = watch('role')

  const onSubmit = async data => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authAPI.register(data)
      const { token, user } = response.data

      setAuthToken(token)
      localStorage.setItem('user', JSON.stringify(user))

      setSuccess('Registration successful! Redirecting...')
      setTimeout(() => {
        onRegister(user)
      }, 1500)
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center py-8'
      style={{ backgroundColor: 'var(--color-light)' }}
    >
      <div className='max-w-2xl w-full mx-4'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <div className='text-center mb-6'>
            <h2
              className='text-2xl font-bold mb-2'
              style={{ color: 'var(--color-primary)' }}
            >
              Register for Student OD System
            </h2>
            <p className='text-gray-600'>Create your account to get started</p>
          </div>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: 'var(--color-dark)' }}
                >
                  Email Address *
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type='email'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='your.email@college.edu'
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: 'var(--color-dark)' }}
                >
                  Password *
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
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Create a password'
                />
                {errors.password && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className='block text-sm font-medium mb-2'
                style={{ color: 'var(--color-dark)' }}
              >
                Role *
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select your role</option>
                <option value='student'>Student</option>
                <option value='teacher'>Teacher/Faculty</option>
              </select>
              {errors.role && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: 'var(--color-dark)' }}
                >
                  Full Name *
                </label>
                <input
                  {...register('profile.fullName', {
                    required: 'Full name is required',
                  })}
                  type='text'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter your full name'
                />
                {errors.profile?.fullName && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.profile.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className='block text-sm font-medium mb-2'
                  style={{ color: 'var(--color-dark)' }}
                >
                  Department *
                </label>
                <select
                  {...register('profile.department', {
                    required: 'Department is required',
                  })}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Select department</option>
                  <option value='CSE'>Computer Science & Engineering</option>
                  <option value='ECE'>Electronics & Communication</option>
                  <option value='EEE'>Electrical & Electronics</option>
                  <option value='MECH'>Mechanical Engineering</option>
                  <option value='CIVIL'>Civil Engineering</option>
                  <option value='IT'>Information Technology</option>
                  <option value='BBA'>Business Administration</option>
                  <option value='MBA'>Master of Business Administration</option>
                </select>
                {errors.profile?.department && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.profile.department.message}
                  </p>
                )}
              </div>
            </div>

            {/* Student-specific fields */}
            {watchRole === 'student' && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Register Number *
                  </label>
                  <input
                    {...register('profile.registerNumber', {
                      required: 'Register number is required',
                    })}
                    type='text'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='e.g., 21CS001'
                  />
                  {errors.profile?.registerNumber && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.profile.registerNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Year *
                  </label>
                  <select
                    {...register('profile.year', {
                      required: 'Year is required',
                    })}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select year</option>
                    <option value='1st Year'>1st Year</option>
                    <option value='2nd Year'>2nd Year</option>
                    <option value='3rd Year'>3rd Year</option>
                    <option value='4th Year'>4th Year</option>
                  </select>
                  {errors.profile?.year && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.profile.year.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Section *
                  </label>
                  <select
                    {...register('profile.section', {
                      required: 'Section is required',
                    })}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select section</option>
                    <option value='A'>Section A</option>
                    <option value='B'>Section B</option>
                    <option value='C'>Section C</option>
                    <option value='D'>Section D</option>
                  </select>
                  {errors.profile?.section && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.profile.section.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Teacher-specific fields */}
            {watchRole === 'teacher' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Employee ID *
                  </label>
                  <input
                    {...register('profile.employeeId', {
                      required: 'Employee ID is required',
                    })}
                    type='text'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='e.g., EMP001'
                  />
                  {errors.profile?.employeeId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.profile.employeeId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Designation *
                  </label>
                  <select
                    {...register('profile.designation', {
                      required: 'Designation is required',
                    })}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select designation</option>
                    <option value='Assistant Professor'>
                      Assistant Professor
                    </option>
                    <option value='Associate Professor'>
                      Associate Professor
                    </option>
                    <option value='Professor'>Professor</option>
                    <option value='HOD'>Head of Department</option>
                    <option value='Principal'>Principal</option>
                    <option value='Dean'>Dean</option>
                  </select>
                  {errors.profile?.designation && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.profile.designation.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 text-white font-medium rounded-lg transition-all disabled:opacity-50'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              Already have an account?{' '}
              <button
                onClick={() => (window.location.href = '/login')}
                className='font-medium hover:underline'
                style={{ color: 'var(--color-primary)' }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
