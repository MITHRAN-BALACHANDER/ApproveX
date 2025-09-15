import { useState, useEffect } from 'react'
import { dutyRequestAPI } from '../services/api'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ClipboardList,
  FileText
} from 'lucide-react'

const RequestStatus = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await dutyRequestAPI.getAll()
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      // Fallback to mock data if API fails
      setRequests(mockRequests)
    } finally {
      setLoading(false)
    }
  }

  const mockRequests = [
    {
      _id: '1',
      description: 'On-Duty request',
      status: 'in-progress',
      submittedAt: '2025-04-02',
    },
    {
      _id: '2',
      description: 'Attendance correction request',
      status: 'resolved',
      submittedAt: '2025-03-28',
    },
    {
      _id: '3',
      description: 'checking',
      status: 'pending',
      submittedAt: '2025-04-03',
    },
    {
      _id: '4',
      description: 'Fake On-Duty found',
      status: 'rejected',
      submittedAt: '2025-04-03',
    },
  ]

  const getStatusColor = status => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'in-progress':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={24} className="text-green-600" />
      case 'rejected':
        return <XCircle size={24} className="text-red-600" />
      case 'pending':
        return <Clock size={24} className="text-yellow-600" />
      case 'in-progress':
        return <RotateCcw size={24} className="text-blue-600" />
      default:
        return <ClipboardList size={24} className="text-gray-600" />
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>Loading your requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {requests.length === 0 ? (
        <div className='text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30'>
          <div className='flex justify-center mb-4'>
            <FileText size={64} className="text-gray-400" />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>
            No OD Requests Yet
          </h3>
          <p className='text-gray-600'>
            You haven't submitted any on-duty requests. Click on "New OD
            Request" to get started.
          </p>
        </div>
      ) : (
        <div className='grid gap-6'>
          {requests.map(request => (
            <div
              key={request._id}
              className='bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center mb-3'>
                    <div className='mr-3'>
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 line-clamp-1'>
                        {request.description ||
                          request.name ||
                          'On-Duty Request'}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        Submitted on {formatDate(request.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {request.eventName && (
                    <div className='mb-3'>
                      <p className='text-sm font-semibold text-gray-700'>
                        Event:
                      </p>
                      <p className='text-gray-600'>{request.eventName}</p>
                    </div>
                  )}

                  {request.eventDate && (
                    <div className='mb-3'>
                      <p className='text-sm font-semibold text-gray-700'>
                        Date:
                      </p>
                      <p className='text-gray-600'>
                        {formatDate(request.eventDate)}
                      </p>
                    </div>
                  )}

                  {request.comments && (
                    <div className='mb-3'>
                      <p className='text-sm font-semibold text-gray-700'>
                        Comments:
                      </p>
                      <p className='text-gray-600 text-sm'>
                        {request.comments}
                      </p>
                    </div>
                  )}
                </div>

                <div className='ml-4 flex flex-col items-end'>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(request.status)} shadow-md`}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1).replace('-', ' ')}
                  </div>

                  {request.documents && request.documents.length > 0 && (
                    <div className='mt-3 text-sm text-gray-500 flex items-center'>
                      <svg
                        className='w-4 h-4 mr-1'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                        />
                      </svg>
                      {request.documents.length} file(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RequestStatus
