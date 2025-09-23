import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import MediaManagement from './components/MediaManagement';
import SystemAnalytics from './components/SystemAnalytics';
import ContentModeration from './components/ContentModeration';
import SecurityMonitoring from './components/SecurityMonitoring';
import SystemAnnouncements from './components/SystemAnnouncements';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase, isAdminUser } from '../../lib/supabase';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('media');
  const [statsLoading, setStatsLoading] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalMedia: 0,
    flaggedContent: 0,
    systemUptime: '100%',
    serverLoad: 0
  });

  // Check if current authenticated user is admin
  const verifyAdminAccess = async () => {
    if (!user) {
      setAdminLoading(false);
      return false;
    }

    try {
      setAdminLoading(true);
      // 1) Fast client check by admin email
      if (isAdminUser(user)) {
        setIsAdminVerified(true);
        return true;
      }

      // 2) Fallback: check profiles.is_admin for this user
      const { data: profile, error } = await supabase
        ?.from('profiles')
        ?.select('is_admin')
        ?.eq('id', user?.id)
        ?.single();

      if (error) {
        console.error('Admin verification profiles error:', error);
        return false;
      }

      if (profile?.is_admin === true) {
        setIsAdminVerified(true);
        return true;
      }

      // Not admin → redirect
      navigate('/dashboard');
      return false;
    } catch (error) {
      console.error('Admin verification failed:', error);
      navigate('/dashboard');
      return false;
    } finally {
      setAdminLoading(false);
    }
  };

  // Fetch real statistics from database
  const fetchSystemStats = async () => {
    try {
      setStatsLoading(true);

      // Get total users count from profiles
      const { count: totalUsersCount, error: usersError } = await supabase?.from('profiles')?.select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Get active users count (users who are is_admin = false)
      const { count: activeUsersCount, error: activeError } = await supabase?.from('profiles')?.select('*', { count: 'exact', head: true })?.eq('is_admin', false);

      if (activeError) {
        console.error('Error fetching active users count:', activeError);
      }

      // Get new users today
      const today = new Date();
      today?.setHours(0, 0, 0, 0);
      const { count: newUsersCount, error: newUsersError } = await supabase?.from('profiles')?.select('*', { count: 'exact', head: true })?.gte('created_at', today?.toISOString());

      if (newUsersError) {
        console.error('Error fetching new users count:', newUsersError);
      }

      // Get total media files count
      const { count: totalMediaCount, error: mediaError } = await supabase?.from('media_files')?.select('*', { count: 'exact', head: true });

      if (mediaError) {
        console.error('Error fetching media count:', mediaError);
      }

      // Get flagged content count (status = 'flagged')
      const { count: flaggedCount, error: flaggedError } = await supabase?.from('media_files')?.select('*', { count: 'exact', head: true })?.eq('status', 'flagged');

      if (flaggedError) {
        console.error('Error fetching flagged content count:', flaggedError);
      }

      // Update stats with real database values (defaults to 0 if query fails)
      setSystemStats({
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        newUsersToday: newUsersCount || 0,
        totalMedia: totalMediaCount || 0,
        flaggedContent: flaggedCount || 0,
        systemUptime: '100%',
        serverLoad: Math.floor(Math.random() * 50) // Keep as simulated value
      });

    } catch (error) {
      console.error('Error fetching system statistics:', error);
      // Keep default values (all zeros) if there's an error
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase?.auth?.signOut();
      navigate('/user-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Verify admin access when user authentication changes
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/user-login');
        return;
      }
      
      verifyAdminAccess()?.then((isAdmin) => {
        if (isAdmin) {
          fetchSystemStats();
        }
      });
    }
  }, [user, loading, navigate]);

  // Auto-refresh stats every 30 seconds when authenticated
  useEffect(() => {
    let interval;
    if (isAdminVerified) {
      interval = setInterval(fetchSystemStats, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAdminVerified]);

  // Show loading while auth is being determined
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {loading ? 'Checking authentication...' : 'Verifying admin access...'}
          </p>
        </div>
      </div>
    );
  }

  // If not verified admin, this will be handled by useEffect redirect
  if (!isAdminVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive"></div>
          <p className="text-muted-foreground">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'media', label: 'Media Management', icon: 'Image' },
    { id: 'overview', label: 'Dashboard Overview', icon: 'LayoutDashboard' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'moderation', label: 'Content Moderation', icon: 'Shield' },
    { id: 'analytics', label: 'System Analytics', icon: 'BarChart3' },
    { id: 'security', label: 'Security', icon: 'Lock' },
    { id: 'announcements', label: 'Announcements', icon: 'Megaphone' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Admin Header */}
      <header className="bg-card border-b border-border shadow-elevation-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Media Management Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  Authenticated: {user?.email || 'Unknown'} • Full Admin Access
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                <Icon name="CheckCircle" size={16} className="text-green-600" color="#16a34a" />
                <span>System Active</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Icon name="Database" size={16} color="#2563eb" />
                <span>{systemStats?.totalMedia} Media Files</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} strokeWidth={2} color="#6b7280" />
                  <span>{tab?.label}</span>
                  {tab?.id === 'media' && systemStats?.totalMedia > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {systemStats?.totalMedia}
                    </span>
                  )}
                  {tab?.id === 'moderation' && systemStats?.flaggedContent > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {systemStats?.flaggedContent}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'media' && <MediaManagement />}
          
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Authentication Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Shield" size={20} className="text-green-600 mt-0.5" color="#16a34a" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Admin Dashboard Active</h3>
                    <p className="text-xs text-green-700 mt-1">
                      Full access to media management system with real-time data updates.
                      {statsLoading ? ' Loading current data...' : ' Data refreshes every 30 seconds.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">
                        {statsLoading ? (
                          <Icon name="Loader2" size={24} className="animate-spin text-blue-500" color="#3b82f6" />
                        ) : (
                          systemStats?.totalUsers?.toLocaleString()
                        )}
                      </p>
                    </div>
                    <Icon name="Users" size={24} className="text-blue-500" color="#3b82f6" />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-foreground">
                        {statsLoading ? (
                          <Icon name="Loader2" size={24} className="animate-spin text-green-500" color="#22c55e" />
                        ) : (
                          systemStats?.activeUsers?.toLocaleString()
                        )}
                      </p>
                    </div>
                    <Icon name="UserCheck" size={24} className="text-green-500" color="#22c55e" />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1 ring-2 ring-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Media Files</p>
                      <p className="text-2xl font-bold text-primary">
                        {statsLoading ? (
                          <Icon name="Loader2" size={24} className="animate-spin text-primary" color="#a855f7" />
                        ) : (
                          systemStats?.totalMedia?.toLocaleString()
                        )}
                      </p>
                    </div>
                    <Icon name="Image" size={24} className="text-primary" color="#a855f7" />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Flagged Content</p>
                      <p className="text-2xl font-bold text-foreground">
                        {statsLoading ? (
                          <Icon name="Loader2" size={24} className="animate-spin text-red-500" color="#ef4444" />
                        ) : (
                          systemStats?.flaggedContent
                        )}
                      </p>
                    </div>
                    <Icon name="AlertTriangle" size={24} className="text-red-500" color="#ef4444" />
                  </div>
                </div>
              </div>

              {/* Media Management Quick Access */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('media')}
                    className="h-20 flex-col space-y-2"
                    variant="outline"
                  >
                    <Icon name="Image" size={24} strokeWidth={2} color="#6b7280" />
                    <span className="text-sm">Manage Media</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('users')}
                    className="h-20 flex-col space-y-2"
                    variant="outline"
                  >
                    <Icon name="Users" size={24} strokeWidth={2} color="#6b7280" />
                    <span className="text-sm">User Management</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('moderation')}
                    className="h-20 flex-col space-y-2"
                    variant="outline"
                  >
                    <Icon name="Shield" size={24} strokeWidth={2} color="#6b7280" />
                    <span className="text-sm">Content Moderation</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'moderation' && <ContentModeration />}
          {activeTab === 'analytics' && <SystemAnalytics />}
          {activeTab === 'security' && <SecurityMonitoring />}
          {activeTab === 'announcements' && <SystemAnnouncements />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;