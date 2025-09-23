import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import AchievementGrid from './components/AchievementGrid';
import CategoryFilter from './components/CategoryFilter';
import StatsPanel from './components/StatsPanel';
import FeaturedAchievements from './components/FeaturedAchievements';
import HistoricalTimeline from './components/HistoricalTimeline';

const Achievements = () => {
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [achievementsData, setAchievementsData] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch achievements from database
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase?.from('achievements')?.select('*')?.order('points', { ascending: false });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        setAchievementsData([]);
        return;
      }

      // Get user's earned achievements
      const { data: earnedAchievements, error: userError } = await supabase?.from('user_achievements')?.select(`
          id,
          earned_at,
          achievement_id,
          achievements (
            id,
            name,
            description,
            icon,
            points
          )
        `)?.eq('user_id', user?.id)?.order('earned_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user achievements:', userError);
        setUserAchievements([]);
      } else {
        setUserAchievements(earnedAchievements || []);
      }

      // Transform achievements data
      const transformedAchievements = allAchievements?.map(achievement => {
        const userAchievement = earnedAchievements?.find(ua => ua?.achievement_id === achievement?.id);
        const isEarned = !!userAchievement;
        
        return {
          id: achievement?.id,
          title: achievement?.name,
          description: achievement?.description,
          category: achievement?.points > 100 ? 'progress' : achievement?.points > 50 ? 'consistency' : 'special',
          rarity: achievement?.points > 200 ? 'legendary' : achievement?.points > 100 ? 'epic' : achievement?.points > 50 ? 'rare' : 'common',
          points: achievement?.points,
          earnedAt: userAchievement ? new Date(userAchievement?.earned_at) : null,
          isEarned,
          unlockCriteria: achievement?.description,
          progress: isEarned ? 100 : 0,
          artwork: achievement?.icon || '🏆'
        };
      }) || [];

      setAchievementsData(transformedAchievements);

    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievementsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
  }, [user?.id]);

  // Calculate stats data from real achievements
  const statsData = {
    totalEarned: achievementsData?.filter(achievement => achievement?.isEarned)?.length || 0,
    totalPoints: achievementsData?.filter(achievement => achievement?.isEarned)?.reduce((sum, achievement) => sum + achievement?.points, 0) || 0,
    completionPercentage: achievementsData?.length > 0 ? Math.round((achievementsData?.filter(achievement => achievement?.isEarned)?.length / achievementsData?.length) * 100) : 0,
    rarityDistribution: {
      common: achievementsData?.filter(a => a?.rarity === 'common' && a?.isEarned)?.length || 0,
      rare: achievementsData?.filter(a => a?.rarity === 'rare' && a?.isEarned)?.length || 0,
      epic: achievementsData?.filter(a => a?.rarity === 'epic' && a?.isEarned)?.length || 0,
      legendary: achievementsData?.filter(a => a?.rarity === 'legendary' && a?.isEarned)?.length || 0
    }
  };

  // Featured achievements data from real achievements
  const featuredAchievements = {
    recent: achievementsData?.filter(a => a?.isEarned)?.sort((a, b) => new Date(b?.earnedAt) - new Date(a?.earnedAt))?.slice(0, 3) || [],
    upcoming: achievementsData?.filter(a => !a?.isEarned && a?.progress > 50)?.sort((a, b) => b?.progress - a?.progress)?.slice(0, 3) || [],
    seasonal: achievementsData?.filter(a => a?.category === 'special')?.slice(0, 2) || []
  };

  const categories = ['all', 'consistency', 'progress', 'social', 'special'];

  const filteredAchievements = achievementsData?.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement?.category === selectedCategory;
    const matchesSearch = achievement?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || 
                         achievement?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Loading your achievements...</span>
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Achievements 🏆
            </h1>
            <p className="text-muted-foreground">
              Celebrate your progress and unlock new milestones on your fitness journey.
            </p>
          </div>

          {/* Stats Panel */}
          <div className="mb-8">
            <StatsPanel stats={statsData} />
          </div>

          {/* Featured Achievements */}
          <div className="mb-8">
            <FeaturedAchievements achievements={featuredAchievements} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Side - Filters and Timeline */}
            <div className="lg:col-span-1 space-y-8">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <HistoricalTimeline achievements={achievementsData?.filter(a => a?.isEarned)} />
            </div>

            {/* Right Side - Achievement Grid */}
            <div className="lg:col-span-3">
              <AchievementGrid
                achievements={filteredAchievements}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Achievements;