// Comprehensive Achievement System with 50 Achievements
// 10 Daily + 15 Weekly + 25 General = 50 Total Achievements
// Automatic points giving and taking based on user actions

export const ACHIEVEMENT_DATABASE = {
  // === DAILY ACHIEVEMENTS (10 total) ===
  daily: [
    {
      id: 'daily_login',
      name: 'Daily Check-in',
      description: 'Log into StriveTrack',
      icon: '📅',
      iconName: 'Calendar',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      points: 5,
      type: 'daily',
      rarity: 'common',
      category: 'engagement',
      condition: 'login_daily',
      resetDaily: true
    },
    {
      id: 'daily_habit_complete',
      name: 'Habit Hero',
      description: 'Complete at least 1 habit today',
      icon: '✅',
      iconName: 'CheckCircle',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      points: 10,
      type: 'daily',
      rarity: 'common',
      category: 'habits',
      condition: 'habit_complete_1',
      resetDaily: true
    },
    {
      id: 'daily_nutrition_log',
      name: 'Nutrition Tracker',
      description: 'Log at least 1 meal today',
      icon: '🍎',
      iconName: 'Apple',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      points: 8,
      type: 'daily',
      rarity: 'common',
      category: 'nutrition',
      condition: 'nutrition_log_1',
      resetDaily: true
    },
    {
      id: 'daily_water_goal',
      name: 'Hydration Station',
      description: 'Drink 8 glasses of water',
      icon: '💧',
      iconName: 'Droplets',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100',
      points: 10,
      type: 'daily',
      rarity: 'common',
      category: 'nutrition',
      condition: 'water_glasses_8',
      resetDaily: true
    },
    {
      id: 'daily_workout',
      name: 'Daily Grind',
      description: 'Complete a workout session',
      icon: '💪',
      iconName: 'Dumbbell',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      points: 15,
      type: 'daily',
      rarity: 'common',
      category: 'fitness',
      condition: 'workout_complete_1',
      resetDaily: true
    },
    {
      id: 'daily_progress_photo',
      name: 'Progress Snapshot',
      description: 'Upload a progress photo',
      icon: '📸',
      iconName: 'Camera',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      points: 12,
      type: 'daily',
      rarity: 'common',
      category: 'progress',
      condition: 'photo_upload_1',
      resetDaily: true
    },
    {
      id: 'daily_social_interaction',
      name: 'Social Butterfly',
      description: 'Like or comment on a friend\'s post',
      icon: '💬',
      iconName: 'MessageCircle',
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100',
      points: 8,
      type: 'daily',
      rarity: 'common',
      category: 'social',
      condition: 'social_interaction_1',
      resetDaily: true
    },
    {
      id: 'daily_goal_progress',
      name: 'Goal Getter',
      description: 'Update progress on at least 1 goal',
      icon: '🎯',
      points: 10,
      type: 'daily',
      rarity: 'common',
      category: 'goals',
      condition: 'goal_update_1',
      resetDaily: true
    },
    {
      id: 'daily_perfect_nutrition',
      name: 'Nutrition Perfectionist',
      description: 'Log all 3 main meals + snacks',
      icon: '🌟',
      points: 20,
      type: 'daily',
      rarity: 'rare',
      category: 'nutrition',
      condition: 'nutrition_log_4',
      resetDaily: true
    },
    {
      id: 'daily_triple_threat',
      name: 'Triple Threat',
      description: 'Complete habits, workout, and nutrition in one day',
      icon: '🔥',
      points: 25,
      type: 'daily',
      rarity: 'rare',
      category: 'overall',
      condition: 'habits_workout_nutrition_combo',
      resetDaily: true
    }
  ],

  // === WEEKLY ACHIEVEMENTS (15 total) ===
  weekly: [
    {
      id: 'weekly_consistent_login',
      name: 'Week Warrior',
      description: 'Log in every day for 7 days',
      icon: '🏆',
      points: 50,
      type: 'weekly',
      rarity: 'rare',
      category: 'engagement',
      condition: 'login_streak_7',
      resetWeekly: true
    },
    {
      id: 'weekly_habit_streak',
      name: 'Habit Master',
      description: 'Complete habits for 7 consecutive days',
      icon: '🎖️',
      points: 75,
      type: 'weekly',
      rarity: 'rare',
      category: 'habits',
      condition: 'habit_streak_7',
      resetWeekly: true
    },
    {
      id: 'weekly_workout_goals',
      name: 'Fitness Fanatic',
      description: 'Complete 5 workouts this week',
      icon: '🏋️',
      points: 60,
      type: 'weekly',
      rarity: 'rare',
      category: 'fitness',
      condition: 'workouts_5_week',
      resetWeekly: true
    },
    {
      id: 'weekly_nutrition_consistency',
      name: 'Nutrition Ninja',
      description: 'Log nutrition for 7 consecutive days',
      icon: '🥗',
      points: 55,
      type: 'weekly',
      rarity: 'rare',
      category: 'nutrition',
      condition: 'nutrition_streak_7',
      resetWeekly: true
    },
    {
      id: 'weekly_progress_documentation',
      name: 'Progress Pro',
      description: 'Upload progress photos 3+ times this week',
      icon: '📊',
      points: 45,
      type: 'weekly',
      rarity: 'common',
      category: 'progress',
      condition: 'photos_3_week',
      resetWeekly: true
    },
    {
      id: 'weekly_social_engagement',
      name: 'Community Champion',
      description: 'Interact with friends 10+ times this week',
      icon: '🤝',
      points: 40,
      type: 'weekly',
      rarity: 'common',
      category: 'social',
      condition: 'social_interactions_10_week',
      resetWeekly: true
    },
    {
      id: 'weekly_goal_achiever',
      name: 'Goal Crusher',
      description: 'Complete at least 1 goal this week',
      icon: '🎯',
      points: 100,
      type: 'weekly',
      rarity: 'epic',
      category: 'goals',
      condition: 'goal_complete_1_week',
      resetWeekly: true
    },
    {
      id: 'weekly_calorie_balance',
      name: 'Calorie Calculator',
      description: 'Stay within calorie goals for 5+ days',
      icon: '⚖️',
      points: 65,
      type: 'weekly',
      rarity: 'rare',
      category: 'nutrition',
      condition: 'calorie_goal_5_days',
      resetWeekly: true
    },
    {
      id: 'weekly_variety_master',
      name: 'Variety Master',
      description: 'Try 5+ different workout types this week',
      icon: '🎨',
      points: 70,
      type: 'weekly',
      rarity: 'rare',
      category: 'fitness',
      condition: 'workout_variety_5',
      resetWeekly: true
    },
    {
      id: 'weekly_early_bird',
      name: 'Early Bird',
      description: 'Log in before 7 AM for 5+ days',
      icon: '🐦',
      points: 35,
      type: 'weekly',
      rarity: 'common',
      category: 'engagement',
      condition: 'early_login_5_days',
      resetWeekly: true
    },
    {
      id: 'weekly_protein_power',
      name: 'Protein Power',
      description: 'Meet protein goals for 6+ days this week',
      icon: '🥩',
      points: 50,
      type: 'weekly',
      rarity: 'rare',
      category: 'nutrition',
      condition: 'protein_goal_6_days',
      resetWeekly: true
    },
    {
      id: 'weekly_step_champion',
      name: 'Step Champion',
      description: 'Walk 10,000+ steps for 5+ days',
      icon: '👟',
      points: 55,
      type: 'weekly',
      rarity: 'rare',
      category: 'fitness',
      condition: 'steps_10k_5_days',
      resetWeekly: true
    },
    {
      id: 'weekly_recipe_explorer',
      name: 'Recipe Explorer',
      description: 'Try 3+ new recipes from the library',
      icon: '👨‍🍳',
      points: 30,
      type: 'weekly',
      rarity: 'common',
      category: 'nutrition',
      condition: 'recipes_3_week',
      resetWeekly: true
    },
    {
      id: 'weekly_challenge_winner',
      name: 'Challenge Champion',
      description: 'Win a friend challenge this week',
      icon: '🏅',
      points: 80,
      type: 'weekly',
      rarity: 'epic',
      category: 'social',
      condition: 'challenge_win_1_week',
      resetWeekly: true
    },
    {
      id: 'weekly_perfect_week',
      name: 'Perfect Week',
      description: 'Complete all daily achievements for 7 days',
      icon: '💎',
      points: 150,
      type: 'weekly',
      rarity: 'legendary',
      category: 'overall',
      condition: 'all_daily_achievements_7_days',
      resetWeekly: true
    }
  ],

  // === GENERAL ACHIEVEMENTS (25 total) ===
  general: [
    {
      id: 'first_login',
      name: 'Welcome to StriveTrack',
      description: 'Sign up and complete your first login',
      icon: '🎉',
      points: 25,
      type: 'general',
      rarity: 'common',
      category: 'onboarding',
      condition: 'first_login'
    },
    {
      id: 'profile_complete',
      name: 'Profile Perfectionist',
      description: 'Complete your user profile with photo and bio',
      icon: '👤',
      points: 30,
      type: 'general',
      rarity: 'common',
      category: 'onboarding',
      condition: 'profile_complete'
    },
    {
      id: 'first_habit',
      name: 'Habit Starter',
      description: 'Create your first habit',
      icon: '🌱',
      points: 15,
      type: 'general',
      rarity: 'common',
      category: 'habits',
      condition: 'habit_create_1'
    },
    {
      id: 'first_goal',
      name: 'Goal Setter',
      description: 'Create your first fitness goal',
      icon: '🎯',
      points: 20,
      type: 'general',
      rarity: 'common',
      category: 'goals',
      condition: 'goal_create_1'
    },
    {
      id: 'first_workout',
      name: 'Workout Warrior',
      description: 'Complete your first workout',
      icon: '💪',
      points: 25,
      type: 'general',
      rarity: 'common',
      category: 'fitness',
      condition: 'workout_complete_first'
    },
    {
      id: 'first_photo_upload',
      name: 'Progress Documenter',
      description: 'Upload your first progress photo',
      icon: '📸',
      points: 20,
      type: 'general',
      rarity: 'common',
      category: 'progress',
      condition: 'photo_upload_first'
    },
    {
      id: 'first_friend',
      name: 'Social Starter',
      description: 'Add your first friend',
      icon: '👥',
      points: 15,
      type: 'general',
      rarity: 'common',
      category: 'social',
      condition: 'friend_add_first'
    },
    {
      id: 'streak_7_days',
      name: 'Week Conqueror',
      description: 'Maintain a 7-day activity streak',
      icon: '🔥',
      points: 50,
      type: 'general',
      rarity: 'rare',
      category: 'consistency',
      condition: 'activity_streak_7'
    },
    {
      id: 'streak_30_days',
      name: 'Month Master',
      description: 'Maintain a 30-day activity streak',
      icon: '🌟',
      points: 200,
      type: 'general',
      rarity: 'epic',
      category: 'consistency',
      condition: 'activity_streak_30'
    },
    {
      id: 'streak_100_days',
      name: 'Century Superstar',
      description: 'Maintain a 100-day activity streak',
      icon: '💎',
      points: 500,
      type: 'general',
      rarity: 'legendary',
      category: 'consistency',
      condition: 'activity_streak_100'
    },
    {
      id: 'weight_loss_5kg',
      name: 'Pound Dropper',
      description: 'Lose 5kg (11 lbs) of weight',
      icon: '📉',
      points: 100,
      type: 'general',
      rarity: 'epic',
      category: 'progress',
      condition: 'weight_loss_5kg'
    },
    {
      id: 'muscle_gain_2kg',
      name: 'Muscle Builder',
      description: 'Gain 2kg (4.4 lbs) of muscle',
      icon: '💪',
      points: 120,
      type: 'general',
      rarity: 'epic',
      category: 'progress',
      condition: 'muscle_gain_2kg'
    },
    {
      id: 'marathon_distance',
      name: 'Marathon Runner',
      description: 'Run a total of 42.2km in workouts',
      icon: '🏃‍♀️',
      points: 150,
      type: 'general',
      rarity: 'epic',
      category: 'fitness',
      condition: 'run_total_42km'
    },
    {
      id: 'calories_burned_10k',
      name: 'Calorie Crusher',
      description: 'Burn 10,000 calories through exercise',
      icon: '🔥',
      points: 100,
      type: 'general',
      rarity: 'rare',
      category: 'fitness',
      condition: 'calories_burned_10k'
    },
    {
      id: 'nutrition_streak_30',
      name: 'Nutrition Maestro',
      description: 'Log nutrition for 30 consecutive days',
      icon: '🥗',
      points: 150,
      type: 'general',
      rarity: 'epic',
      category: 'nutrition',
      condition: 'nutrition_streak_30'
    },
    {
      id: 'water_consumption_1000L',
      name: 'Hydration Hero',
      description: 'Drink 1,000 liters of water total',
      icon: '💧',
      points: 75,
      type: 'general',
      rarity: 'rare',
      category: 'nutrition',
      condition: 'water_total_1000L'
    },
    {
      id: 'social_influencer',
      name: 'Social Influencer',
      description: 'Get 100 likes on your posts',
      icon: '❤️',
      points: 80,
      type: 'general',
      rarity: 'rare',
      category: 'social',
      condition: 'likes_received_100'
    },
    {
      id: 'challenge_master',
      name: 'Challenge Master',
      description: 'Win 10 friend challenges',
      icon: '🏆',
      points: 200,
      type: 'general',
      rarity: 'epic',
      category: 'social',
      condition: 'challenges_won_10'
    },
    {
      id: 'goal_achiever_bronze',
      name: 'Goal Achiever (Bronze)',
      description: 'Complete 5 fitness goals',
      icon: '🥉',
      points: 100,
      type: 'general',
      rarity: 'rare',
      category: 'goals',
      condition: 'goals_completed_5'
    },
    {
      id: 'goal_achiever_silver',
      name: 'Goal Achiever (Silver)',
      description: 'Complete 15 fitness goals',
      icon: '🥈',
      points: 250,
      type: 'general',
      rarity: 'epic',
      category: 'goals',
      condition: 'goals_completed_15'
    },
    {
      id: 'goal_achiever_gold',
      name: 'Goal Achiever (Gold)',
      description: 'Complete 30 fitness goals',
      icon: '🥇',
      points: 500,
      type: 'general',
      rarity: 'legendary',
      category: 'goals',
      condition: 'goals_completed_30'
    },
    {
      id: 'habit_master_bronze',
      name: 'Habit Master (Bronze)',
      description: 'Complete 100 habit check-ins',
      icon: '🥉',
      points: 75,
      type: 'general',
      rarity: 'rare',
      category: 'habits',
      condition: 'habit_logs_100'
    },
    {
      id: 'habit_master_silver',
      name: 'Habit Master (Silver)',
      description: 'Complete 500 habit check-ins',
      icon: '🥈',
      points: 200,
      type: 'general',
      rarity: 'epic',
      category: 'habits',
      condition: 'habit_logs_500'
    },
    {
      id: 'habit_master_gold',
      name: 'Habit Master (Gold)',
      description: 'Complete 1,000 habit check-ins',
      icon: '🥇',
      points: 400,
      type: 'general',
      rarity: 'legendary',
      category: 'habits',
      condition: 'habit_logs_1000'
    },
    {
      id: 'strivetrack_legend',
      name: 'StriveTrack Legend',
      description: 'Reach 10,000 total points',
      icon: '👑',
      points: 1000,
      type: 'general',
      rarity: 'legendary',
      category: 'overall',
      condition: 'total_points_10000'
    }
  ]
};

