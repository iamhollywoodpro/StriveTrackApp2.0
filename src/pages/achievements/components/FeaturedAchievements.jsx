import React from 'react';
import Icon from '../../../components/AppIcon';


const FeaturedAchievements = ({ achievements }) => {
  const getBadgeColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'common': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Unlocks */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Clock" size={20} className="mr-2 text-green-500" />
            Recent Unlocks
          </h3>
          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            New
          </div>
        </div>
        
        <div className="space-y-4">
          {achievements?.recent?.slice(0, 3)?.map((achievement) => (
            <div key={achievement?.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
              <div className={`w-12 h-12 bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} rounded-full flex items-center justify-center shadow-elevation-1`}>
                <span className="text-xl">{achievement?.artwork}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {achievement?.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Earned {formatTimeAgo(achievement?.earnedAt)}
                </p>
                <div className="text-xs text-primary font-medium">
                  +{achievement?.points} points
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {achievements?.recent?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="Award" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent achievements</p>
          </div>
        )}
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Target" size={20} className="mr-2 text-blue-500" />
            Almost There
          </h3>
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            50%+
          </div>
        </div>
        
        <div className="space-y-4">
          {achievements?.upcoming?.slice(0, 3)?.map((achievement) => (
            <div key={achievement?.id} className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center`}>
                  <span className="text-lg opacity-50">{achievement?.artwork}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {achievement?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {achievement?.progress}% complete
                  </p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${getBadgeColor(achievement?.rarity)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${achievement?.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {achievements?.upcoming?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="Target" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming milestones</p>
          </div>
        )}
      </div>

      {/* Seasonal Challenges */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Calendar" size={20} className="mr-2 text-purple-500" />
            Seasonal
          </h3>
          <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            Limited
          </div>
        </div>
        
        <div className="space-y-4">
          {achievements?.seasonal?.map((achievement) => (
            <div key={achievement?.id} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} rounded-full flex items-center justify-center shadow-elevation-1`}>
                  <span className="text-xl">{achievement?.artwork}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {achievement?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {achievement?.description}
                  </p>
                  {achievement?.isEarned ? (
                    <div className="text-xs text-green-600 font-medium flex items-center mt-1">
                      <Icon name="Check" size={12} className="mr-1" />
                      Completed
                    </div>
                  ) : (
                    <div className="text-xs text-purple-600 font-medium">
                      {achievement?.progress}% complete
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {achievements?.seasonal?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="Calendar" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active seasonal challenges</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedAchievements;