import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import UserLevelCard from './components/UserLevelCard';
import StatsGrid from './components/StatsGrid';
import ActivityTimeline from './components/ActivityTimeline';
import MotivationalQuote from './components/MotivationalQuote';
import QuickActions from './components/QuickActions';
import AchievementsBadges from './components/AchievementsBadges';
import GoalDeadlines from './components/GoalDeadlines';
import HabitsGoalsSummary from './components/HabitsGoalsSummary';
import InteractiveHabits from './components/InteractiveHabits';
import WeeklyStreaks from './components/WeeklyStreaks';
import TodaysFocus from './components/TodaysFocus';
import QuickProgressUpdate from './components/QuickProgressUpdate';

import { apiGet } from '../../lib/api';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  
  // Real data state management
  const [userStats, setUserStats] = useState({
    userLevel: 1,
    totalPoints: 0,
    nextLevelPoints: 100,
    currentLevelPoints: 0
  });

  const [dashboardStats, setDashboardStats] = useState({
    currentStreak: 0,
    totalWorkouts: 0,
    photosUploaded: 0,
    activeGoals: 0
  });

  const [userAchievements, setUserAchievements] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [userHabits, setUserHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Enhanced fetchUserStats with better error handling and achievement support
  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1) Points via Worker achievements endpoint
      const achRes = await apiGet('/achievements', supabase);
      const totalPoints = achRes?.total_points || 0;
      const currentLevel = Math.floor(totalPoints / 100) + 1;
      const currentLevelPoints = totalPoints % 100;
      const nextLevelPoints = 100;
      setUserStats({
        userLevel: currentLevel,
        totalPoints,
        nextLevelPoints,
        currentLevelPoints
      });

      // 2) Counts and streaks via Worker
      const today = new Date();
      const to = today.toISOString().split('T')[0];
      const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [goalsResult, habitsResult, mediaResult, habitsWithLogsResult] = await Promise.allSettled([
        apiGet('/goals', supabase),
        apiGet('/habits', supabase),
        apiGet('/media', supabase),
        apiGet(`/habits?from=${from}&to=${to}`, supabase)
      ]);

      const goalsData = goalsResult.status === 'fulfilled' ? (goalsResult.value?.items ?? goalsResult.value ?? []) : [];
      const habitsData = habitsResult.status === 'fulfilled' ? (habitsResult.value?.items ?? habitsResult.value ?? []) : [];
      const mediaData = mediaResult.status === 'fulfilled' ? (mediaResult.value?.items ?? mediaResult.value ?? []) : [];
      const logsData = habitsWithLogsResult.status === 'fulfilled' ? (habitsWithLogsResult.value?.logs ?? []) : [];

      const uniqueDays = new Set((logsData || []).map(l => l?.date));
      const completedGoals = goalsData.filter(g => (g?.progress || 0) >= 100).length;

      setDashboardStats({
        currentStreak: uniqueDays.size || 0,
        totalWorkouts: habitsData.length || 0,
        photosUploaded: mediaData.length || 0,
        activeGoals: goalsData.length || 0,
        completedGoals
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Set default values on error
      setUserStats({
        userLevel: 1,
        totalPoints: 0,
        nextLevelPoints: 100,
        currentLevelPoints: 0
      });
      setDashboardStats({
        currentStreak: 0,
        totalWorkouts: 0,
        photosUploaded: 0,
        activeGoals: 0,
        completedGoals: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetchUserAchievements with better error handling
  const fetchUserAchievements = async () => {
    if (!user?.id) return;

    try {
      const res = await apiGet('/achievements', supabase);
      const items = res?.items || [];
      const formatted = items.map(a => ({
        id: a?.id,
        title: a?.name || a?.code || 'Achievement',
        description: a?.description || a?.code || '',
        category: 'achievement',
        rarity: (a?.points || 0) > 15 ? 'rare' : 'common',
        points: a?.points || 0,
        earnedAt: a?.created_at ? new Date(a.created_at) : new Date(),
        icon: '🏆'
      }));
      setUserAchievements(formatted);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      setUserAchievements([]);
    }
  };

  // Enhanced fetchUserGoals with better transformation
  const fetchUserGoals = async () => {
    if (!user?.id) return;

    try {
      const res = await apiGet('/goals', supabase);
      const data = res?.items ?? res ?? [];
      const formattedGoals = data.map(goal => {
        // Ensure we have a valid numeric progress value (same logic as habit-goal-tracker)
        let progress = 0;
        if (goal?.progress !== null && goal?.progress !== undefined) {
          progress = Number(goal.progress) || 0;
        } else if (goal?.status !== null && goal?.status !== undefined) {
          progress = Number(goal.status) || 0;
        }
        progress = Math.max(0, Math.min(100, progress));
        
        const targetDate = goal?.target_date ? new Date(goal.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
        return {
          id: goal?.id,
          title: goal?.title || 'Untitled Goal',
          description: goal?.description || 'No description provided',
          deadline: targetDate,
          targetDate: targetDate,
          progress: progress,
          target: 100,
          unit: '%',
          daysRemaining: Math.max(0, daysRemaining),
          isOverdue: daysRemaining < 0,
          isCompleted: progress >= 100
        };
      });
      setUserGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching user goals:', error);
      setUserGoals([]);
    }
  };

  // Fetch habits and habit logs
  const fetchUserHabits = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = sevenDaysAgo.toISOString().split('T')[0];
      const to = today.toISOString().split('T')[0];

      const res = await apiGet(`/habits?from=${from}&to=${to}`, supabase);
      const habits = res?.items ?? res ?? [];
      const logs = res?.logs ?? [];

      setUserHabits(habits);
      setHabitLogs(logs);
    } catch (error) {
      console.error('Error fetching user habits:', error);
      setUserHabits([]);
      setHabitLogs([]);
    }
  };

  // Enhanced fetchRecentActivity with habits and goals
  const fetchRecentActivity = async () => {
    if (!user?.id) return;

    try {
      const activities = [];

      // Media uploads via Worker
      const mediaRes = await apiGet('/media', supabase);
      (mediaRes?.items || []).slice(0, 2).forEach((m, idx) => {
        activities.push({
          id: `media_${idx}_${m.key}`,
          type: 'photo',
          title: 'Progress Media Uploaded',
          description: `Added new ${m?.contentType?.startsWith('video/') ? 'video' : 'photo'} to your collection`,
          timestamp: m?.createdAt ? new Date(m.createdAt) : new Date(),
          engagement: { likes: 0, comments: 0 }
        });
      });

      // Recent goals via Worker
      const goalsRes = await apiGet('/goals', supabase);
      (goalsRes?.items || []).slice(0, 2).forEach(g => {
        activities.push({
          id: `goal_${g?.id}`,
          type: 'goal',
          title: 'New Goal Created',
          description: g?.title || 'Goal created',
          timestamp: g?.created_at ? new Date(g.created_at) : new Date(),
          engagement: { likes: 0, comments: 0 }
        });
      });

      // Recent habit logs via Worker (last 2)
      const today = new Date();
      const to = today.toISOString().split('T')[0];
      const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const habitsWithLogs = await apiGet(`/habits?from=${from}&to=${to}`, supabase);
      const habitsMap = new Map();
      (habitsWithLogs?.items || []).forEach(h => habitsMap.set(h.id, h));
      (habitsWithLogs?.logs || []).slice(0, 2).forEach((log, idx) => {
        const h = habitsMap.get(log.habit_id);
        activities.push({
          id: `completion_${idx}_${log.habit_id}_${log.date}`,
          type: 'habit',
          title: 'Habit Completed',
          description: `${h?.emoji || '✅'} ${h?.name || 'Habit'} on ${log.date}`,
          timestamp: new Date(log.date),
          engagement: { likes: 0, comments: 0 }
        });
      });

      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  // Refresh function for habit updates
  const refreshData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchUserStats(),
        fetchUserHabits(),
        fetchUserGoals(),
        fetchRecentActivity()
      ]);
    }
  };

  // Quick habit toggle function for dashboard components
  const handleQuickHabitToggle = async (habitId) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const isCompleted = habitLogs?.some(log => 
        log?.habit_id === habitId && log?.date === today
      );

      await apiSend('POST', `/habits/${habitId}/log`, { 
        date: today, 
        remove: !!isCompleted 
      }, supabase);

      // Refresh data
      await refreshData();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  // Load all data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
      fetchUserAchievements();
      fetchUserGoals();
      fetchUserHabits();
      fetchRecentActivity();
    }
  }, [user?.id]);

  // Get user's display name from multiple possible sources
  const displayName = userProfile?.full_name || 
                      userProfile?.username || 
                      user?.user_metadata?.full_name ||
                      user?.email?.split('@')?.[0] || 
                      'Friend';

  // Motivational quote (can be static or fetched from API)
  const dailyQuote = {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Loading your dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to crush your fitness goals today? Here's your progress overview.
            </p>
          </div>

          {/* User Level Card */}
          <div className="mb-8">
            <UserLevelCard {...userStats} />
          </div>

          {/* Statistics Grid */}
          <div className="mb-8">
            <StatsGrid stats={dashboardStats} />
          </div>

          {/* Main Content Grid - Perfectly Balanced Layout */}
          <div className="space-y-6 mb-8">
            {/* Top Row - Interactive Habits (Full Width) */}
            <InteractiveHabits 
              habits={userHabits} 
              habitLogs={habitLogs} 
              onRefresh={refreshData}
            />
            
            {/* Middle Row - Focus & Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodaysFocus 
                habits={userHabits}
                goals={userGoals}
                onHabitToggle={handleQuickHabitToggle}
              />
              
              <QuickProgressUpdate 
                goals={userGoals}
                onRefresh={refreshData}
              />
            </div>

            {/* Bottom Row - Goals, Activity & Achievements (Balanced 3-Column) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Goals Column - Full Height */}
              <div className="lg:col-span-1">
                <GoalDeadlines goals={userGoals} />
              </div>
              
              {/* Activity Column */}
              <div className="lg:col-span-1">
                <ActivityTimeline activities={recentActivity} />
              </div>
              
              {/* Achievements Column */}
              <div className="lg:col-span-1">
                <AchievementsBadges achievements={userAchievements} />
              </div>
            </div>

            {/* Motivational Quote - Full Width Bottom */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-border/50">
              <p className="text-lg font-medium text-foreground italic text-center mb-2">
                "{dailyQuote.text}"
              </p>
              <p className="text-sm text-muted-foreground text-center">— {dailyQuote.author}</p>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
};

export default Dashboard;