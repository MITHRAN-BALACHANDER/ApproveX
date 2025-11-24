import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  FileText,
  Clock,
  Lock,
  LogOut,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import ChangePassword from './ChangePassword'
import config from '../config/config'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        navigate('/admin/login')
        return
      }

      const response = await fetch(`${config.api.admin}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      if (error.message.includes('401')) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card shadow-sm border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>
                Admin Dashboard
              </h1>
              <p className='text-muted-foreground'>OD Provider System</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setShowChangePassword(true)}
                className='flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg transition-colors'
              >
                <Lock size={16} />
                Change Password
              </button>
              <button
                onClick={() => navigate('/admin/teachers')}
                className='flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors'
              >
                <Users size={16} />
                Manage Teachers
              </button>
              <button
                onClick={() => navigate('/admin/approval-history')}
                className='flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg transition-colors'
              >
                <FileText size={16} />
                Approval History
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg transition-colors'
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-card p-6 rounded-xl shadow-sm border border-border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
                <GraduationCap className='w-6 h-6' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-muted-foreground'>Total Students</p>
                <p className='text-2xl font-bold text-foreground'>
                  {dashboardData?.stats?.totalStudents || 0}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card p-6 rounded-xl shadow-sm border border-border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-green-100 text-green-600'>
                <Users className='w-6 h-6' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-muted-foreground'>Total Teachers</p>
                <p className='text-2xl font-bold text-foreground'>
                  {dashboardData?.stats?.totalTeachers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card p-6 rounded-xl shadow-sm border border-border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-yellow-100 text-yellow-600'>
                <FileText className='w-6 h-6' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-muted-foreground'>Total Requests</p>
                <p className='text-2xl font-bold text-foreground'>
                  {dashboardData?.stats?.totalRequests || 0}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-card p-6 rounded-xl shadow-sm border border-border'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-purple-100 text-purple-600'>
                <Clock className='w-6 h-6' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-muted-foreground'>
                  Pending Requests
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {dashboardData?.stats?.pendingRequests || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className='bg-card shadow-sm rounded-xl border border-border mb-8 overflow-hidden'>
          <div className='px-6 py-4 border-b border-border'>
            <h3 className='text-lg font-medium text-foreground'>
              Recent OD Requests
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-border'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Student
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Event
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className='bg-card divide-y divide-border'>
                {dashboardData?.recentRequests?.map(request => (
                  <tr key={request._id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-foreground'>
                          {request.studentInfo.fullName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {request.studentInfo.registerNumber}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-foreground'>
                        {request.eventDetails?.eventTitle}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.overallStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.overallStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : request.overallStatus === 'under_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.overallStatus === 'approved' && (
                          <CheckCircle className='w-3 h-3 mr-1' />
                        )}
                        {request.overallStatus === 'rejected' && (
                          <XCircle className='w-3 h-3 mr-1' />
                        )}
                        {request.overallStatus === 'under_review' && (
                          <Clock className='w-3 h-3 mr-1' />
                        )}
                        {request.overallStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-muted-foreground'>
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Performance */}
        <div className='bg-card shadow-sm rounded-xl border border-border overflow-hidden'>
          <div className='px-6 py-4 border-b border-border'>
            <h3 className='text-lg font-medium text-foreground'>
              Teacher Approval Statistics
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-border'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Teacher
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Designation
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Total
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Approved
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Rejected
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className='bg-card divide-y divide-border'>
                {dashboardData?.teacherStats?.map(teacher => (
                  <tr key={teacher._id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-foreground'>
                        {teacher.fullName}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {teacher.employeeId}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
                      {teacher.designation}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
                      {teacher.approvalStats?.totalRequests || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                      {teacher.approvalStats?.approved || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium'>
                      {teacher.approvalStats?.rejected || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium'>
                      {teacher.approvalStats?.pending || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userToken={localStorage.getItem('adminToken')}
        userRole='admin'
      />
    </div>
  )
}

export default AdminDashboard
