import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/api'
import config from '../config/config.js'
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Palmtree,
  User,
  Trash2,
  Printer,
  Paperclip
} from 'lucide-react'

const LeaveRequestStatus = () => {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      fetchLeaveRequests()
    }
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const userToken = localStorage.getItem('userToken')
      const response = await fetch(config.api.leaveRequests, {
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
      pending: 'bg-primary/10 text-primary border-primary/20',
      approved: 'bg-green-500/10 text-green-600 border-green-500/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    }

    const icons = {
      pending: <Clock size={12} />,
      approved: <CheckCircle size={12} />,
      rejected: <XCircle size={12} />,
    }

    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 w-fit ${styles[status] || 'bg-muted text-muted-foreground border-border'}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getLeaveTypeIcon = type => {
    // Map types to colors/styles instead of emojis
    const styles = {
      sick: 'bg-red-500/10 text-red-600',
      personal: 'bg-blue-500/10 text-blue-600',
      family: 'bg-purple-500/10 text-purple-600',
      medical: 'bg-pink-500/10 text-pink-600',
      emergency: 'bg-orange-500/10 text-orange-600',
      other: 'bg-gray-500/10 text-gray-600',
    }
    
    return (
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${styles[type] || 'bg-primary/10 text-primary'}`}>
        <FileText size={20} />
      </div>
    )
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
        `${config.api.leaveRequests}/${id}`,
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
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-3 text-muted-foreground'>Loading leave requests...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='text-center p-8 bg-card rounded-xl border border-border'>
        <div className='flex justify-center mb-4'>
          <User size={48} className="text-muted-foreground" />
        </div>
        <p className='text-muted-foreground'>Please log in to view your leave requests.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle size={24} />
        </div>
        <p className='text-destructive font-medium mb-4'>{error}</p>
        <button
          onClick={fetchLeaveRequests}
          className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium'
        >
          Retry
        </button>
      </div>
    )
  }

  if (leaveRequests.length === 0) {
    return (
      <div className='text-center py-12 bg-card rounded-xl border border-border border-dashed'>
        <div className='flex justify-center mb-4'>
          <Palmtree size={48} className="text-muted-foreground/50" />
        </div>
        <h3 className='text-lg font-medium text-foreground mb-1'>
          No Leave Requests
        </h3>
        <p className='text-muted-foreground'>
          You haven't submitted any leave requests yet.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary'>
            <Palmtree size={20} />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>My Leave Requests</h2>
        </div>
        <div className='text-sm text-muted-foreground'>
          Total Requests: <span className='font-medium text-foreground'>{leaveRequests.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {leaveRequests.map(request => (
          <div
            key={request._id}
            className='bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group'
          >
            <div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-6'>
              <div className='flex items-start gap-4'>
                {getLeaveTypeIcon(request.leaveType)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className='text-lg font-semibold text-foreground capitalize'>
                      {request.leaveType.replace(/([A-Z])/g, ' $1')} Leave
                    </h3>
                    {request.isEmergency && (
                      <span className='px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider rounded border border-destructive/20'>
                        Emergency
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground flex items-center gap-2'>
                    <Calendar size={14} />
                    Submitted on {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 self-start md:self-center'>
                {getStatusBadge(request.status)}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50'>
              <div>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                  Duration
                </label>
                <p className='text-sm font-medium text-foreground flex items-center gap-2'>
                  <Calendar size={14} className="text-primary" />
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </p>
                <p className='text-xs text-muted-foreground mt-1 ml-6'>
                  {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                  Academic Year
                </label>
                <p className='text-sm font-medium text-foreground'>{request.academicYear}</p>
              </div>

              <div>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                  Approval Status
                </label>
                <div className='space-y-2 mt-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Class Teacher:</span>
                    {getStatusBadge(request.classTeacherApproval.status)}
                  </div>
                  {request.totalDays > 3 && (
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>HOD:</span>
                      {getStatusBadge(request.hodApproval.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='mb-6'>
              <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
                Reason
              </label>
              <p className='text-sm text-foreground bg-muted/30 p-3 rounded-md border border-border/50'>
                {request.reason}
              </p>
            </div>

            {/* Emergency Contact */}
            {request.emergencyContact && (
              <div className='mb-6'>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
                  Emergency Contact
                </label>
                <div className='text-sm text-foreground bg-muted/30 p-3 rounded-md border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div>
                    <span className="text-muted-foreground text-xs block">Name</span>
                    <span className="font-medium">{request.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Relationship</span>
                    <span className="font-medium">{request.emergencyContact.relationship}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Phone</span>
                    <span className="font-medium">{request.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {request.documents && request.documents.length > 0 && (
              <div className='mb-6'>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
                  Supporting Documents
                </label>
                <div className='flex flex-wrap gap-2'>
                  {request.documents.map((doc, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm bg-background border border-border px-3 py-2 rounded-md'
                    >
                      <Paperclip size={14} className="text-primary" />
                      <span className='text-foreground font-medium'>{doc.originalname}</span>
                      <span className='text-muted-foreground text-xs'>
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
              <div className='mb-6'>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
                  Approval Remarks
                </label>
                <div className='space-y-3'>
                  {request.classTeacherApproval.remarks && (
                    <div className='bg-blue-500/5 border border-blue-500/10 p-3 rounded-md'>
                      <p className='text-xs font-medium text-blue-600 mb-1'>
                        Class Teacher:
                      </p>
                      <p className='text-sm text-foreground'>
                        {request.classTeacherApproval.remarks}
                      </p>
                    </div>
                  )}
                  {request.hodApproval?.remarks && (
                    <div className='bg-purple-500/5 border border-purple-500/10 p-3 rounded-md'>
                      <p className='text-xs font-medium text-purple-600 mb-1'>HOD:</p>
                      <p className='text-sm text-foreground'>
                        {request.hodApproval.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-between items-center pt-4 border-t border-border'>
              <div className='text-xs text-muted-foreground font-mono'>
                ID: {request._id.slice(-8).toUpperCase()}
              </div>
              <div className='flex gap-2'>
                {request.status === 'pending' && (
                  <button
                    onClick={() => deleteRequest(request._id)}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors border border-destructive/20'
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors border border-border'
                >
                  <Printer size={14} />
                  Print
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaveRequestStatus
