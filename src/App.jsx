import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import NewRegister from './components/NewRegister';
import EmailVerification from './components/EmailVerification';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TeacherManagement from './components/TeacherManagement';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import { getCurrentUser, isAuthenticated, removeAuthToken } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-light)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--color-light)', color: 'var(--color-dark)' }}>
      <div className="animated-gradient"></div>
      
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <main>
        <Routes>
          {/* Public routes */}
          <Route 
            path='/login' 
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path='/register' 
            element={
              user ? <Navigate to="/" replace /> : <NewRegister onRegister={handleRegister} />
            } 
          />
          <Route 
            path='/verify-email' 
            element={
              user ? <Navigate to="/" replace /> : <EmailVerification onRegister={handleRegister} />
            } 
          />
          
          {/* Admin routes */}
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/teachers' element={<TeacherManagement />} />
          
          {/* Teacher routes */}
          <Route path='/teacher/login' element={<TeacherLogin />} />
          <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
          
          {/* Student routes */}
          <Route 
            path='/student/login' 
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path='/student/register' 
            element={
              user ? <Navigate to="/" replace /> : <NewRegister onRegister={handleRegister} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path='/' 
            element={
              user ? <Home user={user} /> : <Navigate to="/student/login" replace />
            } 
          />
          <Route 
            path='/dashboard' 
            element={
              user && user.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" replace />
            } 
          />
          <Route 
            path='/about' 
            element={
              user ? <About /> : <Navigate to="/student/login" replace />
            } 
          />
          <Route 
            path='/contact' 
            element={
              user ? <Contact /> : <Navigate to="/student/login" replace />
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/student/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
