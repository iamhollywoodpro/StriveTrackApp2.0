import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { apiSend } from '../../../lib/api';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const QuickProgressUpdate = ({ goals, onRefresh }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState({});

  // Get goals that are in progress (not completed)
  const inProgressGoals = goals?.filter(g => (g.progress || 0) < 100 && (g.progress || 0) > 0) || [];
  const recentGoals = goals?.filter(g => (g.progress || 0) === 0).slice(0, 2) || [];
  const displayGoals = [...inProgressGoals.slice(0, 2), ...recentGoals].slice(0, 3);

  const updateGoalProgress = async (goalId, increment) => {
    if (!user?.id || updating[goalId]) return;

    setUpdating(prev => ({ ...prev, [goalId]: true }));

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const currentProgress = goal.progress || 0;
      const newProgress = Math.max(0, Math.min(100, currentProgress + increment));

      // Update via Worker API
      await apiSend('PUT', `/goals/${goalId}`, {
        progress: newProgress
      }, supabase);

      // Refresh data
      if (onRefresh) {
        await onRefresh();
      }

      // Show celebration for milestone progress
      if (newProgress >= 100 && currentProgress < 100) {
        // Could add confetti or celebration effect here
        setTimeout(() => {
          alert('🎉 Congratulations! Goal completed!');
        }, 500);
      }

    } catch (error) {
      console.error('Error updating goal progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [goalId]: false }));
    }
  };

  if (!displayGoals.length) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Trophy" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No Active Goals</h3>
          <p className="text-sm text-muted-foreground">
            Set some goals to track your progress here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Quick Progress</h3>
        <Icon name="Zap" size={18} className="text-yellow-500" />
      </div>

      <div className="space-y-3">
        {displayGoals.map((goal) => {
          const progress = goal.progress || 0;
          const isCompleted = progress >= 100;
          const isUpdating = updating[goal.id];

          return (
            <div
              key={goal.id}
              className={`p-3 rounded-lg border transition-colors ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                  {goal.title}
                </h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateGoalProgress(goal.id, -5)}
                      disabled={isUpdating || progress <= 0}
                      className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="Minus" size={12} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 5)}
                      disabled={isUpdating}
                      className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon name="Plus" size={12} className="text-white" />
                      )}
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Tap <span className="text-blue-500">+</span> to add 5% progress
        </p>
      </div>
    </div>
  );
};

export default QuickProgressUpdate;