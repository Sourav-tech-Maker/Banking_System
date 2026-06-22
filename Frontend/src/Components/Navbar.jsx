import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, LayoutDashboard, Wallet, ArrowLeftRight } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate('/')
  }

  const isHome = location.pathname === '/'

  const getAnchorLink = (anchor) => {
    return isHome ? anchor : `/${anchor}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link 
          to={user ? '/dashboard' : '/'} 
          className="text-2xl font-bold text-navy tracking-wider no-underline flex items-center gap-2"
        >
          <span className="bg-gradient-to-r from-navy to-navy-light text-transparent bg-clip-text font-extrabold">NEXORA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              {/* Authenticated Links */}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1.5 font-medium no-underline transition-colors ${
                  location.pathname === '/dashboard' ? 'text-gold' : 'text-text-secondary hover:text-navy'
                }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link 
                to="/accounts" 
                className={`flex items-center gap-1.5 font-medium no-underline transition-colors ${
                  location.pathname === '/accounts' ? 'text-gold' : 'text-text-secondary hover:text-navy'
                }`}
              >
                <Wallet size={16} />
                Accounts
              </Link>
              <Link 
                to="/transfer" 
                className={`flex items-center gap-1.5 font-medium no-underline transition-colors ${
                  location.pathname === '/transfer' ? 'text-gold' : 'text-text-secondary hover:text-navy'
                }`}
              >
                <ArrowLeftRight size={16} />
                Transfer
              </Link>
            </>
          ) : (
            <>
              {/* Guest Links */}
              <a href={getAnchorLink('#features')} className="text-text-secondary hover:text-navy font-medium no-underline transition-colors">Features</a>
              <a href={getAnchorLink('#security')} className="text-text-secondary hover:text-navy font-medium no-underline transition-colors">Security</a>
              <a href={getAnchorLink('#about')} className="text-text-secondary hover:text-navy font-medium no-underline transition-colors">About</a>
              <a href={getAnchorLink('#contact')} className="text-text-secondary hover:text-navy font-medium no-underline transition-colors">Contact</a>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User profile info */}
              <div className="flex items-center gap-2 bg-navy/5 border border-navy/10 px-4 py-2 rounded-xl">
                <div className="w-6.5 h-6.5 rounded-full bg-navy text-gold flex items-center justify-center text-xs font-bold">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-navy">{user.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-transparent border-none text-danger hover:text-danger/80 font-semibold cursor-pointer px-2 py-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-navy hover:text-navy-light font-semibold no-underline px-4 py-2 transition-all"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-navy hover:bg-navy-light text-gold font-semibold no-underline px-5 py-2.5 rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                Open Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-navy bg-transparent border-none cursor-pointer p-1"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-4 animate-fade-in-up">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 font-medium no-underline px-2 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/dashboard' ? 'bg-navy/5 text-gold' : 'text-text-secondary hover:bg-bg hover:text-navy'
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link 
                to="/accounts" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 font-medium no-underline px-2 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/accounts' ? 'bg-navy/5 text-gold' : 'text-text-secondary hover:bg-bg hover:text-navy'
                }`}
              >
                <Wallet size={18} />
                Accounts
              </Link>
              <Link 
                to="/transfer" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 font-medium no-underline px-2 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/transfer' ? 'bg-navy/5 text-gold' : 'text-text-secondary hover:bg-bg hover:text-navy'
                }`}
              >
                <ArrowLeftRight size={18} />
                Transfer
              </Link>
              <div className="h-px bg-border my-1"></div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-navy text-gold flex items-center justify-center text-sm font-bold">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-bold text-navy">{user.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-transparent border-none text-danger font-semibold cursor-pointer py-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <a 
                href={getAnchorLink('#features')} 
                onClick={() => setIsOpen(false)} 
                className="text-text-secondary hover:bg-bg hover:text-navy font-medium no-underline px-2 py-1.5 rounded-lg transition-all"
              >
                Features
              </a>
              <a 
                href={getAnchorLink('#security')} 
                onClick={() => setIsOpen(false)} 
                className="text-text-secondary hover:bg-bg hover:text-navy font-medium no-underline px-2 py-1.5 rounded-lg transition-all"
              >
                Security
              </a>
              <a 
                href={getAnchorLink('#about')} 
                onClick={() => setIsOpen(false)} 
                className="text-text-secondary hover:bg-bg hover:text-navy font-medium no-underline px-2 py-1.5 rounded-lg transition-all"
              >
                About
              </a>
              <a 
                href={getAnchorLink('#contact')} 
                onClick={() => setIsOpen(false)} 
                className="text-text-secondary hover:bg-bg hover:text-navy font-medium no-underline px-2 py-1.5 rounded-lg transition-all"
              >
                Contact
              </a>
              <div className="h-px bg-border my-1"></div>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="text-navy font-semibold text-center no-underline py-2 rounded-lg hover:bg-bg transition-all"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="bg-navy text-gold font-semibold text-center no-underline py-3 rounded-xl shadow-md hover:bg-navy-light transition-all text-center"
              >
                Open Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
