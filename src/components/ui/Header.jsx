import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  
  const userMenuItems = [
    { label: 'Profile', path: '/user-profile', icon: 'User' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/user-login');
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Habits', path: '/habit-goal-tracker', icon: 'Target' },
    { label: 'Progress', path: '/progress-photos', icon: 'Camera' },
    { label: 'Nutrition', path: '/nutrition-tracker', icon: 'Apple' },
    { label: 'Community', path: '/community-hub', icon: 'Users' },
    { label: 'Achievements', path: '/achievements', icon: 'Award' },
  ];

  // Add admin dashboard to navigation if user is admin
  if (isAdmin) {
    mainNavItems?.push({ label: 'Admin', path: '/admin-dashboard', icon: 'Shield' });
  }

  const isActive = (path) => location?.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/user-login');
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/user-profile');
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/user-login');
    setIsMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate('/user-registration');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile-First Responsive Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                StriveTrack
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainNavItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} strokeWidth={2} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile/Tablet Menu Button & User Menu */}
            <div className="flex items-center space-x-2">
              {/* User Menu - Responsive */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    {userProfile?.profile_picture_url ? (
                      <img
                        src={userProfile?.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={16} color="white" strokeWidth={2} />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-24 truncate">
                    {userProfile?.full_name || 'User'}
                  </span>
                  <Icon 
                    name={userMenuOpen ? "ChevronUp" : "ChevronDown"} 
                    size={14} 
                    className="hidden sm:block text-muted-foreground" 
                  />
                </button>

                {/* User Dropdown Menu - Mobile Optimized */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userProfile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      {userMenuItems?.map((item) => (
                        <Link
                          key={item?.path}
                          to={item?.path}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Icon name={item?.icon} size={16} strokeWidth={2} />
                          <span>{item?.label}</span>
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Icon name="LogOut" size={16} strokeWidth={2} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon 
                  name={mobileMenuOpen ? "X" : "Menu"} 
                  size={20} 
                  strokeWidth={2} 
                  className="text-foreground"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {mainNavItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={18} strokeWidth={2} />
                    <span>{item?.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;