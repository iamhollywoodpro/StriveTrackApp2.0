import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const NutritionInsights = () => {
  // Mock weekly data
  const weeklyCalories = [
    { day: 'Mon', calories: 1850, target: 2000 },
    { day: 'Tue', calories: 2100, target: 2000 },
    { day: 'Wed', calories: 1950, target: 2000 },
    { day: 'Thu', calories: 2200, target: 2000 },
    { day: 'Fri', calories: 1800, target: 2000 },
    { day: 'Sat', calories: 2300, target: 2000 },
    { day: 'Sun', calories: 1900, target: 2000 }
  ];

  const macroTrends = [
    { day: 'Mon', protein: 120, carbs: 180, fat: 65 },
    { day: 'Tue', protein: 135, carbs: 200, fat: 70 },
    { day: 'Wed', protein: 125, carbs: 175, fat: 68 },
    { day: 'Thu', protein: 140, carbs: 220, fat: 75 },
    { day: 'Fri', protein: 115, carbs: 160, fat: 62 },
    { day: 'Sat', protein: 145, carbs: 240, fat: 80 },
    { day: 'Sun', protein: 130, carbs: 190, fat: 72 }
  ];

  const insights = [
    {
      icon: 'TrendingUp',
      title: 'Protein Goal Achievement',
      description: 'You\'ve consistently met your protein goals 6 out of 7 days this week!',
      type: 'success'
    },
    {
      icon: 'AlertTriangle',
      title: 'Carb Intake Variation',
      description: 'Your carb intake varies significantly. Consider more consistent meal planning.',
      type: 'warning'
    },
    {
      icon: 'Target',
      title: 'Calorie Balance',
      description: 'You\'re averaging 2043 calories daily, slightly above your 2000 calorie target.',
      type: 'info'
    }
  ];

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Calorie Chart */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
          Weekly Calorie Intake
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="calories" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Macro Trends */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="TrendingUp" size={20} className="mr-2 text-primary" />
          Macro Nutrient Trends
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={macroTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="protein" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              <Line type="monotone" dataKey="carbs" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              <Line type="monotone" dataKey="fat" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Protein</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Carbs</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Fat</span>
          </div>
        </div>
      </div>
      {/* Insights & Recommendations */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Lightbulb" size={20} className="mr-2 text-primary" />
          Nutrition Insights
        </h3>
        <div className="space-y-4">
          {insights?.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg ${getInsightColor(insight?.type)}`}>
              <div className="flex items-start space-x-3">
                <Icon name={insight?.icon} size={20} className="mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">{insight?.title}</h4>
                  <p className="text-sm opacity-80">{insight?.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border shadow-elevation-1 text-center">
          <Icon name="Calendar" size={24} className="mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">7</p>
          <p className="text-sm text-muted-foreground">Days Tracked</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-elevation-1 text-center">
          <Icon name="Target" size={24} className="mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">85%</p>
          <p className="text-sm text-muted-foreground">Goal Achievement</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-elevation-1 text-center">
          <Icon name="Flame" size={24} className="mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">2043</p>
          <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionInsights;