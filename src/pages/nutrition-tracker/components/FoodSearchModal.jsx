import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { searchFoods, getFoodsByCategory, getPopularFoods, ENHANCED_FOOD_DATABASE } from '../../../data/enhancedFoodDatabase';

const FoodSearchModal = ({ isOpen, onClose, onAddFood, mealType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [portion, setPortion] = useState('1 serving');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, breakfast, lunch, dinner, snacks
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
      // Enhanced search with smart matching
      setTimeout(() => {
        const results = searchFoods(searchQuery);
        // Filter by category if not 'all'
        const filteredResults = activeTab === 'all' ? 
          results : 
          results.filter(food => food.category === activeTab);
        setSearchResults(filteredResults);
        setIsLoading(false);
      }, 150);
    } else {
      // Show category foods or popular foods when no search query
      const foods = activeTab === 'all' ? 
        getPopularFoods() : 
        getFoodsByCategory(activeTab).slice(0, 12);
      setSearchResults(foods);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    // Set recent foods based on meal type or show variety
    const recentItems = mealType && ENHANCED_FOOD_DATABASE[mealType] ? 
      getFoodsByCategory(mealType).slice(0, 3) : 
      getPopularFoods().slice(0, 6);
    setRecentFoods(recentItems);
  }, [mealType]);

  const handleAddFood = () => {
    if (selectedFood) {
      const foodToAdd = {
        id: Date.now(), // Generate unique ID for this entry
        foodId: selectedFood.id,
        name: selectedFood.name,
        calories: selectedFood.macros.calories,
        protein: selectedFood.macros.protein,
        carbs: selectedFood.macros.carbs,
        fat: selectedFood.macros.fat,
        fiber: selectedFood.macros.fiber || 0,
        sugar: selectedFood.macros.sugar || 0,
        servingSize: selectedFood.servingSize,
        image: selectedFood.image,
        portion,
        category: selectedFood.category
      };
      onAddFood(mealType, foodToAdd);
      onClose();
      setSelectedFood(null);
      setPortion('1 serving');
      setSearchQuery('');
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
        servingSize: 'custom'
      };
      onAddFood(mealType, foodToAdd);
      onClose();
      setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowCustomForm(false);
    }
  };

  const resetModal = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setPortion('1 serving');
    setShowCustomForm(false);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Add Food to {mealType}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => { onClose(); resetModal(); }}>
              <Icon name="X" size={20} color="currentColor" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showCustomForm ? (
            <>
              {/* Search Bar */}
              <div className="mb-6">
                <Input
                  type="search"
                  placeholder="Search 500+ foods (e.g., hamburger, chicken, salmon, pizza)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="mb-4"
                />
                
                {/* Category Tabs */}
                <div className="flex space-x-1 mb-4 bg-muted/30 rounded-lg p-1">
                  {[
                    { id: 'all', name: 'All Foods', icon: 'Grid3X3' },
                    { id: 'breakfast', name: 'Breakfast', icon: 'Coffee' },
                    { id: 'lunch', name: 'Lunch', icon: 'Salad' },
                    { id: 'dinner', name: 'Dinner', icon: 'ChefHat' },
                    { id: 'snacks', name: 'Snacks', icon: 'Apple' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Add Custom Food Button */}
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => setShowCustomForm(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Custom Food
                </Button>
              </div>

              {/* Food Results Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 
                   activeTab === 'all' ? 'Popular Foods' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Foods`}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Searching foods...</span>
                  </div>
                ) : searchResults?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults?.map((food) => (
                      <div
                        key={food?.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedFood?.id === food?.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/30 hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedFood(food)}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {food?.image ? (
                            <img 
                              src={food.image} 
                              alt={food.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="UtensilsCrossed" size={24} className="text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1 line-clamp-1">{food?.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {food?.macros?.calories} cal • {food?.servingSize}
                          </p>
                          <div className="flex space-x-3 text-xs">
                            <span className="text-green-600">P: {food?.macros?.protein}g</span>
                            <span className="text-blue-600">C: {food?.macros?.carbs}g</span>
                            <span className="text-orange-600">F: {food?.macros?.fat}g</span>
                          </div>
                        </div>
                        {selectedFood?.id === food?.id && (
                          <Icon name="CheckCircle" size={20} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? `No foods found for "${searchQuery}"` : 'No foods available'}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setShowCustomForm(true)} variant="outline">
                        Add "{searchQuery}" as custom food
                      </Button>
                    )}
                  </div>
                )}
              </div>



              {/* Selected Food Details */}
              {selectedFood && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Selected Food</h3>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm border border-border">
                      {selectedFood?.image ? (
                        <img 
                          src={selectedFood.image} 
                          alt={selectedFood.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="UtensilsCrossed" size={28} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-foreground mb-1">{selectedFood?.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{selectedFood?.servingSize}</p>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {selectedFood?.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                      <p className="text-2xl font-bold text-foreground">{selectedFood?.macros?.calories}</p>
                      <p className="text-xs text-muted-foreground font-medium">Calories</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                      <p className="text-2xl font-bold text-green-600">{selectedFood?.macros?.protein}g</p>
                      <p className="text-xs text-muted-foreground font-medium">Protein</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                      <p className="text-2xl font-bold text-blue-600">{selectedFood?.macros?.carbs}g</p>
                      <p className="text-xs text-muted-foreground font-medium">Carbs</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                      <p className="text-2xl font-bold text-orange-600">{selectedFood?.macros?.fat}g</p>
                      <p className="text-xs text-muted-foreground font-medium">Fat</p>
                    </div>
                  </div>

                  {selectedFood?.macros?.fiber > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                        <p className="text-lg font-bold text-purple-600">{selectedFood?.macros?.fiber}g</p>
                        <p className="text-xs text-muted-foreground font-medium">Fiber</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 text-center border border-border/50">
                        <p className="text-lg font-bold text-pink-600">{selectedFood?.macros?.sugar}g</p>
                        <p className="text-xs text-muted-foreground font-medium">Sugar</p>
                      </div>
                    </div>
                  )}

                  <Input
                    label="Portion Size"
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e?.target?.value)}
                    placeholder="e.g., 1 serving, 150g, 2 pieces"
                    className="bg-white/70"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Add Custom Food</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(false)}>
                  <Icon name="X" size={16} color="currentColor" />
                </Button>
              </div>
              <Input
                label="Food Name *"
                type="text"
                value={customFood?.name}
                onChange={(e) => setCustomFood(prev => ({...prev, name: e?.target?.value}))}
                placeholder="e.g., Homemade Pasta Salad"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Calories *"
                  type="number"
                  value={customFood?.calories}
                  onChange={(e) => setCustomFood(prev => ({...prev, calories: e?.target?.value}))}
                  placeholder="250"
                  required
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  value={customFood?.protein}
                  onChange={(e) => setCustomFood(prev => ({...prev, protein: e?.target?.value}))}
                  placeholder="15"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Carbs (g)"
                  type="number"
                  value={customFood?.carbs}
                  onChange={(e) => setCustomFood(prev => ({...prev, carbs: e?.target?.value}))}
                  placeholder="30"
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  value={customFood?.fat}
                  onChange={(e) => setCustomFood(prev => ({...prev, fat: e?.target?.value}))}
                  placeholder="8"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Nutrition Preview</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{customFood?.calories || 0}</div>
                    <div className="text-xs text-blue-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{customFood?.protein || 0}g</div>
                    <div className="text-xs text-green-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{customFood?.carbs || 0}g</div>
                    <div className="text-xs text-blue-600">Carbs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{customFood?.fat || 0}g</div>
                    <div className="text-xs text-orange-600">Fat</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => { onClose(); resetModal(); }} fullWidth>
              Cancel
            </Button>
            {!showCustomForm ? (
              <Button
                onClick={handleAddFood}
                disabled={!selectedFood}
                fullWidth
                iconName="Plus"
                iconPosition="left"
              >
                Add Food
              </Button>
            ) : (
              <Button
                onClick={handleAddCustomFood}
                disabled={!customFood?.name || !customFood?.calories}
                fullWidth
                iconName="Plus"
                iconPosition="left"
              >
                Add Custom Food
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchModal;