import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { searchFoods, getFoodsByCategory, getPopularFoods, ENHANCED_FOOD_DATABASE } from '../../../data/enhancedFoodDatabase';
import { getAddonsForFood, calculateTotalMacros, FOOD_ADDONS } from '../../../data/foodAddons';

const EnhancedFoodSearchModal = ({ isOpen, onClose, onAddFood, mealType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [portion, setPortion] = useState('1 serving');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddons, setShowAddons] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Search foods using our enhanced comprehensive database
  useEffect(() => {
    if (searchQuery?.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        const results = searchFoods(searchQuery);
        const filteredResults = activeTab === 'all' ? 
          results : 
          results.filter(food => food.category === activeTab);
        setSearchResults(filteredResults);
        setIsLoading(false);
      }, 150);
    } else {
      const foods = activeTab === 'all' ? 
        getPopularFoods() : 
        getFoodsByCategory(activeTab).slice(0, 12);
      setSearchResults(foods);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    const recentItems = mealType && ENHANCED_FOOD_DATABASE[mealType] ? 
      getFoodsByCategory(mealType).slice(0, 3) : 
      getPopularFoods().slice(0, 6);
    setRecentFoods(recentItems);
  }, [mealType]);

  // Get available add-ons for selected food
  const availableAddons = selectedFood ? getAddonsForFood(selectedFood.id) : [];

  // Calculate total macros including add-ons
  const totalMacros = selectedFood ? calculateTotalMacros(selectedFood, selectedAddons) : null;

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSelectedAddons([]);
    setShowAddons(false);
    // Auto-show add-ons if available
    const addons = getAddonsForFood(food.id);
    if (addons.length > 0) {
      setShowAddons(true);
    }
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.find(a => a.id === addon.id);
      if (isSelected) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddFood = () => {
    if (selectedFood) {
      const foodToAdd = {
        id: Date.now(),
        foodId: selectedFood.id,
        name: selectedFood.name,
        calories: totalMacros.calories,
        protein: totalMacros.protein,
        carbs: totalMacros.carbs,
        fat: totalMacros.fat,
        fiber: totalMacros.fiber || 0,
        sugar: totalMacros.sugar || 0,
        servingSize: selectedFood.servingSize,
        image: selectedFood.image,
        portion,
        category: selectedFood.category,
        addons: selectedAddons.map(addon => ({
          id: addon.id,
          name: addon.name,
          macros: addon.macros
        }))
      };
      onAddFood(mealType, foodToAdd);
      resetModal();
      onClose();
    }
  };

  const handleAddCustomFood = () => {
    if (customFood?.name && customFood?.calories) {
      const foodToAdd = {
        id: Date.now(),
        name: customFood?.name,
        calories: Number(customFood?.calories) || 0,
        protein: Number(customFood?.protein) || 0,
        carbs: Number(customFood?.carbs) || 0,
        fat: Number(customFood?.fat) || 0,
        portion: '1 serving',
        servingSize: 'custom',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' // Default food image
      };
      onAddFood(mealType, foodToAdd);
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setSelectedAddons([]);
    setPortion('1 serving');
    setShowCustomForm(false);
    setShowAddons(false);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const getFoodImage = (food) => {
    // Fallback images for foods without images
    const fallbackImages = {
      breakfast: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 
      dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      snacks: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    };

    return food.image || fallbackImages[food.category] || fallbackImages.default;
  };

  const getAddonCategoryIcon = (category) => {
    const iconMap = {
      cheese: 'Milk',
      vegetables: 'Leaf', 
      meat: 'Beef',
      sauce: 'Droplets',
      bread: 'Wheat',
      nuts: 'Nut',
      fruit: 'Apple',
      dairy: 'Milk',
      sweetener: 'Candy'
    };
    return iconMap[category] || 'Plus';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Add Food to {mealType?.charAt(0)?.toUpperCase() + mealType?.slice(1)}
              </h2>
              <p className="text-muted-foreground">Search our comprehensive database with smart add-ons for accurate tracking</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-140px)]">
          {/* Left Panel - Search & Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!showCustomForm ? (
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search foods (e.g., hamburger, chicken, pizza...)"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['all', 'breakfast', 'lunch', 'dinner', 'snacks'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-white'
                          : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/30'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Add Custom Food Button */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    iconName="Plus"
                    iconPosition="left"
                    className="w-full"
                  >
                    Add Custom Food
                  </Button>
                </div>

                {/* Search Results */}
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Searching foods...</p>
                    </div>
                  ) : searchResults?.length > 0 ? (
                    <div className="grid gap-2">
                      {searchResults.map((food) => {
                        const hasAddons = getAddonsForFood(food.id).length > 0;
                        return (
                          <div
                            key={food.id}
                            onClick={() => handleFoodSelect(food)}
                            className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                              selectedFood?.id === food?.id 
                                ? 'bg-primary/5 border-primary shadow-lg' 
                                : 'bg-card border-border hover:bg-secondary/10'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                              <img 
                                src={getFoodImage(food)}
                                alt={food.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                                }}
                              />
                              {hasAddons && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                  <Icon name="Plus" size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">{food.name}</h4>
                                {hasAddons && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                    Add-ons
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{food.servingSize}</p>
                              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                <span>{food.macros.calories} cal</span>
                                <span>P: {food.macros.protein}g</span>
                                <span>C: {food.macros.carbs}g</span>
                                <span>F: {food.macros.fat}g</span>
                              </div>
                            </div>
                            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No foods found. Try a different search term.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Custom Food Form
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Custom Food</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(false)}>
                    <Icon name="ArrowLeft" size={16} />
                  </Button>
                </div>
                
                <Input
                  label="Food Name"
                  value={customFood.name}
                  onChange={(e) => setCustomFood(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Homemade Protein Shake"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Calories"
                    type="number"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood(prev => ({...prev, calories: e.target.value}))}
                    placeholder="250"
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood(prev => ({...prev, protein: e.target.value}))}
                    placeholder="25"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Carbs (g)"
                    type="number"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood(prev => ({...prev, carbs: e.target.value}))}
                    placeholder="30"
                  />
                  <Input
                    label="Fat (g)"
                    type="number"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood(prev => ({...prev, fat: e.target.value}))}
                    placeholder="5"
                  />
                </div>
                
                <Button 
                  onClick={handleAddCustomFood}
                  disabled={!customFood.name || !customFood.calories}
                  className="w-full"
                >
                  Add Custom Food
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Selected Food & Add-ons */}
          {selectedFood && (
            <div className="lg:w-1/2 border-l border-border p-6 bg-muted/20 overflow-y-auto">
              {/* Selected Food */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={getFoodImage(selectedFood)}
                      alt={selectedFood.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{selectedFood.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{selectedFood.servingSize}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {totalMacros.calories} cal
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        P: {totalMacros.protein}g
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                        C: {totalMacros.carbs}g
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        F: {totalMacros.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-ons Section */}
              {availableAddons.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Icon name="Plus" size={20} className="text-orange-500" />
                      Customize Your {selectedFood.name}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {selectedAddons.length} selected
                    </span>
                  </div>
                  
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {availableAddons.map((addon) => {
                      const isSelected = selectedAddons.find(a => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon)}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-sm'
                              : 'bg-white border-border hover:bg-secondary/30'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={addon.image}
                              alt={addon.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-foreground truncate">{addon.name}</h5>
                              <Icon 
                                name={getAddonCategoryIcon(addon.category)} 
                                size={14} 
                                className="text-muted-foreground" 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{addon.servingSize}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>+{addon.macros.calories} cal</span>
                              <span>P: +{addon.macros.protein}g</span>
                              <span>C: +{addon.macros.carbs}g</span>
                              <span>F: +{addon.macros.fat}g</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-border'
                          }`}>
                            {isSelected && <Icon name="Check" size={14} className="text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Portion Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Portion Size</label>
                <select
                  value={portion}
                  onChange={(e) => setPortion(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="0.5 serving">0.5 serving</option>
                  <option value="1 serving">1 serving</option>
                  <option value="1.5 servings">1.5 servings</option>
                  <option value="2 servings">2 servings</option>
                </select>
              </div>

              {/* Final Macro Summary */}
              {totalMacros && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="BarChart3" size={16} />
                    Total Nutrition
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{totalMacros.calories}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{totalMacros.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{totalMacros.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{totalMacros.fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Includes {selectedAddons.length} add-on{selectedAddons.length > 1 ? 's' : ''}: {' '}
                        {selectedAddons.map(addon => addon.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Food Button */}
              <Button onClick={handleAddFood} className="w-full" size="lg">
                <Icon name="Plus" size={16} className="mr-2" />
                Add to {mealType?.charAt(0)?.toUpperCase() + mealType?.slice(1)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFoodSearchModal;