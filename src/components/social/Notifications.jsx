import React, { useState, useEffect } from 'react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    
    // Generate sample notifications
    const sampleNotifications = [
      {
        id: 'notif_1',
        type: 'like',
        title: 'Sarah liked your post',
        message: 'Sarah Martinez liked your workout post "Just crushed a 5K run!"',
        user: {
          id: 'user_2',
          username: 'sarahfit',
          displayName: 'Sarah Martinez',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        isRead: false,
        action: 'View Post'
      },
      {
        id: 'notif_2',
        type: 'follow',
        title: 'New follower',
        message: 'Mike Chen started following you',
        user: {
          id: 'user_3',
          username: 'mikestrong',
          displayName: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        isRead: false,
        action: 'Follow Back'
      },
      {
        id: 'notif_3',
        type: 'comment',
        title: 'New comment',
        message: 'Emma Wilson commented: "Amazing progress! Keep it up! 💪"',
        user: {
          id: 'user_4',
          username: 'emmayoga',
          displayName: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isRead: true,
        action: 'Reply'
      },
      {
        id: 'notif_4',
        type: 'challenge',
        title: 'Challenge reminder',
        message: 'Don\'t forget to log today\'s workout for the "30-Day Fitness Streak" challenge',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: true,
        action: 'Log Workout'
      },
      {
        id: 'notif_5',
        type: 'achievement',
        title: 'New achievement unlocked!',
        message: 'Congratulations! You\'ve earned the "Week Warrior" badge for completing 7 workouts this week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        isRead: false,
        action: 'View Badge'
      },
      {
        id: 'notif_6',
        type: 'share',
        title: 'Workout shared',
        message: 'David Rodriguez shared your workout routine',
        user: {
          id: 'user_5',
          username: 'davidcardio',
          displayName: 'David Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        isRead: true,
        action: 'View Share'
      },
      {
        id: 'notif_7',
        type: 'leaderboard',
        title: 'Leaderboard update',
        message: 'You\'ve moved up 3 positions to #7 in this week\'s points leaderboard!',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        isRead: true,
        action: 'View Leaderboard'
      },
      {
        id: 'notif_8',
        type: 'milestone',
        title: 'Milestone achieved',
        message: 'Congratulations! You\'ve completed your 50th workout on StriveTrack!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        action: 'Share Achievement'
      }
    ];

    setTimeout(() => {
      setNotifications(sampleNotifications);
      setLoading(false);
    }, 500);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👥';
      case 'share': return '🔄';
      case 'achievement': return '🏆';
      case 'challenge': return '🎯';
      case 'leaderboard': return '📊';
      case 'milestone': return '🎉';
      default: return '📢';
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-white border-slate-200';
    
    switch (type) {
      case 'like': return 'bg-red-50 border-red-200';
      case 'comment': return 'bg-blue-50 border-blue-200';
      case 'follow': return 'bg-green-50 border-green-200';
      case 'achievement': return 'bg-yellow-50 border-yellow-200';
      case 'challenge': return 'bg-purple-50 border-purple-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'unread') return !notif.isRead;
    if (activeFilter === 'social') return ['like', 'comment', 'follow', 'share'].includes(notif.type);
    if (activeFilter === 'achievements') return ['achievement', 'milestone'].includes(notif.type);
    return true; // 'all'
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NotificationItem = ({ notification }) => (
    <div 
      className={`
        border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer
        ${getNotificationColor(notification.type, notification.isRead)}
      `}
      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Icon/Avatar */}
        <div className="flex-shrink-0">
          {notification.user ? (
            <img 
              src={notification.user.avatar} 
              alt={notification.user.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${notification.isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                {notification.message}
              </p>
            </div>
            
            {!notification.isRead && (
              <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">
              {formatTimeAgo(notification.timestamp)}
            </span>
            
            {notification.action && (
              <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                {notification.action}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🔔 Notifications</h1>
          <p className="text-slate-600">
            Stay updated with your fitness community
            {unreadCount > 0 && (
              <span className="ml-2 bg-purple-500 text-white px-2 py-1 rounded-full text-sm">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn btn-outline-primary"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          {[
            { key: 'all', label: '📋 All', count: notifications.length },
            { key: 'unread', label: '🔴 Unread', count: unreadCount },
            { key: 'social', label: '👥 Social', count: notifications.filter(n => ['like', 'comment', 'follow', 'share'].includes(n.type)).length },
            { key: 'achievements', label: '🏆 Achievements', count: notifications.filter(n => ['achievement', 'milestone'].includes(n.type)).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeFilter === tab.key
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-white text-purple-500'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border rounded-xl p-4 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">
            {activeFilter === 'unread' ? '✅' : '🔔'}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-slate-600 mb-4">
            {activeFilter === 'unread' 
              ? 'You\'ve read all your notifications. Great job staying on top of things!'
              : 'Start engaging with the community to receive notifications about likes, comments, and achievements.'
            }
          </p>
          {activeFilter !== 'all' && (
            <button 
              onClick={() => setActiveFilter('all')}
              className="btn btn-primary"
            >
              View All Notifications
            </button>
          )}
        </div>
      )}

      {/* Notification Settings */}
      <div className="mt-12 card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">🔧 Notification Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Likes and comments</span>
              <button className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">New followers</span>
              <button className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Challenge updates</span>
              <button className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Achievements</span>
              <button className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Leaderboard updates</span>
              <button className="w-12 h-6 bg-blue-500 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Weekly summary</span>
              <button className="w-12 h-6 bg-slate-300 rounded-full p-1 transition-colors">
                <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;