import config from '../config/config'

class AuthService {
  // Login with role-based authentication
  async login(email, password, role) {
    try {
      const response = await fetch(`${config.api.roleAuth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      const result = await response.json()

      if (result.success) {
        // Store tokens and user info based on role
        const tokenKey = this.getTokenKey(role)
        const infoKey = this.getInfoKey(role)

        localStorage.setItem(tokenKey, result.token)
        localStorage.setItem(infoKey, JSON.stringify(result.user))

        // Clear other role tokens
        this.clearOtherRoleTokens(role)

        return {
          success: true,
          user: result.user,
          token: result.token,
          redirectTo: result.redirectTo,
        }
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Network error. Please try again.',
      }
    }
  }

  // Logout and clear all authentication data
  logout() {
    try {
      // Clear all role-specific tokens and info
      localStorage.removeItem('userToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('teacherToken')
      localStorage.removeItem('teacherInfo')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, message: 'Logout failed' }
    }
  }

  // Get current user information
  async getCurrentUser() {
    try {
      const token = this.getCurrentToken()
      if (!token) return null

      const response = await fetch(`${config.api.roleAuth}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          return result.user
        }
      }

      // If API fails, return cached user info
      return this.getCachedUserInfo()
    } catch (error) {
      console.error('Get current user error:', error)
      return this.getCachedUserInfo()
    }
  }

  // Verify token validity
  async verifyToken() {
    try {
      const token = this.getCurrentToken()
      if (!token) return { valid: false }

      const response = await fetch(`${config.api.roleAuth}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Token verification error:', error)
      return { valid: false, message: 'Network error' }
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getCurrentToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`${config.api.roleAuth}/change-password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: 'Failed to change password',
      }
    }
  }

  // Get current authentication status
  getAuthStatus() {
    const adminToken = localStorage.getItem('adminToken')
    const teacherToken = localStorage.getItem('teacherToken')
    const userToken = localStorage.getItem('userToken')

    if (adminToken) {
      return {
        isAuthenticated: true,
        role: 'admin',
        token: adminToken,
        userInfo: this.getCachedUserInfo('admin'),
      }
    } else if (teacherToken) {
      return {
        isAuthenticated: true,
        role: 'teacher',
        token: teacherToken,
        userInfo: this.getCachedUserInfo('teacher'),
      }
    } else if (userToken) {
      return {
        isAuthenticated: true,
        role: 'student',
        token: userToken,
        userInfo: this.getCachedUserInfo('student'),
      }
    }

    return {
      isAuthenticated: false,
      role: null,
      token: null,
      userInfo: null,
    }
  }

  // Get role-specific dashboard route
  getDashboardRoute(role) {
    const routes = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    }
    return routes[role] || '/login'
  }

  // Helper methods
  getTokenKey(role) {
    const keys = {
      student: 'userToken',
      teacher: 'teacherToken',
      admin: 'adminToken',
    }
    return keys[role]
  }

  getInfoKey(role) {
    const keys = {
      student: 'userInfo',
      teacher: 'teacherInfo',
      admin: 'adminInfo',
    }
    return keys[role]
  }

  getCurrentToken() {
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('teacherToken') ||
      localStorage.getItem('userToken')
    )
  }

  getCurrentRole() {
    if (localStorage.getItem('adminToken')) return 'admin'
    if (localStorage.getItem('teacherToken')) return 'teacher'
    if (localStorage.getItem('userToken')) return 'student'
    return null
  }

  getCachedUserInfo(role = null) {
    const currentRole = role || this.getCurrentRole()
    if (!currentRole) return null

    const infoKey = this.getInfoKey(currentRole)
    const userInfo = localStorage.getItem(infoKey)
    return userInfo ? JSON.parse(userInfo) : null
  }

  clearOtherRoleTokens(keepRole) {
    const allRoles = ['student', 'teacher', 'admin']
    allRoles.forEach(role => {
      if (role !== keepRole) {
        localStorage.removeItem(this.getTokenKey(role))
        localStorage.removeItem(this.getInfoKey(role))
      }
    })
  }

  // Check if user has required role
  hasRole(requiredRole) {
    const currentRole = this.getCurrentRole()
    return currentRole === requiredRole
  }

  // Check if user has any of the required roles
  hasAnyRole(requiredRoles) {
    const currentRole = this.getCurrentRole()
    return requiredRoles.includes(currentRole)
  }
}

export default new AuthService()
