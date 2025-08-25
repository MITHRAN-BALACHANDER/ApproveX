import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import TeacherDashboard from './components/TeacherDashboard';
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
              user ? <Navigate to="/" replace /> : <Register onRegister={handleRegister} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path='/' 
            element={
              user ? <Home user={user} /> : <Navigate to="/login" replace />
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
              user ? <About /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path='/contact' 
            element={
              user ? <Contact /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
