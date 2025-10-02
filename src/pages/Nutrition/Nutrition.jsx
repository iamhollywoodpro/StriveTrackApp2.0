import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import Modal from '../../components/shared/Modal';
import ProgressBar from '../../components/shared/ProgressBar';
import NutritionChart from '../../components/charts/NutritionChart';
import FoodSearchModal from '../../components/nutrition/FoodSearchModal';
import RecipeSuggestions from '../../components/nutrition/RecipeSuggestions';

function Nutrition() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('meal'); // 'meal', 'food', 'water'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [currentMealType, setCurrentMealType] = useState('breakfast');

  // Nutrition data
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    fiber: 25,
    water: 8 // glasses
  });

  const [todayIntake, setTodayIntake] = useState({
    calories: 1420,
    protein: 95,
    carbs: 180,
    fat: 45,
    fiber: 18,
    water: 6
  });

  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);

  // Form states
  const [mealForm, setMealForm] = useState({
    name: '',
    type: 'breakfast', // breakfast, lunch, dinner, snack
    foods: [], // array of food items
    total_calories: 0,
    notes: ''
  });

  const [foodForm, setFoodForm] = useState({
    name: '',
    serving_size: '',
    calories_per_serving: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    quantity: 1
  });

  // Sample data
  useEffect(() => {
    loadSampleData();
  }, [selectedDate]);

  const loadSampleData = () => {
    setMeals([
      {
        id: 1,
        name: 'Protein Smoothie',
        type: 'breakfast',
        time: '08:30',
        calories: 320,
        protein: 25,
        carbs: 35,
        fat: 8,
        fiber: 6,
        foods: ['Banana', 'Protein Powder', 'Almond Milk', 'Spinach'],
        notes: 'Post-workout fuel'
      },
      {
        id: 2,
        name: 'Grilled Chicken Salad',
        type: 'lunch',
        time: '12:45',
        calories: 450,
        protein: 35,
        carbs: 25,
        fat: 22,
        fiber: 8,
        foods: ['Chicken Breast', 'Mixed Greens', 'Avocado', 'Olive Oil'],
        notes: 'Light and healthy'
      },
      {
        id: 3,
        name: 'Greek Yogurt',
        type: 'snack',
        time: '15:30',
        calories: 150,
        protein: 15,
        carbs: 20,
        fat: 3,
        fiber: 2,
        foods: ['Greek Yogurt', 'Berries', 'Almonds'],
        notes: 'Afternoon energy'
      },
      {
        id: 4,
        name: 'Salmon & Quinoa',
        type: 'dinner',
        time: '19:00',
        calories: 500,
        protein: 40,
        carbs: 45,
        fat: 18,
        fiber: 6,
        foods: ['Salmon Fillet', 'Quinoa', 'Broccoli', 'Lemon'],
        notes: 'Omega-3 rich dinner'
      }
    ]);

    setFoods([
      { id: 1, name: 'Chicken Breast', calories_per_serving: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving_size: '100g' },
      { id: 2, name: 'Brown Rice', calories_per_serving: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, serving_size: '1 cup cooked' },
      { id: 3, name: 'Broccoli', calories_per_serving: 55, protein: 4, carbs: 11, fat: 0.6, fiber: 5, serving_size: '1 cup' },
      { id: 4, name: 'Avocado', calories_per_serving: 234, protein: 3, carbs: 12, fat: 21, fiber: 10, serving_size: '1 medium' },
      { id: 5, name: 'Almonds', calories_per_serving: 161, protein: 6, carbs: 6, fat: 14, fiber: 3.5, serving_size: '1 oz (23 nuts)' },
      { id: 6, name: 'Salmon', calories_per_serving: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, serving_size: '100g' },
      { id: 7, name: 'Sweet Potato', calories_per_serving: 180, protein: 4, carbs: 41, fat: 0.3, fiber: 6.6, serving_size: '1 medium' },
      { id: 8, name: 'Greek Yogurt', calories_per_serving: 100, protein: 17, carbs: 9, fat: 0.7, fiber: 0, serving_size: '150g' }
    ]);
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'orange' },
    { value: 'lunch', label: 'Lunch', icon: '☀️', color: 'blue' },
    { value: 'dinner', label: 'Dinner', icon: '🌙', color: 'purple' },
    { value: 'snack', label: 'Snack', icon: '🍎', color: 'green' }
  ];

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'meal') {
      setMealForm(item || {
        name: '',
        type: 'breakfast',
        foods: [],
        total_calories: 0,
        notes: ''
      });
    } else if (type === 'food') {
      setFoodForm(item || {
        name: '',
        serving_size: '',
        calories_per_serving: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        quantity: 1
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const saveMeal = () => {
    if (!mealForm.name.trim()) return;
    
    const newMeal = {
      ...mealForm,
      id: editingItem ? editingItem.id : Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      calories: mealForm.total_calories
    };
    
    if (editingItem) {
      setMeals(meals.map(m => m.id === editingItem.id ? newMeal : m));
    } else {
      setMeals([...meals, newMeal]);
    }
    closeModal();
  };

  const saveFood = () => {
    if (!foodForm.name.trim()) return;
    
    const newFood = {
      ...foodForm,
      id: editingItem ? editingItem.id : Date.now()
    };
    
    if (editingItem) {
      setFoods(foods.map(f => f.id === editingItem.id ? newFood : f));
    } else {
      setFoods([...foods, newFood]);
    }
    closeModal();
  };

  const addWaterGlass = () => {
    setTodayIntake(prev => ({
      ...prev,
      water: Math.min(prev.water + 1, dailyGoals.water)
    }));
  };

  const removeWaterGlass = () => {
    setTodayIntake(prev => ({
      ...prev,
      water: Math.max(prev.water - 1, 0)
    }));
  };

  const openFoodSearch = (mealType) => {
    setCurrentMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleFoodSelect = (foodData) => {
    // Add selected food to meals
    const newMeal = {
      id: Date.now(),
      name: foodData.name,
      type: currentMealType,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      fiber: foodData.fiber,
      foods: [foodData.name, ...(foodData.selectedAddOns?.map(a => a.name) || [])],
      notes: `${foodData.quantity} serving${foodData.quantity !== 1 ? 's' : ''}${foodData.selectedAddOns?.length > 0 ? ` with ${foodData.selectedAddOns.map(a => a.name).join(', ')}` : ''}`
    };
    
    setMeals([...meals, newMeal]);
    
    // Update today's intake
    setTodayIntake(prev => ({
      calories: prev.calories + foodData.calories,
      protein: prev.protein + foodData.protein,
      carbs: prev.carbs + foodData.carbs,
      fat: prev.fat + foodData.fat,
      fiber: prev.fiber + foodData.fiber,
      water: prev.water
    }));
  };

  const handleRecipeSelect = (recipe) => {
    console.log('Selected recipe:', recipe);
    // TODO: Open recipe details modal
  };

  const getMealsByType = (type) => meals.filter(meal => meal.type === type);

  const getMacroPercentage = (current, goal) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-slate-400 hover:text-slate-600 mr-4">
                ←
              </a>
              <h1 className="text-xl font-bold text-slate-900">Nutrition Tracking</h1>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input text-sm"
              />
              <button 
                onClick={() => openModal('meal')}
                className="btn btn-primary"
              >
                + Add Meal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'today' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Today's Intake
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'meals' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍽️ Meals ({meals.length})
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'foods' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🥗 Food Database ({foods.length})
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Nutrition Analytics</h2>
              <p className="text-slate-600">Track your nutrition trends and patterns over time</p>
            </div>

            <NutritionChart goals={dailyGoals} />
            
            {/* Recipe Suggestions */}
            <div className="mt-8">
              <RecipeSuggestions 
                selectedFoods={meals.slice(-5)} // Last 5 meals for suggestions
                onSelectRecipe={handleRecipeSelect}
              />
            </div>
          </div>
        )}

        {/* Today's Intake Tab */}
        {activeTab === 'today' && (
          <div>
            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Calories */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Calories</h3>
                  <span className="text-2xl">🔥</span>
                </div>
                <ProgressBar
                  current={todayIntake.calories}
                  target={dailyGoals.calories}
                  color="orange"
                  showNumbers={false}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-slate-900">{todayIntake.calories}</span>
                  <span className="text-sm text-slate-600">/ {dailyGoals.calories} kcal</span>
                </div>
              </div>

              {/* Water */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Water</h3>
                  <span className="text-2xl">💧</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {Array.from({ length: dailyGoals.water }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        i < todayIntake.water ? 'bg-blue-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={removeWaterGlass}
                      disabled={todayIntake.water === 0}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-slate-900">
                      {todayIntake.water}/{dailyGoals.water}
                    </span>
                    <button
                      onClick={addWaterGlass}
                      disabled={todayIntake.water >= dailyGoals.water}
                      className="w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-600">glasses</span>
                </div>
              </div>

              {/* Macros Summary */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Macros</h3>
                  <span className="text-2xl">⚖️</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>{todayIntake.protein}g / {dailyGoals.protein}g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full transition-all duration-300"
                        style={{ width: `${getMacroPercentage(todayIntake.protein, dailyGoals.protein)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>{todayIntake.carbs}g / {dailyGoals.carbs}g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${getMacroPercentage(todayIntake.carbs, dailyGoals.carbs)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span>{todayIntake.fat}g / {dailyGoals.fat}g</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${getMacroPercentage(todayIntake.fat, dailyGoals.fat)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals by Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mealTypes.map(type => (
                <div key={type.value} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{type.icon}</span>
                      <h3 className="font-semibold text-slate-900">{type.label}</h3>
                    </div>
                    <button
                      onClick={() => openFoodSearch(type.value)}
                      className="text-slate-400 hover:text-slate-600 text-2xl"
                      title={`Add ${type.label}`}
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-3">
                    {getMealsByType(type.value).map(meal => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{meal.name}</p>
                          <p className="text-sm text-slate-600">{meal.time} • {meal.calories} kcal</p>
                        </div>
                        <button
                          onClick={() => openModal('meal', meal)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          ⚙️
                        </button>
                      </div>
                    ))}
                    
                    {getMealsByType(type.value).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No {type.label.toLowerCase()} logged yet</p>
                        <button
                          onClick={() => openFoodSearch(type.value)}
                          className="text-primary-500 hover:text-primary-600 text-sm mt-1"
                        >
                          Add {type.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Meal Log</h2>
              <p className="text-slate-600">Track all your meals and snacks</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meals.map(meal => (
                <div key={meal.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {mealTypes.find(t => t.value === meal.type)?.icon}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{meal.name}</h3>
                        <p className="text-sm text-slate-600">
                          {mealTypes.find(t => t.value === meal.type)?.label} • {meal.time}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal('meal', meal)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ⚙️
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{meal.calories}</p>
                      <p className="text-xs text-slate-500">kcal</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{meal.protein}g</p>
                      <p className="text-xs text-slate-500">protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{meal.carbs}g</p>
                      <p className="text-xs text-slate-500">carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{meal.fat}g</p>
                      <p className="text-xs text-slate-500">fat</p>
                    </div>
                  </div>

                  {meal.foods && meal.foods.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Foods:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.foods.map((food, index) => (
                          <span key={index} className="inline-block bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {meal.notes && (
                    <p className="text-sm text-slate-600 italic">"{meal.notes}"</p>
                  )}
                </div>
              ))}

              {meals.length === 0 && (
                <div className="col-span-full card p-12 text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No meals logged</h3>
                  <p className="text-slate-600 mb-4">Start tracking your nutrition today!</p>
                  <button
                    onClick={() => openModal('meal')}
                    className="btn btn-primary"
                  >
                    Log Your First Meal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Food Database</h2>
                <p className="text-slate-600">Manage your custom food entries</p>
              </div>
              <button
                onClick={() => openModal('food')}
                className="btn btn-primary"
              >
                + Add Food
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Food Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Serving Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Calories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Protein
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Carbs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Fat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {foods.map(food => (
                      <tr key={food.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{food.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {food.serving_size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {food.calories_per_serving}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {food.protein}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {food.carbs}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {food.fat}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openModal('food', food)}
                            className="text-primary-500 hover:text-primary-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {foods.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🥗</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No foods in database</h3>
                  <p className="text-slate-600 mb-4">Add your favorite foods for quick meal logging!</p>
                  <button
                    onClick={() => openModal('food')}
                    className="btn btn-primary"
                  >
                    Add Your First Food
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={`${editingItem ? 'Edit' : 'Add'} ${modalType === 'meal' ? 'Meal' : 'Food'}`}
        size={modalType === 'meal' ? 'large' : 'medium'}
      >
        {modalType === 'meal' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meal Name</label>
                <input
                  type="text"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                  placeholder="e.g., Protein Smoothie"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meal Type</label>
                <select
                  value={mealForm.type}
                  onChange={(e) => setMealForm({...mealForm, type: e.target.value})}
                  className="input w-full"
                >
                  {mealTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Calories</label>
              <input
                type="number"
                value={mealForm.total_calories}
                onChange={(e) => setMealForm({...mealForm, total_calories: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Foods (comma separated)</label>
              <textarea
                value={mealForm.foods.join(', ')}
                onChange={(e) => setMealForm({...mealForm, foods: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                placeholder="e.g., Chicken breast, Brown rice, Broccoli"
                className="input w-full h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={mealForm.notes}
                onChange={(e) => setMealForm({...mealForm, notes: e.target.value})}
                placeholder="Any additional notes about this meal..."
                className="input w-full h-20 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveMeal} className="btn btn-primary">
                {editingItem ? 'Update' : 'Add'} Meal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Food Name</label>
              <input
                type="text"
                value={foodForm.name}
                onChange={(e) => setFoodForm({...foodForm, name: e.target.value})}
                placeholder="e.g., Chicken Breast"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Serving Size</label>
              <input
                type="text"
                value={foodForm.serving_size}
                onChange={(e) => setFoodForm({...foodForm, serving_size: e.target.value})}
                placeholder="e.g., 100g, 1 cup, 1 medium"
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Calories per Serving</label>
                <input
                  type="number"
                  value={foodForm.calories_per_serving}
                  onChange={(e) => setFoodForm({...foodForm, calories_per_serving: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Protein (g)</label>
                <input
                  type="number"
                  value={foodForm.protein}
                  onChange={(e) => setFoodForm({...foodForm, protein: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Carbs (g)</label>
                <input
                  type="number"
                  value={foodForm.carbs}
                  onChange={(e) => setFoodForm({...foodForm, carbs: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fat (g)</label>
                <input
                  type="number"
                  value={foodForm.fat}
                  onChange={(e) => setFoodForm({...foodForm, fat: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fiber (g)</label>
                <input
                  type="number"
                  value={foodForm.fiber}
                  onChange={(e) => setFoodForm({...foodForm, fiber: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveFood} className="btn btn-primary">
                {editingItem ? 'Update' : 'Add'} Food
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Enhanced Food Search Modal */}
      <FoodSearchModal
        isOpen={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        onSelectFood={handleFoodSelect}
        mealType={currentMealType}
      />
    </div>
  );
}

export default Nutrition;