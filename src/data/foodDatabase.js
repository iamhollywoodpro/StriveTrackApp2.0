// Massive food database with images and pre-calculated macros
// Categories: Breakfast, Lunch, Dinner, Snacks with add-ons

export const foodCategories = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  snacks: 'Snacks'
};

export const addOns = {
  // Breakfast add-ons
  butter: {
    id: 'addon_butter',
    name: 'Butter',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=150&fit=crop',
    serving_size: '1 tbsp (14g)',
    calories: 102,
    protein: 0.1,
    carbs: 0.01,
    fat: 11.5,
    fiber: 0,
    category: 'spread'
  },
  maple_syrup: {
    id: 'addon_maple_syrup',
    name: 'Maple Syrup',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=200&h=150&fit=crop',
    serving_size: '2 tbsp (40g)',
    calories: 104,
    protein: 0,
    carbs: 26.8,
    fat: 0.1,
    fiber: 0,
    category: 'syrup'
  },
  honey: {
    id: 'addon_honey',
    name: 'Honey',
    image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=200&h=150&fit=crop',
    serving_size: '1 tbsp (21g)',
    calories: 64,
    protein: 0.1,
    carbs: 17.3,
    fat: 0,
    fiber: 0,
    category: 'sweetener'
  },
  strawberries: {
    id: 'addon_strawberries',
    name: 'Fresh Strawberries',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=150&fit=crop',
    serving_size: '1 cup sliced (166g)',
    calories: 53,
    protein: 1.1,
    carbs: 12.7,
    fat: 0.5,
    fiber: 3.3,
    category: 'fruit'
  },
  blueberries: {
    id: 'addon_blueberries',
    name: 'Blueberries',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&h=150&fit=crop',
    serving_size: '1 cup (148g)',
    calories: 84,
    protein: 1.1,
    carbs: 21.5,
    fat: 0.5,
    fiber: 3.6,
    category: 'fruit'
  },
  bacon: {
    id: 'addon_bacon',
    name: 'Bacon',
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44b319?w=200&h=150&fit=crop',
    serving_size: '2 slices (16g)',
    calories: 86,
    protein: 5.7,
    carbs: 0.2,
    fat: 6.8,
    fiber: 0,
    category: 'meat'
  },
  cheese: {
    id: 'addon_cheese',
    name: 'Cheddar Cheese',
    image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=200&h=150&fit=crop',
    serving_size: '1 slice (28g)',
    calories: 113,
    protein: 7,
    carbs: 0.9,
    fat: 9.3,
    fiber: 0,
    category: 'dairy'
  },
  avocado: {
    id: 'addon_avocado',
    name: 'Avocado',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=150&fit=crop',
    serving_size: '1/2 medium (100g)',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    category: 'fruit'
  }
};

export const massiveFoodDatabase = {
  // BREAKFAST ITEMS
  breakfast: [
    {
      id: 'breakfast_pancakes',
      name: 'Buttermilk Pancakes',
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&h=200&fit=crop',
      serving_size: '3 medium pancakes (116g)',
      calories: 250,
      protein: 6,
      carbs: 48,
      fat: 4.5,
      fiber: 2,
      category: 'breakfast',
      description: 'Fluffy buttermilk pancakes',
      popular_addons: ['butter', 'maple_syrup', 'strawberries', 'blueberries'],
      tags: ['sweet', 'comfort', 'weekend']
    },
    {
      id: 'breakfast_oatmeal',
      name: 'Steel Cut Oatmeal',
      image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=200&fit=crop',
      serving_size: '1 cup cooked (234g)',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      fiber: 4,
      category: 'breakfast',
      description: 'Hearty steel cut oats',
      popular_addons: ['honey', 'blueberries', 'strawberries'],
      tags: ['healthy', 'fiber', 'filling']
    },
    {
      id: 'breakfast_eggs_benedict',
      name: 'Eggs Benedict',
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=300&h=200&fit=crop',
      serving_size: '2 eggs with sauce (150g)',
      calories: 440,
      protein: 20,
      carbs: 30,
      fat: 28,
      fiber: 2,
      category: 'breakfast',
      description: 'Poached eggs on English muffin with hollandaise',
      popular_addons: ['bacon', 'avocado'],
      tags: ['gourmet', 'protein', 'indulgent']
    },
    {
      id: 'breakfast_french_toast',
      name: 'French Toast',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop',
      serving_size: '2 thick slices (110g)',
      calories: 356,
      protein: 14,
      carbs: 36,
      fat: 18,
      fiber: 1,
      category: 'breakfast',
      description: 'Classic cinnamon French toast',
      popular_addons: ['butter', 'maple_syrup', 'strawberries'],
      tags: ['sweet', 'weekend', 'comfort']
    },
    {
      id: 'breakfast_smoothie_bowl',
      name: 'Acai Smoothie Bowl',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300&h=200&fit=crop',
      serving_size: '1 bowl (250g)',
      calories: 215,
      protein: 4,
      carbs: 45,
      fat: 6,
      fiber: 8,
      category: 'breakfast',
      description: 'Acai smoothie bowl with toppings',
      popular_addons: ['blueberries', 'strawberries', 'honey'],
      tags: ['healthy', 'antioxidants', 'fresh']
    },
    {
      id: 'breakfast_bagel_cream_cheese',
      name: 'Everything Bagel with Cream Cheese',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=200&fit=crop',
      serving_size: '1 bagel with 2 tbsp cream cheese (130g)',
      calories: 360,
      protein: 12,
      carbs: 56,
      fat: 12,
      fiber: 3,
      category: 'breakfast',
      description: 'Fresh everything bagel with cream cheese',
      popular_addons: ['avocado', 'bacon'],
      tags: ['filling', 'savory', 'classic']
    }
  ],

  // LUNCH ITEMS  
  lunch: [
    {
      id: 'lunch_caesar_salad',
      name: 'Grilled Chicken Caesar Salad',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
      serving_size: '1 large salad (320g)',
      calories: 380,
      protein: 35,
      carbs: 12,
      fat: 23,
      fiber: 4,
      category: 'lunch',
      description: 'Romaine lettuce, grilled chicken, parmesan, croutons',
      popular_addons: ['avocado', 'bacon'],
      tags: ['protein', 'salad', 'classic']
    },
    {
      id: 'lunch_club_sandwich',
      name: 'Club Sandwich',
      image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop',
      serving_size: '1 sandwich (280g)',
      calories: 590,
      protein: 31,
      carbs: 42,
      fat: 32,
      fiber: 4,
      category: 'lunch',
      description: 'Turkey, bacon, lettuce, tomato on toasted bread',
      popular_addons: ['cheese', 'avocado'],
      tags: ['sandwich', 'protein', 'comfort']
    },
    {
      id: 'lunch_buddha_bowl',
      name: 'Buddha Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      serving_size: '1 large bowl (400g)',
      calories: 420,
      protein: 18,
      carbs: 58,
      fat: 15,
      fiber: 12,
      category: 'lunch',
      description: 'Quinoa, roasted vegetables, chickpeas, tahini dressing',
      popular_addons: ['avocado', 'cheese'],
      tags: ['healthy', 'vegan', 'bowl']
    },
    {
      id: 'lunch_chicken_wrap',
      name: 'Buffalo Chicken Wrap',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      serving_size: '1 large wrap (250g)',
      calories: 450,
      protein: 28,
      carbs: 35,
      fat: 22,
      fiber: 3,
      category: 'lunch',
      description: 'Spicy buffalo chicken with lettuce and ranch in tortilla',
      popular_addons: ['cheese', 'avocado'],
      tags: ['wrap', 'spicy', 'protein']
    },
    {
      id: 'lunch_poke_bowl',
      name: 'Ahi Tuna Poke Bowl',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
      serving_size: '1 bowl (350g)',
      calories: 380,
      protein: 32,
      carbs: 45,
      fat: 8,
      fiber: 5,
      category: 'lunch',
      description: 'Fresh ahi tuna over rice with vegetables',
      popular_addons: ['avocado'],
      tags: ['fresh', 'protein', 'healthy']
    }
  ],

  // DINNER ITEMS
  dinner: [
    {
      id: 'dinner_grilled_salmon',
      name: 'Grilled Atlantic Salmon',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
      serving_size: '6 oz fillet with sides (250g)',
      calories: 520,
      protein: 45,
      carbs: 25,
      fat: 26,
      fiber: 4,
      category: 'dinner',
      description: 'Grilled salmon with asparagus and quinoa',
      popular_addons: ['avocado', 'butter'],
      tags: ['protein', 'omega3', 'healthy']
    },
    {
      id: 'dinner_ribeye_steak',
      name: 'Ribeye Steak',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
      serving_size: '8 oz steak with sides (300g)',
      calories: 680,
      protein: 52,
      carbs: 15,
      fat: 47,
      fiber: 2,
      category: 'dinner',
      description: 'Grilled ribeye with roasted vegetables',
      popular_addons: ['butter'],
      tags: ['protein', 'premium', 'filling']
    },
    {
      id: 'dinner_chicken_parmesan',
      name: 'Chicken Parmesan',
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
      serving_size: '1 portion with pasta (400g)',
      calories: 620,
      protein: 45,
      carbs: 48,
      fat: 28,
      fiber: 4,
      category: 'dinner',
      description: 'Breaded chicken breast with marinara and mozzarella',
      popular_addons: ['cheese'],
      tags: ['comfort', 'italian', 'protein']
    },
    {
      id: 'dinner_pad_thai',
      name: 'Chicken Pad Thai',
      image: 'https://images.unsplash.com/photo-1559314809-0f31657dc93a?w=300&h=200&fit=crop',
      serving_size: '1 large plate (350g)',
      calories: 540,
      protein: 28,
      carbs: 65,
      fat: 18,
      fiber: 3,
      category: 'dinner',
      description: 'Stir-fried rice noodles with chicken, peanuts, bean sprouts',
      popular_addons: [],
      tags: ['asian', 'noodles', 'flavorful']
    },
    {
      id: 'dinner_margherita_pizza',
      name: 'Margherita Pizza',
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&h=200&fit=crop',
      serving_size: '2 slices (160g)',
      calories: 480,
      protein: 22,
      carbs: 58,
      fat: 18,
      fiber: 4,
      category: 'dinner',
      description: 'Fresh mozzarella, basil, tomato sauce on thin crust',
      popular_addons: ['cheese'],
      tags: ['italian', 'comfort', 'vegetarian']
    }
  ],

  // SNACK ITEMS
  snacks: [
    {
      id: 'snack_greek_yogurt',
      name: 'Greek Yogurt with Berries',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop',
      serving_size: '1 cup yogurt with 1/2 cup berries (200g)',
      calories: 180,
      protein: 20,
      carbs: 18,
      fat: 2,
      fiber: 3,
      category: 'snacks',
      description: 'Plain Greek yogurt with mixed berries',
      popular_addons: ['honey', 'blueberries', 'strawberries'],
      tags: ['protein', 'healthy', 'probiotic']
    },
    {
      id: 'snack_hummus_veggies',
      name: 'Hummus with Vegetables',
      image: 'https://images.unsplash.com/photo-1571197119282-7c4ae78e2525?w=300&h=200&fit=crop',
      serving_size: '1/4 cup hummus with 1 cup veggies (150g)',
      calories: 150,
      protein: 7,
      carbs: 18,
      fat: 6,
      fiber: 6,
      category: 'snacks',
      description: 'Classic hummus with carrots, celery, bell peppers',
      popular_addons: [],
      tags: ['healthy', 'fiber', 'vegetarian']
    },
    {
      id: 'snack_trail_mix',
      name: 'Mixed Nuts Trail Mix',
      image: 'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=300&h=200&fit=crop',
      serving_size: '1/4 cup (35g)',
      calories: 220,
      protein: 8,
      carbs: 12,
      fat: 18,
      fiber: 3,
      category: 'snacks',
      description: 'Almonds, walnuts, cashews, dried cranberries',
      popular_addons: [],
      tags: ['nuts', 'energy', 'portable']
    },
    {
      id: 'snack_apple_peanut_butter',
      name: 'Apple with Peanut Butter',
      image: 'https://images.unsplash.com/photo-1581761989635-2e349c656002?w=300&h=200&fit=crop',
      serving_size: '1 medium apple with 2 tbsp peanut butter (210g)',
      calories: 280,
      protein: 8,
      carbs: 32,
      fat: 16,
      fiber: 6,
      category: 'snacks',
      description: 'Fresh apple slices with natural peanut butter',
      popular_addons: ['honey'],
      tags: ['fruit', 'protein', 'classic']
    },
    {
      id: 'snack_protein_smoothie',
      name: 'Protein Smoothie',
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop',
      serving_size: '12 oz smoothie (350ml)',
      calories: 240,
      protein: 25,
      carbs: 28,
      fat: 4,
      fiber: 5,
      category: 'snacks',
      description: 'Protein powder, banana, berries, almond milk',
      popular_addons: ['honey', 'blueberries'],
      tags: ['protein', 'post-workout', 'healthy']
    }
  ]
};

