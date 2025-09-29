import React, { useState, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { searchRecipes, RECIPE_DATABASE } from '../../../data/foodDatabase';

const RecipeLibrary = ({ isOpen, onClose, onAddRecipe, mealType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, breakfast, lunch, dinner
  const [isLoading, setIsLoading] = useState(false);

  // Search recipes using our database
  useEffect(() => {
    if (searchQuery?.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        const category = activeTab === 'all' ? null : activeTab;
        const results = searchRecipes(searchQuery, category);
        setSearchResults(results);
        setIsLoading(false);
      }, 300);
    } else {
      // Show popular recipes when no search query
      const category = activeTab === 'all' ? null : activeTab;
      const popularRecipes = category ? 
        RECIPE_DATABASE.filter(recipe => recipe.category === category) : 
        RECIPE_DATABASE;
      setSearchResults(popularRecipes);
    }
  }, [searchQuery, activeTab]);

  const handleAddRecipe = () => {
    if (selectedRecipe) {
      // Add recipe as a meal entry with combined macros
      const recipeEntry = {
        id: Date.now(),
        recipeId: selectedRecipe.id,
        name: selectedRecipe.name,
        calories: selectedRecipe.totalMacros.calories,
        protein: selectedRecipe.totalMacros.protein,
        carbs: selectedRecipe.totalMacros.carbs,
        fat: selectedRecipe.totalMacros.fat,
        fiber: selectedRecipe.totalMacros.fiber || 0,
        sugar: selectedRecipe.totalMacros.sugar || 0,
        servingSize: `1 serving (serves ${selectedRecipe.servings})`,
        image: selectedRecipe.image,
        portion: '1 serving',
        category: 'recipe',
        prepTime: selectedRecipe.prepTime,
        difficulty: selectedRecipe.difficulty
      };
      onAddRecipe(mealType, recipeEntry);
      onClose();
      setSelectedRecipe(null);
      setSearchQuery('');
    }
  };

  const resetModal = () => {
    setSearchQuery('');
    setSelectedRecipe(null);
    setActiveTab('all');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Recipe Library
            </h2>
            <Button variant="ghost" size="icon" onClick={() => { onClose(); resetModal(); }}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Recipe List */}
          <div className="w-1/2 border-r border-border">
            <div className="p-6">
              {/* Search Bar */}
              <Input
                type="search"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="mb-4"
              />
              
              {/* Category Tabs */}
              <div className="flex space-x-1 mb-4 bg-muted/30 rounded-lg p-1">
                {[
                  { id: 'all', name: 'All', icon: 'ChefHat' },
                  { id: 'breakfast', name: 'Breakfast', icon: 'Coffee' },
                  { id: 'lunch', name: 'Lunch', icon: 'Salad' },
                  { id: 'dinner', name: 'Dinner', icon: 'UtensilsCrossed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe List */}
            <div className="px-6 pb-6 overflow-y-auto h-[calc(100%-160px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Searching recipes...</span>
                </div>
              ) : searchResults?.length > 0 ? (
                <div className="space-y-3">
                  {searchResults?.map((recipe) => (
                    <div
                      key={recipe?.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipe?.id === recipe?.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {recipe?.image ? (
                            <img 
                              src={recipe.image} 
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="ChefHat" size={24} className="text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1 line-clamp-1">{recipe?.name}</h4>
                          <div className="flex items-center space-x-3 mb-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Icon name="Clock" size={12} />
                              <span>{recipe?.prepTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Icon name="Users" size={12} />
                              <span>{recipe?.servings} serving{recipe?.servings > 1 ? 's' : ''}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(recipe?.difficulty)}`}>
                              {recipe?.difficulty}
                            </span>
                          </div>
                          <div className="flex space-x-3 text-xs">
                            <span className="text-foreground font-medium">{recipe?.totalMacros?.calories} cal</span>
                            <span className="text-green-600">P: {recipe?.totalMacros?.protein}g</span>
                            <span className="text-blue-600">C: {recipe?.totalMacros?.carbs}g</span>
                            <span className="text-orange-600">F: {recipe?.totalMacros?.fat}g</span>
                          </div>
                        </div>
                        {selectedRecipe?.id === recipe?.id && (
                          <Icon name="CheckCircle" size={20} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? `No recipes found for "${searchQuery}"` : 'No recipes available'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Recipe Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedRecipe ? (
              <div className="p-6">
                {/* Recipe Header */}
                <div className="mb-6">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-4">
                    {selectedRecipe?.image ? (
                      <img 
                        src={selectedRecipe.image} 
                        alt={selectedRecipe.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="ChefHat" size={48} className="text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{selectedRecipe?.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={16} />
                      <span>{selectedRecipe?.prepTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={16} />
                      <span>{selectedRecipe?.servings} servings</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedRecipe?.difficulty)}`}>
                      {selectedRecipe?.difficulty}
                    </span>
                  </div>
                </div>

                {/* Nutrition Facts */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 mb-6 border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-3">Nutrition Per Serving</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{selectedRecipe?.totalMacros?.calories}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-600">{selectedRecipe?.totalMacros?.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-blue-600">{selectedRecipe?.totalMacros?.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-orange-600">{selectedRecipe?.totalMacros?.fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Ingredients</h4>
                  <div className="space-y-2">
                    {selectedRecipe?.ingredients?.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-sm text-foreground">{ingredient?.amount} {ingredient?.name}</span>
                        <span className="text-xs text-muted-foreground">{ingredient?.calories} cal</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Instructions</h4>
                  <div className="space-y-3">
                    {selectedRecipe?.instructions?.map((instruction, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-foreground flex-1">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {selectedRecipe?.tags?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe?.tags?.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="ChefHat" size={64} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a recipe to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => { onClose(); resetModal(); }} fullWidth>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecipe}
              disabled={!selectedRecipe}
              fullWidth
              iconName="Plus"
              iconPosition="left"
            >
              Add Recipe to {mealType}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeLibrary;