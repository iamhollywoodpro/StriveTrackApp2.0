import React from 'react';

function HabitChart({ habit, days = 30 }) {
  // Generate last 30 days of data (sample data)
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random completion data (in real app, this would come from API)
      const completed = Math.random() > 0.3; // 70% completion rate
      const percentage = completed ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3; // 60-100% or 0-30%
      
      data.push({
        date: date.toISOString().split('T')[0],
        completed,
        percentage,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate()
      });
    }
    
    return data;
  };

  const data = generateHeatmapData();
  const completionRate = (data.filter(d => d.completed).length / data.length * 100).toFixed(1);

  const getIntensityClass = (percentage) => {
    if (percentage === 0) return 'bg-slate-100';
    if (percentage < 0.3) return 'bg-green-200';
    if (percentage < 0.6) return 'bg-green-300';
    if (percentage < 0.8) return 'bg-green-400';
    return 'bg-green-500';
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">{habit?.title || 'Habit Progress'}</h3>
        <span className="text-sm text-slate-600">{completionRate}% completion rate</span>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-xs text-slate-500 text-center py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {data.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded ${getIntensityClass(day.percentage)} border border-slate-200 relative group cursor-pointer`}
              title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'} (${(day.percentage * 100).toFixed(0)}%)`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">
                  {day.dayOfMonth}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                {new Date(day.date).toLocaleDateString()} - {day.completed ? 'Completed' : 'Missed'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-slate-100 rounded border border-slate-200"></div>
          <div className="w-3 h-3 bg-green-200 rounded border border-slate-200"></div>
          <div className="w-3 h-3 bg-green-300 rounded border border-slate-200"></div>
          <div className="w-3 h-3 bg-green-400 rounded border border-slate-200"></div>
          <div className="w-3 h-3 bg-green-500 rounded border border-slate-200"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

export default HabitChart;