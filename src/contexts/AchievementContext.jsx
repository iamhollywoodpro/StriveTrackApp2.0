import React, { createContext, useContext, useCallback } from 'react';
import useConfetti from '../hooks/useConfetti';
import { getAllAchievements } from '../data/achievementDatabase';

const AchievementContext = createContext({});

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievement must be used within AchievementProvider');
  }
  return context;
};

export const AchievementProvider = ({ children }) => {
  const { playConfetti } = useConfetti();
  const ALL_ACHIEVEMENTS = getAllAchievements();

  const celebrateAchievement = useCallback((achievementCode, points = null) => {
    const achievementDef = ALL_ACHIEVEMENTS.find(def => def.id === achievementCode);
    if (achievementDef) {
      playConfetti({
        title: achievementDef.name,
        icon: achievementDef.icon,
        points: points || achievementDef.points
      });
    }
  }, [playConfetti, ALL_ACHIEVEMENTS]);

  // Function to check and celebrate common achievements
  const checkAchievement = useCallback((type, data = {}) => {
    switch (type) {
      case 'login':
        celebrateAchievement('daily_login');
        break;
      case 'habit_complete':
        celebrateAchievement('daily_habit_complete');
        break;
      case 'nutrition_log':
        celebrateAchievement('daily_nutrition_log');
        break;
      case 'first_upload':
        celebrateAchievement('first_upload');
        break;
      default:
        break;
    }
  }, [celebrateAchievement]);

  const value = {
    celebrateAchievement,
    checkAchievement
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export default AchievementContext;