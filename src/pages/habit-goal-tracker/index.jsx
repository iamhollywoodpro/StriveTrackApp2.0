import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import HabitCards from './components/HabitCards';
import CreateHabitModal from './components/CreateHabitModal';
import GoalProgress from './components/GoalProgress';
import CreateGoalModal from './components/CreateGoalModal';
import Icon from '../../components/ui/Icon';

const HabitGoalTracker = () => {
  const { user } = useAuth();
  
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real habits from database with proper completion tracking
  const fetchHabits = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        ?.from('habits')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching habits:', error);
        setHabits([]);
        return;
      }

      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setHabits([]);
    }
  };

  // Fetch real goals from database
  const fetchGoals = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase?.from('goals')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
        return;
      }

      // Transform goals data to match component expectations
      const transformedGoals = data?.map(goal => ({
        id: goal?.id,
        title: goal?.title,
        description: goal?.description,
        targetDate: goal?.target_date ? new Date(goal?.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: goal?.progress || 0,
        target: 100, // Default target
        unit: "%",
        currentValue: goal?.progress || 0,
        category: "Personal", // Default category
        priority: "Medium", // Default priority
        milestones: [], // Would need milestone tracking
        created_at: goal?.created_at
      })) || [];

      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([fetchHabits(), fetchGoals()]);
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id]);

  const handleCreateHabit = async (newHabit) => {
    if (!user?.id) {
      setError('Please sign in to create habits');
      return;
    }

    try {
      // Only insert fields that exist in the database schema (RLS enforces permissions)
      const { data, error } = await supabase?.from('habits')?.insert([
          {
            name: newHabit?.name?.trim(),
            user_id: user?.id,
            emoji: newHabit?.emoji || '💪',
            difficulty: newHabit?.difficulty || 'Medium',
            days_of_week: newHabit?.days_of_week || [0, 1, 2, 3, 4, 5, 6]
          }
        ])?.select()?.single();

      if (error) {
        console.error('Error creating habit:', error);
        
        // Handle specific error cases
        if (error?.code === '23503') {
          setError('Profile setup required. Please refresh the page and try again.');
        } else {
          setError('Failed to create habit: ' + (error?.message || 'Unknown error'));
        }
        return;
      }

      // Success - refresh habits list and close modal
      await fetchHabits();
      setShowCreateHabit(false);
      setError('');
    } catch (error) {
      console.error('Error creating habit:', error);
      setError('Failed to create habit. Please try again.');
    }
  };

  // Add missing handleToggleHabit function with proper completion tracking
  const handleToggleHabit = async (habitId, completed) => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const dateStr = today?.toISOString()?.split('T')?.[0];

      if (completed) {
        // Remove completion
        const { error } = await supabase
          ?.from('habit_completions')
          ?.delete()
          ?.eq('habit_id', habitId)
          ?.eq('user_id', user?.id)
          ?.eq('completed_date', dateStr);

        if (error) {
          console.error('Error removing habit completion:', error);
          setError('Failed to update habit completion');
          return;
        }
      } else {
        // Add completion
        const { error } = await supabase
          ?.from('habit_completions')
          ?.insert([{
            habit_id: habitId,
            user_id: user?.id,
            completed_date: dateStr
          }]);

        if (error) {
          console.error('Error adding habit completion:', error);
          setError('Failed to complete habit');
          return;
        }

        // Achievements and points are handled by DB triggers server-side.
        // No client RPC call needed.
      }

      // Refresh habits list to show updated completion status
      await fetchHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      setError('Failed to update habit');
    }
  };

  // Enhanced handleCreateGoal with better error handling
  const handleCreateGoal = async (newGoal) => {
    if (!user?.id) {
      setError('Please sign in to create goals');
      return;
    }

    try {
      const { data, error } = await supabase?.from('goals')?.insert([
          {
            title: newGoal?.title?.trim(),
            description: newGoal?.description?.trim() || null,
            target_date: newGoal?.target_date || null,
            user_id: user?.id,
            progress: 0
          }
        ])?.select()?.single();

      if (error) {
        console.error('Error creating goal:', error);
        setError('Failed to create goal: ' + (error?.message || 'Unknown error'));
        return;
      }

      // Achievements and points handled by DB triggers (no RPC).

      // Success - refresh goals list and close modal
      await fetchGoals();
      setShowCreateGoal(false);
      setError('');
    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal. Please try again.');
    }
  };

  // Add missing handleDeleteHabit function
  const handleDeleteHabit = async (habitId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        ?.from('habits')
        ?.delete()
        ?.eq('id', habitId)
        ?.eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting habit:', error);
        setError('Failed to delete habit');
        return;
      }

      // Refresh habits list
      await fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit');
    }
  };

  // Add missing handleDeleteGoal function
  const handleDeleteGoal = async (goalId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        ?.from('goals')
        ?.delete()
        ?.eq('id', goalId)
        ?.eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting goal:', error);
        setError('Failed to delete goal');
        return;
      }

      // Refresh goals list
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">Loading your habits and goals...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                  <button 
                    className="text-xs text-red-500 underline mt-1"
                    onClick={() => navigator?.clipboard?.writeText(error)}
                  >
                    Copy error message
                  </button>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError('')}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Habits & Goals</h1>
              <p className="text-muted-foreground">
                Build lasting habits and achieve your goals through consistent tracking.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setError('');
                  setShowCreateGoal(true);
                }}
                iconName="Target"
                iconPosition="left"
                disabled={!user?.id}
              >
                Add Goal
              </Button>
              <Button
                onClick={() => {
                  setError('');
                  setShowCreateHabit(true);
                }}
                iconName="Plus"
                iconPosition="left"
                disabled={!user?.id}
              >
                Create Habit
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Habits Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Your Habits</h2>
                <span className="text-sm text-muted-foreground">
                  {habits?.length} active habit{habits?.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <HabitCards
                habits={habits}
                onDeleteHabit={handleDeleteHabit}
                onToggleHabit={handleToggleHabit}
                onCompleteHabit={() => setShowCreateHabit(true)} // For empty state button
              />
            </div>

            {/* Goals Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Your Goals</h2>
                <span className="text-sm text-muted-foreground">
                  {goals?.length} active goal{goals?.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {goals?.length > 0 ? (
                <GoalProgress
                  goals={goals}
                  onDeleteGoal={handleDeleteGoal}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Target" size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No goals yet</h3>
                  <p className="text-muted-foreground mb-4">Set your first goal to start achieving your aspirations.</p>
                  <Button onClick={() => setShowCreateGoal(true)}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Add Goal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Modals with error state */}
      <CreateHabitModal
        isOpen={showCreateHabit}
        onClose={() => {
          setShowCreateHabit(false);
          setError('');
        }}
        onCreateHabit={handleCreateHabit}
      />
      
      <CreateGoalModal
        isOpen={showCreateGoal}
        onClose={() => {
          setShowCreateGoal(false);
          setError('');
        }}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
};

export default HabitGoalTracker;