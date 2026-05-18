import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', protected: false },
    { path: '/planner', label: 'Planner', protected: true },
    { path: '/timer', label: 'Clock', protected: true },
    { path: '/creativezone', label: 'Creative Zone', protected: true },
    { path: '/connectus', label: 'Connect Us', protected: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e, link) => {
    if (link.protected && !user) {
      e.preventDefault();
      setShowAuthPopup(true);
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
    <header className="w-full top-0 sticky bg-surface-bright border-b border-surface-variant z-50">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-16">
        {/* Logo */}
        <div className="font-headline-md text-headline-md text-primary">
          <NavLink to="/">Achievers</NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-gutter">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={({ isActive }) =>
                `font-body-md text-body-md transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {(user?.role === 'admin' || user?.role === 'admin-pending') && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `font-body-md text-body-md transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-primary hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-bright border-t border-surface-variant overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg font-body-md text-body-md ${
                      isActive
                        ? 'bg-primary-container text-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-variant'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {(user?.role === 'admin' || user?.role === 'admin-pending') && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg font-body-md text-body-md ${
                      isActive
                        ? 'bg-primary-container text-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-variant'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
      
      {/* Auth Popup Modal */}
      <AnimatePresence>
        {showAuthPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowAuthPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-surface-container-lowest rounded-xl p-6 max-w-sm text-center border border-surface-variant shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <span className="material-symbols-outlined text-primary text-5xl mb-3">lock</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Signup first</h3>
              <p className="text-on-surface-variant mb-6">You need to be a logged-in member to access this page.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAuthPopup(false)}
                  className="px-5 py-2 border border-surface-variant rounded-lg hover:bg-surface-variant/50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;