// Helper functions for achievement management
export const getAllAchievements = () => {
  return [
    ...ACHIEVEMENT_DATABASE.daily,
    ...ACHIEVEMENT_DATABASE.weekly,
    ...ACHIEVEMENT_DATABASE.general
  ];
};

export const getAchievementsByType = (type) => {
  return ACHIEVEMENT_DATABASE[type] || [];
};

export const getAchievementsByCategory = (category) => {
  const allAchievements = getAllAchievements();
  return allAchievements.filter(achievement => achievement.category === category);
};

export const getAchievementsByRarity = (rarity) => {
  const allAchievements = getAllAchievements();
  return allAchievements.filter(achievement => achievement.rarity === rarity);
};

export const getAchievementById = (id) => {
  const allAchievements = getAllAchievements();
  return allAchievements.find(achievement => achievement.id === id);
};

export const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500';
    case 'epic': return 'from-purple-400 to-pink-500';
    case 'rare': return 'from-blue-400 to-cyan-500';
    case 'common': return 'from-green-400 to-emerald-500';
    default: return 'from-gray-400 to-gray-500';
  }
};

export const getRarityTextColor = (rarity) => {
  switch (rarity) {
    case 'legendary': return 'text-yellow-600';
    case 'epic': return 'text-purple-600';
    case 'rare': return 'text-blue-600';
    case 'common': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

// Achievement condition checker functions
export const checkAchievementCondition = (condition, userData) => {
  // This function would be implemented to check if user meets the condition
  // Returns boolean indicating if achievement should be awarded
  
  switch (condition) {
    case 'first_login':
      return userData.loginCount === 1;
    case 'habit_create_1':
      return userData.habitsCreated >= 1;
    case 'goal_create_1':
      return userData.goalsCreated >= 1;
    case 'workout_complete_first':
      return userData.workoutsCompleted >= 1;
    case 'photo_upload_first':
      return userData.photosUploaded >= 1;
    case 'activity_streak_7':
      return userData.currentStreak >= 7;
    case 'activity_streak_30':
      return userData.currentStreak >= 30;
    case 'activity_streak_100':
      return userData.currentStreak >= 100;
    // Add more condition checkers as needed
    default:
      return false;
  }
};

export const ACHIEVEMENT_CATEGORIES = {
  onboarding: { name: 'Getting Started', icon: '🚀', color: 'blue' },
  habits: { name: 'Habits', icon: '✅', color: 'green' },
  goals: { name: 'Goals', icon: '🎯', color: 'purple' },
  fitness: { name: 'Fitness', icon: '💪', color: 'red' },
  nutrition: { name: 'Nutrition', icon: '🍎', color: 'orange' },
  progress: { name: 'Progress', icon: '📈', color: 'indigo' },
  social: { name: 'Social', icon: '👥', color: 'pink' },
  consistency: { name: 'Consistency', icon: '🔥', color: 'amber' },
  engagement: { name: 'Engagement', icon: '📅', color: 'teal' },
  overall: { name: 'Overall', icon: '🌟', color: 'yellow' }
};