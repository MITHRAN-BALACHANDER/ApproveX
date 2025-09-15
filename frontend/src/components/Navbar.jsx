import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BarChart3, 
  Info, 
  Mail, 
  GraduationCap, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    onLogout()
    setIsMenuOpen(false)
  }

  const isActive = path => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    ...(user?.role === 'teacher'
      ? [{ path: '/dashboard', label: 'Dashboard', icon: BarChart3 }]
      : []),
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <nav className='sticky top-0 z-50 glass bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo and brand */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center group'>
              <div className='h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl mr-3 shadow-lg group-hover:scale-105 transition-transform duration-200'>
                <GraduationCap size={20} />
              </div>
              <div>
                <span className='text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                  OD Provider
                </span>
                <div className='text-xs text-gray-500 font-medium'>
                  Management System
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className='hidden md:flex items-center space-x-1'>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User menu - Desktop */}
          <div className='hidden md:flex items-center space-x-4'>
            <div className='flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200'>
              <div className='h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold'>
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.fullName?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
              <div className='text-left'>
                <div className='text-sm font-semibold text-gray-900'>
                  {user?.name || user?.fullName || 'User'}
                </div>
                <div className='text-xs text-gray-500 capitalize'>
                  {user?.role || 'Student'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg'
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-4 space-y-2 border-t border-gray-200 bg-white/95 backdrop-blur-sm'>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600 shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className='border-t border-gray-200 pt-4 mt-4'>
                <div className='flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-3'>
                  <div className='h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold'>
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.fullName?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </div>
                  <div className='text-left'>
                    <div className='text-sm font-semibold text-gray-900'>
                      {user?.name || user?.fullName || 'User'}
                    </div>
                    <div className='text-xs text-gray-500 capitalize'>
                      {user?.role || 'Student'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className='flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-base font-semibold transition-all duration-200 shadow-md'
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
