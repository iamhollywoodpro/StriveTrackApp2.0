import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useAchievementCelebration from '../../../hooks/useAchievementCelebration';
import AchievementConfetti from '../../../components/ui/AchievementConfetti';

const AchievementGrid = ({ achievements, selectedCategory }) => {
  const { celebrate, showConfetti, celebratingAchievement } = useAchievementCelebration();

  const handleAchievementClick = (achievement) => {
    if (achievement?.isEarned && achievement?.earnedAt) {
      // Celebrate recently earned achievements
      const earnedRecently = new Date() - new Date(achievement?.earnedAt) < 24 * 60 * 60 * 1000;
      if (earnedRecently) {
        celebrate(achievement);
      }
    }
  };

  const getBadgeColor = (rarity, isEarned) => {
    if (!isEarned) return 'from-gray-300 to-gray-400';
    
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'common': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityStyle = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'common': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleShareAchievement = (achievement) => {
    // Achievement sharing functionality
    console.log('Sharing achievement:', achievement?.title);
  };

  return (
    <div className="space-y-6">
      <AchievementConfetti 
        trigger={showConfetti}
        particleCount={150}
        colors={celebratingAchievement?.rarity === 'legendary' ? ['#FFD700', '#FFA500'] : undefined}
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {selectedCategory === 'all' ? 'All Achievements' : selectedCategory?.charAt(0)?.toUpperCase() + selectedCategory?.slice(1) +' Achievements'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {achievements?.length} achievement{achievements?.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {achievements?.map((achievement) => (
          <div
            key={achievement?.id}
            onClick={() => handleAchievementClick(achievement)}
            className={`relative bg-card border rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
              achievement?.isEarned
                ? `${getRarityStyle(achievement?.rarity)?.border} ${getRarityStyle(achievement?.rarity)?.bg}`
                : 'border-border hover:border-primary/30'
            }`}
          >
            {/* Badge Artwork */}
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 bg-gradient-to-br ${getBadgeColor(achievement?.rarity, achievement?.isEarned)} rounded-full flex items-center justify-center shadow-elevation-1 relative`}>
                <span className="text-3xl">
                  {achievement?.artwork}
                </span>
                {achievement?.isEarned && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={16} color="white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {achievement?.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {achievement?.description}
              </p>
              
              {/* Rarity and Points */}
              <div className="flex items-center justify-center space-x-3 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getRarityStyle(achievement?.rarity)}`}>
                  {achievement?.rarity}
                </span>
                <span className="text-sm font-medium text-foreground">
                  +{achievement?.points} pts
                </span>
              </div>
            </div>

            {/* Progress Bar (for unearned achievements) */}
            {!achievement?.isEarned && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{achievement?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getBadgeColor(achievement?.rarity, true)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${achievement?.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {achievement?.unlockCriteria}
                </p>
              </div>
            )}

            {/* Earned Date or Action Button */}
            {achievement?.isEarned ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Earned on {new Date(achievement?.earnedAt)?.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleShareAchievement(achievement)}
                  iconName="Share2"
                  iconPosition="left"
                >
                  Share Achievement
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {achievement?.unlockCriteria}
                </p>
                <div className="text-xs text-primary font-medium">
                  {100 - achievement?.progress}% remaining
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {achievements?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No achievements found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search term to find achievements.
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementGrid;