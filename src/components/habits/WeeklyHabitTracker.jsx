import React, { useState, useEffect } from 'react';

function WeeklyHabitTracker({ habit, onUpdateProgress }) {
  const [weeklyProgress, setWeeklyProgress] = useState({});
  
  // Get current week dates (Sunday to Saturday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push({
        date: date,
        dateString: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isFuture: date > today,
        isAllowed: date <= today && (today - date) / (1000 * 60 * 60 * 24) <= 2 // Allow 2 days back
      });
    }
    
    return weekDates;
  };

  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());

  // Update week dates when component mounts or week changes
  useEffect(() => {
    const updateWeek = () => {
      setWeekDates(getCurrentWeekDates());
    };
    
    // Update immediately
    updateWeek();
    
    // Update at midnight each day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      updateWeek();
      // Set daily interval after first midnight
      const intervalId = setInterval(updateWeek, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Load habit progress for current week (in real app, this would come from API)
  useEffect(() => {
    loadWeeklyProgress();
  }, [habit.id, weekDates]);

  const loadWeeklyProgress = () => {
    // Sample data - in real app, fetch from API based on habit.id and week dates
    const sampleProgress = {};
    
    weekDates.forEach((day, index) => {
      // Generate realistic sample data
      if (day.isPast || day.isToday) {
        // 70% completion rate for past days
        const completed = Math.random() > 0.3;
        sampleProgress[day.dateString] = {
          completed,
          timestamp: completed ? new Date(day.date).toISOString() : null,
          notes: completed ? 'Completed!' : null
        };
      }
    });
    
    setWeeklyProgress(sampleProgress);
  };

  const toggleDayCompletion = (dateString, dayData) => {
    if (!dayData.isAllowed) return;
    
    const currentProgress = weeklyProgress[dateString];
    const newCompleted = !currentProgress?.completed;
    
    const updatedProgress = {
      ...weeklyProgress,
      [dateString]: {
        completed: newCompleted,
        timestamp: newCompleted ? new Date().toISOString() : null,
        notes: newCompleted ? 'Completed!' : null
      }
    };
    
    setWeeklyProgress(updatedProgress);
    
    // Notify parent component (for API updates)
    if (onUpdateProgress) {
      onUpdateProgress(habit.id, dateString, newCompleted);
    }
  };

  const getCompletionCount = () => {
    return Object.values(weeklyProgress).filter(p => p?.completed).length;
  };

  const getCompletionRate = () => {
    const totalDays = weekDates.filter(d => d.isPast || d.isToday).length;
    const completedDays = getCompletionCount();
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{habit.icon}</span>
          <h3 className="font-semibold text-slate-900">{habit.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">{getCompletionCount()}/7</p>
          <p className="text-xs text-slate-500">{getCompletionRate()}% this week</p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDates.map((day, index) => {
          const progress = weeklyProgress[day.dateString];
          const isCompleted = progress?.completed;
          const isClickable = day.isAllowed;
          
          let boxClass = 'aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 ';
          
          if (isCompleted) {
            boxClass += 'bg-green-500 border-green-500 text-white ';
          } else if (day.isPast && day.isAllowed) {
            boxClass += 'bg-red-100 border-red-300 text-red-600 ';
          } else if (day.isFuture) {
            boxClass += 'bg-slate-50 border-slate-200 text-slate-400 ';
          } else {
            boxClass += 'bg-slate-100 border-slate-300 text-slate-600 ';
          }
          
          if (isClickable) {
            boxClass += 'cursor-pointer hover:scale-105 ';
          } else {
            boxClass += 'cursor-not-allowed ';
          }
          
          if (day.isToday) {
            boxClass += 'ring-2 ring-blue-400 ';
          }

          return (
            <div key={day.dateString} className="text-center">
              <p className="text-xs text-slate-500 mb-1">{day.dayName}</p>
              <div
                className={boxClass}
                onClick={() => isClickable && toggleDayCompletion(day.dateString, day)}
                title={
                  isCompleted 
                    ? `Completed on ${day.dayName}` 
                    : day.isFuture 
                    ? 'Future date' 
                    : day.isAllowed 
                    ? `Click to mark ${day.dayName} as complete`
                    : 'Too far in the past'
                }
              >
                <span className="text-lg font-bold">{day.dayNumber}</span>
                <div className="text-lg mt-1">
                  {isCompleted ? (
                    <span>✓</span>
                  ) : day.isPast && day.isAllowed ? (
                    <span>✕</span>
                  ) : day.isFuture ? (
                    <span>○</span>
                  ) : (
                    <span>−</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div>
            <span>Future</span>
          </div>
        </div>
        
        <div className="text-right">
          <p>Can edit up to 2 days back</p>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">{getCompletionCount()}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">
              {weekDates.filter(d => d.isPast || d.isToday).length - getCompletionCount()}
            </p>
            <p className="text-xs text-slate-500">Missed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{getCompletionRate()}%</p>
            <p className="text-xs text-slate-500">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyHabitTracker;