import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Stethoscope, 
  Palmtree, 
  User, 
  Lock, 
  LogOut, 
  GraduationCap, 
  Pencil,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import config from '../config/config.js'
import DutyRequestForm from './DutyRequestForm'
import RequestStatus from './RequestStatus'
import LeaveRequestForm from './LeaveRequestForm'
import LeaveRequestStatus from './LeaveRequestStatus'
import ChangePassword from './ChangePassword'
import EditProfile from './EditProfile'

const StudentDashboard = ({ userInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState('od-requests')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [currentUserInfo, setCurrentUserInfo] = useState(userInfo)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalLeaveRequests: 0,
    pendingLeaveRequests: 0,
    approvedLeaveRequests: 0,
    rejectedLeaveRequests: 0,
  })
  const navigate = useNavigate()

  const userToken = localStorage.getItem('userToken')

  useEffect(() => {
    if (!userToken) {
      navigate('/login')
      return
    }
    fetchStats()
    setCurrentUserInfo(userInfo)
  }, [userToken, navigate, userInfo])

  const handleProfileUpdate = updatedUserInfo => {
    setCurrentUserInfo(updatedUserInfo)
  }

  const fetchStats = async () => {
    try {
      const userToken = localStorage.getItem('userToken')

      // Fetch OD requests stats
      const odResponse = await fetch(
        config.api.odRequests,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      // Fetch Leave requests stats
      const leaveResponse = await fetch(
        config.api.leaveRequests,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      if (odResponse.ok) {
        const odResult = await odResponse.json()
        if (odResult.success) {
          const odRequests = odResult.dutyRequests || []
          setStats(prev => ({
            ...prev,
            totalRequests: odRequests.length,
            pendingRequests: odRequests.filter(req => req.status === 'pending')
              .length,
            approvedRequests: odRequests.filter(
              req => req.status === 'approved'
            ).length,
            rejectedRequests: odRequests.filter(
              req => req.status === 'rejected'
            ).length,
          }))
        }
      }

      if (leaveResponse.ok) {
        const leaveResult = await leaveResponse.json()
        if (leaveResult.success) {
          const leaveRequests = leaveResult.leaveRequests || []
          setStats(prev => ({
            ...prev,
            totalLeaveRequests: leaveRequests.length,
            pendingLeaveRequests: leaveRequests.filter(
              req => req.status === 'pending'
            ).length,
            approvedLeaveRequests: leaveRequests.filter(
              req => req.status === 'approved'
            ).length,
            rejectedLeaveRequests: leaveRequests.filter(
              req => req.status === 'rejected'
            ).length,
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const tabs = [
    { id: 'od-requests', name: 'OD Requests', icon: FileText },
    { id: 'new-od-request', name: 'New OD Request', icon: Plus },
    { id: 'leave-requests', name: 'Leave Requests', icon: Stethoscope },
    { id: 'new-leave-request', name: 'New Leave Request', icon: Palmtree },
    { id: 'profile', name: 'Profile', icon: User },
  ]

  return (
    <div className='min-h-screen bg-background font-sans text-foreground'>
      {/* Header */}
      <div className='bg-card border-b border-border sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-sm'>
                <GraduationCap size={20} />
              </div>
              <div>
                <h1 className='text-xl font-bold text-foreground tracking-tight'>
                  Student Dashboard
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Welcome back,{' '}
                  {currentUserInfo?.fullName ||
                    currentUserInfo?.profile?.fullName}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              >
                <Lock size={16} />
                <span className="hidden sm:inline">Change Password</span>
              </button>
              <button
                onClick={onLogout}
                className='flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors'
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Stats Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* OD Request Stats */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 mb-2'>
              <FileText className="w-5 h-5 text-primary" />
              <h3 className='text-lg font-semibold text-foreground'>
                On-Duty Requests
              </h3>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1'>Total</div>
                <div className='text-2xl font-bold text-foreground'>{stats.totalRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <Clock size={12} className="text-primary" /> Pending
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.pendingRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <CheckCircle size={12} className="text-green-600" /> Approved
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.approvedRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <XCircle size={12} className="text-destructive" /> Rejected
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.rejectedRequests}</div>
              </div>
            </div>
          </div>

          {/* Leave Request Stats */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Stethoscope className="w-5 h-5 text-primary" />
              <h3 className='text-lg font-semibold text-foreground'>
                Leave Requests
              </h3>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1'>Total</div>
                <div className='text-2xl font-bold text-foreground'>{stats.totalLeaveRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <Clock size={12} className="text-primary" /> Pending
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.pendingLeaveRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <CheckCircle size={12} className="text-green-600" /> Approved
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.approvedLeaveRequests}</div>
              </div>
              <div className='bg-card border border-border rounded-2xl p-4 shadow-sm'>
                <div className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
                  <XCircle size={12} className="text-destructive" /> Rejected
                </div>
                <div className='text-2xl font-bold text-foreground'>{stats.rejectedLeaveRequests}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className='bg-card border border-border rounded-xl shadow-sm overflow-hidden'>
          <div className='border-b border-border bg-muted/30'>
            <nav className='flex overflow-x-auto scrollbar-hide'>
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-background'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className='p-6'>
            {activeTab === 'od-requests' && (
              <div className="space-y-6">
                <div className='flex items-center gap-3 pb-4 border-b border-border'>
                  <div className='h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                    <FileText size={20} />
                  </div>
                  <h3 className='text-xl font-bold text-foreground'>
                    My OD Requests
                  </h3>
                </div>
                <RequestStatus />
              </div>
            )}

            {activeTab === 'new-od-request' && (
              <div className="space-y-6">
                <div className='flex items-center gap-3 pb-4 border-b border-border'>
                  <div className='h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                    <Plus size={20} />
                  </div>
                  <h3 className='text-xl font-bold text-foreground'>
                    Submit New OD Request
                  </h3>
                </div>
                <DutyRequestForm />
              </div>
            )}

            {activeTab === 'leave-requests' && (
              <div className="space-y-6">
                <div className='flex items-center gap-3 pb-4 border-b border-border'>
                  <div className='h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                    <Stethoscope size={20} />
                  </div>
                  <h3 className='text-xl font-bold text-foreground'>
                    My Leave Requests
                  </h3>
                </div>
                <LeaveRequestStatus />
              </div>
            )}

            {activeTab === 'new-leave-request' && (
              <div className="space-y-6">
                <div className='flex items-center gap-3 pb-4 border-b border-border'>
                  <div className='h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                    <Palmtree size={20} />
                  </div>
                  <h3 className='text-xl font-bold text-foreground'>
                    Submit New Leave Request
                  </h3>
                </div>
                <LeaveRequestForm />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className='flex justify-between items-center pb-4 border-b border-border'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                      <User size={20} />
                    </div>
                    <h3 className='text-xl font-bold text-foreground'>
                      Profile Information
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors shadow-sm'
                  >
                    <Pencil size={16} />
                    <span>Edit Profile</span>
                  </button>
                </div>
                <div className='bg-muted/30 p-6 rounded-2xl border border-border'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Full Name
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.fullName ||
                          currentUserInfo?.profile?.fullName}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Email
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.email}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Registration Number
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.registrationNumber ||
                          currentUserInfo?.profile?.registrationNumber}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Department
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.department ||
                          currentUserInfo?.profile?.department}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Year
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.year ||
                          currentUserInfo?.profile?.year}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                        Section
                      </label>
                      <p className='text-base text-foreground font-medium'>
                        {currentUserInfo?.section ||
                          currentUserInfo?.profile?.section}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userToken={userToken}
        userRole='student'
      />

      {showEditProfile && (
        <EditProfile
          userInfo={currentUserInfo}
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default StudentDashboard
