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

      // Get user points and profile info - should work now with fixed RLS policies
      const { data: profileData, error: profileError } = await supabase
        ?.from('profiles')
        ?.select('points, name, email')
        ?.eq('id', user?.id)
        ?.single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Set default values on profile error
        setUserStats({
          userLevel: 1,
          totalPoints: 0,
          nextLevelPoints: 100,
          currentLevelPoints: 0
        });
      } else {
        // Calculate user level based on points (100 points per level)
        const totalPoints = profileData?.points || 0;
        const currentLevel = Math.floor(totalPoints / 100) + 1;
        const currentLevelPoints = totalPoints % 100;
        const nextLevelPoints = 100;

        setUserStats({
          userLevel: currentLevel,
          totalPoints,
          nextLevelPoints,
          currentLevelPoints
        });
      }

      // Get enhanced statistics using new functions
      const [goalsResult, habitsResult, mediaResult] = await Promise.allSettled([
        supabase?.from('goals')?.select('id, progress')?.eq('user_id', user?.id),
        supabase?.from('habits')?.select('id')?.eq('user_id', user?.id),
        supabase?.from('media_files')?.select('id')?.eq('user_id', user?.id)?.eq('status', 'active')
      ]);

      const goalsData = goalsResult?.status === 'fulfilled' ? goalsResult?.value?.data || [] : [];
      const habitsData = habitsResult?.status === 'fulfilled' ? habitsResult?.value?.data || [] : [];
      const mediaData = mediaResult?.status === 'fulfilled' ? mediaResult?.value?.data || [] : [];

      // Calculate habit completion streak (simplified)
      const { data: recentCompletions } = await supabase
        ?.from('habit_completions')
        ?.select('completed_date')
        ?.eq('user_id', user?.id)
        ?.gte('completed_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0])
        ?.order('completed_date', { ascending: false });

      // Calculate unique days with completions for streak
      const uniqueDays = new Set(
        recentCompletions?.map(completion => completion?.completed_date) || []
      );

      // Calculate completed goals
      const completedGoals = goalsData?.filter(goal => goal?.progress >= 100)?.length || 0;

      setDashboardStats({
        currentStreak: uniqueDays?.size || 0,
        totalWorkouts: habitsData?.length || 0,
        photosUploaded: mediaData?.length || 0,
        activeGoals: goalsData?.length || 0,
        completedGoals: completedGoals
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
      // Fixed query that should work with the new RLS policies
      const { data, error } = await supabase
        ?.from('user_achievements')
        ?.select(`
          id,
          earned_at,
          achievements (
            id,
            name,
            description,
            icon,
            points
          )
        `)
        ?.eq('user_id', user?.id)
        ?.order('earned_at', { ascending: false })
        ?.limit(5);

      if (error) {
        console.error('Error fetching achievements:', error);
        setUserAchievements([]);
        return;
      }

      const formattedAchievements = data?.map(item => ({
        id: item?.id,
        title: item?.achievements?.name || 'Achievement',
        description: item?.achievements?.description || '',
        category: 'achievement',
        rarity: item?.achievements?.points > 15 ? 'rare' : 'common',
        points: item?.achievements?.points || 0,
        earnedAt: new Date(item?.earned_at),
        icon: item?.achievements?.icon || '🏆'
      })) || [];

      setUserAchievements(formattedAchievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      setUserAchievements([]);
    }
  };

  // Enhanced fetchUserGoals with better transformation
  const fetchUserGoals = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        ?.from('goals')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false })
        ?.limit(4);

      if (error) {
        console.error('Error fetching goals:', error);
        setUserGoals([]);
        return;
      }

      const formattedGoals = data?.map(goal => {
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
      }) || [];

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

      // Get recent media uploads
      const { data: mediaData } = await supabase
        ?.from('media_files')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'active')
        ?.order('uploaded_at', { ascending: false })
        ?.limit(2);

      mediaData?.forEach(media => {
        activities?.push({
          id: `media_${media?.id}`,
          type: 'photo',
          title: 'Progress Photo Uploaded',
          description: `Added new ${media?.media_type} to your progress collection`,
          timestamp: new Date(media?.uploaded_at),
          engagement: { likes: 0, comments: 0 }
        });
      });

      // Get recent goals
      const { data: goalsData } = await supabase
        ?.from('goals')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false })
        ?.limit(2);

      goalsData?.forEach(goal => {
        activities?.push({
          id: `goal_${goal?.id}`,
          type: 'goal',
          title: 'New Goal Created',
          description: goal?.title || 'Goal created',
          timestamp: new Date(goal?.created_at),
          engagement: { likes: 0, comments: 0 }
        });
      });

      // Get recent habit completions
      const { data: completionsData } = await supabase
        ?.from('habit_completions')
        ?.select(`
          *,
          habits (
            name,
            emoji
          )
        `)
        ?.eq('user_id', user?.id)
        ?.order('completed_at', { ascending: false })
        ?.limit(2);

      completionsData?.forEach(completion => {
        activities?.push({
          id: `completion_${completion?.id}`,
          type: 'habit',
          title: 'Habit Completed',
          description: `${completion?.habits?.emoji || '✅'} ${completion?.habits?.name || 'Unknown habit'}`,
          timestamp: new Date(completion?.completed_at),
          engagement: { likes: 0, comments: 0 }
        });
      });

      // Sort all activities by timestamp and take the most recent 5
      activities?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp));

      setRecentActivity(activities?.slice(0, 5) || []);
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