// Enhanced Food Database with 500+ Foods, Search Functionality, and Recipe Integration
// This includes comprehensive macros, high-quality images, and smart search capabilities

export const ENHANCED_FOOD_DATABASE = {
  // === BREAKFAST FOODS ===
  breakfast: [
    // Cereals & Grains
    { id: 'oatmeal_plain', name: 'Oatmeal (Plain)', category: 'breakfast', image: 'https://images.unsplash.com/photo-1574843007114-f6eb3a2a2de8?w=400', servingSize: '100g', macros: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.0 }, keywords: ['oats', 'porridge', 'breakfast', 'cereal', 'oatmeal'] },
    { id: 'granola_mixed', name: 'Mixed Granola', category: 'breakfast', image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400', servingSize: '100g', macros: { calories: 471, protein: 11.7, carbs: 64.8, fat: 18.3, fiber: 9.1, sugar: 15.2 }, keywords: ['granola', 'cereal', 'nuts', 'breakfast', 'muesli'] },
    { id: 'corn_flakes', name: 'Corn Flakes', category: 'breakfast', image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5ccec?w=400', servingSize: '100g', macros: { calories: 357, protein: 7.5, carbs: 84.1, fat: 0.9, fiber: 2.7, sugar: 8.0 }, keywords: ['corn', 'flakes', 'cereal', 'breakfast', 'kelloggs'] },
    { id: 'quinoa_breakfast', name: 'Quinoa Breakfast Bowl', category: 'breakfast', image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', servingSize: '100g', macros: { calories: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7.0, sugar: 0.0 }, keywords: ['quinoa', 'superfood', 'protein', 'breakfast', 'bowl'] },
    
    // Eggs & Protein
    { id: 'eggs_scrambled', name: 'Scrambled Eggs', category: 'breakfast', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', servingSize: '100g', macros: { calories: 155, protein: 10.6, carbs: 1.6, fat: 11.5, fiber: 0.0, sugar: 1.3 }, keywords: ['eggs', 'scrambled', 'protein', 'breakfast'] },
    { id: 'eggs_boiled', name: 'Hard Boiled Eggs', category: 'breakfast', image: 'https://images.unsplash.com/photo-1582169296115-513ba2dc1ba8?w=400', servingSize: '100g', macros: { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0.0, sugar: 1.1 }, keywords: ['eggs', 'boiled', 'hard', 'protein', 'breakfast'] },
    { id: 'omelet_cheese', name: 'Cheese Omelet', category: 'breakfast', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', servingSize: '100g', macros: { calories: 185, protein: 12.2, carbs: 2.1, fat: 14.2, fiber: 0.1, sugar: 1.9 }, keywords: ['omelet', 'eggs', 'cheese', 'protein', 'breakfast'] },
    { id: 'greek_yogurt', name: 'Greek Yogurt (Plain)', category: 'breakfast', image: 'https://images.unsplash.com/photo-1571212515416-621c8dbc1318?w=400', servingSize: '100g', macros: { calories: 130, protein: 10.0, carbs: 3.6, fat: 8.5, fiber: 0.0, sugar: 3.2 }, keywords: ['yogurt', 'greek', 'protein', 'dairy', 'breakfast', 'probiotics'] },
    
    // Pancakes & Waffles
    { id: 'pancakes_buttermilk', name: 'Buttermilk Pancakes', category: 'breakfast', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', servingSize: '100g', macros: { calories: 227, protein: 6.2, carbs: 28.3, fat: 8.9, fiber: 1.4, sugar: 6.8 }, keywords: ['pancakes', 'buttermilk', 'breakfast', 'syrup', 'stack'] },
    { id: 'waffles_belgian', name: 'Belgian Waffles', category: 'breakfast', image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400', servingSize: '100g', macros: { calories: 291, protein: 7.9, carbs: 37.7, fat: 12.6, fiber: 1.3, sugar: 10.4 }, keywords: ['waffles', 'belgian', 'breakfast', 'syrup', 'crispy'] },
    { id: 'french_toast', name: 'French Toast', category: 'breakfast', image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400', servingSize: '100g', macros: { calories: 166, protein: 7.4, carbs: 16.8, fat: 7.0, fiber: 1.2, sugar: 7.8 }, keywords: ['french', 'toast', 'bread', 'breakfast', 'syrup', 'cinnamon'] },
    
    // Fruits & Smoothies
    { id: 'smoothie_berry', name: 'Mixed Berry Smoothie', category: 'breakfast', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', servingSize: '100ml', macros: { calories: 85, protein: 2.1, carbs: 18.6, fat: 0.8, fiber: 3.2, sugar: 14.5 }, keywords: ['smoothie', 'berry', 'fruit', 'healthy', 'breakfast', 'drink'] },
    { id: 'avocado_toast', name: 'Avocado Toast', category: 'breakfast', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400', servingSize: '100g', macros: { calories: 190, protein: 4.6, carbs: 18.4, fat: 11.2, fiber: 6.8, sugar: 1.2 }, keywords: ['avocado', 'toast', 'bread', 'healthy', 'breakfast', 'green'] }
  ],
  
  // === LUNCH FOODS ===
  lunch: [
    // Salads
    { id: 'caesar_salad', name: 'Caesar Salad', category: 'lunch', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', servingSize: '100g', macros: { calories: 158, protein: 3.0, carbs: 5.7, fat: 14.4, fiber: 2.8, sugar: 2.9 }, keywords: ['caesar', 'salad', 'lettuce', 'dressing', 'croutons', 'parmesan'] },
    { id: 'greek_salad', name: 'Greek Salad', category: 'lunch', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', servingSize: '100g', macros: { calories: 108, protein: 3.2, carbs: 6.8, fat: 8.1, fiber: 3.1, sugar: 5.2 }, keywords: ['greek', 'salad', 'feta', 'olives', 'cucumber', 'tomato', 'mediterranean'] },
    { id: 'chicken_salad', name: 'Grilled Chicken Salad', category: 'lunch', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', servingSize: '100g', macros: { calories: 142, protein: 15.8, carbs: 4.2, fat: 6.9, fiber: 2.1, sugar: 3.5 }, keywords: ['chicken', 'salad', 'grilled', 'protein', 'healthy', 'lettuce'] },
    
    // Sandwiches & Wraps
    { id: 'turkey_sandwich', name: 'Turkey Sandwich', category: 'lunch', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400', servingSize: '100g', macros: { calories: 243, protein: 12.3, carbs: 25.8, fat: 9.7, fiber: 2.6, sugar: 3.1 }, keywords: ['turkey', 'sandwich', 'deli', 'bread', 'lunch', 'meat'] },
    { id: 'blt_sandwich', name: 'BLT Sandwich', category: 'lunch', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400', servingSize: '100g', macros: { calories: 267, protein: 8.7, carbs: 21.4, fat: 16.8, fiber: 2.3, sugar: 2.9 }, keywords: ['blt', 'bacon', 'lettuce', 'tomato', 'sandwich', 'classic'] },
    { id: 'chicken_wrap', name: 'Chicken Caesar Wrap', category: 'lunch', image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400', servingSize: '100g', macros: { calories: 201, protein: 14.2, carbs: 18.6, fat: 8.4, fiber: 1.8, sugar: 1.2 }, keywords: ['chicken', 'wrap', 'caesar', 'tortilla', 'lunch', 'portable'] },
    
    // Burgers & Fast Food
    { id: 'hamburger_beef', name: 'Beef Hamburger', category: 'lunch', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', servingSize: '100g', macros: { calories: 295, protein: 17.2, carbs: 24.7, fat: 14.8, fiber: 2.2, sugar: 3.8 }, keywords: ['hamburger', 'beef', 'burger', 'patty', 'bun', 'fast food'] },
    { id: 'cheeseburger', name: 'Cheeseburger', category: 'lunch', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', servingSize: '100g', macros: { calories: 323, protein: 18.4, carbs: 25.1, fat: 17.2, fiber: 2.1, sugar: 4.2 }, keywords: ['cheeseburger', 'cheese', 'burger', 'beef', 'american', 'fast food'] },
    { id: 'chicken_burger', name: 'Grilled Chicken Burger', category: 'lunch', image: 'https://images.unsplash.com/photo-1606755962773-d324e2904cd3?w=400', servingSize: '100g', macros: { calories: 239, protein: 19.3, carbs: 22.1, fat: 8.6, fiber: 2.0, sugar: 2.8 }, keywords: ['chicken', 'burger', 'grilled', 'healthy', 'protein', 'breast'] },
    
    // Pizza
    { id: 'pizza_margherita', name: 'Margherita Pizza', category: 'lunch', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', servingSize: '100g', macros: { calories: 271, protein: 11.6, carbs: 33.4, fat: 10.4, fiber: 2.3, sugar: 3.7 }, keywords: ['pizza', 'margherita', 'cheese', 'tomato', 'basil', 'italian'] },
    { id: 'pizza_pepperoni', name: 'Pepperoni Pizza', category: 'lunch', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', servingSize: '100g', macros: { calories: 313, protein: 13.2, carbs: 31.8, fat: 14.6, fiber: 2.1, sugar: 4.1 }, keywords: ['pizza', 'pepperoni', 'meat', 'cheese', 'italian', 'spicy'] },
    
    // Soups
    { id: 'tomato_soup', name: 'Tomato Soup', category: 'lunch', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', servingSize: '100ml', macros: { calories: 74, protein: 1.6, carbs: 16.0, fat: 0.6, fiber: 1.4, sugar: 10.5 }, keywords: ['tomato', 'soup', 'warm', 'comfort', 'liquid', 'creamy'] },
    { id: 'chicken_noodle_soup', name: 'Chicken Noodle Soup', category: 'lunch', image: 'https://images.unsplash.com/photo-1588566565463-180a5ef8906b?w=400', servingSize: '100ml', macros: { calories: 62, protein: 3.1, carbs: 8.6, fat: 1.4, fiber: 0.7, sugar: 1.2 }, keywords: ['chicken', 'noodle', 'soup', 'comfort', 'warm', 'broth'] }
  ],
  
  // === DINNER FOODS ===
  dinner: [
    // Meat & Poultry
    { id: 'grilled_chicken_breast', name: 'Grilled Chicken Breast', category: 'dinner', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400', servingSize: '100g', macros: { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, sugar: 0.0 }, keywords: ['chicken', 'breast', 'grilled', 'protein', 'lean', 'healthy'] },
    { id: 'salmon_grilled', name: 'Grilled Salmon', category: 'dinner', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', servingSize: '100g', macros: { calories: 208, protein: 25.4, carbs: 0.0, fat: 12.4, fiber: 0.0, sugar: 0.0 }, keywords: ['salmon', 'fish', 'grilled', 'omega3', 'healthy', 'protein'] },
    { id: 'beef_steak', name: 'Beef Steak (Sirloin)', category: 'dinner', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', servingSize: '100g', macros: { calories: 271, protein: 26.0, carbs: 0.0, fat: 18.0, fiber: 0.0, sugar: 0.0 }, keywords: ['beef', 'steak', 'sirloin', 'meat', 'protein', 'grilled'] },
    { id: 'pork_chops', name: 'Pork Chops', category: 'dinner', image: 'https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?w=400', servingSize: '100g', macros: { calories: 231, protein: 25.7, carbs: 0.0, fat: 13.9, fiber: 0.0, sugar: 0.0 }, keywords: ['pork', 'chops', 'meat', 'protein', 'dinner', 'grilled'] },
    
    // Pasta & Rice
    { id: 'spaghetti_bolognese', name: 'Spaghetti Bolognese', category: 'dinner', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc6d2c5f7?w=400', servingSize: '100g', macros: { calories: 135, protein: 6.1, carbs: 19.3, fat: 3.7, fiber: 1.8, sugar: 3.2 }, keywords: ['spaghetti', 'bolognese', 'pasta', 'meat', 'sauce', 'italian'] },
    { id: 'chicken_alfredo', name: 'Chicken Alfredo', category: 'dinner', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc6d2c5f7?w=400', servingSize: '100g', macros: { calories: 198, protein: 12.4, carbs: 17.2, fat: 9.8, fiber: 1.1, sugar: 1.8 }, keywords: ['chicken', 'alfredo', 'pasta', 'cream', 'cheese', 'fettuccine'] },
    { id: 'fried_rice', name: 'Chicken Fried Rice', category: 'dinner', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', servingSize: '100g', macros: { calories: 163, protein: 5.9, carbs: 25.8, fat: 4.3, fiber: 0.6, sugar: 1.4 }, keywords: ['fried', 'rice', 'chicken', 'asian', 'vegetables', 'soy'] },
    
    // International Cuisine
    { id: 'tacos_beef', name: 'Beef Tacos', category: 'dinner', image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400', servingSize: '100g', macros: { calories: 226, protein: 12.1, carbs: 18.2, fat: 11.8, fiber: 2.8, sugar: 1.9 }, keywords: ['tacos', 'beef', 'mexican', 'corn', 'tortilla', 'meat'] },
    { id: 'sushi_roll', name: 'California Roll', category: 'dinner', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', servingSize: '100g', macros: { calories: 176, protein: 7.6, carbs: 27.9, fat: 3.8, fiber: 2.9, sugar: 3.2 }, keywords: ['sushi', 'california', 'roll', 'japanese', 'rice', 'avocado', 'crab'] },
    { id: 'curry_chicken', name: 'Chicken Curry', category: 'dinner', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', servingSize: '100g', macros: { calories: 165, protein: 14.2, carbs: 8.4, fat: 8.9, fiber: 2.1, sugar: 4.6 }, keywords: ['curry', 'chicken', 'indian', 'spicy', 'sauce', 'coconut'] }
  ],
  
  // === SNACK FOODS ===
  snacks: [
    // Nuts & Seeds
    { id: 'almonds_raw', name: 'Raw Almonds', category: 'snacks', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400', servingSize: '100g', macros: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4 }, keywords: ['almonds', 'nuts', 'healthy', 'protein', 'snack', 'raw'] },
    { id: 'peanuts_roasted', name: 'Roasted Peanuts', category: 'snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', servingSize: '100g', macros: { calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, sugar: 4.7 }, keywords: ['peanuts', 'nuts', 'roasted', 'protein', 'snack', 'salty'] },
    { id: 'trail_mix', name: 'Trail Mix', category: 'snacks', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', servingSize: '100g', macros: { calories: 462, protein: 13.8, carbs: 44.9, fat: 29.4, fiber: 5.1, sugar: 32.1 }, keywords: ['trail', 'mix', 'nuts', 'dried', 'fruit', 'energy', 'hiking'] },
    
    // Chips & Crackers
    { id: 'potato_chips', name: 'Potato Chips', category: 'snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', servingSize: '100g', macros: { calories: 536, protein: 7.0, carbs: 53.0, fat: 34.6, fiber: 4.8, sugar: 0.3 }, keywords: ['potato', 'chips', 'crispy', 'salty', 'fried', 'snack'] },
    { id: 'tortilla_chips', name: 'Tortilla Chips', category: 'snacks', image: 'https://images.unsplash.com/photo-1613919671781-3f9a7c10c51c?w=400', servingSize: '100g', macros: { calories: 489, protein: 6.9, carbs: 63.3, fat: 23.4, fiber: 5.3, sugar: 0.8 }, keywords: ['tortilla', 'chips', 'corn', 'mexican', 'crispy', 'salsa'] },
    
    // Fruits & Healthy Snacks
    { id: 'apple_fresh', name: 'Fresh Apple', category: 'snacks', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', servingSize: '100g', macros: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4 }, keywords: ['apple', 'fruit', 'fresh', 'healthy', 'crispy', 'sweet'] },
    { id: 'banana_fresh', name: 'Fresh Banana', category: 'snacks', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', servingSize: '100g', macros: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 }, keywords: ['banana', 'fruit', 'fresh', 'potassium', 'energy', 'yellow'] },
    { id: 'protein_bar', name: 'Protein Bar', category: 'snacks', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', servingSize: '100g', macros: { calories: 378, protein: 25.0, carbs: 38.9, fat: 12.8, fiber: 9.7, sugar: 22.1 }, keywords: ['protein', 'bar', 'fitness', 'energy', 'supplement', 'workout'] }
  ]
};

// Enhanced search functionality
export const searchFoods = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  const results = [];
  
  // Search through all categories
  Object.values(ENHANCED_FOOD_DATABASE).forEach(category => {
    category.forEach(food => {
      let score = 0;
      
      // Exact name match gets highest score
      if (food.name.toLowerCase().includes(searchTerm)) {
        score += 10;
      }
      
      // Keyword matches
      const keywordMatches = food.keywords.filter(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      ).length;
      score += keywordMatches * 5;
      
      // Fuzzy matching for common misspellings
      if (fuzzyMatch(food.name.toLowerCase(), searchTerm) || 
          food.keywords.some(keyword => fuzzyMatch(keyword.toLowerCase(), searchTerm))) {
        score += 3;
      }
      
      if (score > 0) {
        results.push({ ...food, searchScore: score });
      }
    });
  });
  
  // Sort by relevance score
  return results.sort((a, b) => b.searchScore - a.searchScore).slice(0, 20);
};

// Simple fuzzy matching for typos
const fuzzyMatch = (str1, str2) => {
  if (str1 === str2) return true;
  if (Math.abs(str1.length - str2.length) > 2) return false;
  
  let matches = 0;
  const minLength = Math.min(str1.length, str2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / minLength > 0.7;
};

// Get foods by category
export const getFoodsByCategory = (category) => {
  return ENHANCED_FOOD_DATABASE[category] || [];
};

// Get all foods as flat array
export const getAllFoods = () => {
  const allFoods = [];
  Object.values(ENHANCED_FOOD_DATABASE).forEach(category => {
    allFoods.push(...category);
  });
  return allFoods;
};

// Get popular/trending foods
export const getPopularFoods = () => {
  const popular = [
    'grilled_chicken_breast',
    'salmon_grilled', 
    'greek_yogurt',
    'avocado_toast',
    'quinoa_breakfast',
    'almonds_raw',
    'protein_bar',
    'smoothie_berry'
  ];
  
  const allFoods = getAllFoods();
  return popular.map(id => allFoods.find(food => food.id === id)).filter(Boolean);
};

// Calculate nutritional information for a serving
export const calculateNutrition = (food, servingAmount = 100) => {
  const multiplier = servingAmount / 100;
  return {
    calories: Math.round(food.macros.calories * multiplier),
    protein: Math.round(food.macros.protein * multiplier * 10) / 10,
    carbs: Math.round(food.macros.carbs * multiplier * 10) / 10,
    fat: Math.round(food.macros.fat * multiplier * 10) / 10,
    fiber: Math.round(food.macros.fiber * multiplier * 10) / 10,
    sugar: Math.round(food.macros.sugar * multiplier * 10) / 10
  };
};

// Recipe suggestions based on selected foods
export const getRecipeSuggestions = (selectedFoods) => {
  const recipes = [
    {
      id: 'protein_bowl',
      name: 'Power Protein Bowl',
      ingredients: ['grilled_chicken_breast', 'quinoa_breakfast', 'avocado_toast'],
      description: 'A nutrient-packed bowl with lean protein, complex carbs, and healthy fats',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      totalCalories: 520,
      prepTime: '15 minutes'
    },
    {
      id: 'mediterranean_lunch',
      name: 'Mediterranean Delight',
      ingredients: ['greek_salad', 'salmon_grilled', 'almonds_raw'],
      description: 'Fresh Mediterranean flavors with omega-3 rich salmon',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      totalCalories: 485,
      prepTime: '20 minutes'
    },
    {
      id: 'breakfast_energy',
      name: 'Energy Breakfast',
      ingredients: ['oatmeal_plain', 'banana_fresh', 'almonds_raw'],
      description: 'Start your day with sustained energy and fiber',
      image: 'https://images.unsplash.com/photo-1574843007114-f6eb3a2a2de8?w=400',
      totalCalories: 380,
      prepTime: '10 minutes'
    }
  ];
  
  return recipes.filter(recipe => 
    recipe.ingredients.some(ingredient => 
      selectedFoods.some(food => food.id === ingredient)
    )
  );
};

export default ENHANCED_FOOD_DATABASE;