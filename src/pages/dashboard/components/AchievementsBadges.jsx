import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const AchievementsBadges = ({ achievements }) => {
  const getBadgeColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'common': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getIconName = (category) => {
    switch (category) {
      case 'streak': return 'Flame';
      case 'workout': return 'Dumbbell';
      case 'photo': return 'Camera';
      case 'goal': return 'Target';
      case 'social': return 'Users';
      default: return 'Award';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
        <div className="text-sm text-muted-foreground">
          {achievements?.length} earned
        </div>
      </div>
      <div className="space-y-3">
        {achievements?.slice(0, 4)?.map((achievement) => (
          <div key={achievement?.id} className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`w-10 h-10 bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} rounded-full flex items-center justify-center shadow-elevation-1 flex-shrink-0`}>
              <Icon name={getIconName(achievement?.category)} size={18} color="white" strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-1 flex-1">
                  {achievement?.title}
                </h4>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(achievement.earnedAt)?.toLocaleDateString()}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {achievement?.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  achievement?.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  achievement?.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  achievement?.rarity === 'rare'? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {achievement?.rarity}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  +{achievement?.points} XP
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        className="w-full mt-4"
        iconName="ChevronRight"
        iconPosition="right"
      >
        View All Achievements
      </Button>
    </div>
  );
};

export default AchievementsBadges;