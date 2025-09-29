import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { apiSend } from '../../../lib/api';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const InteractiveHabits = ({ habits, habitLogs, onRefresh }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Check if habit is completed today
  const isHabitCompletedToday = (habitId) => {
    return habitLogs?.some(log => 
      log?.habit_id === habitId && log?.date === today
    );
  };

  // Handle habit toggle for today
  const handleToggleHabit = async (habitId) => {
    if (!user?.id || loading) return;

    setLoading(true);
    try {
      const isCompleted = isHabitCompletedToday(habitId);
      
      // Toggle via Worker API (remove if already completed)
      await apiSend('POST', `/habits/${habitId}/log`, { 
        date: today, 
        remove: !!isCompleted 
      }, supabase);

      // Refresh data
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!habits?.length) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Today's Habits</h3>
          <Link to="/habits-goals">
            <Button variant="outline" size="sm">
              Create Habits
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Target" size={24} className="text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-2">No habits yet</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Create your first habit to start building better routines.
          </p>
          <Link to="/habits-goals">
            <Button size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Create Your First Habit
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedToday = habits.filter(h => isHabitCompletedToday(h.id)).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Today's Habits</h3>
          <p className="text-sm text-muted-foreground">
            {completedToday} of {totalHabits} completed ({completionRate}%)
          </p>
        </div>
        <Link to="/habits-goals">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Today's Progress</span>
          <span className="font-medium text-foreground">{completionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {habits.slice(0, 8).map((habit) => {
          const isCompleted = isHabitCompletedToday(habit.id);
          
          return (
            <div
              key={habit.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{habit?.emoji || '💪'}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{habit?.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {habit?.difficulty?.toLowerCase() || 'medium'} difficulty
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggleHabit(habit.id)}
                disabled={loading}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                    : 'border-border hover:border-green-500 hover:bg-green-50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
              >
                {isCompleted && (
                  <Icon name="Check" size={14} className="text-white" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Show more link if there are more habits */}
      {habits.length > 8 && (
        <div className="mt-3 pt-3 border-t border-border">
          <Link 
            to="/habits-goals" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
          >
            <Icon name="Plus" size={16} className="mr-1" />
            View {habits.length - 8} more habit{habits.length - 8 > 1 ? 's' : ''}
          </Link>
        </div>
      )}
    </div>
  );
};

export default InteractiveHabits;