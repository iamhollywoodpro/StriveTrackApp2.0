import React, { useState, useEffect } from 'react';
import socialService from '../../lib/socialService';

function Leaderboards() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [activeCategory, setActiveCategory] = useState('points');
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory, activeTimeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await socialService.getLeaderboard(activeCategory, activeTimeframe);
      if (response.success) {
        setLeaderboard(response.leaderboard);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'points', label: '🏆 Points', description: 'Total points earned' },
    { key: 'workouts', label: '💪 Workouts', description: 'Workouts completed' },
    { key: 'streak', label: '🔥 Streak', description: 'Consecutive days' },
    { key: 'distance', label: '🏃 Distance', description: 'Miles covered' }
  ];

  const timeframes = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'alltime', label: 'All Time' }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getChangeIcon = (change) => {
    switch (change) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'same': return '➡️';
      default: return '➡️';
    }
  };

  const getChangeColor = (change) => {
    switch (change) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'same': return 'text-slate-500';
      default: return 'text-slate-500';
    }
  };

  const LeaderboardEntry = ({ entry, index }) => {
    const isTopThree = entry.rank <= 3;
    const isCurrentUser = entry.isCurrentUser;

    return (
      <div className={`
        flex items-center space-x-4 p-4 rounded-xl transition-all hover:shadow-md
        ${isCurrentUser ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200' : 'bg-white border border-slate-200'}
        ${isTopThree ? 'shadow-lg' : ''}
      `}>
        {/* Rank */}
        <div className="flex items-center justify-center w-12 h-12">
          {isTopThree ? (
            <span className="text-2xl">{getRankIcon(entry.rank)}</span>
          ) : (
            <span className="text-lg font-bold text-slate-600">#{entry.rank}</span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <img 
              src={entry.user.avatar} 
              alt={entry.user.displayName}
              className={`w-12 h-12 rounded-full object-cover ${
                isTopThree ? 'ring-4 ring-yellow-300' : 'ring-2 ring-slate-200'
              }`}
            />
            {isCurrentUser && (
              <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                YOU
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">{entry.user.displayName}</h4>
            <p className="text-sm text-slate-500">@{entry.user.username}</p>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="font-bold text-lg text-slate-900">
            {entry.score} {entry.unit}
          </div>
          
          {/* Change Indicator */}
          <div className={`flex items-center justify-end space-x-1 text-sm ${getChangeColor(entry.change)}`}>
            <span>{getChangeIcon(entry.change)}</span>
            <span>
              {entry.change === 'same' ? 'No change' : `${entry.changeAmount} ${entry.change === 'up' ? 'up' : 'down'}`}
            </span>
          </div>
        </div>

        {/* Follow Button */}
        {!isCurrentUser && (
          <button className="btn btn-outline-primary text-sm">
            Follow
          </button>
        )}
      </div>
    );
  };

  const StatsCard = ({ title, value, unit, icon, color = 'purple' }) => (
    <div className={`card p-6 bg-gradient-to-r from-${color}-50 to-${color}-100 border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 font-medium`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>
            {value} {unit && <span className="text-lg">{unit}</span>}
          </p>
        </div>
        <div className={`text-${color}-500 text-3xl`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🏆 Leaderboards</h1>
        <p className="text-slate-600">See how you rank against other fitness enthusiasts!</p>
      </div>

      {/* Current User Stats */}
      {leaderboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Your Rank" 
            value={leaderboard.entries.find(e => e.isCurrentUser)?.rank || 'N/A'} 
            icon="🎯"
            color="purple"
          />
          <StatsCard 
            title="Your Score" 
            value={leaderboard.entries.find(e => e.isCurrentUser)?.score || 0} 
            unit={leaderboard.entries.find(e => e.isCurrentUser)?.unit || ''}
            icon="📊"
            color="blue"
          />
          <StatsCard 
            title="Total Users" 
            value={leaderboard.entries.length} 
            icon="👥"
            color="green"
          />
          <StatsCard 
            title="Updated" 
            value="Live" 
            icon="🔄"
            color="orange"
          />
        </div>
      )}

      {/* Category Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`p-4 rounded-xl text-left transition-all ${
                activeCategory === category.key
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="font-medium">{category.label}</div>
              <div className={`text-sm ${
                activeCategory === category.key ? 'text-purple-100' : 'text-slate-500'
              }`}>
                {category.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Filters */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.key}
              onClick={() => setActiveTimeframe(timeframe.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTimeframe === timeframe.key
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-slate-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard && leaderboard.entries.length > 0 ? (
        <div className="space-y-3">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {leaderboard.entries.slice(0, 3).map((entry) => (
              <div 
                key={entry.rank} 
                className={`
                  card p-6 text-center relative
                  ${entry.rank === 1 ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300 transform scale-105' : ''}
                  ${entry.rank === 2 ? 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-300' : ''}
                  ${entry.rank === 3 ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300' : ''}
                `}
              >
                {/* Crown for first place */}
                {entry.rank === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl">
                    👑
                  </div>
                )}
                
                <div className="mb-4">
                  <span className="text-4xl">{getRankIcon(entry.rank)}</span>
                </div>
                
                <img 
                  src={entry.user.avatar} 
                  alt={entry.user.displayName}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-4 ring-yellow-300"
                />
                
                <h4 className="font-bold text-slate-900 mb-1">{entry.user.displayName}</h4>
                <p className="text-sm text-slate-500 mb-3">@{entry.user.username}</p>
                
                <div className="text-xl font-bold text-slate-900">
                  {entry.score} {entry.unit}
                </div>
                
                {entry.isCurrentUser && (
                  <div className="mt-2">
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      That's You! 🎉
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rest of the leaderboard */}
          {leaderboard.entries.slice(3).map((entry, index) => (
            <LeaderboardEntry key={entry.user.id} entry={entry} index={index + 3} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Rankings Yet</h3>
          <p className="text-slate-600 mb-4">
            Be the first to start competing! Complete some workouts to appear on the leaderboard.
          </p>
          <button className="btn btn-primary">
            Start Your First Workout
          </button>
        </div>
      )}

      {/* Achievement Highlights */}
      {leaderboard && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
            <h3 className="font-bold text-amber-900 mb-3">🏆 This Week's Champion</h3>
            <div className="flex items-center space-x-3">
              <img 
                src={leaderboard.entries[0]?.user.avatar} 
                alt="Champion"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-amber-900">{leaderboard.entries[0]?.user.displayName}</p>
                <p className="text-sm text-amber-700">{leaderboard.entries[0]?.score} {leaderboard.entries[0]?.unit}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <h3 className="font-bold text-green-900 mb-3">🚀 Rising Star</h3>
            <div className="flex items-center space-x-3">
              {(() => {
                const risingUser = leaderboard.entries.find(e => e.change === 'up' && e.changeAmount >= 3);
                return risingUser ? (
                  <>
                    <img 
                      src={risingUser.user.avatar} 
                      alt="Rising star"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-green-900">{risingUser.user.displayName}</p>
                      <p className="text-sm text-green-700">+{risingUser.changeAmount} positions</p>
                    </div>
                  </>
                ) : (
                  <p className="text-green-700">Keep pushing to claim this spot!</p>
                );
              })()}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-3">💪 Most Consistent</h3>
            <div className="flex items-center space-x-3">
              <img 
                src={leaderboard.entries[2]?.user.avatar} 
                alt="Consistent user"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-purple-900">{leaderboard.entries[2]?.user.displayName}</p>
                <p className="text-sm text-purple-700">Steady progress</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {leaderboard && (
        <div className="mt-8 text-center text-sm text-slate-500">
          Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default Leaderboards;