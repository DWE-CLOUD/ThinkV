import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Settings, User, Cpu, Search, Menu, ChevronDown, LogOut, Smartphone, BarChart2, Home, Sparkles, Server, FileJson, BookOpen } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const { currentUser, signOut } = useAppContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if the click is inside a menu button
      const target = e.target as HTMLElement;
      if (target.closest('[data-menu-button]')) {
        return;
      }
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent propagation to avoid closing when clicking on the menu itself
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={16} className="mr-1.5" /> },
    { path: '/devices', label: 'Devices', icon: <Smartphone size={16} className="mr-1.5" /> },
    { path: '/api-docs', label: 'API', icon: <FileJson size={16} className="mr-1.5" /> },
    { path: '/simulator', label: 'Simulator', icon: <Server size={16} className="mr-1.5" /> },
    { path: '/documentation', label: 'Docs', icon: <BookOpen size={16} className="mr-1.5" /> }
  ];

  // Check if path is active (includes partial matching for sub-paths)
  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  return (
    <header className="bg-beige-100 border-b border-beige-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              {isLandingPage ? (
                <>
                  <div className="relative">
                    <motion.div 
                      className="absolute -inset-1 bg-gradient-to-r from-coffee-600 to-sand-500 rounded-lg blur-sm opacity-70"
                      animate={{ 
                        opacity: [0.5, 0.7, 0.5],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    ></motion.div>
                    <motion.div 
                      className="relative bg-coffee-600 text-white p-2 rounded-md"
                      whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
                    >
                      <Cpu size={24} />
                    </motion.div>
                  </div>
                  <motion.h1 
                    className="text-xl font-extrabold tracking-tighter bg-gradient-to-r from-coffee-900 to-sand-600 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Think<span className="text-coffee-600">V</span>
                    <motion.span 
                      className="absolute -top-1 -right-1 text-xs" 
                      animate={{ 
                        opacity: [0, 1, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 4
                      }}
                    >
                      <Sparkles size={14} className="text-sand-500" />
                    </motion.span>
                  </motion.h1>
                </>
              ) : (
                <h1 className="text-xl font-bold text-coffee-800">ThinkV</h1>
              )}
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 space-x-2 lg:space-x-6">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05, y: -1 }}
                >
                  <Link 
                    to={item.path}
                    className={`flex items-center text-sm px-2 py-1 rounded-md ${
                      isActive(item.path)
                        ? 'text-coffee-800 font-medium bg-beige-200'
                        : 'text-coffee-500 hover:text-coffee-700 hover:bg-beige-200'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Desktop Search */}
          <div className="hidden md:flex items-center bg-beige-200 rounded-lg px-3 py-2 w-64">
            <Search size={18} className="text-coffee-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none text-coffee-700 focus:outline-none w-full placeholder-coffee-400"
            />
          </div>
          
          {/* Mobile Search Dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                className="absolute top-full left-0 right-0 bg-beige-100 shadow-md p-4 flex md:hidden z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={handleMenuClick}
              >
                <div className="flex items-center bg-beige-200 rounded-lg px-3 py-2 w-full">
                  <Search size={18} className="text-coffee-500 mr-2 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none text-coffee-700 focus:outline-none w-full placeholder-coffee-400"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* User Menu & Mobile Menu Button */}
          {currentUser ? (
            <motion.div 
              className="flex items-center space-x-1 md:space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Mobile search button */}
              <motion.button 
                data-menu-button="search"
                className="p-2 text-coffee-500 hover:text-coffee-700 rounded-full hover:bg-beige-200 md:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(!isSearchOpen);
                  setIsMobileMenuOpen(false);
                  setShowUserMenu(false);
                }}
              >
                <Search size={20} />
              </motion.button>
              
              {/* Desktop notification button */}
              <motion.button 
                className="p-2 text-coffee-500 hover:text-coffee-700 rounded-full hover:bg-beige-200 hidden sm:block"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={20} />
              </motion.button>
              
              {/* Desktop settings link */}
              <Link to="/settings" className="hidden sm:block">
                <motion.button 
                  className="p-2 text-coffee-500 hover:text-coffee-700 rounded-full hover:bg-beige-200"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={20} />
                </motion.button>
              </Link>
              
              {/* User avatar & profile menu */}
              <div className="relative">
                <motion.div 
                  data-menu-button="user"
                  className="relative flex items-center space-x-2 ml-2 p-2 rounded-lg hover:bg-beige-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(false);
                  }}
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="h-8 w-8 rounded-full object-cover border border-beige-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-beige-300 flex items-center justify-center text-coffee-600">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-coffee-700 hidden md:block">
                    {currentUser.name}
                  </span>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:block"
                  >
                    <ChevronDown size={16} className="text-coffee-500" />
                  </motion.div>
                </motion.div>
                
                {/* User dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 bg-beige-50 rounded-lg shadow-warm-lg border border-beige-200 py-1 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleMenuClick}
                    >
                      <div className="px-4 py-2 border-b border-beige-200">
                        <p className="text-sm font-medium text-coffee-800">{currentUser.name}</p>
                        <p className="text-xs text-coffee-500 truncate">{currentUser.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-coffee-700 hover:bg-beige-200 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          Profile
                        </div>
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-coffee-700 hover:bg-beige-200 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          Settings
                        </div>
                      </Link>
                      <Link 
                        to="/devices" 
                        className="block px-4 py-2 text-sm text-coffee-700 hover:bg-beige-200 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <Smartphone size={16} className="mr-2" />
                          Devices
                        </div>
                      </Link>
                      <Link 
                        to="/simulator" 
                        className="block px-4 py-2 text-sm text-coffee-700 hover:bg-beige-200 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <Server size={16} className="mr-2" />
                          Simulator
                        </div>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-rose-600 hover:bg-beige-200 transition-colors flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Mobile menu toggle button */}
              <motion.button 
                data-menu-button="mobile"
                className="md:hidden p-2 text-coffee-500 hover:text-coffee-700 rounded-full hover:bg-beige-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsSearchOpen(false);
                  setShowUserMenu(false);
                }}
                aria-label="Toggle mobile menu"
              >
                <Menu size={20} />
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                to="/" 
                className="text-coffee-700 hover:text-coffee-900 px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Log in
              </Link>
              <Link 
                to="/" 
                className="bg-coffee-600 hover:bg-coffee-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-coffee-950/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            ></motion.div>
            
            {/* Menu panel */}
            <motion.div 
              className="fixed inset-y-0 right-0 w-64 md:w-80 bg-beige-50 shadow-xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={handleMenuClick}
            >
              {/* User info (if logged in) */}
              {currentUser && (
                <div className="p-4 border-b border-beige-200 bg-beige-100">
                  <div className="flex items-center space-x-3">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="h-10 w-10 rounded-full object-cover border border-beige-300"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-beige-300 flex items-center justify-center text-coffee-600">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-coffee-800">{currentUser.name}</p>
                      <p className="text-xs text-coffee-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation links */}
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`flex items-center py-2.5 px-3 rounded-md text-sm font-medium ${
                      isActive(item.path) 
                        ? 'bg-beige-200 text-coffee-800' 
                        : 'text-coffee-600 hover:bg-beige-200 hover:text-coffee-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
              
              {/* Additional links section */}
              {currentUser && (
                <div className="pt-2 mt-2 p-4 border-t border-beige-200">
                  <h3 className="text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-2">
                    Account
                  </h3>
                  <div className="space-y-1">
                    <Link 
                      to="/profile" 
                      className="flex items-center py-2.5 px-3 rounded-md text-sm font-medium text-coffee-600 hover:bg-beige-200 hover:text-coffee-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center py-2.5 px-3 rounded-md text-sm font-medium text-coffee-600 hover:bg-beige-200 hover:text-coffee-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center py-2.5 px-3 rounded-md text-sm font-medium text-rose-600 hover:bg-beige-200 hover:text-rose-700 text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
              
              {/* Close button for better UX */}
              <div className="p-4 text-center mt-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-coffee-500 hover:text-coffee-700"
                >
                  Close menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;