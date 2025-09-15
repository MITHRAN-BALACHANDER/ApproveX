import { useState, useEffect } from 'react'

const LeaveRequestStatus = () => {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const userToken = localStorage.getItem('userToken')
      const response = await fetch('http://localhost:5000/api/leave-requests', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setLeaveRequests(result.leaveRequests)
      } else {
        setError('Failed to fetch leave requests')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = status => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getLeaveTypeIcon = type => {
    const icons = {
      sick: '🤒',
      personal: '👤',
      family: '👨‍👩‍👧‍👦',
      medical: '🏥',
      emergency: '🚨',
      other: '📝',
    }
    return icons[type] || '📝'
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const deleteRequest = async id => {
    if (
      !window.confirm('Are you sure you want to delete this leave request?')
    ) {
      return
    }

    try {
      const userToken = localStorage.getItem('userToken')
      const response = await fetch(
        `http://localhost:5000/api/leave-requests/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      const result = await response.json()

      if (result.success) {
        setLeaveRequests(prev => prev.filter(req => req._id !== id))
      } else {
        alert('Failed to delete leave request')
      }
    } catch (error) {
      alert('Network error. Please try again.')
      console.error('Error deleting leave request:', error)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading leave requests...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>{error}</p>
        <button
          onClick={fetchLeaveRequests}
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          Retry
        </button>
      </div>
    )
  }

  if (leaveRequests.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-6xl mb-4'>📝</div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No Leave Requests
        </h3>
        <p className='text-gray-600'>
          You haven't submitted any leave requests yet.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {leaveRequests.map(request => (
        <div
          key={request._id}
          className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
        >
          <div className='flex justify-between items-start mb-4'>
            <div className='flex items-center space-x-3'>
              <span className='text-2xl'>
                {getLeaveTypeIcon(request.leaveType)}
              </span>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 capitalize'>
                  {request.leaveType.replace(/([A-Z])/g, ' $1')} Leave
                </h3>
                <p className='text-sm text-gray-600'>
                  Submitted on {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              {getStatusBadge(request.status)}
              {request.isEmergency && (
                <span className='px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200'>
                  Emergency
                </span>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Duration
              </label>
              <p className='text-sm text-gray-900'>
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </p>
              <p className='text-xs text-gray-600'>
                {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Academic Year
              </label>
              <p className='text-sm text-gray-900'>{request.academicYear}</p>
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Approval Status
              </label>
              {request.totalDays > 3 ? (
                <div className='space-y-1'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-xs text-gray-600'>
                      Class Teacher:
                    </span>
                    {getStatusBadge(request.classTeacherApproval.status)}
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-xs text-gray-600'>HOD:</span>
                    {getStatusBadge(request.hodApproval.status)}
                  </div>
                </div>
              ) : (
                <div className='flex items-center space-x-2'>
                  <span className='text-xs text-gray-600'>Class Teacher:</span>
                  {getStatusBadge(request.classTeacherApproval.status)}
                </div>
              )}
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
              Reason
            </label>
            <p className='text-sm text-gray-900 bg-gray-50 p-3 rounded-md'>
              {request.reason}
            </p>
          </div>

          {/* Emergency Contact */}
          {request.emergencyContact && (
            <div className='mb-4'>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                Emergency Contact
              </label>
              <div className='text-sm text-gray-900 bg-gray-50 p-3 rounded-md'>
                <p>
                  <strong>Name:</strong> {request.emergencyContact.name}
                </p>
                <p>
                  <strong>Relationship:</strong>{' '}
                  {request.emergencyContact.relationship}
                </p>
                <p>
                  <strong>Phone:</strong> {request.emergencyContact.phone}
                </p>
              </div>
            </div>
          )}

          {/* Documents */}
          {request.documents && request.documents.length > 0 && (
            <div className='mb-4'>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                Supporting Documents
              </label>
              <div className='space-y-2'>
                {request.documents.map((doc, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-2 text-sm'
                  >
                    <span className='text-blue-600'>📎</span>
                    <span className='text-gray-700'>{doc.originalname}</span>
                    <span className='text-gray-500'>
                      ({(doc.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teacher Remarks */}
          {(request.classTeacherApproval.remarks ||
            request.hodApproval?.remarks) && (
            <div className='mb-4'>
              <label className='block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                Approval Remarks
              </label>
              <div className='space-y-2'>
                {request.classTeacherApproval.remarks && (
                  <div className='bg-blue-50 p-3 rounded-md'>
                    <p className='text-xs font-medium text-blue-800'>
                      Class Teacher:
                    </p>
                    <p className='text-sm text-blue-900'>
                      {request.classTeacherApproval.remarks}
                    </p>
                  </div>
                )}
                {request.hodApproval?.remarks && (
                  <div className='bg-purple-50 p-3 rounded-md'>
                    <p className='text-xs font-medium text-purple-800'>HOD:</p>
                    <p className='text-sm text-purple-900'>
                      {request.hodApproval.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
            <div className='text-xs text-gray-500'>
              Request ID: {request._id.slice(-8).toUpperCase()}
            </div>
            <div className='flex space-x-2'>
              {request.status === 'pending' && (
                <button
                  onClick={() => deleteRequest(request._id)}
                  className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors'
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => window.print()}
                className='px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors'
              >
                Print
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LeaveRequestStatus
