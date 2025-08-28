import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UnifiedLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Use the auto-login endpoint that detects role automatically
      const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/role-auth/auto-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store role-specific tokens and user info
        const tokenKeys = {
          admin: 'adminToken',
          teacher: 'teacherToken', 
          student: 'userToken'
        };
        
        const infoKeys = {
          admin: 'adminInfo',
          teacher: 'teacherInfo',
          student: 'userInfo'
        };

        const tokenKey = tokenKeys[result.role];
        const infoKey = infoKeys[result.role];
        
        localStorage.setItem(tokenKey, result.token);
        localStorage.setItem(infoKey, JSON.stringify(result.user));
        
        // Clear other role tokens to prevent conflicts
        Object.entries(tokenKeys).forEach(([role, key]) => {
          if (role !== result.role) {
            localStorage.removeItem(key);
            localStorage.removeItem(infoKeys[role]);
          }
        });
        
        // Call parent login handler with role information
        onLogin(result.user, result.role);
        
        // Redirect to role-specific dashboard
        navigate(result.redirectTo);
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mb-4">
            🎓
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            OD Provider System
          </h2>
          <p className="text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 border border-red-300 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="text-center text-sm text-gray-600">
          <p>Enter your credentials to access your dashboard</p>
          <p className="mt-1">System will automatically detect your role</p>
        </div>
      </div>
    </div>
  );
}

export default UnifiedLogin;
