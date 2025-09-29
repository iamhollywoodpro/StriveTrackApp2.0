// Food Add-ons Database
// This system allows users to customize their food with common add-ons for accurate macro tracking

export const FOOD_ADDONS = {
  // === BURGER & SANDWICH ADD-ONS ===
  burger: [
    { 
      id: 'cheese_american', 
      name: 'American Cheese Slice', 
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200',
      macros: { calories: 104, protein: 5.4, carbs: 2.3, fat: 8.7, fiber: 0, sugar: 2.1 },
      servingSize: '1 slice (21g)',
      category: 'cheese'
    },
    { 
      id: 'cheese_cheddar', 
      name: 'Cheddar Cheese Slice', 
      image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=200',
      macros: { calories: 113, protein: 7.0, carbs: 1.0, fat: 9.3, fiber: 0, sugar: 0.5 },
      servingSize: '1 slice (28g)',
      category: 'cheese'
    },
    { 
      id: 'lettuce_iceberg', 
      name: 'Iceberg Lettuce', 
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
      macros: { calories: 2, protein: 0.1, carbs: 0.4, fat: 0, fiber: 0.2, sugar: 0.3 },
      servingSize: '1 leaf (8g)',
      category: 'vegetables'
    },
    { 
      id: 'tomato_slice', 
      name: 'Tomato Slice', 
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      macros: { calories: 3, protein: 0.2, carbs: 0.7, fat: 0, fiber: 0.2, sugar: 0.5 },
      servingSize: '1 slice (15g)',
      category: 'vegetables'
    },
    { 
      id: 'onion_red', 
      name: 'Red Onion Slice', 
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200',
      macros: { calories: 4, protein: 0.1, carbs: 0.9, fat: 0, fiber: 0.2, sugar: 0.4 },
      servingSize: '1 slice (10g)',
      category: 'vegetables'
    },
    { 
      id: 'pickle_dill', 
      name: 'Dill Pickle Slices', 
      image: 'https://images.unsplash.com/photo-1628773822503-930a7eacc9db?w=200',
      macros: { calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0.1, sugar: 0.1 },
      servingSize: '3 slices (9g)',
      category: 'vegetables'
    },
    { 
      id: 'bacon_strips', 
      name: 'Crispy Bacon (2 strips)', 
      image: 'https://images.unsplash.com/photo-1528607929212-2636ec44b19d?w=200',
      macros: { calories: 86, protein: 5.9, carbs: 0.1, fat: 6.8, fiber: 0, sugar: 0 },
      servingSize: '2 strips (16g)',
      category: 'meat'
    },
    { 
      id: 'avocado_slice', 
      name: 'Avocado Slices', 
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200',
      macros: { calories: 48, protein: 0.6, carbs: 2.5, fat: 4.4, fiber: 2.0, sugar: 0.2 },
      servingSize: '3 slices (30g)',
      category: 'vegetables'
    },
    { 
      id: 'mushroom_grilled', 
      name: 'Grilled Mushrooms', 
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200',
      macros: { calories: 7, protein: 1.0, carbs: 1.0, fat: 0.1, fiber: 0.4, sugar: 0.6 },
      servingSize: '2 slices (20g)',
      category: 'vegetables'
    }
  ],

  // === CONDIMENTS & SAUCES ===
  condiments: [
    { 
      id: 'ketchup', 
      name: 'Ketchup', 
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
      macros: { calories: 19, protein: 0.2, carbs: 4.9, fat: 0.1, fiber: 0.1, sugar: 4.1 },
      servingSize: '1 tbsp (17g)',
      category: 'sauce'
    },
    { 
      id: 'mustard_yellow', 
      name: 'Yellow Mustard', 
      image: 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=200',
      macros: { calories: 3, protein: 0.2, carbs: 0.3, fat: 0.2, fiber: 0.2, sugar: 0.1 },
      servingSize: '1 tsp (5g)',
      category: 'sauce'
    },
    { 
      id: 'mayo_regular', 
      name: 'Mayonnaise', 
      image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=200',
      macros: { calories: 94, protein: 0.1, carbs: 0.1, fat: 10.3, fiber: 0, sugar: 0.1 },
      servingSize: '1 tbsp (13g)',
      category: 'sauce'
    },
    { 
      id: 'ranch_dressing', 
      name: 'Ranch Dressing', 
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200',
      macros: { calories: 73, protein: 0.4, carbs: 1.4, fat: 7.7, fiber: 0, sugar: 1.2 },
      servingSize: '1 tbsp (15g)',
      category: 'sauce'
    },
    { 
      id: 'bbq_sauce', 
      name: 'BBQ Sauce', 
      image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=200',
      macros: { calories: 29, protein: 0.3, carbs: 7.0, fat: 0.1, fiber: 0.1, sugar: 6.4 },
      servingSize: '1 tbsp (18g)',
      category: 'sauce'
    },
    { 
      id: 'hot_sauce', 
      name: 'Hot Sauce', 
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5ccec?w=200',
      macros: { calories: 1, protein: 0, carbs: 0.1, fat: 0, fiber: 0, sugar: 0 },
      servingSize: '1 tsp (5g)',
      category: 'sauce'
    }
  ],

  // === PIZZA ADD-ONS ===
  pizza: [
    { 
      id: 'pepperoni_slices', 
      name: 'Extra Pepperoni', 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
      macros: { calories: 137, protein: 5.8, carbs: 0.4, fat: 12.3, fiber: 0, sugar: 0.2 },
      servingSize: '10 slices (28g)',
      category: 'meat'
    },
    { 
      id: 'mozzarella_extra', 
      name: 'Extra Mozzarella', 
      image: 'https://images.unsplash.com/photo-1571197119282-7c4e79ef8a8d?w=200',
      macros: { calories: 85, protein: 6.3, carbs: 0.6, fat: 6.3, fiber: 0, sugar: 0.4 },
      servingSize: '1 oz (28g)',
      category: 'cheese'
    },
    { 
      id: 'bell_peppers', 
      name: 'Bell Peppers', 
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200',
      macros: { calories: 6, protein: 0.2, carbs: 1.4, fat: 0.1, fiber: 0.5, sugar: 1.0 },
      servingSize: '1/4 cup (30g)',
      category: 'vegetables'
    },
    { 
      id: 'mushrooms_pizza', 
      name: 'Mushrooms', 
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200',
      macros: { calories: 7, protein: 1.0, carbs: 1.0, fat: 0.1, fiber: 0.4, sugar: 0.6 },
      servingSize: '1/4 cup (20g)',
      category: 'vegetables'
    },
    { 
      id: 'olives_black', 
      name: 'Black Olives', 
      image: 'https://images.unsplash.com/photo-1611270629569-8b357016bb34?w=200',
      macros: { calories: 25, protein: 0.2, carbs: 1.3, fat: 2.3, fiber: 0.5, sugar: 0 },
      servingSize: '5 olives (15g)',
      category: 'vegetables'
    }
  ],

  // === SALAD ADD-ONS ===
  salad: [
    { 
      id: 'croutons_seasoned', 
      name: 'Seasoned Croutons', 
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200',
      macros: { calories: 31, protein: 0.9, carbs: 5.5, fat: 0.5, fiber: 0.4, sugar: 0.6 },
      servingSize: '2 tbsp (7g)',
      category: 'bread'
    },
    { 
      id: 'parmesan_grated', 
      name: 'Grated Parmesan', 
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200',
      macros: { calories: 22, protein: 2.0, carbs: 0.2, fat: 1.5, fiber: 0, sugar: 0.2 },
      servingSize: '1 tbsp (5g)',
      category: 'cheese'
    },
    { 
      id: 'sunflower_seeds', 
      name: 'Sunflower Seeds', 
      image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=200',
      macros: { calories: 47, protein: 1.6, carbs: 1.9, fat: 4.1, fiber: 0.7, sugar: 0.2 },
      servingSize: '1 tbsp (8g)',
      category: 'nuts'
    },
    { 
      id: 'cherry_tomatoes', 
      name: 'Cherry Tomatoes', 
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      macros: { calories: 9, protein: 0.4, carbs: 1.9, fat: 0.1, fiber: 0.6, sugar: 1.3 },
      servingSize: '5 tomatoes (50g)',
      category: 'vegetables'
    },
    { 
      id: 'cucumber_diced', 
      name: 'Diced Cucumber', 
      image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200',
      macros: { calories: 4, protein: 0.2, carbs: 1.0, fat: 0, fiber: 0.3, sugar: 0.5 },
      servingSize: '1/4 cup (30g)',
      category: 'vegetables'
    }
  ],

  // === BREAKFAST ADD-ONS ===
  breakfast: [
    { 
      id: 'maple_syrup', 
      name: 'Maple Syrup', 
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
      macros: { calories: 52, protein: 0, carbs: 13.4, fat: 0, fiber: 0, sugar: 12.1 },
      servingSize: '1 tbsp (20g)',
      category: 'sweetener'
    },
    { 
      id: 'butter_pat', 
      name: 'Butter Pat', 
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200',
      macros: { calories: 36, protein: 0, carbs: 0, fat: 4.1, fiber: 0, sugar: 0 },
      servingSize: '1 pat (5g)',
      category: 'dairy'
    },
    { 
      id: 'strawberries_fresh', 
      name: 'Fresh Strawberries', 
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200',
      macros: { calories: 16, protein: 0.3, carbs: 3.9, fat: 0.2, fiber: 1.0, sugar: 2.9 },
      servingSize: '5 berries (50g)',
      category: 'fruit'
    },
    { 
      id: 'blueberries_fresh', 
      name: 'Fresh Blueberries', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      macros: { calories: 29, protein: 0.4, carbs: 7.4, fat: 0.2, fiber: 1.2, sugar: 5.0 },
      servingSize: '1/4 cup (50g)',
      category: 'fruit'
    },
    { 
      id: 'honey_drizzle', 
      name: 'Honey Drizzle', 
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200',
      macros: { calories: 21, protein: 0, carbs: 5.7, fat: 0, fiber: 0, sugar: 5.7 },
      servingSize: '1 tsp (7g)',
      category: 'sweetener'
    },
    { 
      id: 'banana_slices', 
      name: 'Banana Slices', 
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200',
      macros: { calories: 27, protein: 0.3, carbs: 6.8, fat: 0.1, fiber: 0.8, sugar: 3.7 },
      servingSize: '1/4 medium (30g)',
      category: 'fruit'
    },
    { 
      id: 'whipped_cream', 
      name: 'Whipped Cream', 
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200',
      macros: { calories: 52, protein: 0.3, carbs: 1.7, fat: 5.5, fiber: 0, sugar: 1.7 },
      servingSize: '2 tbsp (15g)',
      category: 'dairy'
    }
  ]
};

