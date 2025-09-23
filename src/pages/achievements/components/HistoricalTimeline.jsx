import React from 'react';
import Icon from '../../../components/AppIcon';

const HistoricalTimeline = ({ achievements }) => {
  const sortedAchievements = achievements
    ?.filter(achievement => achievement?.earnedAt)
    ?.sort((a, b) => new Date(b?.earnedAt) - new Date(a?.earnedAt))
    ?.slice(0, 8);

  const getBadgeColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'common': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthYear = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Group achievements by month
  const groupedAchievements = sortedAchievements?.reduce((groups, achievement) => {
    const monthYear = getMonthYear(achievement?.earnedAt);
    if (!groups?.[monthYear]) {
      groups[monthYear] = [];
    }
    groups?.[monthYear]?.push(achievement);
    return groups;
  }, {});

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="History" size={20} className="mr-2 text-orange-500" />
          Achievement History
        </h3>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(groupedAchievements || {})?.map(([monthYear, monthAchievements]) => (
          <div key={monthYear} className="space-y-4">
            {/* Month Header */}
            <div className="sticky top-0 bg-card py-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                {monthYear}
              </h4>
            </div>

            {/* Achievements for this month */}
            <div className="space-y-3 relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

              {monthAchievements?.map((achievement, index) => (
                <div key={achievement?.id} className="flex items-start space-x-4 relative">
                  {/* Timeline dot */}
                  <div className={`w-3 h-3 bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} rounded-full shadow-elevation-1 relative z-10 mt-2`}></div>
                  
                  {/* Achievement content */}
                  <div className="flex-1 min-w-0 bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} rounded-full flex items-center justify-center`}>
                        <span className="text-sm">{achievement?.artwork}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-foreground truncate">
                          {achievement?.title}
                        </h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(achievement?.earnedAt)}
                          </span>
                          <span className="text-xs text-primary font-medium">
                            +{achievement?.points}pts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Celebration animation indicator */}
                    <div className="mt-2 flex items-center">
                      <Icon name="Sparkles" size={12} className="text-yellow-500 mr-1" />
                      <span className="text-xs text-muted-foreground">
                        Achievement unlocked with celebration!
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedAchievements?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="History" size={32} className="mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-medium mb-1">No Achievement History</h4>
            <p className="text-xs">
              Start earning achievements to see your progress timeline here.
            </p>
          </div>
        )}
      </div>

      {sortedAchievements?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Icon name="TrendingUp" size={14} className="mr-1 text-green-500" />
              <span>Great progress this month!</span>
            </div>
            <span>
              {sortedAchievements?.length} recent achievements
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalTimeline;