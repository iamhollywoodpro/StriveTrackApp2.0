import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsPanel = ({ stats }) => {
  const rarityColors = {
    common: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Achievements */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <Icon name="Award" size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalEarned}
            </div>
            <div className="text-sm text-muted-foreground">
              Achievements Earned
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <Icon name="TrendingUp" size={16} className="mr-1" />
          <span>+3 this month</span>
        </div>
      </div>
      {/* Total Points */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <Icon name="Star" size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalPoints?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Points Earned
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <Icon name="Plus" size={16} className="mr-1" />
          <span>+750 this week</span>
        </div>
      </div>
      {/* Completion Percentage */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Icon name="Target" size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {stats?.completionPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              Completion Rate
            </div>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats?.completionPercentage}%` }}
          ></div>
        </div>
      </div>
      {/* Rarity Distribution */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Icon name="Crown" size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">
              Rarity Breakdown
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {Object.entries(stats?.rarityDistribution)?.map(([rarity, count]) => (
            <div key={rarity} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  rarity === 'legendary' ? 'bg-yellow-400' :
                  rarity === 'epic' ? 'bg-purple-400' :
                  rarity === 'rare' ? 'bg-blue-400' : 'bg-green-400'
                }`}></div>
                <span className={`capitalize font-medium ${rarityColors?.[rarity]}`}>
                  {rarity}
                </span>
              </div>
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;