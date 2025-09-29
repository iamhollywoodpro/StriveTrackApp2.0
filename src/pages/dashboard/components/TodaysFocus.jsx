import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const TodaysFocus = ({ habits, goals, onHabitToggle }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Find the most important incomplete habit for today
  const getTopPriorityHabit = () => {
    if (!habits?.length) return null;
    
    // Priority: Hard difficulty habits first, then by creation order
    const sortedHabits = [...habits].sort((a, b) => {
      const difficultyOrder = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
      const aDiff = difficultyOrder[a.difficulty] || 2;
      const bDiff = difficultyOrder[b.difficulty] || 2;
      
      if (aDiff !== bDiff) return bDiff - aDiff;
      return new Date(a.created_at) - new Date(b.created_at);
    });
    
    return sortedHabits[0];
  };

  // Find goal with nearest deadline
  const getUrgentGoal = () => {
    if (!goals?.length) return null;
    
    const incompleteGoals = goals.filter(g => (g.progress || 0) < 100);
    if (!incompleteGoals.length) return null;
    
    return incompleteGoals.sort((a, b) => {
      const aDate = new Date(a.targetDate || a.deadline);
      const bDate = new Date(b.targetDate || b.deadline);
      return aDate - bDate;
    })[0];
  };

  const focusHabit = getTopPriorityHabit();
  const urgentGoal = getUrgentGoal();

  if (!focusHabit && !urgentGoal) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-border/50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Target" size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Ready to Start?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first habit or goal to get focused recommendations.
          </p>
          <Link to="/habits-goals">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">🎯 Today's Focus</h3>
          <p className="text-sm text-muted-foreground">Your most important task</p>
        </div>
        <Icon name="Star" size={20} className="text-yellow-500" />
      </div>

      {focusHabit && (
        <div className="mb-4 p-3 bg-white/50 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{focusHabit.emoji || '💪'}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">{focusHabit.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">
                  {focusHabit.difficulty?.toLowerCase()} priority
                </p>
              </div>
            </div>
            <button
              onClick={() => onHabitToggle?.(focusHabit.id)}
              className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
            >
              <Icon name="Check" size={12} />
            </button>
          </div>
        </div>
      )}

      {urgentGoal && (
        <div className="p-3 bg-white/50 rounded-lg border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="Trophy" size={16} className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">{urgentGoal.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {urgentGoal.daysRemaining || 0} days left
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-purple-600">
              {Math.round(urgentGoal.progress || 0)}%
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
              style={{ width: `${urgentGoal.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Link to="/habits-goals">
          <Button variant="outline" size="sm" className="text-xs">
            <Icon name="Edit2" size={14} className="mr-1" />
            Manage All
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TodaysFocus;