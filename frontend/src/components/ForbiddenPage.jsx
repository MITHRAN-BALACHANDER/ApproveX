import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, LogOut } from 'lucide-react'

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
    <div className='min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-card py-8 px-4 shadow-lg border border-border sm:rounded-xl sm:px-10'>
          <div className='text-center'>
            {/* 403 Icon */}
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10'>
              <AlertTriangle className='h-6 w-6 text-destructive' />
            </div>

            <h2 className='mt-6 text-3xl font-extrabold text-foreground'>
              Access Forbidden
            </h2>

            <p className='mt-2 text-sm text-muted-foreground'>
              You don't have permission to access this page.
            </p>

            {userRole && (
              <p className='mt-2 text-sm text-primary'>
                You are logged in as:{' '}
                <span className='font-medium capitalize'>{userRole}</span>
              </p>
            )}

            <div className='mt-6 space-y-3'>
              {userRole ? (
                <button
                  onClick={handleGoToDashboard}
                  className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors'
                >
                  Go to My Dashboard
                  <ArrowRight className='ml-2 h-4 w-4' />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className='w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors'
                >
                  Go to Login
                  <ArrowRight className='ml-2 h-4 w-4' />
                </button>
              )}

              <button
                onClick={handleLogout}
                className='w-full flex justify-center items-center py-2 px-4 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors'
              >
                <LogOut className='mr-2 h-4 w-4' />
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