// Food-specific add-on mappings
export const FOOD_ADDON_MAPPING = {
  // Burgers & Sandwiches
  'hamburger_beef': ['burger', 'condiments'],
  'cheeseburger': ['burger', 'condiments'],
  'chicken_burger': ['burger', 'condiments'],
  'turkey_sandwich': ['burger', 'condiments'],
  'blt_sandwich': ['burger', 'condiments'],
  'chicken_wrap': ['burger', 'condiments'],
  
  // Pizza
  'pizza_margherita': ['pizza', 'condiments'],
  'pizza_pepperoni': ['pizza', 'condiments'],
  
  // Salads
  'caesar_salad': ['salad', 'condiments'],
  'greek_salad': ['salad', 'condiments'],
  'chicken_salad': ['salad', 'condiments'],
  
  // Breakfast Items
  'pancakes_buttermilk': ['breakfast'],
  'waffles_belgian': ['breakfast'],
  'french_toast': ['breakfast'],
  'oatmeal_plain': ['breakfast'],
  'greek_yogurt': ['breakfast'],
  'eggs_scrambled': ['breakfast', 'condiments'],
  'omelet_cheese': ['breakfast', 'condiments'],
  'avocado_toast': ['breakfast', 'condiments'],
  
  // Main Proteins (commonly customized)
  'grilled_chicken_breast': ['condiments'],
  'salmon_grilled': ['condiments'],
  'beef_steak': ['condiments'],
  'pork_chops': ['condiments'],
  
  // Pasta & Rice
  'spaghetti_bolognese': ['condiments'],
  'chicken_alfredo': ['condiments'],
  'fried_rice': ['condiments'],
  
  // International
  'tacos_beef': ['burger', 'condiments'],
  'sushi_roll': ['condiments'],
  'curry_chicken': ['condiments'],
  
  // Soups (can add crackers, cheese, etc)
  'tomato_soup': ['condiments'],
  'chicken_noodle_soup': ['condiments']
};

// Get add-ons for a specific food
export const getAddonsForFood = (foodId) => {
  const categories = FOOD_ADDON_MAPPING[foodId] || [];
  const addons = [];
  
  categories.forEach(category => {
    if (FOOD_ADDONS[category]) {
      addons.push(...FOOD_ADDONS[category]);
    }
  });
  
  return addons;
};

// Calculate total macros including add-ons
export const calculateTotalMacros = (baseFood, selectedAddons = []) => {
  let totalMacros = { ...baseFood.macros };
  
  selectedAddons.forEach(addon => {
    totalMacros.calories += addon.macros.calories;
    totalMacros.protein += addon.macros.protein;
    totalMacros.carbs += addon.macros.carbs;
    totalMacros.fat += addon.macros.fat;
    totalMacros.fiber += addon.macros.fiber;
    totalMacros.sugar += addon.macros.sugar;
  });
  
  // Round to 1 decimal place
  Object.keys(totalMacros).forEach(key => {
    totalMacros[key] = Math.round(totalMacros[key] * 10) / 10;
  });
  
  return totalMacros;
};

export default FOOD_ADDONS;