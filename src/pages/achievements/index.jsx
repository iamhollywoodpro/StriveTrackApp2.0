import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { apiGet } from '../../lib/api';
import Header from '../../components/ui/Header';
import AchievementGrid from './components/AchievementGrid';
import CategoryFilter from './components/CategoryFilter';
import StatsPanel from './components/StatsPanel';
import FeaturedAchievements from './components/FeaturedAchievements';
import HistoricalTimeline from './components/HistoricalTimeline';
import { 
  getAllAchievements, 
  getAchievementsByCategory, 
  ACHIEVEMENT_CATEGORIES,
  getRarityColor,
  getRarityTextColor 
} from '../../data/achievementDatabase';
import useConfetti from '../../hooks/useConfetti';

const Achievements = () => {
  const { user } = useAuth();
  const { playConfetti } = useConfetti();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [achievementsData, setAchievementsData] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [previousAchievements, setPreviousAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all 50 achievements from our comprehensive database
  const ALL_ACHIEVEMENTS = getAllAchievements();

  // Fetch achievements from database
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await apiGet('/achievements', supabase);
      const items = res?.items ?? [];

      // Create map of earned achievements by ID
      const earnedByCode = new Map(items.map(a => [a.code, a]));

      // Transform all 50 achievements with earned status
      const transformed = ALL_ACHIEVEMENTS.map(def => {
        const earned = earnedByCode.get(def.id);
        return {
          id: def.id,
          code: def.id,
          title: def.name,
          description: def.description,
          category: def.category,
          type: def.type,
          rarity: def.rarity,
          points: def.points,
          icon: def.icon,
          earnedAt: earned?.created_at ? new Date(earned.created_at) : null,
          isEarned: !!earned,
          unlockCriteria: def.description,
          progress: earned ? 100 : 0,
          resetDaily: def.resetDaily || false,
          resetWeekly: def.resetWeekly || false,
          condition: def.condition
        };
      });

      setAchievementsData(transformed);
      
      // Check for newly earned achievements and trigger confetti
      const newEarnedCodes = items.map(a => a.code);
      const previousEarnedCodes = previousAchievements.map(a => a.code);
      const newlyEarned = items.filter(a => !previousEarnedCodes.includes(a.code));
      
      // Trigger confetti for each newly earned achievement
      if (newlyEarned.length > 0 && previousAchievements.length > 0) {
        newlyEarned.forEach((achievement, index) => {
          setTimeout(() => {
            const achievementDef = ALL_ACHIEVEMENTS.find(def => def.id === achievement.code);
            if (achievementDef) {
              playConfetti({
                title: achievementDef.name,
                icon: achievementDef.icon,
                points: achievementDef.points
              });
            }
          }, index * 1000); // Stagger confetti if multiple achievements
        });
      }
      
      setUserAchievements(items);
      setPreviousAchievements(items);

    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Show all achievements even if API fails
      const fallbackAchievements = ALL_ACHIEVEMENTS.map(def => ({
        id: def.id,
        code: def.id,
        title: def.name,
        description: def.description,
        category: def.category,
        type: def.type,
        rarity: def.rarity,
        points: def.points,
        icon: def.icon,
        earnedAt: null,
        isEarned: false,
        unlockCriteria: def.description,
        progress: 0,
        resetDaily: def.resetDaily || false,
        resetWeekly: def.resetWeekly || false,
        condition: def.condition
      }));
      setAchievementsData(fallbackAchievements);
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

  const categories = ['all', ...Object.keys(ACHIEVEMENT_CATEGORIES)];
  const types = ['all', 'daily', 'weekly', 'general'];

  const filteredAchievements = achievementsData?.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement?.category === selectedCategory;
    const matchesType = selectedType === 'all' || achievement?.type === selectedType;
    const matchesSearch = achievement?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || 
                         achievement?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
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
              Achievement Center 🏆
            </h1>
            <p className="text-muted-foreground mb-4">
              Unlock all 50 achievements! Track your progress with 10 daily, 15 weekly, and 25 general achievements.
            </p>
            
            {/* Achievement Type Tabs */}
            <div className="flex space-x-1 bg-muted/30 rounded-lg p-1 w-fit">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'all' ? 'All (50)' : 
                   type === 'daily' ? 'Daily (10)' :
                   type === 'weekly' ? 'Weekly (15)' : 
                   'General (25)'}
                </button>
              ))}
            </div>
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