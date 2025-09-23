import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const HabitAnalytics = ({ habits, goals }) => {
  const [timeRange, setTimeRange] = useState('week');

  // Mock analytics data
  const weeklyProgress = [
    { day: 'Mon', completed: 3, total: 4 },
    { day: 'Tue', completed: 4, total: 4 },
    { day: 'Wed', completed: 2, total: 4 },
    { day: 'Thu', completed: 4, total: 4 },
    { day: 'Fri', completed: 3, total: 4 },
    { day: 'Sat', completed: 4, total: 4 },
    { day: 'Sun', completed: 3, total: 4 }
  ];

  const monthlyTrends = [
    { week: 'Week 1', completion: 85 },
    { week: 'Week 2', completion: 90 },
    { week: 'Week 3', completion: 78 },
    { week: 'Week 4', completion: 92 }
  ];

  const categoryData = [
    { name: 'Fitness', value: 40, color: '#3b82f6' },
    { name: 'Wellness', value: 25, color: '#10b981' },
    { name: 'Personal', value: 20, color: '#8b5cf6' },
    { name: 'Nutrition', value: 15, color: '#f97316' }
  ];

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const calculateStreakDistribution = () => {
    const distribution = { '1-7': 0, '8-14': 0, '15-21': 0, '22+': 0 };
    
    habits?.forEach(habit => {
      const streak = habit?.currentStreak;
      if (streak <= 7) distribution['1-7']++;
      else if (streak <= 14) distribution['8-14']++;
      else if (streak <= 21) distribution['15-21']++;
      else distribution['22+']++;
    });
    
    return Object.entries(distribution)?.map(([range, count]) => ({
      range,
      count,
      percentage: habits?.length > 0 ? Math.round((count / habits?.length) * 100) : 0
    }));
  };

  const getInsights = () => {
    const avgCompletion = Math.round(
      habits?.reduce((acc, h) => acc + h?.completionRate, 0) / habits?.length
    );
    
    const bestCategory = categoryData?.reduce((a, b) => a?.value > b?.value ? a : b)?.name;
    
    const longestStreak = Math.max(...habits?.map(h => h?.currentStreak));
    
    return { avgCompletion, bestCategory, longestStreak };
  };

  const insights = getInsights();
  const streakDistribution = calculateStreakDistribution();

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground mb-4 sm:mb-0">
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          {timeRanges?.map((range) => (
            <Button
              key={range?.value}
              variant={timeRange === range?.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range?.value)}
            >
              {range?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Completion Rate</p>
              <p className="text-2xl font-bold text-foreground">{insights?.avgCompletion}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold text-foreground">{insights?.longestStreak} days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Category</p>
              <p className="text-2xl font-bold text-foreground">{insights?.bestCategory}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Target" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Daily Completion This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Monthly Completion Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Habits by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
              >
                {categoryData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Streak Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Streak Distribution
          </h3>
          <div className="space-y-3">
            {streakDistribution?.map((item) => (
              <div key={item?.range} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item?.range} days
                </span>
                <div className="flex items-center space-x-2 flex-1 max-w-xs">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item?.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {item?.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recommendations */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Lightbulb" size={20} />
          <span>Recommendations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Icon name="TrendingUp" size={16} className="text-blue-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Focus on Consistency
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Your completion rate is {insights?.avgCompletion}%. Try to maintain daily habits for better results.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <Icon name="Target" size={16} className="text-green-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Build on Strengths
                </p>
                <p className="text-xs text-green-700 mt-1">
                  You're doing great with {insights?.bestCategory}. Consider adding related habits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitAnalytics;