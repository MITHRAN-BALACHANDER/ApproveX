import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Lock, 
  FileText, 
  Target, 
  BookOpen, 
  Paperclip, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Eye,
  Scale,
  Zap,
  AlertTriangle,
  User
} from 'lucide-react'
import ChangePassword from './ChangePassword'

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('od-requests')
  const [requests, setRequests] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [error, setError] = useState('')
  const [leaveError, setLeaveError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [leaveReviewModal, setLeaveReviewModal] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    remarks: '',
  })
  const [leaveReviewData, setLeaveReviewData] = useState({
    approvalType: 'classTeacher',
    status: '',
    remarks: '',
  })
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [showLeaveDetailedView, setShowLeaveDetailedView] = useState(false)
  const navigate = useNavigate()

  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}')
  const teacherToken = localStorage.getItem('teacherToken')

  useEffect(() => {
    if (!teacherToken) {
      navigate('/teacher/login')
      return
    }
    fetchRequests()
    fetchLeaveRequests()
  }, [teacherToken, navigate])

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/teacher/requests',
        {
          headers: {
            Authorization: `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      } else {
        setError('Failed to fetch requests')
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/leave-requests/pending/approvals?level=classTeacher',
        {
          headers: {
            Authorization: `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.pendingRequests || [])
      } else {
        setLeaveError('Failed to fetch leave requests')
      }
    } catch (error) {
      setLeaveError('Network error occurred')
      console.error('Error fetching leave requests:', error)
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleReviewRequest = request => {
    setSelectedRequest(request)
    setReviewData({
      status: '',
      remarks: '',
    })
    setShowDetailedView(true)
  }

  const handleCloseDetailedView = () => {
    setShowDetailedView(false)
    setReviewModal(false)
    setSelectedRequest(null)
  }

  const handleProceedToReview = () => {
    setShowDetailedView(false)
    setReviewModal(true)
  }

  const submitReview = async () => {
    try {
      console.log('Submitting review with data:', {
        action: reviewData.status,
        remarks: reviewData.remarks,
      })

      const response = await fetch(
        `http://localhost:5000/api/teacher/requests/${selectedRequest._id}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewData.status, // 'approved' or 'rejected'
            remarks: reviewData.remarks,
          }),
        }
      )

      console.log('Review response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Review submitted successfully:', result)
        setReviewModal(false)
        setShowDetailedView(false)
        setSelectedRequest(null)
        setReviewData({
          status: '',
          remarks: '',
        })
        fetchRequests() // Refresh the list
        alert('Review submitted successfully!')
      } else {
        const error = await response.json()
        console.log('Review error:', error)
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Network error submitting review:', error)
      alert('Network error occurred. Please check your connection.')
    }
  }

  // Leave Request Functions
  const handleReviewLeaveRequest = request => {
    setSelectedLeaveRequest(request)
    setLeaveReviewData({
      approvalType: 'classTeacher',
      status: '',
      remarks: '',
    })
    setShowLeaveDetailedView(true)
  }

  const handleCloseLeaveDetailedView = () => {
    setShowLeaveDetailedView(false)
    setLeaveReviewModal(false)
    setSelectedLeaveRequest(null)
  }

  const handleProceedToLeaveReview = () => {
    setShowLeaveDetailedView(false)
    setLeaveReviewModal(true)
  }

  const submitLeaveReview = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/leave-requests/${selectedLeaveRequest._id}/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approvalType: leaveReviewData.approvalType,
            status: leaveReviewData.status,
            remarks: leaveReviewData.remarks,
          }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        setLeaveReviewModal(false)
        setShowLeaveDetailedView(false)
        setSelectedLeaveRequest(null)
        setLeaveReviewData({
          approvalType: 'classTeacher',
          status: '',
          remarks: '',
        })
        fetchLeaveRequests() // Refresh the list
        alert('Leave request review submitted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Network error submitting leave review:', error)
      alert('Network error occurred. Please check your connection.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('teacherInfo')
    navigate('/teacher/login')
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Teacher Dashboard
              </h1>
              <p className='text-gray-600'>
                Welcome, {teacherInfo.firstName} {teacherInfo.lastName}
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2'
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
              <button
                onClick={handleLogout}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
              <p className='text-red-800'>{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {requests.length}
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Total Requests
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {requests.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {
                          requests.filter(
                            r =>
                              r.overallStatus === 'pending' ||
                              r.overallStatus === 'under_review' ||
                              r.overallStatus === 'submitted'
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Pending Review
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {
                          requests.filter(
                            r =>
                              r.overallStatus === 'pending' ||
                              r.overallStatus === 'under_review' ||
                              r.overallStatus === 'submitted'
                          ).length
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {
                          requests.filter(r => r.overallStatus === 'approved')
                            .length
                        }
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Approved
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {
                          requests.filter(r => r.overallStatus === 'approved')
                            .length
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                OD Requests for Review
              </h3>
              <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                Review and approve/reject student on-duty requests
              </p>
            </div>
            <ul className='divide-y divide-gray-200'>
              {requests.length === 0 ? (
                <li className='px-4 py-4 text-center text-gray-500'>
                  No requests available for review
                </li>
              ) : (
                requests.map(request => (
                  <li key={request._id} className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              request.overallStatus === 'pending' ||
                              request.overallStatus === 'under_review' ||
                              request.overallStatus === 'submitted'
                                ? 'bg-yellow-400'
                                : request.overallStatus === 'approved'
                                  ? 'bg-green-400'
                                  : request.overallStatus === 'rejected'
                                    ? 'bg-red-400'
                                    : 'bg-gray-400'
                            }`}
                          ></div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {request.studentInfo?.fullName ||
                              request.studentId?.profile?.fullName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {request.studentInfo?.email ||
                              request.studentId?.email}{' '}
                            • {request.studentInfo?.registerNumber}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {request.eventDetails?.eventTitle} •{' '}
                            {new Date(
                              request.eventDetails?.dateRange?.startDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.overallStatus === 'pending' ||
                            request.overallStatus === 'under_review' ||
                            request.overallStatus === 'submitted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.overallStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : request.overallStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {(() => {
                            const status = request.overallStatus || 'unknown'
                            if (status === 'under_review') return 'Under Review'
                            if (status === 'submitted') return 'Awaiting Review'
                            return (
                              status.charAt(0).toUpperCase() +
                              status.slice(1).replace('_', ' ')
                            )
                          })()}
                        </span>
                        {(request.overallStatus === 'pending' ||
                          request.overallStatus === 'under_review' ||
                          request.overallStatus === 'submitted') && (
                          <button
                            onClick={() => handleReviewRequest(request)}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1'
                          >
                            <FileText size={14} />
                            <span>Review Application</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Application View Modal */}
      {showDetailedView && selectedRequest && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-4 mx-auto p-6 border max-w-4xl shadow-lg rounded-md bg-white mb-8'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl font-bold text-gray-900 flex items-center space-x-2'>
                <FileText size={24} />
                <span>Review Application Details</span>
              </h3>
              <button
                onClick={handleCloseDetailedView}
                className='text-gray-500 hover:text-gray-700 text-2xl'
              >
                ✕
              </button>
            </div>

            <div className='space-y-6'>
              {/* Student Information */}
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2'>
                  <User size={18} />
                  <span>Student Information</span>
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p>
                      <strong>Full Name:</strong>{' '}
                      {selectedRequest.studentInfo?.fullName ||
                        selectedRequest.studentId?.profile?.fullName}
                    </p>
                    <p>
                      <strong>Register Number:</strong>{' '}
                      {selectedRequest.studentInfo?.registerNumber}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {selectedRequest.studentInfo?.email ||
                        selectedRequest.studentId?.email}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Department:</strong>{' '}
                      {selectedRequest.studentInfo?.department}
                    </p>
                    <p>
                      <strong>Year:</strong> {selectedRequest.studentInfo?.year}
                    </p>
                    <p>
                      <strong>Section:</strong>{' '}
                      {selectedRequest.studentInfo?.section}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className='bg-green-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-green-900 mb-3 flex items-center space-x-2'>
                  <Target size={18} />
                  <span>Event Details</span>
                </h4>
                <div className='space-y-3 text-sm'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p>
                        <strong>Event Title:</strong>{' '}
                        {selectedRequest.eventDetails?.eventTitle}
                      </p>
                      <p>
                        <strong>Event Type:</strong>{' '}
                        {selectedRequest.eventDetails?.reasonType?.toUpperCase()}
                      </p>
                      <p>
                        <strong>Event Theme:</strong>{' '}
                        {selectedRequest.eventDetails?.eventTheme || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Institution:</strong>{' '}
                        {selectedRequest.eventDetails?.venue?.institutionName}
                      </p>
                      <p>
                        <strong>City:</strong>{' '}
                        {selectedRequest.eventDetails?.venue?.city}
                      </p>
                      <p>
                        <strong>Address:</strong>{' '}
                        {selectedRequest.eventDetails?.venue?.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p>
                        <strong>Start Date:</strong>{' '}
                        {new Date(
                          selectedRequest.eventDetails?.dateRange?.startDate
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>End Date:</strong>{' '}
                        {new Date(
                          selectedRequest.eventDetails?.dateRange?.endDate
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Duration:</strong>{' '}
                        {Math.ceil(
                          (new Date(
                            selectedRequest.eventDetails?.dateRange?.endDate
                          ) -
                            new Date(
                              selectedRequest.eventDetails?.dateRange?.startDate
                            )) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{' '}
                        days
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Start Time:</strong>{' '}
                        {selectedRequest.eventDetails?.dateRange?.startTime ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>End Time:</strong>{' '}
                        {selectedRequest.eventDetails?.dateRange?.endTime ||
                          'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p>
                      <strong>Organizer:</strong>{' '}
                      {selectedRequest.eventDetails?.organizer?.name}
                    </p>
                    <p>
                      <strong>Organizer Type:</strong>{' '}
                      {selectedRequest.eventDetails?.organizer?.type?.toUpperCase()}
                    </p>
                    <p>
                      <strong>Contact Info:</strong>{' '}
                      {selectedRequest.eventDetails?.organizer?.contactInfo ||
                        'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className='bg-yellow-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-yellow-900 mb-3 flex items-center space-x-2'>
                  <BookOpen size={18} />
                  <span>Academic Impact</span>
                </h4>
                <div className='space-y-3 text-sm'>
                  <div>
                    <p>
                      <strong>Classes/Subjects to be Missed:</strong>
                    </p>
                    <div className='bg-white p-3 rounded border mt-2'>
                      {selectedRequest.academicDetails?.subjectsMissed?.length >
                      0 ? (
                        selectedRequest.academicDetails.subjectsMissed.map(
                          (subject, index) => (
                            <div
                              key={index}
                              className='mb-2 pb-2 border-b border-gray-200 last:border-b-0'
                            >
                              <p>
                                <strong>{subject.subjectName}</strong> -{' '}
                                {subject.facultyName}
                              </p>
                              <p className='text-xs text-gray-600'>
                                {new Date(subject.date).toLocaleDateString()} |{' '}
                                {subject.timeSlot} |{' '}
                                {subject.classType?.toUpperCase()}
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p className='text-gray-600'>
                          No specific subjects mentioned
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p>
                      <strong>Student Undertaking:</strong>
                    </p>
                    <div className='bg-white p-3 rounded border mt-2'>
                      <p className='text-xs'>
                        {selectedRequest.academicDetails?.undertaking}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className='bg-purple-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-purple-900 mb-3 flex items-center space-x-2'>
                  <Paperclip size={18} />
                  <span>Supporting Documents</span>
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p>
                        <strong>Invitation/Brochure:</strong>
                        <span
                          className={`flex items-center space-x-1 ${
                            selectedRequest.documents?.invitation
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {selectedRequest.documents?.invitation ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Uploaded</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              <span>Missing</span>
                            </>
                          )}
                        </span>
                      </p>
                      <p>
                        <strong>Permission Letter:</strong>
                        <span
                          className={`flex items-center space-x-1 ${
                            selectedRequest.documents?.permissionLetter
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {selectedRequest.documents?.permissionLetter ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Uploaded</span>
                            </>
                          ) : (
                            <span>Optional</span>
                          )}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Travel Proof:</strong>
                        <span
                          className={`flex items-center space-x-1 ${
                            selectedRequest.documents?.travelProof
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {selectedRequest.documents?.travelProof ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Uploaded</span>
                            </>
                          ) : (
                            <span>Optional</span>
                          )}
                        </span>
                      </p>
                      <p>
                        <strong>Additional Docs:</strong>
                        <span className='text-blue-600'>
                          {selectedRequest.documents?.additionalDocs?.length ||
                            0}{' '}
                          files
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Approval Status */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2'>
                  <Zap size={18} />
                  <span>Approval Status</span>
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='text-center'>
                    <div className='text-center'>
                      <p className='font-semibold'>Current Status</p>
                      <span
                        className={`inline-block px-3 py-2 rounded text-sm font-medium ${
                          selectedRequest.approval?.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : selectedRequest.approval?.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedRequest.approval?.status?.toUpperCase() ||
                          'PENDING REVIEW'}
                      </span>
                    </div>

                    {selectedRequest.approval?.status !== 'pending' && (
                      <div className='mt-3 text-center'>
                        <p>
                          <strong>Reviewed by:</strong>{' '}
                          {selectedRequest.approval?.teacherName}
                        </p>
                        <p>
                          <strong>Designation:</strong>{' '}
                          {selectedRequest.approval?.teacherDesignation}
                        </p>
                        <p>
                          <strong>Department:</strong>{' '}
                          {selectedRequest.approval?.teacherDepartment}
                        </p>
                        <p>
                          <strong>Date:</strong>{' '}
                          {new Date(
                            selectedRequest.approval?.approvedAt
                          ).toLocaleString()}
                        </p>
                        {selectedRequest.approval?.remarks && (
                          <p>
                            <strong>Remarks:</strong>{' '}
                            {selectedRequest.approval.remarks}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className='mt-3 text-center'>
                    <p>
                      <strong>Overall Status:</strong>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedRequest.overallStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : selectedRequest.overallStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : selectedRequest.overallStatus === 'under_review'
                                ? 'bg-blue-100 text-blue-800'
                                : selectedRequest.overallStatus === 'submitted'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {(() => {
                          const status =
                            selectedRequest.overallStatus || 'pending'
                          if (status === 'under_review') return 'UNDER REVIEW'
                          if (status === 'submitted') return 'AWAITING REVIEW'
                          return status.toUpperCase().replace('_', ' ')
                        })()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Timeline */}
              <div className='bg-indigo-50 p-4 rounded-lg'>
                <h4 className='text-lg font-semibold text-indigo-900 mb-3 flex items-center space-x-2'>
                  <Clock size={18} />
                  <span>Application Timeline</span>
                </h4>
                <div className='space-y-2 text-sm'>
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {new Date(selectedRequest.submittedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                  {selectedRequest.approval?.approvedAt && (
                    <p>
                      <strong>Reviewed:</strong>{' '}
                      {new Date(
                        selectedRequest.approval.approvedAt
                      ).toLocaleString()}
                    </p>
                  )}
                  {selectedRequest.approvalHistory?.length > 0 && (
                    <div className='mt-3'>
                      <p>
                        <strong>Review History:</strong>
                      </p>
                      {selectedRequest.approvalHistory.map((history, index) => (
                        <div
                          key={index}
                          className='ml-2 mt-1 text-xs bg-white p-2 rounded border'
                        >
                          <p>
                            <strong>{history.reviewerName}</strong> (
                            {history.reviewerDesignation})
                          </p>
                          <p>
                            {history.action.toUpperCase()} on{' '}
                            {new Date(history.reviewedAt).toLocaleString()}
                          </p>
                          {history.remarks && <p>Remarks: {history.remarks}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center space-x-4 mt-6 pt-4 border-t'>
              {(selectedRequest.overallStatus === 'pending' ||
                selectedRequest.overallStatus === 'under_review' ||
                selectedRequest.overallStatus === 'submitted') && (
                <button
                  onClick={handleProceedToReview}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2'
                >
                  <Search size={18} />
                  <span>Proceed to Review & Approve/Reject</span>
                </button>
              )}
              <button
                onClick={handleCloseDetailedView}
                className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2'
              >
                <Eye size={18} />
                <span>Close Application View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && selectedRequest && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <h3 className='text-lg font-medium text-gray-900 text-center mb-4 flex items-center justify-center space-x-2'>
                <Scale size={20} />
                <span>Submit Review Decision</span>
              </h3>

              <div className='mb-4 bg-blue-50 p-3 rounded'>
                <p className='text-sm text-blue-800'>
                  <strong>Application:</strong>{' '}
                  {selectedRequest.eventDetails?.eventTitle}
                </p>
                <p className='text-sm text-blue-600'>
                  Student:{' '}
                  {selectedRequest.studentInfo?.fullName ||
                    selectedRequest.studentId?.profile?.fullName}
                </p>
                <p className='text-sm text-green-600 flex items-center space-x-1'>
                  <CheckCircle size={14} />
                  <strong>
                    One approval from any teacher/staff is sufficient
                  </strong>
                </p>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Decision *
                </label>
                <select
                  value={reviewData.status}
                  onChange={e =>
                    setReviewData({ ...reviewData, status: e.target.value })
                  }
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                  required
                >
                  <option value=''>Select Decision</option>
                  <option value='approved'>Approve Request</option>
                  <option value='rejected'>Reject Request</option>
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Remarks
                </label>
                <textarea
                  value={reviewData.remarks}
                  onChange={e =>
                    setReviewData({ ...reviewData, remarks: e.target.value })
                  }
                  rows='3'
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                  placeholder='Add your comments...'
                />
              </div>

              <div className='flex justify-end space-x-4'>
                <button
                  onClick={() => {
                    setReviewModal(false)
                    setShowDetailedView(true)
                  }}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                >
                  ← Back to Application
                </button>
                <button
                  onClick={submitReview}
                  disabled={!reviewData.status}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2'
                >
                  <CheckCircle size={16} />
                  <span>Submit Review Decision</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userToken={teacherToken}
        userRole='teacher'
      />
    </div>
  )
}

export default TeacherDashboard
