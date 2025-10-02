import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Pure Cloudflare API - no Supabase imports needed
import { apiGet, apiSend } from '../../lib/api';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MacroRing from './components/MacroRing';
import WaterIntakeTracker from './components/WaterIntakeTracker';
import MealSection from './components/MealSection';
import EnhancedFoodSearchModal from './components/EnhancedFoodSearchModal';
import RecipeLibrary from './components/RecipeLibrary';
import NutritionInsights from './components/NutritionInsights';
import QuickAddDropdown from './components/QuickAddDropdown';
import { searchFoods, getFoodsByCategory, getPopularFoods, calculateNutrition, getRecipeSuggestions } from '../../data/enhancedFoodDatabase';

const NutritionTracker = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('today');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRecipeLibraryOpen, setIsRecipeLibraryOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);
  const [meals, setMeals] = useState({
    breakfast: { name: 'Breakfast', foods: [] },
    lunch: { name: 'Lunch', foods: [] },
    dinner: { name: 'Dinner', foods: [] },
    snacks: { name: 'Snacks', foods: [] }
  });
  const [loading, setLoading] = useState(true);

  // Fetch real nutrition data from database
  const fetchNutritionData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get today's nutrition entries from Worker
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const res = await apiGet(`/nutrition?date=${today}`);
      const entries = res?.items ?? res ?? [];

      // Transform nutrition entries to meals structure
      const mealData = {
        breakfast: { name: 'Breakfast', foods: [] },
        lunch: { name: 'Lunch', foods: [] },
        dinner: { name: 'Dinner', foods: [] },
        snacks: { name: 'Snacks', foods: [] }
      };

      entries?.forEach(entry => {
        const mealType = (entry?.meal_type || 'snacks')?.toLowerCase();
        if (mealData?.[mealType]) {
          // Parse addons if they exist (backward compatibility)
          let addons = [];
          try {
            if (entry?.addons && typeof entry.addons === 'string') {
              addons = JSON.parse(entry.addons);
            } else if (Array.isArray(entry?.addons)) {
              addons = entry.addons;
            }
          } catch (e) {
            console.warn('Failed to parse addons for entry:', entry?.id, e);
            addons = [];
          }

          // Build food object with backward compatibility
          const foodItem = {
            id: entry?.id,
            name: entry?.meal_name || 'Unknown Food',
            image: entry?.food_image || entry?.image || null,
            portion: entry?.serving_size || '1 serving',
            calories: Math.round(Number(entry?.calories || 0)),
            protein: Math.round(Number(entry?.protein || 0) * 10) / 10,
            carbs: Math.round(Number(entry?.carbs || 0) * 10) / 10,
            fat: Math.round(Number(entry?.fat || 0) * 10) / 10,
            addons: addons
          };

          // Add optional fields if they exist
          if (entry?.fiber !== undefined) foodItem.fiber = Math.round(Number(entry.fiber || 0) * 10) / 10;
          if (entry?.sugar !== undefined) foodItem.sugar = Math.round(Number(entry.sugar || 0) * 10) / 10;
          if (entry?.category) foodItem.category = entry.category;
          if (entry?.food_id) foodItem.foodId = entry.food_id;

          mealData?.[mealType]?.foods?.push(foodItem);
        }
      });

      setMeals(mealData);
      setWaterIntake(0);

    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNutritionData();
    }
  }, [user?.id]);

  // Calculate daily totals from real data
  const dailyTotals = Object.values(meals)?.reduce(
    (totals, meal) => {
      meal?.foods?.forEach(food => {
        totals.calories += food?.calories || 0;
        totals.protein += food?.protein || 0;
        totals.carbs += food?.carbs || 0;
        totals.fat += food?.fat || 0;
      });
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Daily targets (these could come from user profile in the future)
  const dailyTargets = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 67,
    water: 2500
  };

  const handleAddFood = (mealType) => {
    setSelectedMealType(mealType);
    setIsSearchModalOpen(true);
  };

  const handleAddRecipe = (mealType) => {
    setSelectedMealType(mealType);
    setIsRecipeLibraryOpen(true);
  };

  const handleRecipeAdded = async (mealType, recipe) => {
    if (!user?.id) return;

    try {
      await apiSend('POST', '/nutrition', {
        meal_name: recipe?.name,
        meal_type: mealType?.toLowerCase(),
        calories: recipe?.calories || 0,
        protein: recipe?.protein || 0,
        carbs: recipe?.carbs || 0,
        fat: recipe?.fat || 0,
        date: new Date()?.toISOString()?.split('T')?.[0]
      });

      // Refresh nutrition data
      fetchNutritionData();
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert(error?.message || (error?.response?.error) || 'Failed to add recipe');
    }
  };

  const handleFoodAdded = async (mealType, food) => {
    if (!user?.id) return;

    try {
      console.log('🍔 Adding food:', food);
      
      // Send comprehensive food data with fallbacks for backward compatibility
      const foodData = {
        meal_name: food?.name || 'Unknown Food',
        meal_type: (mealType || 'snacks')?.toLowerCase(),
        calories: Math.round(Number(food?.calories || 0)),
        protein: Math.round(Number(food?.protein || 0) * 10) / 10,
        carbs: Math.round(Number(food?.carbs || 0) * 10) / 10,
        fat: Math.round(Number(food?.fat || 0) * 10) / 10,
        date: new Date()?.toISOString()?.split('T')?.[0]
      };

      // Add enhanced fields only if they exist (backward compatibility)
      if (food?.fiber !== undefined) foodData.fiber = Math.round(Number(food.fiber || 0) * 10) / 10;
      if (food?.sugar !== undefined) foodData.sugar = Math.round(Number(food.sugar || 0) * 10) / 10;
      if (food?.servingSize || food?.portion) foodData.serving_size = food.servingSize || food.portion || '1 serving';
      if (food?.image) foodData.food_image = food.image;
      if (food?.foodId || food?.id) foodData.food_id = food.foodId || food.id;
      if (food?.category) foodData.category = food.category;
      if (food?.addons && food.addons.length > 0) foodData.addons = JSON.stringify(food.addons);

      console.log('📤 Sending food data:', foodData);

      await apiSend('POST', '/nutrition', foodData);

      console.log('✅ Food added successfully');
      
      // Refresh nutrition data
      fetchNutritionData();
    } catch (error) {
      console.error('❌ Error adding food:', error);
      
      // Better error messaging
      let errorMessage = 'Failed to add food. ';
      if (error?.message?.includes('column')) {
        errorMessage += 'Database schema mismatch - please refresh the page and try again.';
      } else if (error?.message?.includes('Unauthorized')) {
        errorMessage += 'Please log in again.';
      } else {
        errorMessage += error?.message || error?.response?.error || 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    }
  };

  const handleRemoveFood = async (foodId) => {
    if (!user?.id) return;

    try {
      await apiSend('DELETE', `/nutrition/${foodId}`, null);

      // Refresh the data to update all meal sections
      await fetchNutritionData();
    } catch (error) {
      console.error('Error removing food:', error);
      alert(error?.message || (error?.response?.error) || 'Failed to remove food');
    }
  };

  const handleAddWater = (amount) => {
    setWaterIntake(prev => Math.min(prev + amount, dailyTargets?.water));
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: 'Calendar' },
    { id: 'insights', label: 'Insights', icon: 'BarChart3' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Loading your nutrition data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Nutrition Tracker</h1>
                <p className="text-muted-foreground mt-1">
                  Track your meals and monitor your nutritional goals
                </p>
              </div>
              <div className="hidden md:block">
                <QuickAddDropdown onSelectMeal={handleAddFood} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab?.id
                    ? 'bg-card text-foreground shadow-elevation-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'today' ? (
            <div className="space-y-8">
              {/* Daily Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Macro Rings */}
                <div className="lg:col-span-2">
                  <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Daily Macros</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {/* Calories */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-2">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="#E5E7EB"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="#6366F1"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={2 * Math.PI * 45}
                              strokeDashoffset={2 * Math.PI * 45 - (Math.min(dailyTotals?.calories / dailyTargets?.calories, 1) * 2 * Math.PI * 45)}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-in-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-foreground">{Math.round(dailyTotals?.calories)}</span>
                            <span className="text-xs text-muted-foreground">cal</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Calories</p>
                          <p className="text-xs text-muted-foreground">{Math.round(dailyTotals?.calories)}/{dailyTargets?.calories}</p>
                        </div>
                      </div>

                      <MacroRing
                        label="Protein"
                        current={Math.round(dailyTotals?.protein)}
                        target={dailyTargets?.protein}
                        color="#10B981"
                        unit="g"
                      />
                      <MacroRing
                        label="Carbs"
                        current={Math.round(dailyTotals?.carbs)}
                        target={dailyTargets?.carbs}
                        color="#3B82F6"
                        unit="g"
                      />
                      <MacroRing
                        label="Fat"
                        current={Math.round(dailyTotals?.fat)}
                        target={dailyTargets?.fat}
                        color="#F59E0B"
                        unit="g"
                      />
                    </div>
                  </div>
                </div>

                {/* Water Intake */}
                <div>
                  <WaterIntakeTracker
                    currentIntake={waterIntake}
                    targetIntake={dailyTargets?.water}
                    onAddWater={handleAddWater}
                  />
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Today's Meals</h2>
                {Object.entries(meals)?.map(([mealType, meal]) => (
                  <MealSection
                    key={mealType}
                    meal={meal}
                    onAddFood={() => handleAddFood(mealType)}
                    onAddRecipe={() => handleAddRecipe(mealType)}
                    onRemoveFood={handleRemoveFood}
                  />
                ))}
              </div>

              {/* Quick Actions - Mobile */}
              <div className="md:hidden fixed bottom-20 right-4 z-40">
                <QuickAddDropdown onSelectMeal={handleAddFood} />
              </div>
            </div>
          ) : (
            <NutritionInsights />
          )}
        </div>
      </main>
      {/* Food Search Modal */}
      <EnhancedFoodSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddFood={handleFoodAdded}
        mealType={selectedMealType}
      />
      
      {/* Recipe Library Modal */}
      <RecipeLibrary
        isOpen={isRecipeLibraryOpen}
        onClose={() => setIsRecipeLibraryOpen(false)}
        onAddRecipe={handleRecipeAdded}
        mealType={selectedMealType}
      />
    </div>
  );
};

export default NutritionTracker;