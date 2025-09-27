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
        const targetDate = goal?.target_date ? new Date(goal.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
        return {
          id: goal?.id,
          title: goal?.title || 'Untitled Goal',
          description: goal?.description || 'No description provided',
          deadline: targetDate,
          progress: Math.max(0, Math.min(100, goal?.progress || 0)),
          target: 100,
          unit: '%',
          daysRemaining: Math.max(0, daysRemaining),
          isOverdue: daysRemaining < 0,
          isCompleted: (goal?.progress || 0) >= 100
        };
      });
      setUserGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching user goals:', error);
      setUserGoals([]);
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

  // Load all data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
      fetchUserAchievements();
      fetchUserGoals();
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Activity Timeline */}
            <div className="lg:col-span-2 space-y-8">
              <ActivityTimeline activities={recentActivity} />
              <MotivationalQuote quote={dailyQuote} />
            </div>

            {/* Right Column - Quick Actions & Achievements */}
            <div className="space-y-8">
              <QuickActions />
              <AchievementsBadges achievements={userAchievements} />
            </div>
          </div>

          {/* Goals Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GoalDeadlines goals={userGoals} />
            
            {/* Enhanced Additional Stats Card with better data */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-6">Your Progress Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{dashboardStats?.totalWorkouts || 0}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Active Habits</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {dashboardStats?.totalWorkouts > 0 ? 'Keep it up!' : 'Start your first habit!'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">{dashboardStats?.photosUploaded || 0}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Progress Photos</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {dashboardStats?.photosUploaded > 0 ? 'Great documentation!' : 'Upload your first photo!'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">{dashboardStats?.activeGoals || 0}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Active Goals</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {dashboardStats?.activeGoals > 0 ? 'Stay focused!' : 'Set your first goal!'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{dashboardStats?.completedGoals || 0}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Goals Completed</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {dashboardStats?.completedGoals > 0 ? 'Excellent work!' : 'Complete your first goal!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;