// Search function for food items
export const searchFoods = (query, category = null) => {
  const allFoods = category 
    ? massiveFoodDatabase[category] || []
    : Object.values(massiveFoodDatabase).flat();
    
  if (!query) return allFoods;
  
  const searchTerm = query.toLowerCase();
  
  return allFoods.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.description.toLowerCase().includes(searchTerm) ||
    food.tags.some(tag => tag.includes(searchTerm))
  );
};

// Get food by ID
export const getFoodById = (foodId) => {
  const allFoods = Object.values(massiveFoodDatabase).flat();
  return allFoods.find(food => food.id === foodId);
};

// Get add-on by ID
export const getAddOnById = (addOnId) => {
  return addOns[addOnId];
};

// Calculate total macros for food with add-ons
export const calculateTotalMacros = (food, selectedAddOns = []) => {
  let totalCalories = food.calories;
  let totalProtein = food.protein;
  let totalCarbs = food.carbs;
  let totalFat = food.fat;
  let totalFiber = food.fiber;
  
  selectedAddOns.forEach(addOnId => {
    const addOn = getAddOnById(addOnId);
    if (addOn) {
      totalCalories += addOn.calories;
      totalProtein += addOn.protein;
      totalCarbs += addOn.carbs;
      totalFat += addOn.fat;
      totalFiber += addOn.fiber;
    }
  });
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10
  };
};

export default {
  massiveFoodDatabase,
  addOns,
  foodCategories,
  searchFoods,
  getFoodById,
  getAddOnById,
  calculateTotalMacros
};