import React from 'react';
import Icon from '../../../components/ui/Icon';

const WeeklyStreaks = ({ habitLogs, habits }) => {
  // Generate last 7 days
  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;
      
      // Count completed habits for this day
      const dayLogs = habitLogs?.filter(log => log?.date === dateStr)?.length || 0;
      const totalHabits = habits?.length || 0;
      const completionRate = totalHabits > 0 ? (dayLogs / totalHabits) * 100 : 0;
      
      days.push({
        name: dayName,
        number: dayNumber,
        dateStr,
        isToday,
        completedHabits: dayLogs,
        totalHabits,
        completionRate
      });
    }
    
    return days;
  };

  const weekDays = generateWeekDays();
  const currentStreak = calculateCurrentStreak(weekDays);

  function calculateCurrentStreak(days) {
    let streak = 0;
    // Count from today backwards
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].completionRate >= 100) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Weekly Streak</h3>
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-foreground">
            {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div key={day.dateStr} className="text-center">
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              {day.name}
            </div>
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200
                ${day.completionRate >= 100
                  ? 'bg-green-500 text-white shadow-sm'
                  : day.completionRate >= 75
                  ? 'bg-green-400 text-white'
                  : day.completionRate >= 50
                  ? 'bg-yellow-400 text-white'
                  : day.completionRate > 0
                  ? 'bg-orange-400 text-white'
                  : 'bg-muted text-muted-foreground border border-border'
                }
                ${day.isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
              `}
            >
              {day.number}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {day.completedHabits}/{day.totalHabits}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-foreground">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Current Streak</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-lg font-bold text-foreground">
            {Math.round(weekDays.reduce((acc, day) => acc + day.completionRate, 0) / 7)}%
          </div>
          <div className="text-xs text-muted-foreground">Weekly Average</div>
        </div>
      </div>

      {/* Motivational Message */}
      {currentStreak > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Icon name="Trophy" size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {currentStreak >= 7 
                ? "Amazing! You're on fire! 🔥"
                : currentStreak >= 3
                ? "Great momentum! Keep it up! 💪"
                : "Good start! Build that streak! ⭐"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyStreaks;