import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DutyRequestForm from './DutyRequestForm'
import RequestStatus from './RequestStatus'
import ChangePassword from './ChangePassword'

const StudentDashboard = ({ userInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState('requests')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  })
  const navigate = useNavigate()

  const userToken = localStorage.getItem('userToken')

  useEffect(() => {
    if (!userToken) {
      navigate('/login')
      return
    }
    fetchStats()
  }, [userToken, navigate])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/duty-requests', {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const requests = await response.json()
        setStats({
          totalRequests: requests.length,
          pendingRequests: requests.filter(r =>
            ['submitted', 'pending', 'under_review'].includes(r.overallStatus)
          ).length,
          approvedRequests: requests.filter(r => r.overallStatus === 'approved')
            .length,
          rejectedRequests: requests.filter(r => r.overallStatus === 'rejected')
            .length,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const tabs = [
    { id: 'requests', name: 'My Requests', icon: '📝' },
    { id: 'new-request', name: 'New Request', icon: '➕' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Student Dashboard
              </h1>
              <p className='text-gray-600'>
                Welcome, {userInfo?.fullName || userInfo?.profile?.fullName}
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                🔐 Change Password
              </button>
              <button
                onClick={onLogout}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {stats.totalRequests}
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Total Requests
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {stats.totalRequests}
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
                        {stats.pendingRequests}
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Pending
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {stats.pendingRequests}
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
                        {stats.approvedRequests}
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Approved
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {stats.approvedRequests}
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
                    <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {stats.rejectedRequests}
                      </span>
                    </div>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Rejected
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>
                        {stats.rejectedRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='bg-white shadow rounded-lg'>
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className='mr-2'>{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className='p-6'>
              {activeTab === 'requests' && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    My OD Requests
                  </h3>
                  <RequestStatus />
                </div>
              )}

              {activeTab === 'new-request' && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Submit New OD Request
                  </h3>
                  <DutyRequestForm />
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Profile Information
                  </h3>
                  <div className='bg-gray-50 p-6 rounded-lg'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Full Name
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.fullName || userInfo?.profile?.fullName}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Email
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.email}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Register Number
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.registerNumber ||
                            userInfo?.profile?.registerNumber}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Department
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.department ||
                            userInfo?.profile?.department}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Year
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.year || userInfo?.profile?.year}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Section
                        </label>
                        <p className='mt-1 text-sm text-gray-900'>
                          {userInfo?.section || userInfo?.profile?.section}
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
    </div>
  )
}

export default StudentDashboard
