import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { apiGet, apiSend } from '../../../lib/api';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const HabitCards = ({ habits, onDeleteHabit, onToggleHabit, onCompleteHabit }) => {
  const { user } = useAuth();
  const [completionData, setCompletionData] = useState({});
  const [loading, setLoading] = useState(false);

  // Days of the week mapping
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Fetch completion data for each habit
  const fetchCompletionData = async () => {
    if (!user?.id || !habits?.length) return;

    setLoading(true);
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

      const from = sevenDaysAgo?.toISOString()?.split('T')?.[0];
      const to = today?.toISOString()?.split('T')?.[0];

      // Try to fetch logs from Worker
      const res = await apiGet(`/habits?from=${from}&to=${to}`, supabase);

      // Organize completion data by habit and date
      const completionMap = {};
      habits?.forEach(habit => { completionMap[habit?.id] = {}; });

      if (Array.isArray(res?.logs)) {
        res.logs.forEach((log) => {
          const hid = log?.habit_id || log?.habitId;
          const date = log?.date ?? log?.['date'] ?? log?.logged_date ?? log?.completed_date;
          if (hid && date && completionMap[hid]) completionMap[hid][date] = true;
        });
      } else if (Array.isArray(res?.items)) {
        res.items.forEach((h) => {
          const hid = h?.id;
          const logs = h?.logs || h?.recent_logs || [];
          logs.forEach((lg) => {
            const date = typeof lg === 'string' ? lg : (lg?.date ?? lg?.['date'] ?? lg?.logged_date ?? lg?.completed_date);
            if (hid && date && completionMap[hid]) completionMap[hid][date] = true;
          });
        });
      }

      setCompletionData(completionMap);
    } catch (error) {
      console.error('Error fetching completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletionData();
  }, [user?.id, habits]);

  // Handle day click to toggle completion
  const handleDayClick = async (habitId, dayIndex) => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const targetDate = new Date(today.getTime() - (dayIndex * 24 * 60 * 60 * 1000));
      const dateStr = targetDate?.toISOString()?.split('T')?.[0];
      const isCompleted = completionData?.[habitId]?.[dateStr] || false;

      if (typeof onToggleHabit === 'function') {
        await onToggleHabit(habitId, isCompleted);
      } else {
        await apiSend('POST', `/habits/${habitId}/log`, { date: dateStr, remove: !!isCompleted }, supabase);
      }

      // Refresh completion data
      await fetchCompletionData();
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  // Generate calendar days (last 7 days including today)
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayName = daysOfWeek?.[date?.getDay()];
      const dayNumber = date?.getDate();
      const dateStr = date?.toISOString()?.split('T')?.[0];
      const isToday = i === 0;
      
      days?.push({
        index: i,
        name: dayName,
        number: dayNumber,
        dateStr,
        isToday
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  if (!habits?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Target" size={24} className="text-muted-foreground" color="currentColor" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
        <p className="text-muted-foreground mb-4">Create your first habit to start building a better you.</p>
        <Button onClick={onCompleteHabit}>
          <Icon name="Plus" size={16} className="mr-2" color="currentColor" />
          Create Habit
        </Button>
      </div>
    );
  }

  if (loading && !Object.keys(completionData)?.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-muted-foreground">Loading habits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits?.map((habit) => (
        <div key={habit?.id} className="bg-card rounded-xl p-6 border border-border shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{habit?.emoji || '💪'}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{habit?.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="capitalize">{habit?.difficulty?.toLowerCase() || 'medium'} difficulty</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteHabit?.(habit?.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon name="Trash2" size={14} color="currentColor" />
            </Button>
          </div>

          {/* Weekly Calendar */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">This Week</h4>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays?.map((day) => {
                const isCompleted = completionData?.[habit?.id]?.[day?.dateStr] || false;
                const isClickable = true; // All days are clickable for historical tracking
                
                return (
                  <div key={day?.dateStr} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                      {day?.name}
                    </div>
                    <button
                      onClick={() => isClickable && handleDayClick(habit?.id, day?.index)}
                      disabled={!isClickable}
                      className={`
                        w-10 h-10 rounded-lg border text-sm font-medium transition-all duration-200
                        ${isCompleted 
                          ? 'bg-green-500 text-white border-green-500 shadow-sm' 
                          : 'bg-background border-border hover:bg-muted hover:border-muted-foreground'
                        }
                        ${day?.isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                        ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                      `}
                    >
                      {isCompleted ? (
                        <Icon name="Check" size={16} color="currentColor" />
                      ) : (
                        day?.number
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This week:</span>
                <span className="font-medium text-foreground">
                  {Object.values(completionData?.[habit?.id] || {})?.filter(Boolean)?.length} / 7 days
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitCards;