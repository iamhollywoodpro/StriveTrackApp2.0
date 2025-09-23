import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const Leaderboards = ({ friends }) => {
  const [activeLeaderboard, setActiveLeaderboard] = useState('points');

  const leaderboardTypes = [
    { id: 'points', label: 'Points', icon: 'Award' },
    { id: 'streaks', label: 'Streaks', icon: 'Zap' },
    { id: 'workouts', label: 'Workouts', icon: 'Dumbbell' },
    { id: 'goals', label: 'Goals', icon: 'Target' }
  ];

  // Mock leaderboard data
  const leaderboardData = {
    points: [
      { id: 1, name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', value: 3200, change: '+150', isUser: false },
      { id: 2, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', value: 2850, change: '+200', isUser: false },
      { id: 3, name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', value: 2450, change: '+75', isUser: true },
      { id: 4, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', value: 2100, change: '+125', isUser: false },
      { id: 5, name: 'Jessica Wang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', value: 1890, change: '+90', isUser: false }
    ],
    streaks: [
      { id: 1, name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', value: 42, change: '+1', isUser: false },
      { id: 2, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', value: 28, change: '+1', isUser: false },
      { id: 3, name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', value: 21, change: '+1', isUser: true },
      { id: 4, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', value: 15, change: '+1', isUser: false },
      { id: 5, name: 'Jessica Wang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', value: 12, change: '+1', isUser: false }
    ],
    workouts: [
      { id: 1, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', value: 156, change: '+8', isUser: false },
      { id: 2, name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', value: 142, change: '+6', isUser: false },
      { id: 3, name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', value: 127, change: '+4', isUser: true },
      { id: 4, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', value: 118, change: '+5', isUser: false },
      { id: 5, name: 'Jessica Wang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', value: 95, change: '+3', isUser: false }
    ],
    goals: [
      { id: 1, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', value: 8, change: '+2', isUser: false },
      { id: 2, name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', value: 6, change: '+1', isUser: false },
      { id: 3, name: 'Alex Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', value: 5, change: '+1', isUser: true },
      { id: 4, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', value: 4, change: '+1', isUser: false },
      { id: 5, name: 'Jessica Wang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', value: 3, change: '0', isUser: false }
    ]
  };

  const getCurrentData = () => leaderboardData?.[activeLeaderboard] || [];

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (position) => {
    switch (position) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const getValueLabel = (type) => {
    switch (type) {
      case 'points': return 'pts';
      case 'streaks': return 'days';
      case 'workouts': return 'workouts';
      case 'goals': return 'goals';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Type Selector */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Leaderboards
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {leaderboardTypes?.map((type) => (
            <Button
              key={type?.id}
              variant={activeLeaderboard === type?.id ? "default" : "outline"}
              onClick={() => setActiveLeaderboard(type?.id)}
              className="flex items-center justify-center space-x-2"
            >
              <Icon name={type?.icon} size={18} />
              <span>{type?.label}</span>
            </Button>
          ))}
        </div>
      </div>
      {/* Podium Display */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-end justify-center space-x-4 mb-8">
          {getCurrentData()?.slice(0, 3)?.map((user, index) => {
            const position = index + 1;
            const heights = ['h-24', 'h-32', 'h-20']; // 2nd, 1st, 3rd place heights
            const orders = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
            const actualIndex = orders?.indexOf(index);
            
            return (
              <div
                key={user?.id}
                className={`flex flex-col items-center ${actualIndex === 1 ? 'order-2' : actualIndex === 0 ? 'order-1' : 'order-3'}`}
              >
                <div className="relative mb-3">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className={`rounded-full border-4 ${
                      position === 1 ? 'border-yellow-400 w-16 h-16' :
                      position === 2 ? 'border-gray-400 w-14 h-14': 'border-amber-600 w-12 h-12'
                    }`}
                  />
                  <div className="absolute -top-2 -right-2 text-2xl">
                    {getRankIcon(position)}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-center text-sm mb-1">
                  {user?.name?.split(' ')?.[0]}
                </h3>
                <div className={`${heights?.[actualIndex]} ${
                  position === 1 ? 'bg-gradient-to-t from-yellow-400 to-yellow-300' :
                  position === 2 ? 'bg-gradient-to-t from-gray-400 to-gray-300': 'bg-gradient-to-t from-amber-600 to-amber-400'
                } rounded-t-lg w-20 flex flex-col items-center justify-center text-white font-bold`}>
                  <div className="text-lg">
                    {user?.value?.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-90">
                    {getValueLabel(activeLeaderboard)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Full Leaderboard */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Full Rankings - {leaderboardTypes?.find(t => t?.id === activeLeaderboard)?.label}
          </h3>
        </div>
        
        <div className="divide-y divide-border">
          {getCurrentData()?.map((user, index) => {
            const position = index + 1;
            
            return (
              <div
                key={user?.id}
                className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                  user?.isUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 text-center font-bold ${getRankColor(position)}`}>
                    {getRankIcon(position) || `#${position}`}
                  </div>
                  
                  <div className="relative">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-12 h-12 rounded-full border-2 border-border"
                    />
                    {user?.isUser && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {user?.name}
                      {user?.isUser && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          (You)
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Rank #{position}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-foreground text-lg">
                    {user?.value?.toLocaleString()}
                    <span className="text-sm text-muted-foreground ml-1">
                      {getValueLabel(activeLeaderboard)}
                    </span>
                  </div>
                  <div className={`text-sm ${
                    user?.change?.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {user?.change} this week
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Weekly Summary */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          This Week's Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              Emma Rodriguez
            </div>
            <div className="text-sm text-yellow-700">Most Improved</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              5
            </div>
            <div className="text-sm text-green-700">New Records Set</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              +28%
            </div>
            <div className="text-sm text-blue-700">Average Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;