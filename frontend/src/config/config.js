const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const config = {
  api: {
    baseUrl: API_BASE_URL,
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      register: `${API_BASE_URL}/auth/register`,
      verifyEmail: `${API_BASE_URL}/auth/verify-email`,
      forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
      resetPassword: `${API_BASE_URL}/auth/reset-password`,
    },
    roleAuth: `${API_BASE_URL}/role-auth`,
    autoLogin: `${API_BASE_URL}/role-auth/auto-login`,
    odRequests: `${API_BASE_URL}/duty-requests`,
    leaveRequests: `${API_BASE_URL}/leave-requests`,
    admin: {
      dashboard: `${API_BASE_URL}/admin/dashboard`,
      teachers: `${API_BASE_URL}/admin/teachers`,
      students: `${API_BASE_URL}/admin/students`,
      stats: `${API_BASE_URL}/admin/stats`,
    },
    user: {
      profile: `${API_BASE_URL}/users/profile`,
      changePassword: `${API_BASE_URL}/users/change-password`,
    }
  }
};

export default config;
