import React from 'react';
import Icon from '../../../components/AppIcon';

const UserLevelCard = ({ userLevel, totalPoints, nextLevelPoints, currentLevelPoints }) => {
  const progressPercentage = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl text-white shadow-elevation-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Level {userLevel}</h2>
          <p className="text-white/80">Fitness Warrior</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Icon name="Trophy" size={24} color="white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{totalPoints?.toLocaleString()} points</span>
          <span>{nextLevelPoints?.toLocaleString()} points to next level</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UserLevelCard;