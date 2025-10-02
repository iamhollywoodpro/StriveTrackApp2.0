import React from 'react';

function NutritionChart({ data, goals, type = 'weekly' }) {
  // Generate sample weekly data (in real app, this would come from API)
  const generateWeeklyData = () => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic nutrition data
      const calories = Math.floor(Math.random() * 600) + 1200; // 1200-1800
      const protein = Math.floor(Math.random() * 60) + 60; // 60-120g
      const carbs = Math.floor(Math.random() * 100) + 150; // 150-250g
      const fat = Math.floor(Math.random() * 30) + 40; // 40-70g
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories,
        protein,
        carbs,
        fat
      });
    }
    
    return weekData;
  };

  const weeklyData = data || generateWeeklyData();
  const maxCalories = Math.max(...weeklyData.map(d => d.calories), goals?.calories || 2000);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 mb-2">Weekly Nutrition Overview</h3>
        <p className="text-sm text-slate-600">Track your daily nutrition intake over time</p>
      </div>

      {/* Calorie Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-700">Daily Calories</h4>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-slate-600">Intake</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-orange-300 rounded"></div>
              <span className="text-slate-600">Goal ({goals?.calories || 2000})</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-32">
          <div className="flex items-end justify-between h-full">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative w-8 bg-slate-100 rounded-t" style={{ height: '100%' }}>
                  {/* Goal line */}
                  {goals?.calories && (
                    <div 
                      className="absolute w-full border-t-2 border-orange-300 border-dashed"
                      style={{ 
                        bottom: `${(goals.calories / maxCalories) * 100}%`,
                        transform: 'translateY(1px)' 
                      }}
                    />
                  )}
                  
                  {/* Intake bar */}
                  <div 
                    className="absolute bottom-0 w-full bg-orange-500 rounded-t transition-all duration-300 hover:bg-orange-600"
                    style={{ height: `${(day.calories / maxCalories) * 100}%` }}
                    title={`${day.day}: ${day.calories} calories`}
                  />
                  
                  {/* Value label */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700">
                    {day.calories}
                  </div>
                </div>
                
                <span className="mt-2 text-xs text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Macronutrient Breakdown */}
      <div>
        <h4 className="font-medium text-slate-700 mb-4">Macronutrient Trends</h4>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Protein */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-600">Protein</span>
              <span className="text-xs text-slate-500">grams</span>
            </div>
            <div className="space-y-1">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 w-8">{day.day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${Math.min((day.protein / (goals?.protein || 150)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-8 text-right">{day.protein}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">Carbs</span>
              <span className="text-xs text-slate-500">grams</span>
            </div>
            <div className="space-y-1">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 w-8">{day.day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${Math.min((day.carbs / (goals?.carbs || 250)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-8 text-right">{day.carbs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Fat</span>
              <span className="text-xs text-slate-500">grams</span>
            </div>
            <div className="space-y-1">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 w-8">{day.day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min((day.fat / (goals?.fat || 67)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-8 text-right">{day.fat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-700 mb-2">Weekly Summary</h5>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-orange-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7)}
            </p>
            <p className="text-xs text-slate-500">Avg Calories</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / 7)}g
            </p>
            <p className="text-xs text-slate-500">Avg Protein</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / 7)}g
            </p>
            <p className="text-xs text-slate-500">Avg Carbs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">
              {Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / 7)}g
            </p>
            <p className="text-xs text-slate-500">Avg Fat</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NutritionChart;