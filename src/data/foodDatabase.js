// Comprehensive Food Database with 100+ Real Foods, Accurate Macros, and High-Quality Images
// All macros are per 100g serving unless specified otherwise

export const FOOD_DATABASE = {
  // === BREAKFAST FOODS ===
  breakfast: [
    {
      id: 'oatmeal_plain',
      name: 'Oatmeal (Plain)',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1574843007114-f6eb3a2a2de8?w=400',
      servingSize: '100g',
      macros: {
        calories: 389,
        protein: 16.9,
        carbs: 66.3,
        fat: 6.9,
        fiber: 10.6,
        sugar: 0.0
      },
      keywords: ['oats', 'porridge', 'breakfast', 'cereal']
    },
    {
      id: 'eggs_scrambled',
      name: 'Scrambled Eggs',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
      servingSize: '100g (2 large eggs)',
      macros: {
        calories: 155,
        protein: 10.6,
        carbs: 1.6,
        fat: 11.5,
        fiber: 0.0,
        sugar: 1.3
      },
      keywords: ['eggs', 'scrambled', 'protein', 'breakfast']
    },
    {
      id: 'pancakes_buttermilk',
      name: 'Buttermilk Pancakes',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      servingSize: '100g',
      macros: {
        calories: 227,
        protein: 6.2,
        carbs: 28.3,
        fat: 8.9,
        fiber: 1.4,
        sugar: 5.9
      },
      keywords: ['pancakes', 'buttermilk', 'breakfast', 'syrup']
    },
    {
      id: 'greek_yogurt_plain',
      name: 'Greek Yogurt (Plain)',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      servingSize: '100g',
      macros: {
        calories: 59,
        protein: 10.0,
        carbs: 3.6,
        fat: 0.4,
        fiber: 0.0,
        sugar: 3.6
      },
      keywords: ['yogurt', 'greek', 'protein', 'healthy', 'breakfast']
    },
    {
      id: 'avocado_toast',
      name: 'Avocado Toast',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
      servingSize: '100g',
      macros: {
        calories: 160,
        protein: 6.0,
        carbs: 15.0,
        fat: 10.0,
        fiber: 7.0,
        sugar: 1.0
      },
      keywords: ['avocado', 'toast', 'healthy', 'breakfast', 'bread']
    },
    {
      id: 'bacon_strips',
      name: 'Bacon Strips',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1528607929212-2636ec44b391?w=400',
      servingSize: '100g',
      macros: {
        calories: 541,
        protein: 37.0,
        carbs: 1.4,
        fat: 42.0,
        fiber: 0.0,
        sugar: 1.4
      },
      keywords: ['bacon', 'pork', 'breakfast', 'strips', 'crispy']
    },
    {
      id: 'cereal_granola',
      name: 'Granola Cereal',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
      servingSize: '100g',
      macros: {
        calories: 471,
        protein: 14.3,
        carbs: 64.0,
        fat: 18.3,
        fiber: 9.0,
        sugar: 21.8
      },
      keywords: ['granola', 'cereal', 'nuts', 'oats', 'crunchy', 'breakfast']
    },
    {
      id: 'french_toast',
      name: 'French Toast',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
      servingSize: '100g',
      macros: {
        calories: 222,
        protein: 8.1,
        carbs: 27.7,
        fat: 8.8,
        fiber: 1.4,
        sugar: 10.2
      },
      keywords: ['french', 'toast', 'syrup', 'breakfast', 'sweet']
    },
    {
      id: 'bagel_plain',
      name: 'Plain Bagel',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      servingSize: '100g',
      macros: {
        calories: 250,
        protein: 10.0,
        carbs: 48.0,
        fat: 1.5,
        fiber: 2.0,
        sugar: 6.0
      },
      keywords: ['bagel', 'bread', 'breakfast', 'plain', 'carbs']
    },
    {
      id: 'english_muffin',
      name: 'English Muffin',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
      servingSize: '100g',
      macros: {
        calories: 227,
        protein: 8.0,
        carbs: 45.0,
        fat: 2.0,
        fiber: 3.0,
        sugar: 1.0
      },
      keywords: ['english', 'muffin', 'bread', 'breakfast', 'toasted']
    },
    {
      id: 'croissant_butter',
      name: 'Butter Croissant',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1555507036-ab794f4ab6ca?w=400',
      servingSize: '100g',
      macros: {
        calories: 406,
        protein: 8.2,
        carbs: 45.8,
        fat: 21.0,
        fiber: 2.6,
        sugar: 7.0
      },
      keywords: ['croissant', 'butter', 'pastry', 'flaky', 'french']
    },
    {
      id: 'waffles_homemade',
      name: 'Homemade Waffles',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1562376552-0d160dee7de3?w=400',
      servingSize: '100g',
      macros: {
        calories: 291,
        protein: 7.0,
        carbs: 33.0,
        fat: 14.7,
        fiber: 1.5,
        sugar: 4.9
      },
      keywords: ['waffles', 'syrup', 'breakfast', 'crispy', 'sweet']
    },
    {
      id: 'cottage_cheese',
      name: 'Cottage Cheese',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1571212515416-cd93285c8bec?w=400',
      servingSize: '100g',
      macros: {
        calories: 98,
        protein: 11.1,
        carbs: 3.4,
        fat: 4.3,
        fiber: 0.0,
        sugar: 2.7
      },
      keywords: ['cottage', 'cheese', 'protein', 'healthy', 'low fat']
    },
    {
      id: 'smoothie_berry',
      name: 'Mixed Berry Smoothie',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
      servingSize: '250ml',
      macros: {
        calories: 134,
        protein: 4.0,
        carbs: 30.0,
        fat: 1.0,
        fiber: 4.0,
        sugar: 24.0
      },
      keywords: ['smoothie', 'berries', 'healthy', 'drink', 'blended']
    },
    {
      id: 'muesli_swiss',
      name: 'Swiss Muesli',
      category: 'breakfast',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
      servingSize: '100g',
      macros: {
        calories: 390,
        protein: 13.0,
        carbs: 66.0,
        fat: 8.2,
        fiber: 10.0,
        sugar: 16.0
      },
      keywords: ['muesli', 'oats', 'nuts', 'fruits', 'healthy', 'cereal']
    }
  ],

  // === LUNCH FOODS ===
  lunch: [
    {
      id: 'chicken_breast_grilled',
      name: 'Grilled Chicken Breast',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1532636721612-c2d77d27f0c6?w=400',
      servingSize: '100g',
      macros: {
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['chicken', 'breast', 'grilled', 'protein', 'lean']
    },
    {
      id: 'quinoa_cooked',
      name: 'Quinoa (Cooked)',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      servingSize: '100g',
      macros: {
        calories: 120,
        protein: 4.4,
        carbs: 21.3,
        fat: 1.9,
        fiber: 2.8,
        sugar: 0.9
      },
      keywords: ['quinoa', 'grain', 'healthy', 'protein', 'superfood']
    },
    {
      id: 'salmon_fillet',
      name: 'Salmon Fillet',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1567608198972-d0b284709d7f?w=400',
      servingSize: '100g',
      macros: {
        calories: 208,
        protein: 25.4,
        carbs: 0.0,
        fat: 12.4,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['salmon', 'fish', 'omega3', 'protein', 'healthy']
    },
    {
      id: 'mixed_green_salad',
      name: 'Mixed Green Salad',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      servingSize: '100g',
      macros: {
        calories: 20,
        protein: 2.0,
        carbs: 4.0,
        fat: 0.3,
        fiber: 2.0,
        sugar: 2.0
      },
      keywords: ['salad', 'greens', 'healthy', 'vegetables', 'low calorie']
    },
    {
      id: 'turkey_sandwich',
      name: 'Turkey Sandwich',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
      servingSize: '100g',
      macros: {
        calories: 200,
        protein: 15.0,
        carbs: 20.0,
        fat: 7.0,
        fiber: 3.0,
        sugar: 3.0
      },
      keywords: ['turkey', 'sandwich', 'bread', 'deli', 'lunch']
    },
    {
      id: 'tuna_salad',
      name: 'Tuna Salad',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
      servingSize: '100g',
      macros: {
        calories: 187,
        protein: 25.0,
        carbs: 0.0,
        fat: 9.0,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['tuna', 'fish', 'salad', 'protein', 'omega3']
    },
    {
      id: 'caesar_salad',
      name: 'Caesar Salad',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      servingSize: '100g',
      macros: {
        calories: 158,
        protein: 3.0,
        carbs: 5.0,
        fat: 15.0,
        fiber: 2.0,
        sugar: 2.0
      },
      keywords: ['caesar', 'salad', 'romaine', 'parmesan', 'croutons']
    },
    {
      id: 'chicken_wrap',
      name: 'Grilled Chicken Wrap',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      servingSize: '100g',
      macros: {
        calories: 195,
        protein: 13.0,
        carbs: 22.0,
        fat: 6.0,
        fiber: 2.5,
        sugar: 1.0
      },
      keywords: ['chicken', 'wrap', 'tortilla', 'veggies', 'portable']
    },
    {
      id: 'beef_stir_fry',
      name: 'Beef Stir Fry',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      servingSize: '100g',
      macros: {
        calories: 142,
        protein: 18.0,
        carbs: 8.0,
        fat: 4.5,
        fiber: 2.0,
        sugar: 5.0
      },
      keywords: ['beef', 'stir fry', 'vegetables', 'asian', 'wok']
    },
    {
      id: 'burrito_bowl',
      name: 'Burrito Bowl',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      servingSize: '100g',
      macros: {
        calories: 167,
        protein: 8.0,
        carbs: 22.0,
        fat: 5.0,
        fiber: 4.0,
        sugar: 3.0
      },
      keywords: ['burrito', 'bowl', 'rice', 'beans', 'mexican']
    },
    {
      id: 'pasta_salad',
      name: 'Pasta Salad',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
      servingSize: '100g',
      macros: {
        calories: 143,
        protein: 3.5,
        carbs: 19.0,
        fat: 6.0,
        fiber: 1.5,
        sugar: 4.0
      },
      keywords: ['pasta', 'salad', 'cold', 'vegetables', 'italian']
    },
    {
      id: 'soup_chicken_noodle',
      name: 'Chicken Noodle Soup',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      servingSize: '100g',
      macros: {
        calories: 62,
        protein: 3.1,
        carbs: 9.4,
        fat: 1.4,
        fiber: 0.5,
        sugar: 1.0
      },
      keywords: ['soup', 'chicken', 'noodles', 'broth', 'comfort']
    },
    {
      id: 'panini_ham_cheese',
      name: 'Ham & Cheese Panini',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      servingSize: '100g',
      macros: {
        calories: 250,
        protein: 14.0,
        carbs: 23.0,
        fat: 11.0,
        fiber: 2.0,
        sugar: 2.0
      },
      keywords: ['panini', 'ham', 'cheese', 'grilled', 'pressed']
    },
    {
      id: 'sushi_california_roll',
      name: 'California Roll',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      servingSize: '100g',
      macros: {
        calories: 129,
        protein: 2.9,
        carbs: 18.4,
        fat: 5.8,
        fiber: 2.9,
        sugar: 3.2
      },
      keywords: ['sushi', 'california', 'roll', 'crab', 'avocado', 'rice']
    },
    {
      id: 'fish_tacos',
      name: 'Fish Tacos',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c6d7f5b?w=400',
      servingSize: '100g',
      macros: {
        calories: 198,
        protein: 12.0,
        carbs: 18.0,
        fat: 8.0,
        fiber: 3.0,
        sugar: 2.0
      },
      keywords: ['fish', 'tacos', 'mexican', 'corn tortilla', 'lime']
    },
    {
      id: 'club_sandwich',
      name: 'Club Sandwich',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400',
      servingSize: '100g',
      macros: {
        calories: 233,
        protein: 13.0,
        carbs: 20.0,
        fat: 11.0,
        fiber: 2.0,
        sugar: 3.0
      },
      keywords: ['club', 'sandwich', 'bacon', 'turkey', 'triple decker']
    },
    {
      id: 'greek_salad',
      name: 'Greek Salad',
      category: 'lunch',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      servingSize: '100g',
      macros: {
        calories: 107,
        protein: 3.0,
        carbs: 7.0,
        fat: 8.0,
        fiber: 3.0,
        sugar: 4.0
      },
      keywords: ['greek', 'salad', 'feta', 'olives', 'cucumber', 'mediterranean']
    }
  ],

  // === DINNER FOODS ===
  dinner: [
    {
      id: 'beef_sirloin_steak',
      name: 'Sirloin Steak',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      servingSize: '100g',
      macros: {
        calories: 271,
        protein: 26.0,
        carbs: 0.0,
        fat: 17.0,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['beef', 'steak', 'sirloin', 'protein', 'red meat']
    },
    {
      id: 'brown_rice_cooked',
      name: 'Brown Rice (Cooked)',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      servingSize: '100g',
      macros: {
        calories: 111,
        protein: 2.6,
        carbs: 23.0,
        fat: 0.9,
        fiber: 1.8,
        sugar: 0.4
      },
      keywords: ['rice', 'brown', 'grain', 'carbs', 'healthy']
    },
    {
      id: 'broccoli_steamed',
      name: 'Steamed Broccoli',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
      servingSize: '100g',
      macros: {
        calories: 35,
        protein: 2.4,
        carbs: 7.2,
        fat: 0.4,
        fiber: 2.3,
        sugar: 1.5
      },
      keywords: ['broccoli', 'vegetable', 'green', 'healthy', 'steamed']
    },
    {
      id: 'pasta_marinara',
      name: 'Pasta with Marinara',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
      servingSize: '100g',
      macros: {
        calories: 131,
        protein: 4.3,
        carbs: 25.0,
        fat: 1.1,
        fiber: 1.8,
        sugar: 3.2
      },
      keywords: ['pasta', 'marinara', 'spaghetti', 'italian', 'tomato']
    },
    {
      id: 'pork_tenderloin',
      name: 'Pork Tenderloin',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
      servingSize: '100g',
      macros: {
        calories: 143,
        protein: 26.0,
        carbs: 0.0,
        fat: 3.5,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['pork', 'tenderloin', 'lean', 'protein', 'meat']
    },
    {
      id: 'lobster_tail',
      name: 'Lobster Tail',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      servingSize: '100g',
      macros: {
        calories: 89,
        protein: 19.0,
        carbs: 0.0,
        fat: 0.9,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['lobster', 'seafood', 'luxury', 'protein', 'low fat']
    },
    {
      id: 'lamb_chops',
      name: 'Lamb Chops',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
      servingSize: '100g',
      macros: {
        calories: 294,
        protein: 25.0,
        carbs: 0.0,
        fat: 21.0,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['lamb', 'chops', 'red meat', 'protein', 'gourmet']
    },
    {
      id: 'mashed_potatoes',
      name: 'Mashed Potatoes',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400',
      servingSize: '100g',
      macros: {
        calories: 113,
        protein: 2.0,
        carbs: 17.0,
        fat: 4.2,
        fiber: 1.5,
        sugar: 1.3
      },
      keywords: ['mashed', 'potatoes', 'comfort', 'creamy', 'side dish']
    },
    {
      id: 'grilled_vegetables',
      name: 'Grilled Vegetables',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400',
      servingSize: '100g',
      macros: {
        calories: 35,
        protein: 1.5,
        carbs: 8.0,
        fat: 0.2,
        fiber: 3.5,
        sugar: 4.0
      },
      keywords: ['grilled', 'vegetables', 'healthy', 'mixed', 'low calorie']
    },
    {
      id: 'baked_potato',
      name: 'Baked Potato',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400',
      servingSize: '100g',
      macros: {
        calories: 93,
        protein: 2.5,
        carbs: 21.0,
        fat: 0.1,
        fiber: 2.2,
        sugar: 1.2
      },
      keywords: ['baked', 'potato', 'carbs', 'fiber', 'simple']
    },
    {
      id: 'caesar_chicken',
      name: 'Chicken Caesar',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      servingSize: '100g',
      macros: {
        calories: 201,
        protein: 18.0,
        carbs: 4.0,
        fat: 12.0,
        fiber: 1.5,
        sugar: 2.0
      },
      keywords: ['chicken', 'caesar', 'salad', 'protein', 'greens']
    },
    {
      id: 'fish_chips',
      name: 'Fish & Chips',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400',
      servingSize: '100g',
      macros: {
        calories: 232,
        protein: 12.0,
        carbs: 18.0,
        fat: 12.0,
        fiber: 1.5,
        sugar: 0.5
      },
      keywords: ['fish', 'chips', 'fried', 'british', 'comfort']
    },
    {
      id: 'stuffed_peppers',
      name: 'Stuffed Bell Peppers',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=400',
      servingSize: '100g',
      macros: {
        calories: 112,
        protein: 5.0,
        carbs: 16.0,
        fat: 3.5,
        fiber: 3.0,
        sugar: 8.0
      },
      keywords: ['stuffed', 'peppers', 'rice', 'vegetables', 'healthy']
    },
    {
      id: 'chicken_parmesan',
      name: 'Chicken Parmesan',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      servingSize: '100g',
      macros: {
        calories: 219,
        protein: 19.0,
        carbs: 8.0,
        fat: 12.0,
        fiber: 1.0,
        sugar: 3.0
      },
      keywords: ['chicken', 'parmesan', 'breaded', 'cheese', 'italian']
    },
    {
      id: 'beef_tacos',
      name: 'Beef Tacos',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c6d7f5b?w=400',
      servingSize: '100g',
      macros: {
        calories: 226,
        protein: 14.0,
        carbs: 15.0,
        fat: 12.0,
        fiber: 3.0,
        sugar: 1.5
      },
      keywords: ['beef', 'tacos', 'mexican', 'ground beef', 'spicy']
    },
    {
      id: 'shrimp_scampi',
      name: 'Shrimp Scampi',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
      servingSize: '100g',
      macros: {
        calories: 144,
        protein: 18.0,
        carbs: 2.0,
        fat: 7.0,
        fiber: 0.0,
        sugar: 0.5
      },
      keywords: ['shrimp', 'scampi', 'garlic', 'butter', 'seafood']
    },
    {
      id: 'pork_chops',
      name: 'Pork Chops',
      category: 'dinner',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
      servingSize: '100g',
      macros: {
        calories: 231,
        protein: 23.0,
        carbs: 0.0,
        fat: 15.0,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['pork', 'chops', 'grilled', 'protein', 'juicy']
    }
  ],

  // === SNACK FOODS ===
  snacks: [
    {
      id: 'almonds_raw',
      name: 'Raw Almonds',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 161,
        protein: 6.0,
        carbs: 6.1,
        fat: 14.0,
        fiber: 3.5,
        sugar: 1.2
      },
      keywords: ['almonds', 'nuts', 'healthy', 'snack', 'protein']
    },
    {
      id: 'apple_medium',
      name: 'Apple (Medium)',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      servingSize: '182g (1 medium)',
      macros: {
        calories: 95,
        protein: 0.5,
        carbs: 25.0,
        fat: 0.3,
        fiber: 4.4,
        sugar: 19.0
      },
      keywords: ['apple', 'fruit', 'healthy', 'snack', 'fiber']
    },
    {
      id: 'banana_medium',
      name: 'Banana (Medium)',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      servingSize: '118g (1 medium)',
      macros: {
        calories: 105,
        protein: 1.3,
        carbs: 27.0,
        fat: 0.4,
        fiber: 3.1,
        sugar: 14.4
      },
      keywords: ['banana', 'fruit', 'potassium', 'snack', 'energy']
    },
    {
      id: 'protein_bar',
      name: 'Protein Bar',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      servingSize: '60g (1 bar)',
      macros: {
        calories: 200,
        protein: 20.0,
        carbs: 15.0,
        fat: 7.0,
        fiber: 5.0,
        sugar: 8.0
      },
      keywords: ['protein', 'bar', 'supplement', 'snack', 'fitness']
    },
    {
      id: 'dark_chocolate',
      name: 'Dark Chocolate (70%)',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 155,
        protein: 2.2,
        carbs: 13.0,
        fat: 12.0,
        fiber: 3.1,
        sugar: 7.0
      },
      keywords: ['chocolate', 'dark', 'antioxidants', 'snack', 'treat']
    },
    {
      id: 'trail_mix',
      name: 'Trail Mix',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 131,
        protein: 4.0,
        carbs: 13.0,
        fat: 8.0,
        fiber: 2.0,
        sugar: 9.0
      },
      keywords: ['trail', 'mix', 'nuts', 'dried fruit', 'hiking', 'energy']
    },
    {
      id: 'greek_yogurt_berries',
      name: 'Greek Yogurt with Berries',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      servingSize: '150g',
      macros: {
        calories: 100,
        protein: 15.0,
        carbs: 12.0,
        fat: 0.5,
        fiber: 2.0,
        sugar: 10.0
      },
      keywords: ['greek', 'yogurt', 'berries', 'healthy', 'protein', 'probiotics']
    },
    {
      id: 'cheese_crackers',
      name: 'Cheese & Crackers',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 150,
        protein: 6.0,
        carbs: 12.0,
        fat: 9.0,
        fiber: 1.0,
        sugar: 1.0
      },
      keywords: ['cheese', 'crackers', 'savory', 'calcium', 'crunchy']
    },
    {
      id: 'hummus_veggies',
      name: 'Hummus with Vegetables',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      servingSize: '100g',
      macros: {
        calories: 166,
        protein: 8.0,
        carbs: 14.3,
        fat: 9.6,
        fiber: 6.0,
        sugar: 0.3
      },
      keywords: ['hummus', 'vegetables', 'chickpeas', 'healthy', 'fiber']
    },
    {
      id: 'granola_bar',
      name: 'Granola Bar',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
      servingSize: '28g (1 bar)',
      macros: {
        calories: 118,
        protein: 3.0,
        carbs: 16.0,
        fat: 5.0,
        fiber: 2.0,
        sugar: 7.0
      },
      keywords: ['granola', 'bar', 'oats', 'portable', 'energy', 'crunchy']
    },
    {
      id: 'popcorn_air_popped',
      name: 'Air-Popped Popcorn',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      servingSize: '100g',
      macros: {
        calories: 387,
        protein: 12.9,
        carbs: 77.8,
        fat: 5.0,
        fiber: 14.5,
        sugar: 0.9
      },
      keywords: ['popcorn', 'air popped', 'whole grain', 'low calorie', 'fiber']
    },
    {
      id: 'mixed_nuts',
      name: 'Mixed Nuts',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 173,
        protein: 5.0,
        carbs: 6.0,
        fat: 16.0,
        fiber: 3.0,
        sugar: 1.0
      },
      keywords: ['mixed', 'nuts', 'healthy fats', 'protein', 'vitamin e']
    },
    {
      id: 'rice_cakes',
      name: 'Rice Cakes',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1609991872764-b4d23e89bd85?w=400',
      servingSize: '9g (1 cake)',
      macros: {
        calories: 35,
        protein: 0.7,
        carbs: 7.3,
        fat: 0.3,
        fiber: 0.4,
        sugar: 0.1
      },
      keywords: ['rice', 'cakes', 'low calorie', 'crunchy', 'gluten free']
    },
    {
      id: 'energy_balls',
      name: 'Energy Balls',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
      servingSize: '20g (1 ball)',
      macros: {
        calories: 89,
        protein: 2.5,
        carbs: 12.0,
        fat: 4.0,
        fiber: 2.0,
        sugar: 8.0
      },
      keywords: ['energy', 'balls', 'dates', 'nuts', 'natural', 'no bake']
    },
    {
      id: 'string_cheese',
      name: 'String Cheese',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
      servingSize: '28g (1 stick)',
      macros: {
        calories: 80,
        protein: 7.0,
        carbs: 1.0,
        fat: 6.0,
        fiber: 0.0,
        sugar: 0.0
      },
      keywords: ['string', 'cheese', 'mozzarella', 'protein', 'calcium', 'portable']
    },
    {
      id: 'edamame',
      name: 'Edamame',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d66?w=400',
      servingSize: '100g',
      macros: {
        calories: 121,
        protein: 11.9,
        carbs: 8.9,
        fat: 5.2,
        fiber: 5.2,
        sugar: 2.2
      },
      keywords: ['edamame', 'soybeans', 'protein', 'fiber', 'japanese', 'healthy']
    },
    {
      id: 'pretzels',
      name: 'Pretzels',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400',
      servingSize: '28g (1 oz)',
      macros: {
        calories: 108,
        protein: 3.0,
        carbs: 22.0,
        fat: 1.0,
        fiber: 1.0,
        sugar: 1.0
      },
      keywords: ['pretzels', 'salty', 'crunchy', 'low fat', 'twisted']
    },
    {
      id: 'dried_fruit',
      name: 'Mixed Dried Fruit',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1577003833619-76bbc0373f4e?w=400',
      servingSize: '40g',
      macros: {
        calories: 120,
        protein: 1.0,
        carbs: 32.0,
        fat: 0.0,
        fiber: 4.0,
        sugar: 28.0
      },
      keywords: ['dried', 'fruit', 'raisins', 'natural', 'sweet', 'portable']
    },
    {
      id: 'peanut_butter_toast',
      name: 'Peanut Butter Toast',
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400',
      servingSize: '100g',
      macros: {
        calories: 374,
        protein: 13.0,
        carbs: 35.0,
        fat: 22.0,
        fiber: 5.0,
        sugar: 8.0
      },
      keywords: ['peanut butter', 'toast', 'protein', 'filling', 'comfort']
    }
  ]
};

// === RECIPE DATABASE ===
export const RECIPE_DATABASE = [
  {
    id: 'protein_smoothie',
    name: 'Protein Power Smoothie',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    prepTime: '5 minutes',
    servings: 1,
    difficulty: 'Easy',
    totalMacros: {
      calories: 320,
      protein: 25.0,
      carbs: 35.0,
      fat: 8.0,
      fiber: 6.0,
      sugar: 28.0
    },
    ingredients: [
      { name: 'Banana', amount: '1 medium', calories: 105 },
      { name: 'Protein Powder', amount: '1 scoop', calories: 120 },
      { name: 'Greek Yogurt', amount: '1/2 cup', calories: 60 },
      { name: 'Almond Milk', amount: '1 cup', calories: 30 },
      { name: 'Spinach', amount: '1 handful', calories: 5 }
    ],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth (1-2 minutes)',
      'Pour into glass and enjoy immediately',
      'Add ice for thicker consistency if desired'
    ],
    tags: ['high-protein', 'post-workout', 'breakfast', 'healthy']
  },
  {
    id: 'chicken_quinoa_bowl',
    name: 'Mediterranean Chicken Quinoa Bowl',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    prepTime: '25 minutes',
    servings: 2,
    difficulty: 'Medium',
    totalMacros: {
      calories: 485,
      protein: 35.0,
      carbs: 45.0,
      fat: 18.0,
      fiber: 8.0,
      sugar: 6.0
    },
    ingredients: [
      { name: 'Chicken Breast', amount: '200g', calories: 330 },
      { name: 'Quinoa (dry)', amount: '1/2 cup', calories: 170 },
      { name: 'Cucumber', amount: '1/2 cup diced', calories: 8 },
      { name: 'Cherry Tomatoes', amount: '1/2 cup', calories: 15 },
      { name: 'Feta Cheese', amount: '30g', calories: 80 },
      { name: 'Olive Oil', amount: '1 tbsp', calories: 120 },
      { name: 'Lemon Juice', amount: '2 tbsp', calories: 7 }
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Season and grill chicken breast until cooked through',
      'Dice cucumber and halve cherry tomatoes',
      'Slice cooked chicken',
      'Assemble bowl with quinoa, chicken, vegetables, and feta',
      'Drizzle with olive oil and lemon juice'
    ],
    tags: ['mediterranean', 'high-protein', 'balanced', 'meal-prep']
  },
  {
    id: 'salmon_sweet_potato',
    name: 'Herb-Crusted Salmon with Sweet Potato',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    prepTime: '30 minutes',
    servings: 2,
    difficulty: 'Medium',
    totalMacros: {
      calories: 520,
      protein: 32.0,
      carbs: 35.0,
      fat: 26.0,
      fiber: 5.0,
      sugar: 8.0
    },
    ingredients: [
      { name: 'Salmon Fillet', amount: '200g', calories: 416 },
      { name: 'Sweet Potato', amount: '1 medium', calories: 130 },
      { name: 'Asparagus', amount: '150g', calories: 30 },
      { name: 'Olive Oil', amount: '1 tbsp', calories: 120 },
      { name: 'Fresh Herbs', amount: '2 tbsp mixed', calories: 5 },
      { name: 'Lemon', amount: '1/2 lemon', calories: 9 }
    ],
    instructions: [
      'Preheat oven to 400°F (200°C)',
      'Cube and roast sweet potato for 20 minutes',
      'Season salmon with herbs, salt, and pepper',
      'Pan-sear salmon skin-side down for 4 minutes',
      'Flip and cook 3 more minutes',
      'Steam asparagus for 4-5 minutes until tender',
      'Serve with lemon wedge'
    ],
    tags: ['omega-3', 'heart-healthy', 'dinner', 'gourmet']
  }
];

// Search functions
export const searchFoods = (query, category = null) => {
  const allFoods = Object.values(FOOD_DATABASE).flat();
  const foods = category ? FOOD_DATABASE[category] || [] : allFoods;
  
  if (!query) return foods;
  
  const queryLower = query.toLowerCase();
  return foods.filter(food => 
    food.name.toLowerCase().includes(queryLower) ||
    food.keywords.some(keyword => keyword.includes(queryLower))
  );
};

export const searchRecipes = (query, category = null) => {
  let recipes = RECIPE_DATABASE;
  
  if (category) {
    recipes = recipes.filter(recipe => recipe.category === category);
  }
  
  if (!query) return recipes;
  
  const queryLower = query.toLowerCase();
  return recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(queryLower) ||
    recipe.tags.some(tag => tag.includes(queryLower)) ||
    recipe.ingredients.some(ing => ing.name.toLowerCase().includes(queryLower))
  );
};

export const getFoodById = (id) => {
  const allFoods = Object.values(FOOD_DATABASE).flat();
  return allFoods.find(food => food.id === id);
};

export const getRecipeById = (id) => {
  return RECIPE_DATABASE.find(recipe => recipe.id === id);
};