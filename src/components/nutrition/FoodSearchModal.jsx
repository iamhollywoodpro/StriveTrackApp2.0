import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { 
  searchFoods, 
  getFoodById, 
  getAddOnById, 
  calculateTotalMacros,
  massiveFoodDatabase,
  addOns,
  foodCategories 
} from '../../data/foodDatabase';

function FoodSearchModal({ isOpen, onClose, onSelectFood, mealType = 'breakfast' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(mealType);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showAddOns, setShowAddOns] = useState(false);

  // Load initial results when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFoods();
    } else {
      // Reset when modal closes
      setSearchQuery('');
      setSelectedFood(null);
      setSelectedAddOns([]);
      setQuantity(1);
      setShowAddOns(false);
    }
  }, [isOpen, selectedCategory]);

  // Load foods based on category and search
  const loadFoods = () => {
    const results = searchFoods(searchQuery, selectedCategory);
    setSearchResults(results);
  };

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadFoods();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategory]);

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSelectedAddOns([]);
    setShowAddOns(food.popular_addons && food.popular_addons.length > 0);
  };

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    const totalMacros = calculateTotalMacros(selectedFood, selectedAddOns);
    
    // Calculate final values based on quantity
    const finalFood = {
      ...selectedFood,
      calories: Math.round(totalMacros.calories * quantity),
      protein: Math.round(totalMacros.protein * quantity * 10) / 10,
      carbs: Math.round(totalMacros.carbs * quantity * 10) / 10,
      fat: Math.round(totalMacros.fat * quantity * 10) / 10,
      fiber: Math.round(totalMacros.fiber * quantity * 10) / 10,
      quantity,
      selectedAddOns: selectedAddOns.map(id => getAddOnById(id)).filter(Boolean),
      totalMacros
    };

    onSelectFood(finalFood);
    onClose();
  };

  const getMacroDisplay = () => {
    if (!selectedFood) return null;
    const macros = calculateTotalMacros(selectedFood, selectedAddOns);
    return {
      calories: Math.round(macros.calories * quantity),
      protein: Math.round(macros.protein * quantity * 10) / 10,
      carbs: Math.round(macros.carbs * quantity * 10) / 10,
      fat: Math.round(macros.fat * quantity * 10) / 10,
      fiber: Math.round(macros.fiber * quantity * 10) / 10
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Food to Meal"
      size="xlarge"
    >
      <div className="flex h-96">
        {/* Left Side - Search & Results */}
        <div className="w-1/2 border-r border-slate-200 pr-4">
          {/* Search & Category Filter */}
          <div className="mb-4">
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for foods..."
                className="input flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-32"
              >
                <option value="">All</option>
                {Object.entries(foodCategories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Results */}
          <div className="h-80 overflow-y-auto space-y-2">
            {searchResults.map(food => (
              <div
                key={food.id}
                onClick={() => handleFoodSelect(food)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedFood?.id === food.id 
                    ? 'bg-primary-50 border-2 border-primary-200' 
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=150&h=150&fit=crop';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">{food.name}</h4>
                  <p className="text-sm text-slate-600 truncate">{food.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-orange-600 font-medium">
                      {food.calories} cal
                    </span>
                    <span className="text-xs text-red-600">
                      {food.protein}g protein
                    </span>
                    <span className="text-xs text-slate-500">
                      {food.serving_size}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {food.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-200 text-xs text-slate-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🔍</div>
                <h3 className="font-medium text-slate-900 mb-1">No foods found</h3>
                <p className="text-sm text-slate-600">Try a different search term or category</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Selected Food Details */}
        <div className="w-1/2 pl-4">
          {selectedFood ? (
            <div>
              {/* Food Details */}
              <div className="mb-4">
                <img
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop';
                  }}
                />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {selectedFood.name}
                </h3>
                <p className="text-sm text-slate-600 mb-2">{selectedFood.description}</p>
                <p className="text-xs text-slate-500">Serving size: {selectedFood.serving_size}</p>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                    step="0.5"
                    min="0.5"
                    className="w-20 input text-center"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 0.5)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm text-slate-600">servings</span>
                </div>
              </div>

              {/* Add-ons */}
              {selectedFood.popular_addons && selectedFood.popular_addons.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Popular Add-ons
                    </label>
                    <button
                      onClick={() => setShowAddOns(!showAddOns)}
                      className="text-xs text-primary-500 hover:text-primary-600"
                    >
                      {showAddOns ? 'Hide' : 'Show'} Add-ons
                    </button>
                  </div>
                  
                  {showAddOns && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFood.popular_addons.map(addOnId => {
                        const addOn = getAddOnById(addOnId);
                        if (!addOn) return null;
                        
                        const isSelected = selectedAddOns.includes(addOnId);
                        
                        return (
                          <div
                            key={addOnId}
                            onClick={() => toggleAddOn(addOnId)}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <img
                              src={addOn.image}
                              alt={addOn.name}
                              className="w-8 h-8 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=50&h=50&fit=crop';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{addOn.name}</p>
                              <p className="text-xs text-slate-500">
                                +{addOn.calories} cal • {addOn.serving_size}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-green-600 text-sm">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Nutrition Summary */}
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Total Nutrition ({quantity} serving{quantity !== 1 ? 's' : ''})
                </h4>
                {getMacroDisplay() && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span className="font-medium text-orange-600">
                        {getMacroDisplay().calories}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium text-red-600">
                        {getMacroDisplay().protein}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span className="font-medium text-green-600">
                        {getMacroDisplay().carbs}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span className="font-medium text-blue-600">
                        {getMacroDisplay().fat}g
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-4xl mb-2">🍽️</div>
                <h3 className="font-medium text-slate-900 mb-1">Select a food item</h3>
                <p className="text-sm text-slate-600">Choose from the list to see details and add-ons</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              // TODO: Open custom food entry modal
              console.log('Open custom food entry');
            }}
            className="btn btn-secondary text-sm"
          >
            + Add Custom Food
          </button>
          
          <button
            onClick={handleAddFood}
            disabled={!selectedFood}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to {foodCategories[mealType] || 'Meal'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default FoodSearchModal;