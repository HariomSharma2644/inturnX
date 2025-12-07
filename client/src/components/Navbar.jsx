import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/inturnx-logo.svg" alt="InturnX" className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-[#14A44D] transition-colors">
                  Dashboard
                </Link>
                <Link to="/learning" className="text-white hover:text-[#14A44D] transition-colors">
                  Learning
                </Link>
                <Link to="/battle" className="text-white hover:text-[#14A44D] transition-colors">
                  Battle Arena
                </Link>
                <Link to="/projects" className="text-white hover:text-[#14A44D] transition-colors">
                  Projects
                </Link>
                <Link to="/internships" className="text-white hover:text-[#14A44D] transition-colors">
                  Internships
                </Link>
                <Link to="/community" className="text-white hover:text-[#14A44D] transition-colors">
                  Community
                </Link>
                <Link to="/mentor" className="text-white hover:text-[#14A44D] transition-colors">
                  AI Mentor
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-red-400 hover:text-red-300 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/10">
                  <span className="text-gray-300 text-sm">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="text-white hover:text-[#14A44D] transition-colors">
                  Home
                </Link>
                <Link to="/login" className="text-white hover:text-[#14A44D] transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#14A44D] text-white px-4 py-2 rounded-lg hover:bg-[#14A44D]/80 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="text-gray-300 text-sm mb-4">Welcome, {user?.name}</div>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Dashboard
                </Link>
                <Link to="/learning" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Learning
                </Link>
                <Link to="/battle" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Battle Arena
                </Link>
                <Link to="/projects" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Projects
                </Link>
                <Link to="/internships" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Internships
                </Link>
                <Link to="/community" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Community
                </Link>
                <Link to="/mentor" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  AI Mentor
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-red-400 hover:text-red-300 transition-colors py-2">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Home
                </Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-[#14A44D] transition-colors py-2">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block bg-[#14A44D] text-white px-4 py-2 rounded-lg hover:bg-[#14A44D]/80 transition-colors inline-block">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
