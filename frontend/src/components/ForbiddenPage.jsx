import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const ForbiddenPage = () => {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    // Determine current user role
    if (localStorage.getItem('adminToken')) setUserRole('admin')
    else if (localStorage.getItem('teacherToken')) setUserRole('teacher')
    else if (localStorage.getItem('userToken')) setUserRole('student')
  }, [])

  const handleGoToDashboard = () => {
    const roleRedirects = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    }

    const dashboardPath = roleRedirects[userRole] || '/login'
    navigate(dashboardPath)
  }

  const handleLogout = () => {
    // Clear all tokens
    localStorage.removeItem('adminToken')
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('userToken')
    localStorage.removeItem('adminInfo')
    localStorage.removeItem('teacherInfo')
    localStorage.removeItem('userInfo')

    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <div className='text-center'>
            {/* 403 Icon */}
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.1 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Access Forbidden
            </h2>

            <p className='mt-2 text-sm text-gray-600'>
              You don't have permission to access this page.
            </p>

            {userRole && (
              <p className='mt-2 text-sm text-blue-600'>
                You are logged in as:{' '}
                <span className='font-medium capitalize'>{userRole}</span>
              </p>
            )}

            <div className='mt-6 space-y-3'>
              {userRole ? (
                <button
                  onClick={handleGoToDashboard}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Go to My Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Go to Login
                </button>
              )}

              <button
                onClick={handleLogout}
                className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Logout & Login as Different User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForbiddenPage
