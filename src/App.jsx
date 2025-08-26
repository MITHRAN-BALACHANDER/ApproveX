import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
// import RoleBasedLogin from './components/RoleBasedLogin';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import RoleBasedLogin from './components/RBLogin.jsx';
import NewRegister from './components/NewRegister';
import EmailVerification from './components/EmailVerification';
import AdminDashboard from './components/AdminDashboard';
import TeacherManagement from './components/TeacherManagement';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current authentication status
        const authStatus = authService.getAuthStatus();
        
        if (authStatus.isAuthenticated) {
          // Verify token validity with backend
          const verification = await authService.verifyToken();
          
          if (verification.valid) {
            // Get fresh user data
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser({ ...currentUser, role: authStatus.role });
            } else {
              // Use cached user info if API fails
              setUser({ ...authStatus.userInfo, role: authStatus.role });
            }
          } else {
            // Invalid token, clear authentication
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Use cached authentication if available
        const authStatus = authService.getAuthStatus();
        if (authStatus.isAuthenticated && authStatus.userInfo) {
          setUser({ ...authStatus.userInfo, role: authStatus.role });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (userData, role) => {
    setUser({ ...userData, role });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleRegister = (userData) => {
    setUser({ ...userData, role: 'student' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-light)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--color-light)', color: 'var(--color-dark)' }}>
      <div className="animated-gradient"></div>
      
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <main>
        <Routes>
          {/* Public login route */}
          <Route 
            path='/login' 
            element={
              user ? <Navigate to="/dashboard" replace /> : <RoleBasedLogin onLogin={handleLogin} />
            } 
          />
          
          {/* Registration routes */}
          <Route 
            path='/register' 
            element={
              user ? <Navigate to="/dashboard" replace /> : <NewRegister onRegister={handleRegister} />
            } 
          />
          <Route 
            path='/verify-email' 
            element={
              user ? <Navigate to="/dashboard" replace /> : <EmailVerification onRegister={handleRegister} />
            } 
          />
          
          {/* Main dashboard route */}
          <Route 
            path='/dashboard' 
            element={
              <ProtectedRoute user={user}>
                <RoleBasedDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin specific routes */}
          <Route 
            path='/admin/dashboard' 
            element={
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/admin/teachers' 
            element={
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <TeacherManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher specific routes */}
          <Route 
            path='/teacher/dashboard' 
            element={
              <ProtectedRoute user={user} allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Student specific routes */}
          <Route 
            path='/student/dashboard' 
            element={
              <ProtectedRoute user={user} allowedRoles={['student']}>
                <StudentDashboard userInfo={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy routes for compatibility */}
          <Route 
            path='/' 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path='/about' 
            element={
              <ProtectedRoute user={user}>
                <About />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/contact' 
            element={
              <ProtectedRoute user={user}>
                <Contact />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
