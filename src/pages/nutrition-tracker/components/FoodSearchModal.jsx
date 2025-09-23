import React, { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FoodSearchModal = ({ isOpen, onClose, onAddFood, mealType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [portion, setPortion] = useState('1 serving');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Mock food database
  const mockFoodDatabase = [
    {
      id: 1,
      name: "Grilled Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      servingSize: "100g"
    },
    {
      id: 2,
      name: "Brown Rice",
      calories: 112,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      servingSize: "100g"
    },
    {
      id: 3,
      name: "Greek Yogurt",
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      servingSize: "100g"
    },
    {
      id: 4,
      name: "Banana",
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      servingSize: "1 medium (118g)"
    },
    {
      id: 5,
      name: "Avocado",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      servingSize: "100g"
    },
    {
      id: 6,
      name: "Salmon Fillet",
      calories: 208,
      protein: 25.4,
      carbs: 0,
      fat: 12.4,
      servingSize: "100g"
    }
  ];

  useEffect(() => {
    if (searchQuery?.trim()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = mockFoodDatabase?.filter(food =>
          food?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setSearchResults(filtered);
        setIsLoading(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Mock recent foods
    setRecentFoods(mockFoodDatabase?.slice(0, 3));
  }, []);

  const handleAddFood = () => {
    if (selectedFood) {
      const foodToAdd = {
        ...selectedFood,
        portion,
        id: Date.now() // Generate unique ID
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
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="mb-4"
                />
                
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

              {/* Recent Foods */}
              {!searchQuery && recentFoods?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Recent Foods</h3>
                  <div className="space-y-2">
                    {recentFoods?.map((food) => (
                      <div
                        key={food?.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedFood(food)}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <Icon name="Target" size={20} color="currentColor" className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{food?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {food?.calories} cal • {food?.servingSize}
                          </p>
                        </div>
                        <Icon name="Plus" size={20} color="currentColor" className="text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Search Results</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : searchResults?.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults?.map((food) => (
                        <div
                          key={food?.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedFood?.id === food?.id
                              ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedFood(food)}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <Icon name="Target" size={20} color="currentColor" className="text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{food?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {food?.calories} cal • P: {food?.protein}g • C: {food?.carbs}g • F: {food?.fat}g
                            </p>
                          </div>
                          {selectedFood?.id === food?.id && (
                            <Icon name="Check" size={20} color="currentColor" className="text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Search" size={48} color="currentColor" className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-4">No foods found for "{searchQuery}"</p>
                      <Button onClick={() => setShowCustomForm(true)} variant="outline">
                        Add "{searchQuery}" as custom food
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Food Details */}
              {selectedFood && (
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">Selected Food</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Icon name="Target" size={24} color="currentColor" className="text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{selectedFood?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedFood?.servingSize}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{selectedFood?.calories}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{selectedFood?.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{selectedFood?.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{selectedFood?.fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>

                  <Input
                    label="Portion Size"
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e?.target?.value)}
                    placeholder="e.g., 1 serving, 100g, 1 cup"
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