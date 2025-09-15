import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
        'http://localhost:5000/api/duty-requests',
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      // Fetch Leave requests stats
      const leaveResponse = await fetch(
        'http://localhost:5000/api/leave-requests',
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
    { id: 'od-requests', name: 'OD Requests', icon: '📝' },
    { id: 'new-od-request', name: 'New OD Request', icon: '➕' },
    { id: 'leave-requests', name: 'Leave Requests', icon: '🏥' },
    { id: 'new-leave-request', name: 'New Leave Request', icon: '🏖️' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-blue-200/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      {/* Header */}
      <div className='bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg relative z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center space-x-4'>
              <div className='h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200'>
                🎓
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                  Student Dashboard
                </h1>
                <p className='text-gray-600 font-medium'>
                  Welcome back,{' '}
                  {currentUserInfo?.fullName ||
                    currentUserInfo?.profile?.fullName}
                </p>
              </div>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2'
              >
                <span>🔐</span>
                <span>Change Password</span>
              </button>
              <button
                onClick={onLogout}
                className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2'
              >
                <span>👋</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10'>
        <div className='px-4 py-6 sm:px-0'>
          {/* OD Request Stats */}
          <div className='mb-8'>
            <div className='flex items-center mb-6'>
              <div className='h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                📝
              </div>
              <h3 className='text-xl font-bold text-gray-900'>
                On-Duty Request Statistics
              </h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.totalRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Total OD Requests
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.totalRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.pendingRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Pending
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.pendingRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.approvedRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Approved
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.approvedRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.rejectedRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Rejected
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.rejectedRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Request Stats */}
          <div className='mb-8'>
            <div className='flex items-center mb-6'>
              <div className='h-8 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                🏥
              </div>
              <h3 className='text-xl font-bold text-gray-900'>
                Leave Request Statistics
              </h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.totalLeaveRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Total Leave Requests
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.totalLeaveRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.pendingLeaveRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Pending
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.pendingLeaveRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.approvedLeaveRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Approved
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.approvedLeaveRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/80 backdrop-blur-sm border border-white/30 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
                        <span className='text-white text-lg font-bold'>
                          {stats.rejectedLeaveRequests}
                        </span>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-semibold text-gray-600 truncate'>
                          Rejected
                        </dt>
                        <dd className='text-2xl font-bold text-gray-900'>
                          {stats.rejectedLeaveRequests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl overflow-hidden'>
            <div className='border-b border-gray-200/50'>
              <nav className='-mb-px flex overflow-x-auto'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50 rounded-t-lg'
                    }`}
                  >
                    <span className='text-lg'>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className='p-8'>
              {activeTab === 'od-requests' && (
                <div>
                  <div className='flex items-center mb-6'>
                    <div className='h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                      📝
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      My OD Requests
                    </h3>
                  </div>
                  <RequestStatus />
                </div>
              )}

              {activeTab === 'new-od-request' && (
                <div>
                  <div className='flex items-center mb-6'>
                    <div className='h-8 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                      ➕
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      Submit New OD Request
                    </h3>
                  </div>
                  <DutyRequestForm />
                </div>
              )}

              {activeTab === 'leave-requests' && (
                <div>
                  <div className='flex items-center mb-6'>
                    <div className='h-8 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                      🏥
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      My Leave Requests
                    </h3>
                  </div>
                  <LeaveRequestStatus />
                </div>
              )}

              {activeTab === 'new-leave-request' && (
                <div>
                  <div className='flex items-center mb-6'>
                    <div className='h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                      🏖️
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      Submit New Leave Request
                    </h3>
                  </div>
                  <LeaveRequestForm />
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <div className='flex justify-between items-center mb-6'>
                    <div className='flex items-center'>
                      <div className='h-8 w-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3'>
                        👤
                      </div>
                      <h3 className='text-2xl font-bold text-gray-900'>
                        Profile Information
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2'
                    >
                      <span>✏️</span>
                      <span>Edit Profile</span>
                    </button>
                  </div>
                  <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Full Name
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
                          {currentUserInfo?.fullName ||
                            currentUserInfo?.profile?.fullName}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Email
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
                          {currentUserInfo?.email}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Registration Number
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
                          {currentUserInfo?.registrationNumber ||
                            currentUserInfo?.profile?.registrationNumber}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Department
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
                          {currentUserInfo?.department ||
                            currentUserInfo?.profile?.department}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Year
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
                          {currentUserInfo?.year ||
                            currentUserInfo?.profile?.year}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-semibold text-gray-700'>
                          Section
                        </label>
                        <p className='text-lg text-gray-900 font-medium'>
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
