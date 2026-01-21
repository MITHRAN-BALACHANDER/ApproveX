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
  User,
  LogOut,
  LayoutDashboard,
  Palmtree,
  Filter,
  ChevronRight
} from 'lucide-react'
import ChangePassword from './ChangePassword'
import config from '../config/config'

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('od-requests')
  const [requests, setRequests] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
      navigate('/login')
      return
    }
    fetchRequests()
    fetchLeaveRequests()
  }, [teacherToken, navigate])

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/teacher/requests`,
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
        `${config.api.leaveRequests}/pending/approvals?level=classTeacher`,
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
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
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
      const response = await fetch(
        `${config.api.baseUrl}/teacher/requests/${selectedRequest._id}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewData.status,
            remarks: reviewData.remarks,
          }),
        }
      )

      if (response.ok) {
        setReviewModal(false)
        setShowDetailedView(false)
        setSelectedRequest(null)
        setReviewData({ status: '', remarks: '' })
        fetchRequests()
        alert('Review submitted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('Network error occurred. Please check your connection.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('teacherInfo')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  const pendingCount = requests.filter(r => ['pending', 'under_review', 'submitted'].includes(r.overallStatus)).length
  const approvedCount = requests.filter(r => r.overallStatus === 'approved').length

  return (
    <div className='min-h-screen bg-background font-sans text-foreground'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className='text-xl font-bold text-foreground tracking-tight'>
                  Teacher Dashboard
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Welcome, {teacherInfo.firstName} {teacherInfo.lastName}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors'
                title="Change Password"
              >
                <Lock size={20} />
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors'
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Requests</p>
                <p className='text-3xl font-bold text-foreground mt-1'>{requests.length}</p>
              </div>
              <div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Pending Review</p>
                <p className='text-3xl font-bold text-foreground mt-1'>{pendingCount}</p>
              </div>
              <div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Approved</p>
                <p className='text-3xl font-bold text-foreground mt-1'>{approvedCount}</p>
              </div>
              <div className='h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600'>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('od-requests')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'od-requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText size={18} />
              OD Requests
            </button>
            <button
              onClick={() => setActiveTab('leave-requests')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'leave-requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Palmtree size={18} />
              Leave Requests
              {leaveRequests.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  {leaveRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'od-requests' && (
          <div className='bg-card border border-border rounded-xl shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30'>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <h3 className='text-sm font-medium text-foreground'>
                  OD Requests ({requests.length})
                </h3>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {requests.length === 0 ? (
                <div className='p-12 text-center'>
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No requests found</h3>
                  <p className='text-muted-foreground mt-1'>
                    There are no OD requests to review at the moment.
                  </p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request._id} className='p-6 hover:bg-muted/30 transition-colors'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                      <div className='flex items-start gap-4'>
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          ['pending', 'under_review', 'submitted'].includes(request.overallStatus)
                            ? 'bg-primary'
                            : request.overallStatus === 'approved'
                              ? 'bg-green-500'
                              : 'bg-destructive'
                        }`} />
                        <div>
                          <h4 className='text-base font-semibold text-foreground'>
                            {request.studentInfo?.fullName || request.studentId?.profile?.fullName}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {request.studentInfo?.registerNumber} • {request.studentInfo?.department}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target size={14} />
                              {request.eventDetails?.eventTitle}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(request.eventDetails?.dateRange?.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 self-end sm:self-center'>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          ['pending', 'under_review', 'submitted'].includes(request.overallStatus)
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : request.overallStatus === 'approved'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {request.overallStatus.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        {['pending', 'under_review', 'submitted'].includes(request.overallStatus) && (
                          <button
                            onClick={() => handleReviewRequest(request)}
                            className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm'
                          >
                            <span>Review</span>
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'leave-requests' && (
          <div className='bg-card border border-border rounded-xl shadow-sm overflow-hidden'>
             <div className='px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30'>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <h3 className='text-sm font-medium text-foreground'>
                  Pending Leave Requests ({leaveRequests.length})
                </h3>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {leaveRequests.length === 0 ? (
                <div className='p-12 text-center'>
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palmtree size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No pending leave requests</h3>
                  <p className='text-muted-foreground mt-1'>
                    You have no leave requests pending for approval.
                  </p>
                </div>
              ) : (
                leaveRequests.map(request => (
                  <div key={request._id} className='p-6 hover:bg-muted/30 transition-colors'>
                    {/* Leave Request Item Structure - similar to OD but with leave details */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                      <div className='flex items-start gap-4'>
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <h4 className='text-base font-semibold text-foreground'>
                            {request.studentId?.profile?.fullName}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {request.studentId?.profile?.registerNumber} • {request.leaveType} Leave
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              {request.totalDays} Days
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          // Implement leave review logic
                          alert('Leave review implementation pending')
                        }}
                        className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm'
                      >
                        <span>Review</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detailed View Modal */}
      {showDetailedView && selectedRequest && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-card border border-border w-full max-w-4xl shadow-lg rounded-xl overflow-hidden max-h-[90vh] flex flex-col'>
            <div className='px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30'>
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <FileText size={20} />
                Review Application
              </h3>
              <button onClick={handleCloseDetailedView} className="text-muted-foreground hover:text-foreground">
                <XCircle size={24} />
              </button>
            </div>

            <div className='p-6 overflow-y-auto flex-1 space-y-6'>
              {/* Student Info */}
              <div className='bg-muted/30 p-4 rounded-2xl border border-border'>
                <h4 className='text-sm font-semibold text-foreground mb-3 flex items-center gap-2'>
                  <User size={16} /> Student Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{selectedRequest.studentInfo?.fullName || selectedRequest.studentId?.profile?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Register Number</p>
                    <p className="font-medium text-foreground">{selectedRequest.studentInfo?.registerNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium text-foreground">{selectedRequest.studentInfo?.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year & Section</p>
                    <p className="font-medium text-foreground">{selectedRequest.studentInfo?.year} - {selectedRequest.studentInfo?.section}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className='bg-muted/30 p-4 rounded-2xl border border-border'>
                <h4 className='text-sm font-semibold text-foreground mb-3 flex items-center gap-2'>
                  <Target size={16} /> Event Details
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className="text-muted-foreground">Event Title</p>
                    <p className="font-medium text-foreground">{selectedRequest.eventDetails?.eventTitle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground capitalize">{selectedRequest.eventDetails?.reasonType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date Range</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedRequest.eventDetails?.dateRange?.startDate).toLocaleDateString()} - {new Date(selectedRequest.eventDetails?.dateRange?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Venue</p>
                    <p className="font-medium text-foreground">
                      {selectedRequest.eventDetails?.venue?.institutionName}, {selectedRequest.eventDetails?.venue?.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className='bg-muted/30 p-4 rounded-2xl border border-border'>
                <h4 className='text-sm font-semibold text-foreground mb-3 flex items-center gap-2'>
                  <Paperclip size={16} /> Documents
                </h4>
                <div className='flex gap-4 text-sm'>
                  <div className={`flex items-center gap-2 ${selectedRequest.documents?.invitation ? 'text-green-600' : 'text-destructive'}`}>
                    {selectedRequest.documents?.invitation ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>Invitation</span>
                  </div>
                  <div className={`flex items-center gap-2 ${selectedRequest.documents?.permissionLetter ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {selectedRequest.documents?.permissionLetter ? <CheckCircle size={16} /> : <div className="w-4" />}
                    <span>Permission Letter</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='p-6 border-t border-border bg-muted/30 flex justify-end gap-4'>
              <button
                onClick={handleCloseDetailedView}
                className='px-4 py-2 border border-input bg-background hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors'
              >
                Close
              </button>
              <button
                onClick={handleProceedToReview}
                className='px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2'
              >
                <Scale size={16} />
                Proceed to Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Decision Modal */}
      {reviewModal && selectedRequest && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-card border border-border w-full max-w-md shadow-lg rounded-xl overflow-hidden'>
            <div className='px-6 py-4 border-b border-border bg-muted/30'>
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <Scale size={20} />
                Submit Decision
              </h3>
            </div>
            
            <div className='p-6 space-y-4'>
              <div className='bg-primary/10 p-3 rounded-xl border border-primary/20'>
                <p className='text-sm text-primary font-medium'>
                  Reviewing: {selectedRequest.eventDetails?.eventTitle}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Student: {selectedRequest.studentInfo?.fullName || selectedRequest.studentId?.profile?.fullName}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  Decision *
                </label>
                <select
                  value={reviewData.status}
                  onChange={e => setReviewData({ ...reviewData, status: e.target.value })}
                  className='w-full bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                >
                  <option value=''>Select Decision</option>
                  <option value='approved'>Approve Request</option>
                  <option value='rejected'>Reject Request</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  Remarks
                </label>
                <textarea
                  value={reviewData.remarks}
                  onChange={e => setReviewData({ ...reviewData, remarks: e.target.value })}
                  rows='3'
                  className='w-full bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                  placeholder='Add comments...'
                />
              </div>
            </div>

            <div className='p-6 border-t border-border bg-muted/30 flex justify-end gap-3'>
              <button
                onClick={() => {
                  setReviewModal(false)
                  setShowDetailedView(true)
                }}
                className='px-4 py-2 border border-input bg-background hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors'
              >
                Back
              </button>
              <button
                onClick={submitReview}
                disabled={!reviewData.status}
                className='px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50'
              >
                Submit Decision
              </button>
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
