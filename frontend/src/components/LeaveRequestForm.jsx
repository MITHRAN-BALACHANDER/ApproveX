import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getCurrentUser } from '../services/api'

const LeaveRequestForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [files, setFiles] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const watchDates = watch(['startDate', 'endDate'])
  const watchLeaveType = watch('leaveType')

  // Calculate total days
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const timeDifference = end.getTime() - start.getTime()
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1
  }

  const totalDays = calculateTotalDays(watchDates?.[0], watchDates?.[1])

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async data => {
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const formData = new FormData()

      // Prepare leave request data
      // const leaveData = {
      //   leaveType: data.leaveType,
      //   reason: data.reason,
      //   startDate: data.startDate,
      //   endDate: data.endDate,
      //   isEmergency: data.isEmergency || false,
      // }

              const leaveData = {
          leaveType: data.leaveType,
          reason: data.reason,
          startDate: data.startDate,
          endDate: data.endDate,
          isEmergency: data.isEmergency || false,
          totalDays: totalDays
        }
      // Add emergency contact if provided
      if (data.emergencyContactName) {
        leaveData.emergencyContact = JSON.stringify({
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelationship,
          phone: data.emergencyContactPhone,
        })
      }

      // Append form data
      Object.keys(leaveData).forEach(key => {
        formData.append(key, leaveData[key])
      })

      // Append files
      files.forEach(file => {
        formData.append('documents', file)
      })

      // formData.append("totalDays", String(totalDays))

      const userToken = localStorage.getItem('userToken')
      const response = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage('✅ Leave request submitted successfully!')
        reset()
        setFiles([])
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setSubmitMessage(
          `❌ ${result.message || 'Failed to submit leave request'}`
        )
      }
    } catch (error) {
      setSubmitMessage('❌ Network error. Please try again.')
      console.error('Leave request submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'student') {
    return (
      <div className='text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30'>
        <div className='text-6xl mb-4'>🚫</div>
        <p className='text-red-600 font-semibold text-lg'>
          Access denied. Only students can submit leave requests.
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* Header */}
      <div className='bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white'>
        <div className='flex items-center mb-4'>
          <div className='h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mr-4'>
            🏖️
          </div>
          <div>
            <h2 className='text-2xl font-bold'>Submit Leave Request</h2>
            <p className='text-orange-100'>
              Fill out the form below to request leave
            </p>
          </div>
        </div>

        {totalDays > 0 && (
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>Total Days Requested:</span>
              <span className='text-2xl font-bold'>{totalDays} days</span>
            </div>
          </div>
        )}
      </div>

      {submitMessage && (
        <div
          className={`p-4 rounded-xl border ${
            submitMessage.includes('✅')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          } animate-fade-in-up`}
        >
          <div className='flex items-center'>
            <span className='mr-2'>
              {submitMessage.includes('✅') ? '✅' : '❌'}
            </span>
            <span className='font-medium'>
              {submitMessage.replace(/[✅❌]\s*/, '')}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        <div className='bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl p-8'>
          {/* Leave Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='group'>
              <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors'>
                Leave Type *
              </label>
              <select
                {...register('leaveType', {
                  required: 'Leave type is required',
                })}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
              >
                <option value=''>Select Leave Type</option>
                <option value='sick'>Sick Leave</option>
                <option value='personal'>Personal Leave</option>
                <option value='family'>Family Emergency</option>
                <option value='medical'>Medical Leave</option>
                <option value='emergency'>Emergency Leave</option>
                <option value='other'>Other</option>
              </select>
              {errors.leaveType && (
                <p className='text-red-500 text-sm mt-2 flex items-center'>
                  <span className='mr-1'>⚠️</span>
                  {errors.leaveType.message}
                </p>
              )}
            </div>

            <div className='group'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Emergency Leave
              </label>
              <div className='flex items-center p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 transition-all duration-200 group-hover:shadow-md'>
                <input
                  type='checkbox'
                  {...register('isEmergency')}
                  className='h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200'
                />
                <label className='ml-3 text-sm font-medium text-gray-700'>
                  This is an emergency leave
                </label>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='group'>
              <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors'>
                Start Date *
              </label>
              <input
                type='date'
                {...register('startDate', {
                  required: 'Start date is required',
                })}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
              />
              {errors.startDate && (
                <p className='text-red-500 text-sm mt-2 flex items-center'>
                  <span className='mr-1'>⚠️</span>
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className='group'>
              <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors'>
                End Date *
              </label>
              <input
                type='date'
                {...register('endDate', { required: 'End date is required' })}
                min={watchDates?.[0] || new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
              />
              {errors.endDate && (
                <p className='text-red-500 text-sm mt-2 flex items-center'>
                  <span className='mr-1'>⚠️</span>
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className='mb-8 group'>
            <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors'>
              Reason for Leave *
            </label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={4}
              placeholder='Please provide a detailed reason for your leave request...'
              className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none group-hover:shadow-md'
            />
            {errors.reason && (
              <p className='text-red-500 text-sm mt-2 flex items-center'>
                <span className='mr-1'>⚠️</span>
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Emergency Contact (Conditional) */}
          {watchLeaveType &&
            ['sick', 'medical', 'family', 'emergency'].includes(
              watchLeaveType
            ) && (
              <div className='mb-8'>
                <div className='flex items-center mb-6'>
                  <div className='h-8 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                    📞
                  </div>
                  <h3 className='text-xl font-bold text-gray-900'>
                    Emergency Contact Information
                  </h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors'>
                      Contact Name
                    </label>
                    <input
                      type='text'
                      {...register('emergencyContactName')}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
                      placeholder='Full name'
                    />
                  </div>

                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors'>
                      Relationship
                    </label>
                    <select
                      {...register('emergencyContactRelationship')}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
                    >
                      <option value=''>Select relationship</option>
                      <option value='parent'>Parent</option>
                      <option value='guardian'>Guardian</option>
                      <option value='sibling'>Sibling</option>
                      <option value='spouse'>Spouse</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-red-600 transition-colors'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      {...register('emergencyContactPhone')}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white group-hover:shadow-md'
                      placeholder='+91 XXXXXXXXXX'
                    />
                  </div>
                </div>
              </div>
            )}

          {/* File Upload */}
          <div className='mb-8'>
            <label className='block text-sm font-semibold text-gray-700 mb-4'>
              Supporting Documents
            </label>
            <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors bg-gray-50 hover:bg-white'>
              <input
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                onChange={handleFileChange}
                className='hidden'
                id='documents'
              />
              <label htmlFor='documents' className='cursor-pointer'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='mx-auto h-16 w-16'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                </div>
                <p className='text-lg text-gray-600 mb-2'>
                  <span className='font-semibold text-orange-600 hover:text-orange-700 transition-colors'>
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className='text-sm text-gray-500'>
                  PDF, DOC, JPG, PNG up to 5MB each
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className='mt-6'>
                <h4 className='text-sm font-semibold text-gray-700 mb-4'>
                  Selected files:
                </h4>
                <div className='space-y-3'>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200'
                    >
                      <div className='flex items-center'>
                        <div className='text-2xl mr-3'>📄</div>
                        <span className='text-sm font-medium text-gray-700 truncate'>
                          {file.name}
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile(index)}
                        className='text-red-500 hover:text-red-700 focus:outline-none p-2 hover:bg-red-50 rounded-lg transition-all duration-200'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => {
                reset()
                setFiles([])
              }}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold'
            >
              Clear Form
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transform hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-2'
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>🏖️</span>
                  <span>Submit Leave Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LeaveRequestForm
