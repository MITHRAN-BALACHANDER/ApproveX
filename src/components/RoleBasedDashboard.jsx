import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Import role-specific dashboard components
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'

const RoleBasedDashboard = () => {
  const [userRole, setUserRole] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const determineUserRole = () => {
      // Check for admin authentication
      const adminToken = localStorage.getItem('adminToken')
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}')

      // Check for teacher authentication
      const teacherToken = localStorage.getItem('teacherToken')
      const teacherInfo = JSON.parse(
        localStorage.getItem('teacherInfo') || '{}'
      )

      // Check for student authentication
      const userToken = localStorage.getItem('userToken')
      const userInfoData = JSON.parse(localStorage.getItem('userInfo') || '{}')

      if (adminToken && adminInfo.email) {
        setUserRole('admin')
        setUserInfo(adminInfo)
      } else if (teacherToken && teacherInfo.email) {
        setUserRole('teacher')
        setUserInfo(teacherInfo)
      } else if (userToken && userInfoData.email) {
        setUserRole('student')
        setUserInfo(userInfoData)
      } else {
        // No valid authentication found
        navigate('/login')
        return
      }

      setLoading(false)
    }

    determineUserRole()
  }, [navigate])

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('teacherInfo')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')

    // Redirect to login
    navigate('/login')
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  // Render role-specific dashboard
  switch (userRole) {
    case 'admin':
      return <AdminDashboard userInfo={userInfo} onLogout={handleLogout} />
    case 'teacher':
      return <TeacherDashboard userInfo={userInfo} onLogout={handleLogout} />
    case 'student':
      return <StudentDashboard userInfo={userInfo} onLogout={handleLogout} />
    default:
      navigate('/login')
      return null
  }
}

export default RoleBasedDashboard
