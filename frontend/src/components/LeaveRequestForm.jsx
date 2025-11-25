import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getCurrentUser } from '../services/api'
import config from '../config/config.js'
import { 
  Calendar, 
  FileText, 
  Phone, 
  User, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  RotateCcw,
  Palmtree
} from 'lucide-react'

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

      const userToken = localStorage.getItem('userToken')
      const response = await fetch(config.api.leaveRequests, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage('Leave request submitted successfully!')
        reset()
        setFiles([])
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setSubmitMessage(
          `Failed to submit leave request: ${result.message || 'Unknown error'}`
        )
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.')
      console.error('Leave request submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'student') {
    return (
      <div className='text-center p-8 bg-card rounded-xl border border-border'>
        <div className='flex justify-center mb-4'>
          <AlertCircle size={48} className="text-destructive" />
        </div>
        <p className='text-destructive font-semibold text-lg'>
          Access denied. Only students can submit leave requests.
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      {/* Header */}
      <div className='bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
            <Palmtree size={24} />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>Submit Leave Request</h2>
            <p className='text-muted-foreground'>
              Fill out the form below to request leave
            </p>
          </div>
        </div>

        {totalDays > 0 && (
          <div className='bg-muted/50 rounded-lg p-4 border border-border'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-foreground'>Total Days Requested:</span>
              <span className='text-xl font-bold text-primary'>{totalDays} days</span>
            </div>
          </div>
        )}
      </div>

      {submitMessage && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            submitMessage.includes('success')
              ? 'bg-green-500/10 border-green-500/20 text-green-600'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {submitMessage.includes('success') ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className='font-medium'>{submitMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        <div className='bg-card border border-border rounded-xl shadow-sm p-6 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
          {/* Leave Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Leave Type *
              </label>
              <select
                {...register('leaveType', {
                  required: 'Leave type is required',
                })}
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
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
                <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.leaveType.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Emergency Leave
              </label>
              <div className='flex items-center p-3 bg-background rounded-md border border-input'>
                <input
                  type='checkbox'
                  {...register('isEmergency')}
                  className='h-4 w-4 rounded border-input text-primary focus:ring-primary'
                />
                <label className='ml-3 text-sm font-medium text-foreground'>
                  This is an emergency leave
                </label>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Start Date *
              </label>
              <div className="relative">
                <input
                  type='date'
                  {...register('startDate', {
                    required: 'Start date is required',
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
              </div>
              {errors.startDate && (
                <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                End Date *
              </label>
              <div className="relative">
                <input
                  type='date'
                  {...register('endDate', { required: 'End date is required' })}
                  min={watchDates?.[0] || new Date().toISOString().split('T')[0]}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
              </div>
              {errors.endDate && (
                <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className='mb-8 space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Reason for Leave *
            </label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={4}
              placeholder='Please provide a detailed reason for your leave request...'
              className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors resize-none'
            />
            {errors.reason && (
              <p className='text-destructive text-xs mt-1 flex items-center gap-1'>
                <AlertCircle size={12} />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Emergency Contact (Conditional) */}
          {watchLeaveType &&
            ['sick', 'medical', 'family', 'emergency'].includes(
              watchLeaveType
            ) && (
              <div className='mb-8 bg-muted/30 p-6 rounded-lg border border-border'>
                <div className='flex items-center gap-2 mb-6 pb-2 border-b border-border'>
                  <Phone className="text-primary w-5 h-5" />
                  <h3 className='text-lg font-semibold text-foreground'>
                    Emergency Contact Information
                  </h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                      Contact Name
                    </label>
                    <input
                      type='text'
                      {...register('emergencyContactName')}
                      className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                      placeholder='Full name'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                      Relationship
                    </label>
                    <select
                      {...register('emergencyContactRelationship')}
                      className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                    >
                      <option value=''>Select relationship</option>
                      <option value='parent'>Parent</option>
                      <option value='guardian'>Guardian</option>
                      <option value='sibling'>Sibling</option>
                      <option value='spouse'>Spouse</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      {...register('emergencyContactPhone')}
                      className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                      placeholder='+91 XXXXXXXXXX'
                    />
                  </div>
                </div>
              </div>
            )}

          {/* File Upload */}
          <div className='mb-8'>
            <label className='text-sm font-medium text-foreground mb-4 block'>
              Supporting Documents
            </label>
            <div className='border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/20 transition-all duration-300 bg-muted/10 cursor-pointer'>
              <input
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                onChange={handleFileChange}
                className='hidden'
                id='documents'
              />
              <label htmlFor='documents' className='cursor-pointer flex flex-col items-center'>
                <div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
                  <Upload className="text-primary w-6 h-6" />
                </div>
                <p className='text-base font-medium text-foreground mb-1'>
                  <span className='text-primary hover:underline'>
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className='text-xs text-muted-foreground'>
                  PDF, DOC, JPG, PNG up to 5MB each
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className='mt-6'>
                <h4 className='text-sm font-medium text-foreground mb-3'>
                  Selected files:
                </h4>
                <div className='space-y-2'>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-background rounded-lg border border-border'
                    >
                      <div className='flex items-center gap-3'>
                        <FileText className="text-muted-foreground w-4 h-4" />
                        <span className='text-sm text-foreground truncate max-w-[200px] sm:max-w-xs'>
                          {file.name}
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile(index)}
                        className='text-muted-foreground hover:text-destructive transition-colors'
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-4 pt-6 border-t border-border'>
            <button
              type='button'
              onClick={() => {
                reset()
                setFiles([])
              }}
              className='px-6 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted transition-all duration-300 font-medium text-sm hover:scale-105 active:scale-95'
            >
              Clear Form
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
            >
              {isSubmitting ? (
                <>
                  <RotateCcw size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} className='group-hover:translate-x-0.5 transition-transform duration-300' />
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
