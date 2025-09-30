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

  // Real leaderboard data - empty until more users join
  const leaderboardData = {
    points: [],
    streaks: [],
    workouts: [],
    goals: []
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
        
        {getCurrentData()?.length === 0 ? (
          // Empty state when no users in leaderboard
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trophy" size={24} className="text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No rankings yet</h4>
            <p className="text-muted-foreground mb-4">
              Be the first to appear on the leaderboards! Complete habits, reach goals, and earn points.
            </p>
          </div>
        ) : (
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
        )}
      </div>
      {/* Weekly Summary */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          This Week's Highlights
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="TrendingUp" size={20} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Weekly highlights will appear here as users become more active in the community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;