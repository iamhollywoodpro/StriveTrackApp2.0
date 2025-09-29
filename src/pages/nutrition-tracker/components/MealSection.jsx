import React, { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const MealSection = ({ meal, onAddFood, onAddRecipe, onRemoveFood }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalCalories = meal?.foods?.reduce((sum, food) => sum + food?.calories, 0);
  const totalProtein = meal?.foods?.reduce((sum, food) => sum + food?.protein, 0);
  const totalCarbs = meal?.foods?.reduce((sum, food) => sum + food?.carbs, 0);
  const totalFat = meal?.foods?.reduce((sum, food) => sum + food?.fat, 0);

  // Get appropriate fallback image for food based on category or meal type
  const getFoodFallbackImage = (food) => {
    const fallbackImages = {
      // By food category
      breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
      lunch: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 
      snacks: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
      
      // By meal name
      'Breakfast': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
      'Lunch': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      'Dinner': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
      'Snacks': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
      
      // Default
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
    };

    // Try food category first, then meal name, then default
    return fallbackImages[food?.category] || 
           fallbackImages[meal?.name] || 
           fallbackImages.default;
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return 'Coffee';
      case 'lunch': return 'Utensils';
      case 'dinner': return 'UtensilsCrossed';
      case 'snacks': return 'Cookie';
      default: return 'Utensils';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-elevation-1 overflow-hidden">
      {/* Meal Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getMealIcon(meal?.name)} size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{meal?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {meal?.foods?.length} items • {totalCalories} calories
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onAddRecipe && onAddRecipe(meal?.name);
              }}
              iconName="ChefHat"
              iconSize={16}
              className="hidden sm:flex"
            >
              Recipe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onAddFood(meal?.name);
              }}
              iconName="Plus"
              iconSize={16}
            >
              Add Food
            </Button>
            <Icon 
              name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
              size={20} 
              className="text-muted-foreground" 
            />
          </div>
        </div>
      </div>
      {/* Meal Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {meal?.foods?.length === 0 ? (
            <div className="p-6 text-center">
              <Icon name="Utensils" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No foods logged for {meal?.name?.toLowerCase()}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => onAddFood(meal?.name)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Food
                </Button>
                {onAddRecipe && (
                  <Button
                    variant="outline"
                    onClick={() => onAddRecipe(meal?.name)}
                    iconName="ChefHat"
                    iconPosition="left"
                  >
                    Browse Recipes
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Food Items */}
              <div className="p-4 space-y-3">
                {meal?.foods?.map((food) => (
                  <div key={food?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
                        <Image
                          src={food?.image}
                          alt={food?.name || 'Food item'}
                          className="w-full h-full object-cover"
                          fallback={getFoodFallbackImage(food)}
                        />
                        {food?.addons && food?.addons?.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{food?.addons?.length}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{food?.name}</h4>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-muted-foreground">{food?.portion}</p>
                          {food?.addons && food?.addons?.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              +{food?.addons?.length}
                            </span>
                          )}
                        </div>
                        {food?.addons && food?.addons?.length > 0 && (
                          <p className="text-xs text-orange-600 mt-0.5">
                            + {food?.addons?.map(addon => addon.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{food?.calories} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {food?.protein}g • C: {food?.carbs}g • F: {food?.fat}g
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFood(food?.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Summary */}
              <div className="p-4 bg-muted/20 border-t border-border">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{totalCalories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{totalProtein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{totalCarbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">{totalFat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MealSection;