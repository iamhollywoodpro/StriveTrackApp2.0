import React, { useState, useEffect } from 'react';
import { getFoodById, calculateTotalMacros } from '../../data/foodDatabase';

// Recipe database based on food combinations
const recipeDatabase = [
  {
    id: 'recipe_protein_pancakes',
    name: 'Protein Power Pancakes',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300&h=200&fit=crop',
    description: 'High-protein pancakes perfect for post-workout breakfast',
    cookTime: '15 min',
    difficulty: 'Easy',
    servings: 2,
    requiredIngredients: ['breakfast_pancakes'],
    suggestedAddOns: ['strawberries', 'blueberries', 'honey'],
    instructions: [
      'Mix protein powder into pancake batter for extra nutrition',
      'Cook pancakes on medium heat until golden brown',
      'Top with fresh berries and a drizzle of honey',
      'Serve immediately for best taste and texture'
    ],
    tags: ['protein', 'breakfast', 'post-workout'],
    nutritionBenefits: 'High in protein to support muscle recovery and keep you full longer'
  },
  {
    id: 'recipe_acai_power_bowl',
    name: 'Ultimate Acai Power Bowl',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=200&fit=crop',
    description: 'Antioxidant-packed smoothie bowl with superfood toppings',
    cookTime: '10 min',
    difficulty: 'Easy',
    servings: 1,
    requiredIngredients: ['breakfast_smoothie_bowl'],
    suggestedAddOns: ['blueberries', 'strawberries', 'honey'],
    instructions: [
      'Blend frozen acai with minimal liquid for thick consistency',
      'Pour into bowl and arrange toppings artistically',
      'Add fresh berries, nuts, and seeds for crunch',
      'Drizzle with honey and enjoy immediately'
    ],
    tags: ['antioxidants', 'breakfast', 'healthy'],
    nutritionBenefits: 'Loaded with antioxidants and fiber to boost immunity and digestion'
  },
  {
    id: 'recipe_loaded_caesar',
    name: 'Loaded Caesar Salad',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
    description: 'Restaurant-quality Caesar with premium toppings',
    cookTime: '15 min',
    difficulty: 'Medium',
    servings: 1,
    requiredIngredients: ['lunch_caesar_salad'],
    suggestedAddOns: ['avocado', 'bacon'],
    instructions: [
      'Grill chicken breast and slice into strips',
      'Massage romaine lettuce with Caesar dressing',
      'Add crispy bacon bits and creamy avocado slices',
      'Top with fresh parmesan and crunchy croutons'
    ],
    tags: ['protein', 'lunch', 'satisfying'],
    nutritionBenefits: 'Complete protein with healthy fats from avocado for sustained energy'
  },
  {
    id: 'recipe_ultimate_club',
    name: 'Ultimate Club Sandwich',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop',
    description: 'Triple-decker club with all the fixings',
    cookTime: '10 min',
    difficulty: 'Easy',
    servings: 1,
    requiredIngredients: ['lunch_club_sandwich'],
    suggestedAddOns: ['cheese', 'avocado'],
    instructions: [
      'Toast three slices of bread until golden',
      'Layer turkey, bacon, lettuce, and tomato',
      'Add melted cheese and creamy avocado',
      'Secure with toothpicks and cut diagonally'
    ],
    tags: ['sandwich', 'lunch', 'comfort'],
    nutritionBenefits: 'Balanced macros with protein, healthy fats, and complex carbohydrates'
  },
  {
    id: 'recipe_herb_crusted_salmon',
    name: 'Herb-Crusted Salmon',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
    description: 'Restaurant-style salmon with fresh herb crust',
    cookTime: '25 min',
    difficulty: 'Medium',
    servings: 1,
    requiredIngredients: ['dinner_grilled_salmon'],
    suggestedAddOns: ['avocado', 'butter'],
    instructions: [
      'Create herb crust with parsley, dill, and garlic',
      'Season salmon and press herb mixture on top',
      'Bake at 400°F until flaky and golden',
      'Serve with avocado and lemon butter sauce'
    ],
    tags: ['omega3', 'dinner', 'gourmet'],
    nutritionBenefits: 'Rich in omega-3 fatty acids for heart and brain health'
  },
  {
    id: 'recipe_berry_yogurt_parfait',
    name: 'Triple Berry Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop',
    description: 'Layered parfait with Greek yogurt and fresh berries',
    cookTime: '5 min',
    difficulty: 'Easy',
    servings: 1,
    requiredIngredients: ['snack_greek_yogurt'],
    suggestedAddOns: ['honey', 'blueberries', 'strawberries'],
    instructions: [
      'Layer Greek yogurt with mixed berries',
      'Alternate yogurt and fruit in tall glass',
      'Drizzle honey between layers for sweetness',
      'Top with granola for added crunch'
    ],
    tags: ['protein', 'snack', 'healthy'],
    nutritionBenefits: 'High in protein and probiotics for muscle health and digestion'
  }
];

