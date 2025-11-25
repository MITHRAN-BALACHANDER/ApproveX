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
    <nav className='sticky top-0 z-50 bg-background border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo and brand */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center group gap-3'>
              <div className='h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300'>
                <GraduationCap size={20} className='group-hover:rotate-6 transition-transform duration-300' />
              </div>
              <div>
                <span className='text-lg font-bold text-foreground tracking-tight block leading-none'>
                  OD Provider
                </span>
                <span className='text-xs text-muted-foreground font-medium block mt-0.5'>
                  Management System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className='hidden md:flex items-center gap-1'>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`group flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon size={16} className='group-hover:scale-110 transition-transform duration-300' />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User menu - Desktop */}
          <div className='hidden md:flex items-center gap-4'>
            <div className='flex items-center gap-3 px-3 py-1.5 rounded-md border border-border bg-card'>
              <div className='h-8 w-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-bold'>
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.fullName?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
              <div className='text-left'>
                <div className='text-sm font-medium text-foreground leading-none'>
                  {user?.name || user?.fullName || 'User'}
                </div>
                <div className='text-xs text-muted-foreground capitalize mt-0.5'>
                  {user?.role || 'Student'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className='group flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
            >
              <LogOut size={16} className='group-hover:translate-x-0.5 transition-transform duration-300' />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 hover:scale-110 active:scale-95'
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className='md:hidden border-t border-border bg-background'>
            <div className='px-2 pt-2 pb-4 space-y-1'>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon size={18} className='group-hover:scale-110 transition-transform duration-300' />
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className='border-t border-border pt-4 mt-4'>
                <div className='flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-md mb-3'>
                  <div className='h-10 w-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-bold border border-border'>
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.fullName?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </div>
                  <div className='text-left'>
                    <div className='text-sm font-medium text-foreground'>
                      {user?.name || user?.fullName || 'User'}
                    </div>
                    <div className='text-xs text-muted-foreground capitalize'>
                      {user?.role || 'Student'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className='group flex items-center justify-center gap-2 w-full px-4 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                >
                  <LogOut size={18} className='group-hover:translate-x-0.5 transition-transform duration-300' />
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
