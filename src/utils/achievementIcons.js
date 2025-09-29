// Achievement Icon Mapping Utility
// Maps achievement categories and IDs to appropriate Lucide React icons and colors

export const ACHIEVEMENT_ICON_MAP = {
  // Daily achievements
  daily_login: { icon: 'Calendar', color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-400 to-blue-600' },
  daily_habit_complete: { icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-400 to-green-600' },
  daily_nutrition_log: { icon: 'Apple', color: 'text-red-600', bg: 'bg-red-100', gradient: 'from-red-400 to-red-600' },
  daily_water_goal: { icon: 'Droplets', color: 'text-blue-500', bg: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-500' },
  daily_workout: { icon: 'Dumbbell', color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-400 to-orange-600' },
  daily_progress_photo: { icon: 'Camera', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-400 to-purple-600' },
  daily_social_interaction: { icon: 'MessageCircle', color: 'text-pink-600', bg: 'bg-pink-100', gradient: 'from-pink-400 to-pink-600' },
  daily_goal_update: { icon: 'Target', color: 'text-indigo-600', bg: 'bg-indigo-100', gradient: 'from-indigo-400 to-indigo-600' },
  daily_streak: { icon: 'Flame', color: 'text-red-500', bg: 'bg-red-100', gradient: 'from-red-400 to-orange-500' },
  daily_mindfulness: { icon: 'Brain', color: 'text-teal-600', bg: 'bg-teal-100', gradient: 'from-teal-400 to-teal-600' },

  // Weekly achievements
  weekly_habit_streak_7: { icon: 'Calendar', color: 'text-blue-700', bg: 'bg-blue-200', gradient: 'from-blue-500 to-blue-700' },
  weekly_workout_consistency: { icon: 'TrendingUp', color: 'text-green-700', bg: 'bg-green-200', gradient: 'from-green-500 to-green-700' },
  weekly_nutrition_consistency: { icon: 'UtensilsCrossed', color: 'text-yellow-700', bg: 'bg-yellow-200', gradient: 'from-yellow-500 to-yellow-700' },
  weekly_water_champion: { icon: 'Waves', color: 'text-cyan-700', bg: 'bg-cyan-200', gradient: 'from-cyan-500 to-blue-600' },
  weekly_progress_documentation: { icon: 'FileImage', color: 'text-purple-700', bg: 'bg-purple-200', gradient: 'from-purple-500 to-purple-700' },
  weekly_social_engagement: { icon: 'Users', color: 'text-pink-700', bg: 'bg-pink-200', gradient: 'from-pink-500 to-pink-700' },
  weekly_goal_achiever: { icon: 'Award', color: 'text-amber-700', bg: 'bg-amber-200', gradient: 'from-amber-500 to-orange-600' },
  weekly_explorer: { icon: 'Compass', color: 'text-emerald-700', bg: 'bg-emerald-200', gradient: 'from-emerald-500 to-emerald-700' },
  weekly_mindful_moments: { icon: 'Heart', color: 'text-rose-700', bg: 'bg-rose-200', gradient: 'from-rose-500 to-rose-700' },
  weekly_community_contributor: { icon: 'Share2', color: 'text-violet-700', bg: 'bg-violet-200', gradient: 'from-violet-500 to-violet-700' },

  // General achievements - Fitness & Health
  first_workout: { icon: 'Play', color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-400 to-green-600' },
  workout_warrior: { icon: 'Sword', color: 'text-red-700', bg: 'bg-red-200', gradient: 'from-red-500 to-red-700' },
  strength_builder: { icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-400 to-orange-500' },
  cardio_champion: { icon: 'Zap', color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-400 to-blue-600' },
  flexibility_master: { icon: 'Flower2', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-400 to-purple-600' },
  
  // Nutrition & Diet
  nutrition_newbie: { icon: 'Utensils', color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-400 to-green-600' },
  calorie_conscious: { icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-400 to-blue-600' },
  macro_master: { icon: 'PieChart', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-400 to-purple-600' },
  hydration_hero: { icon: 'Droplets', color: 'text-cyan-600', bg: 'bg-cyan-100', gradient: 'from-cyan-400 to-blue-500' },
  
  // Progress & Milestones
  first_progress_photo: { icon: 'ImagePlus', color: 'text-indigo-600', bg: 'bg-indigo-100', gradient: 'from-indigo-400 to-indigo-600' },
  transformation_tracker: { icon: 'BarChart3', color: 'text-emerald-600', bg: 'bg-emerald-100', gradient: 'from-emerald-400 to-emerald-600' },
  goal_getter: { icon: 'Target', color: 'text-red-600', bg: 'bg-red-100', gradient: 'from-red-400 to-red-600' },
  milestone_master: { icon: 'Flag', color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-400 to-red-500' },
  
  // Social & Engagement  
  social_starter: { icon: 'UserPlus', color: 'text-pink-600', bg: 'bg-pink-100', gradient: 'from-pink-400 to-pink-600' },
  community_champion: { icon: 'Crown', color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-400 to-amber-500' },
  motivational_speaker: { icon: 'MessageSquare', color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-400 to-blue-600' },
  friendship_builder: { icon: 'Users', color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-400 to-green-600' },
  
  // Consistency & Streaks
  consistency_king: { icon: 'Calendar', color: 'text-purple-700', bg: 'bg-purple-200', gradient: 'from-purple-500 to-purple-700' },
  streak_master: { icon: 'Flame', color: 'text-orange-700', bg: 'bg-orange-200', gradient: 'from-orange-500 to-red-600' },
  habit_champion: { icon: 'Repeat', color: 'text-emerald-700', bg: 'bg-emerald-200', gradient: 'from-emerald-500 to-emerald-700' },
  
  // Special & Rare
  early_adopter: { icon: 'Rocket', color: 'text-violet-600', bg: 'bg-violet-100', gradient: 'from-violet-400 to-violet-600' },
  perfectionist: { icon: 'Star', color: 'text-amber-600', bg: 'bg-amber-100', gradient: 'from-amber-400 to-orange-500' },
  overachiever: { icon: 'Trophy', color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-400 to-amber-500' },
  dedication_master: { icon: 'Shield', color: 'text-blue-700', bg: 'bg-blue-200', gradient: 'from-blue-500 to-indigo-600' },
  wellness_warrior: { icon: 'Heart', color: 'text-red-600', bg: 'bg-red-100', gradient: 'from-red-400 to-pink-500' }
};

// Get icon details for an achievement
export const getAchievementIcon = (achievementId) => {
  return ACHIEVEMENT_ICON_MAP[achievementId] || {
    icon: 'Award',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    gradient: 'from-gray-400 to-gray-600'
  };
};

// Get rarity-based styling
export const getRarityStyle = (rarity) => {
  const styles = {
    common: {
      border: 'border-gray-300',
      ring: 'ring-gray-200',
      glow: 'shadow-sm'
    },
    uncommon: {
      border: 'border-green-400',
      ring: 'ring-green-200',
      glow: 'shadow-green-200/50 shadow-lg'
    },
    rare: {
      border: 'border-blue-400',
      ring: 'ring-blue-200',
      glow: 'shadow-blue-200/50 shadow-lg'
    },
    epic: {
      border: 'border-purple-400',
      ring: 'ring-purple-200',
      glow: 'shadow-purple-200/50 shadow-xl'
    },
    legendary: {
      border: 'border-yellow-400',
      ring: 'ring-yellow-200',
      glow: 'shadow-yellow-200/50 shadow-xl'
    }
  };
  
  return styles[rarity] || styles.common;
};

// Get progress-based opacity
export const getProgressOpacity = (progress) => {
  if (progress >= 100) return 'opacity-100';
  if (progress >= 75) return 'opacity-90';
  if (progress >= 50) return 'opacity-75';
  if (progress >= 25) return 'opacity-60';
  return 'opacity-50';
};

export default ACHIEVEMENT_ICON_MAP;