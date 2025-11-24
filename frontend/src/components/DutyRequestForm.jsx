import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { dutyRequestAPI, getCurrentUser } from '../services/api'
import { XCircle, CheckCircle, RotateCcw, Send, Upload, FileText, Calendar, MapPin, User, Building, AlertCircle } from 'lucide-react'

const ComprehensiveDutyRequestForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [files, setFiles] = useState({
    invitation: null,
    permissionLetter: null,
    travelProof: null,
    additionalDocs: [],
  })
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const watchDates = watch(['startDate', 'endDate'])

  const onSubmit = async data => {
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Validate required files
      if (!files.invitation) {
        setSubmitMessage(
          'Please upload an invitation/brochure/circular document.'
        )
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()

      // Prepare request data
      const requestData = {
        studentInfo: {
          fullName: data.fullName,
          registerNumber: data.registerNumber,
          department: data.department,
          year: data.year,
          section: data.section,
        },
        eventDetails: {
          reasonType: data.reasonType,
          eventTitle: data.eventTitle,
          eventTheme: data.eventTheme || '',
          venue: {
            institutionName: data.institutionName,
            city: data.city,
            address: data.address || '',
          },
          dateRange: {
            startDate: data.startDate,
            endDate: data.endDate,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          },
          organizer: {
            name: data.organizerName,
            type: data.organizerType,
            contactInfo: data.organizerContact || '',
          },
        },
        academicDetails: {
          subjectsMissed: data.subjectsMissed || [],
          undertaking:
            data.undertaking ||
            'I undertake to compensate for all missed classes/labs and complete any assignments given during my absence.',
        },
      }

      formData.append('requestData', JSON.stringify(requestData))

      // Append files
      if (files.invitation) {
        formData.append('invitation', files.invitation)
      }
      if (files.permissionLetter) {
        formData.append('permissionLetter', files.permissionLetter)
      }
      if (files.travelProof) {
        formData.append('travelProof', files.travelProof)
      }
      if (files.additionalDocs.length > 0) {
        files.additionalDocs.forEach(file => {
          formData.append('additionalDocs', file)
        })
      }

      await dutyRequestAPI.create(formData)
      setSubmitMessage(
        'Request submitted successfully! Your request is now under review.'
      )
      reset()
      setFiles({
        invitation: null,
        permissionLetter: null,
        travelProof: null,
        additionalDocs: [],
      })
    } catch (error) {
      console.error('Error submitting request:', error)

      let errorMessage = 'Error submitting request. Please try again.'

      if (error.response?.data?.message) {
        errorMessage = `${error.response.data.message}`
      } else if (error.response?.data?.errors) {
        const errors = Array.isArray(error.response.data.errors)
          ? error.response.data.errors
          : error.response.data.errors.map(err => err.msg || err)
        errorMessage = `Validation errors:\n• ${errors.join('\n• ')}`
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check all required fields and try again.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.'
      }

      setSubmitMessage(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (fieldName, file) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: file,
    }))
  }

  const handleMultipleFileChange = files => {
    setFiles(prev => ({
      ...prev,
      additionalDocs: Array.from(files),
    }))
  }

  if (!user || user.role !== 'student') {
    return (
      <div className='text-center p-8'>
        <p className='text-destructive'>
          Access denied. Only students can submit duty requests.
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-8'>
        <p className='text-muted-foreground'>
          Complete all sections accurately. Incomplete forms will be rejected.
        </p>
      </div>

      {submitMessage && (
        <div
          className={`p-4 rounded-lg mb-6 flex items-start space-x-3 border ${
            submitMessage.includes('Error') || submitMessage.includes('error') || submitMessage.includes('failed') 
              ? 'bg-destructive/10 text-destructive border-destructive/20' 
              : 'bg-green-500/10 text-green-600 border-green-500/20'
          }`}
        >
          {submitMessage.includes('Error') || submitMessage.includes('error') || submitMessage.includes('failed') ? (
            <XCircle size={20} className="flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{submitMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        {/* Core Student Information */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <User className="text-primary w-5 h-5" />
            <h3 className='text-lg font-semibold text-foreground'>
              1. Core Student Information
            </h3>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Full Name (as per college records) *
              </label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type='text'
                defaultValue={user?.profile?.fullName}
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                placeholder='Enter your full name'
              />
              {errors.fullName && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Register/Roll Number *
              </label>
              <input
                {...register('registerNumber', {
                  required: 'Register number is required',
                })}
                type='text'
                defaultValue={user?.profile?.registerNumber}
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                placeholder='e.g., 21CS001'
              />
              {errors.registerNumber && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.registerNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Department & Year *
              </label>
              <div className='grid grid-cols-2 gap-2'>
                <select
                  {...register('department', {
                    required: 'Department is required',
                  })}
                  defaultValue={user?.profile?.department}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors text-sm'
                >
                  <option value=''>Dept</option>
                  <option value='CSE'>CSE</option>
                  <option value='ECE'>ECE</option>
                  <option value='EEE'>EEE</option>
                  <option value='MECH'>MECH</option>
                  <option value='CIVIL'>CIVIL</option>
                  <option value='IT'>IT</option>
                </select>
                <select
                  {...register('year', { required: 'Year is required' })}
                  defaultValue={user?.profile?.year}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors text-sm'
                >
                  <option value=''>Year</option>
                  <option value='1st Year'>1st</option>
                  <option value='2nd Year'>2nd</option>
                  <option value='3rd Year'>3rd</option>
                  <option value='4th Year'>4th</option>
                </select>
              </div>
              {(errors.department || errors.year) && (
                <p className='text-destructive text-xs mt-1'>
                  Department and year required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Section/Class *
              </label>
              <select
                {...register('section', { required: 'Section is required' })}
                defaultValue={user?.profile?.section}
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
              >
                <option value=''>Select section</option>
                <option value='A'>Section A</option>
                <option value='B'>Section B</option>
                <option value='C'>Section C</option>
                <option value='D'>Section D</option>
              </select>
              {errors.section && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.section.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event/Reason Details */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <Calendar className="text-primary w-5 h-5" />
            <h3 className='text-lg font-semibold text-foreground'>
              2. Event/Reason Details
            </h3>
          </div>

          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Reason for OD *
                </label>
                <select
                  {...register('reasonType', {
                    required: 'Reason type is required',
                  })}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                >
                  <option value=''>Select reason</option>
                  <option value='seminar'>Seminar</option>
                  <option value='workshop'>Workshop</option>
                  <option value='symposium'>Symposium</option>
                  <option value='internship'>Internship</option>
                  <option value='hackathon'>Hackathon</option>
                  <option value='placement_drive'>Placement Drive</option>
                  <option value='cultural'>Cultural Event</option>
                  <option value='sports'>Sports Event</option>
                  <option value='medical'>Medical</option>
                  <option value='conference'>Conference</option>
                  <option value='competition'>Competition</option>
                  <option value='training'>Training Program</option>
                  <option value='other'>Other</option>
                </select>
                {errors.reasonType && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.reasonType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Event Title & Theme *
                </label>
                <input
                  {...register('eventTitle', {
                    required: 'Event title is required',
                  })}
                  type='text'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder="Official event name"
                />
                {errors.eventTitle && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.eventTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Event Theme/Description
              </label>
              <input
                {...register('eventTheme')}
                type='text'
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                placeholder='Brief description of the event theme'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Institution/Venue Name *
                </label>
                <input
                  {...register('institutionName', {
                    required: 'Institution name is required',
                  })}
                  type='text'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder='College/Company/Organization name'
                />
                {errors.institutionName && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.institutionName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type='text'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder='Event city'
                />
                {errors.city && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Complete Address
              </label>
              <textarea
                {...register('address')}
                rows='2'
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                placeholder='Full venue address'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Start Date *
                </label>
                <input
                  {...register('startDate', {
                    required: 'Start date is required',
                  })}
                  type='date'
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.startDate && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  End Date *
                </label>
                <input
                  {...register('endDate', { required: 'End date is required' })}
                  type='date'
                  min={
                    watchDates?.[0] || new Date().toISOString().split('T')[0]
                  }
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
                {errors.endDate && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Start Time
                </label>
                <input
                  {...register('startTime')}
                  type='time'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  End Time
                </label>
                <input
                  {...register('endTime')}
                  type='time'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Organizer Name *
                </label>
                <input
                  {...register('organizerName', {
                    required: 'Organizer name is required',
                  })}
                  type='text'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder='Organizing body'
                />
                {errors.organizerName && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.organizerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Organizer Type *
                </label>
                <select
                  {...register('organizerType', {
                    required: 'Organizer type is required',
                  })}
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                >
                  <option value=''>Select type</option>
                  <option value='college'>College/University</option>
                  <option value='company'>Company/Corporate</option>
                  <option value='club'>Club/Society</option>
                  <option value='organization'>NGO/Organization</option>
                </select>
                {errors.organizerType && (
                  <p className='text-destructive text-xs mt-1'>
                    {errors.organizerType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className='text-sm font-medium text-foreground'>
                  Contact Information
                </label>
                <input
                  {...register('organizerContact')}
                  type='text'
                  className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder='Phone/Email'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Compliance */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <Building className="text-primary w-5 h-5" />
            <h3 className='text-lg font-semibold text-foreground'>
              3. Academic Compliance
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Subjects/Classes That Will Be Missed
              </label>
              <textarea
                {...register('subjectsMissed')}
                rows='3'
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                placeholder='List subjects, faculty names, dates, and time slots'
              />
              <p className='text-xs text-muted-foreground'>
                Format: Subject Name - Faculty Name - Date - Time Slot
              </p>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Student Undertaking *
              </label>
              <textarea
                {...register('undertaking', {
                  required: 'Undertaking is required',
                })}
                rows='3'
                defaultValue='I undertake to compensate for all missed classes/labs and complete any assignments given during my absence. I will coordinate with respective faculty members and classmates to cover the missed content.'
                className='w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input transition-colors'
              />
              {errors.undertaking && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.undertaking.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Supporting Documents */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <FileText className="text-primary w-5 h-5" />
            <h3 className='text-lg font-semibold text-foreground'>
              4. Supporting Documents
            </h3>
          </div>

          <div className='space-y-6'>
            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Invitation/Brochure/Circular * (Required)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={e =>
                    handleFileChange('invitation', e.target.files[0])
                  }
                  className='w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
                  required
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Upload official invitation or event brochure (PDF/Image, Max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Permission Letter/Nomination Letter
              </label>
              <input
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={e =>
                  handleFileChange('permissionLetter', e.target.files[0])
                }
                className='w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
              />
              <p className='text-xs text-muted-foreground'>
                If external participation (PDF/DOCX, Max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Travel Proof (Tickets/Booking)
              </label>
              <input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={e =>
                  handleFileChange('travelProof', e.target.files[0])
                }
                className='w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
              />
              <p className='text-xs text-muted-foreground'>
                If travel is required (PDF/Image, Max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-foreground'>
                Additional Documents
              </label>
              <input
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                onChange={e => handleMultipleFileChange(e.target.files)}
                className='w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
              />
              <p className='text-xs text-muted-foreground'>
                Any additional supporting documents (Max 5 files, 10MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Student Declaration */}
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <AlertCircle className="text-primary w-5 h-5" />
            <h3 className='text-lg font-semibold text-foreground'>
              5. Student Declaration
            </h3>
          </div>

          <div className='space-y-4'>
            <div className='flex items-start space-x-3'>
              <input
                {...register('declaration', {
                  required: 'Declaration is required',
                })}
                type='checkbox'
                className='mt-1 w-4 h-4 rounded border-input text-primary focus:ring-primary'
              />
              <label className='text-sm text-muted-foreground'>
                I hereby declare that all the information provided is true and
                correct. I understand that any false information may lead to
                rejection of my application and disciplinary action. I commit to
                maintaining good conduct during the OD period and representing
                the institution positively.
              </label>
            </div>
            {errors.declaration && (
              <p className='text-destructive text-xs mt-1'>
                Declaration acceptance is required
              </p>
            )}

            <div className='bg-primary/10 p-4 rounded-lg border border-primary/20'>
              <p className='text-sm font-medium text-primary'>
                <strong>Note:</strong> Submit this form at least 3-5 working
                days before the event. Emergency requests may not be processed.
                Keep copies of all submitted documents for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm'
          >
            {isSubmitting ? (
              <>
                <RotateCcw size={18} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit OD Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ComprehensiveDutyRequestForm
