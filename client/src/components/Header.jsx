import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#14A44D] to-[#5F2EEA] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-bold text-lg">I</span>
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] bg-clip-text text-transparent">
              InturnX
            </div>
          </Link>

          {/* Navigation - Only show for non-authenticated users on home page */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Testimonials
              </a>
            </nav>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>

                {/* Home Button */}
                <Link
                  to="/home"
                  className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white px-4 py-2 rounded-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105 font-medium hidden md:block"
                >
                  🏠 Home
                </Link>

                {/* Profile Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 focus:outline-none p-2 rounded-lg hover:bg-white/10"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden md:block">{user?.name || 'User'}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] rounded-full flex items-center justify-center text-white font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{user?.name || 'User'}</div>
                          <div className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}

              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white px-6 py-2 rounded-full hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;