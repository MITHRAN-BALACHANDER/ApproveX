import { useState, useEffect } from 'react'
import { dutyRequestAPI } from '../services/api'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
  Paperclip
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
      case 'approved':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'pending':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'in-progress':
        return 'bg-secondary/10 text-secondary border-secondary/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'resolved':
      case 'approved':
        return <CheckCircle size={20} className="text-green-600" />
      case 'rejected':
        return <XCircle size={20} className="text-destructive" />
      case 'pending':
        return <Clock size={20} className="text-primary" />
      case 'in-progress':
        return <RotateCcw size={20} className="text-secondary" />
      default:
        return <ClipboardList size={20} className="text-muted-foreground" />
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
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground font-medium'>Loading your requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {requests.length === 0 ? (
        <div className='text-center py-12 bg-card rounded-xl border border-border border-dashed'>
          <div className='flex justify-center mb-4'>
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <FileText size={32} className="text-muted-foreground" />
            </div>
          </div>
          <h3 className='text-lg font-semibold text-foreground mb-1'>
            No OD Requests Yet
          </h3>
          <p className='text-muted-foreground max-w-sm mx-auto'>
            You haven't submitted any on-duty requests. Click on "New OD
            Request" to get started.
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {requests.map(request => (
            <div
              key={request._id}
              className='bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5'
            >
              <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
                <div className='flex-1 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <div className='mt-1'>
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className='text-base font-semibold text-foreground line-clamp-1'>
                        {request.description ||
                          request.name ||
                          'On-Duty Request'}
                      </h3>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Submitted on {formatDate(request.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 space-y-2">
                    {request.eventName && (
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium text-foreground min-w-[60px]'>Event:</span>
                        <span className='text-muted-foreground'>{request.eventName}</span>
                      </div>
                    )}

                    {request.eventDate && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className='text-muted-foreground'>
                          {formatDate(request.eventDate)}
                        </span>
                      </div>
                    )}

                    {request.comments && (
                      <div className='flex items-start gap-2 text-sm bg-muted/30 p-2 rounded-xl'>
                        <MessageSquare size={14} className="text-muted-foreground mt-0.5" />
                        <span className='text-muted-foreground'>
                          {request.comments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pl-8 sm:pl-0'>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1).replace('-', ' ')}
                  </div>

                  {request.documents && request.documents.length > 0 && (
                    <div className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Paperclip size={12} />
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