function RecipeSuggestions({ selectedFoods = [], onSelectRecipe }) {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generateRecipeSuggestions();
  }, [selectedFoods]);

  const generateRecipeSuggestions = () => {
    if (selectedFoods.length === 0) {
      setSuggestedRecipes(recipeDatabase.slice(0, 3));
      return;
    }

    const foodIds = selectedFoods.map(food => food.id || food);
    
    // Find recipes that match selected foods
    const matchingRecipes = recipeDatabase.filter(recipe => {
      return recipe.requiredIngredients.some(ingredient => 
        foodIds.includes(ingredient)
      );
    });

    // Add some popular recipes if we don't have enough matches
    const popularRecipes = recipeDatabase.filter(recipe => 
      recipe.tags.includes('protein') || recipe.tags.includes('healthy')
    );

    const allSuggestions = [...matchingRecipes, ...popularRecipes];
    
    // Remove duplicates and limit results
    const uniqueRecipes = allSuggestions.filter((recipe, index, self) =>
      index === self.findIndex(r => r.id === recipe.id)
    );

    setSuggestedRecipes(uniqueRecipes.slice(0, 6));
  };

  const calculateRecipeNutrition = (recipe) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Calculate base nutrition from required ingredients
    recipe.requiredIngredients.forEach(ingredientId => {
      const food = getFoodById(ingredientId);
      if (food) {
        totalCalories += food.calories;
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFat += food.fat;
      }
    });

    // Add suggested add-ons (estimate 50% will be used)
    recipe.suggestedAddOns.forEach(addOnId => {
      const addOn = getFoodById(addOnId);
      if (addOn) {
        totalCalories += addOn.calories * 0.5;
        totalProtein += addOn.protein * 0.5;
        totalCarbs += addOn.carbs * 0.5;
        totalFat += addOn.fat * 0.5;
      }
    });

    return {
      calories: Math.round(totalCalories / (recipe.servings || 1)),
      protein: Math.round(totalProtein / (recipe.servings || 1)),
      carbs: Math.round(totalCarbs / (recipe.servings || 1)),
      fat: Math.round(totalFat / (recipe.servings || 1))
    };
  };

  const displayedRecipes = showAll ? suggestedRecipes : suggestedRecipes.slice(0, 3);

  if (suggestedRecipes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recipe Suggestions</h3>
          <p className="text-sm text-slate-600">
            {selectedFoods.length > 0 
              ? `Based on your selected foods` 
              : `Popular healthy recipes`
            }
          </p>
        </div>
        {suggestedRecipes.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            {showAll ? 'Show Less' : `Show All (${suggestedRecipes.length})`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedRecipes.map(recipe => {
          const nutrition = calculateRecipeNutrition(recipe);
          
          return (
            <div
              key={recipe.id}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => onSelectRecipe && onSelectRecipe(recipe)}
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop';
                  }}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  {recipe.cookTime}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 text-sm leading-tight">
                    {recipe.name}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    recipe.difficulty === 'Easy' 
                      ? 'bg-green-100 text-green-700'
                      : recipe.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Nutrition Facts */}
                <div className="grid grid-cols-4 gap-1 mb-3 text-center">
                  <div>
                    <p className="text-xs font-medium text-orange-600">{nutrition.calories}</p>
                    <p className="text-xs text-slate-500">cal</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600">{nutrition.protein}g</p>
                    <p className="text-xs text-slate-500">protein</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600">{nutrition.carbs}g</p>
                    <p className="text-xs text-slate-500">carbs</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">{nutrition.fat}g</p>
                    <p className="text-xs text-slate-500">fat</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-xs text-slate-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Benefits */}
                <p className="text-xs text-slate-500 italic mb-3">
                  {recipe.nutritionBenefits}
                </p>

                {/* Servings */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Makes {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                  <span className="text-primary-500 font-medium group-hover:text-primary-600">
                    View Recipe →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFoods.length === 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Add foods to your meals to get personalized recipe suggestions based on your selections!
          </p>
        </div>
      )}
    </div>
  );
}

export default RecipeSuggestions;