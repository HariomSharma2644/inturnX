import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

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

                {/* Profile Avatar */}
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 focus:outline-none p-2 rounded-full hover:bg-white/10">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-[#FF4B2B] to-[#FF8E53] text-white px-4 py-2 rounded-lg hover:shadow-[#FF4B2B]/40 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  Logout
                </button>

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