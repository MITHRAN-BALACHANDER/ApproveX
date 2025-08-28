import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) => {
  const [isVerifying, setIsVerifying] = useState(true)
  const [authStatus, setAuthStatus] = useState({
    isValid: false,
    userRole: null,
  })

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // Check for tokens in localStorage
        const adminToken = localStorage.getItem('adminToken')
        const teacherToken = localStorage.getItem('teacherToken')
        const userToken = localStorage.getItem('userToken')

        let token = null
        let expectedRole = null

        if (adminToken) {
          token = adminToken
          expectedRole = 'admin'
        } else if (teacherToken) {
          token = teacherToken
          expectedRole = 'teacher'
        } else if (userToken) {
          token = userToken
          expectedRole = 'student'
        }

        if (!token) {
          setAuthStatus({ isValid: false, userRole: null })
          setIsVerifying(false)
          return
        }

        // Verify token with backend
        const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(
          `${API_BASE_URL}/role-auth/verify`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        const result = await response.json()

        if (result.success && result.valid) {
          // Verify role matches expected
          if (result.user.role === expectedRole) {
            setAuthStatus({
              isValid: true,
              userRole: result.user.role,
              userData: result.user,
            })
          } else {
            // Role mismatch - clear tokens and redirect
            localStorage.removeItem('adminToken')
            localStorage.removeItem('teacherToken')
            localStorage.removeItem('userToken')
            localStorage.removeItem('adminInfo')
            localStorage.removeItem('teacherInfo')
            localStorage.removeItem('userInfo')
            setAuthStatus({ isValid: false, userRole: null })
          }
        } else {
          // Invalid token - clear storage
          localStorage.removeItem('adminToken')
          localStorage.removeItem('teacherToken')
          localStorage.removeItem('userToken')
          localStorage.removeItem('adminInfo')
          localStorage.removeItem('teacherInfo')
          localStorage.removeItem('userInfo')
          setAuthStatus({ isValid: false, userRole: null })
        }
      } catch (error) {
        console.error('Authentication verification error:', error)
        // On network error, fall back to local check
        const adminToken = localStorage.getItem('adminToken')
        const teacherToken = localStorage.getItem('teacherToken')
        const userToken = localStorage.getItem('userToken')

        if (adminToken || teacherToken || userToken) {
          let role = null
          if (adminToken) role = 'admin'
          else if (teacherToken) role = 'teacher'
          else if (userToken) role = 'student'

          setAuthStatus({ isValid: true, userRole: role })
        } else {
          setAuthStatus({ isValid: false, userRole: null })
        }
      } finally {
        setIsVerifying(false)
      }
    }

    verifyAuthentication()
  }, [])

  // Show loading spinner while verifying
  if (isVerifying) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!authStatus.isValid) {
    return <Navigate to={redirectTo} replace />
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(authStatus.userRole)) {
    // Redirect to role-specific dashboard
    const roleRedirects = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    }

    const redirectPath = roleRedirects[authStatus.userRole] || '/login'
    return <Navigate to={redirectPath} replace />
  }

  // Authentication and authorization successful
  return children
}

export default ProtectedRoute
