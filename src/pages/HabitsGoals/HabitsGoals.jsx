import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import Modal from '../../components/shared/Modal';
import ProgressBar from '../../components/shared/ProgressBar';
import HabitChart from '../../components/charts/HabitChart';
import WeeklyHabitTracker from '../../components/habits/WeeklyHabitTracker';
import { generateEmojiSuggestions, getBestEmojiSuggestion, emojiCategories } from '../../utils/emojiGenerator';

function HabitsGoals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('habits');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [habitForm, setHabitForm] = useState({
    title: '',
    description: '',
    frequency: 'daily', // daily, weekly, monthly
    target_count: 1,
    category: 'fitness',
    icon: '💪'
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: 0,
    unit: '',
    deadline: '',
    category: 'fitness',
    icon: '🎯'
  });

  // Sample data (replace with Cloudflare API calls)
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    setHabits([
      {
        id: 1,
        title: 'Morning Workout',
        description: 'Complete 30-minute workout session',
        frequency: 'daily',
        target_count: 7,
        current_count: 5,
        category: 'fitness',
        icon: '💪',
        streak: 12,
        created_at: '2024-09-15'
      },
      {
        id: 2,
        title: 'Drink Water',
        description: 'Drink 8 glasses of water',
        frequency: 'daily',
        target_count: 8,
        current_count: 6,
        category: 'health',
        icon: '💧',
        streak: 25,
        created_at: '2024-09-10'
      },
      {
        id: 3,
        title: 'Read Fitness Articles',
        description: 'Read fitness and health articles',
        frequency: 'weekly',
        target_count: 3,
        current_count: 2,
        category: 'learning',
        icon: '📚',
        streak: 8,
        created_at: '2024-09-01'
      }
    ]);

    setGoals([
      {
        id: 1,
        title: 'Lose Weight',
        description: 'Reach target weight for summer',
        target_value: 15,
        current_value: 8.5,
        unit: 'lbs',
        deadline: '2024-12-31',
        category: 'fitness',
        icon: '⚖️',
        created_at: '2024-09-01'
      },
      {
        id: 2,
        title: 'Run Marathon',
        description: 'Complete a full marathon',
        target_value: 26.2,
        current_value: 18.3,
        unit: 'miles',
        deadline: '2024-11-15',
        category: 'fitness',
        icon: '🏃‍♀️',
        created_at: '2024-08-15'
      },
      {
        id: 3,
        title: 'Build Muscle',
        description: 'Gain lean muscle mass',
        target_value: 10,
        current_value: 6.2,
        unit: 'lbs',
        deadline: '2024-12-01',
        category: 'fitness',
        icon: '💪',
        created_at: '2024-09-05'
      }
    ]);
  };

  const categories = [
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘‍♀️' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const icons = ['💪', '🏃‍♀️', '🚴‍♂️', '🏋️‍♀️', '🧘‍♀️', '💧', '🥗', '📚', '🎯', '⚖️', '❤️', '🔥'];

  const openModal = (type, item = null) => {
    setEditingItem(item);
    if (type === 'habit') {
      setHabitForm(item || {
        title: '',
        description: '',
        frequency: 'daily',
        target_count: 1,
        category: 'fitness',
        icon: '💪'
      });
    } else {
      setGoalForm(item || {
        title: '',
        description: '',
        target_value: '',
        current_value: 0,
        unit: '',
        deadline: '',
        category: 'fitness',
        icon: '🎯'
      });
    }
    setShowModal(true);
  };

  // Auto-generate emoji when title changes
  const handleTitleChange = (type, title) => {
    const bestEmoji = getBestEmojiSuggestion(title);
    
    if (type === 'habit') {
      setHabitForm(prev => ({
        ...prev,
        title,
        icon: title.trim() ? bestEmoji : '💪'
      }));
    } else {
      setGoalForm(prev => ({
        ...prev,
        title,
        icon: title.trim() ? bestEmoji : '🎯'
      }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const saveHabit = () => {
    if (!habitForm.title.trim()) return;
    
    if (editingItem) {
      setHabits(habits.map(h => h.id === editingItem.id ? { ...h, ...habitForm } : h));
    } else {
      const newHabit = {
        ...habitForm,
        id: Date.now(),
        current_count: 0,
        streak: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setHabits([...habits, newHabit]);
    }
    closeModal();
  };

  const saveGoal = () => {
    if (!goalForm.title.trim() || !goalForm.target_value) return;
    
    if (editingItem) {
      setGoals(goals.map(g => g.id === editingItem.id ? { ...g, ...goalForm } : g));
    } else {
      const newGoal = {
        ...goalForm,
        id: Date.now(),
        created_at: new Date().toISOString().split('T')[0]
      };
      setGoals([...goals, newGoal]);
    }
    closeModal();
  };

  const updateHabitProgress = (habitId, increment = true) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCount = increment 
          ? Math.min(habit.current_count + 1, habit.target_count)
          : Math.max(habit.current_count - 1, 0);
        return { ...habit, current_count: newCount };
      }
      return habit;
    }));
  };

  const updateGoalProgress = (goalId, newValue) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, current_value: Math.max(0, newValue) };
      }
      return goal;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-slate-400 hover:text-slate-600 mr-4">
                ←
              </a>
              <h1 className="text-xl font-bold text-slate-900">Habits & Goals</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">Welcome, {user?.full_name || user?.email}!</span>
              <button 
                onClick={() => openModal(activeTab === 'habits' ? 'habit' : 'goal')}
                className="btn btn-primary"
              >
                + Add {activeTab === 'habits' ? 'Habit' : 'Goal'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'habits' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔄 Habits ({habits.length})
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'goals' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎯 Goals ({goals.length})
          </button>
        </div>

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Daily Habits</h2>
              <p className="text-slate-600">Build consistency with daily, weekly, and monthly habits</p>
            </div>

            {/* Weekly Habit Trackers */}
            {habits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">This Week's Progress</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {habits.slice(0, 4).map(habit => (
                    <WeeklyHabitTracker 
                      key={habit.id} 
                      habit={habit} 
                      onUpdateProgress={(habitId, date, completed) => {
                        console.log('Update habit progress:', habitId, date, completed);
                        // TODO: API call to update progress
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Habit Analytics */}
            {habits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Long-term Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {habits.slice(0, 2).map(habit => (
                    <HabitChart key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => (
                <div key={habit.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{habit.title}</h3>
                        <p className="text-sm text-slate-600">{habit.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal('habit', habit)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ⚙️
                    </button>
                  </div>

                  <div className="mb-4">
                    <ProgressBar
                      current={habit.current_count}
                      target={habit.target_count}
                      label={`${habit.frequency} progress`}
                      color="green"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{habit.streak}</p>
                        <p className="text-xs text-slate-500">day streak</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{habit.current_count}</p>
                        <p className="text-xs text-slate-500">today</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateHabitProgress(habit.id, false)}
                        disabled={habit.current_count === 0}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateHabitProgress(habit.id, true)}
                        disabled={habit.current_count >= habit.target_count}
                        className="w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="inline-block bg-slate-100 px-2 py-1 rounded-full">
                      {categories.find(c => c.value === habit.category)?.label}
                    </span>
                  </div>
                </div>
              ))}

              {habits.length === 0 && (
                <div className="col-span-full card p-12 text-center">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No habits yet</h3>
                  <p className="text-slate-600 mb-4">Start building healthy habits today!</p>
                  <button
                    onClick={() => openModal('habit')}
                    className="btn btn-primary"
                  >
                    Create Your First Habit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Fitness Goals</h2>
              <p className="text-slate-600">Track your long-term objectives and milestones</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {goals.map(goal => (
                <div key={goal.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                        <p className="text-sm text-slate-600">{goal.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal('goal', goal)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ⚙️
                    </button>
                  </div>

                  <div className="mb-4">
                    <ProgressBar
                      current={goal.current_value}
                      target={goal.target_value}
                      label={`Progress (${goal.unit})`}
                      color="blue"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-700">Current:</label>
                      <input
                        type="number"
                        value={goal.current_value}
                        onChange={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                        step="0.1"
                      />
                      <span className="text-sm text-slate-600">{goal.unit}</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="inline-block bg-slate-100 px-2 py-1 rounded-full">
                      {categories.find(c => c.value === goal.category)?.label}
                    </span>
                  </div>
                </div>
              ))}

              {goals.length === 0 && (
                <div className="col-span-full card p-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No goals set</h3>
                  <p className="text-slate-600 mb-4">Set your first fitness goal and start tracking progress!</p>
                  <button
                    onClick={() => openModal('goal')}
                    className="btn btn-primary"
                  >
                    Create Your First Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal for Adding/Editing */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={`${editingItem ? 'Edit' : 'Add'} ${activeTab === 'habits' ? 'Habit' : 'Goal'}`}
        size="medium"
      >
        {activeTab === 'habits' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={habitForm.title}
                onChange={(e) => handleTitleChange('habit', e.target.value)}
                placeholder="e.g., Take your vitamins, Morning workout, Drink water"
                className="input w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Emoji will be auto-suggested based on your title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={habitForm.description}
                onChange={(e) => setHabitForm({...habitForm, description: e.target.value})}
                placeholder="Describe your habit..."
                className="input w-full h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                <select
                  value={habitForm.frequency}
                  onChange={(e) => setHabitForm({...habitForm, frequency: e.target.value})}
                  className="input w-full"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Count</label>
                <input
                  type="number"
                  value={habitForm.target_count}
                  onChange={(e) => setHabitForm({...habitForm, target_count: parseInt(e.target.value) || 1})}
                  min="1"
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={habitForm.category}
                onChange={(e) => setHabitForm({...habitForm, category: e.target.value})}
                className="input w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Icon {habitForm.title && (
                  <span className="text-xs text-green-600">(auto-suggested: {getBestEmojiSuggestion(habitForm.title)})</span>
                )}
              </label>
              
              {/* Auto-suggestions first */}
              {habitForm.title && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-2">Suggested for "{habitForm.title}":</p>
                  <div className="flex flex-wrap gap-2">
                    {generateEmojiSuggestions(habitForm.title).slice(0, 8).map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setHabitForm({...habitForm, icon: emoji})}
                        className={`p-2 text-xl border rounded-lg hover:bg-slate-50 transition-all ${
                          habitForm.icon === emoji ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200'
                        }`}
                        title={`Use ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual selection */}
              <p className="text-xs text-slate-600 mb-2">Or choose manually:</p>
              <div className="grid grid-cols-8 gap-2">
                {Object.values(emojiCategories).flat().slice(0, 16).map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setHabitForm({...habitForm, icon})}
                    className={`p-2 text-lg border rounded-lg hover:bg-slate-50 transition-all ${
                      habitForm.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveHabit} className="btn btn-primary">
                {editingItem ? 'Update' : 'Create'} Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={goalForm.title}
                onChange={(e) => handleTitleChange('goal', e.target.value)}
                placeholder="e.g., Lose weight, Run marathon, Build muscle"
                className="input w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Emoji will be auto-suggested based on your title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                placeholder="Describe your goal..."
                className="input w-full h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Value</label>
                <input
                  type="number"
                  value={goalForm.target_value}
                  onChange={(e) => setGoalForm({...goalForm, target_value: parseFloat(e.target.value) || ''})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={goalForm.current_value}
                  onChange={(e) => setGoalForm({...goalForm, current_value: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  step="0.1"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={goalForm.unit}
                  onChange={(e) => setGoalForm({...goalForm, unit: e.target.value})}
                  placeholder="lbs, miles, etc."
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm({...goalForm, category: e.target.value})}
                className="input w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Icon {goalForm.title && (
                  <span className="text-xs text-green-600">(auto-suggested: {getBestEmojiSuggestion(goalForm.title)})</span>
                )}
              </label>
              
              {/* Auto-suggestions first */}
              {goalForm.title && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-2">Suggested for "{goalForm.title}":</p>
                  <div className="flex flex-wrap gap-2">
                    {generateEmojiSuggestions(goalForm.title).slice(0, 8).map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setGoalForm({...goalForm, icon: emoji})}
                        className={`p-2 text-xl border rounded-lg hover:bg-slate-50 transition-all ${
                          goalForm.icon === emoji ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200'
                        }`}
                        title={`Use ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual selection */}
              <p className="text-xs text-slate-600 mb-2">Or choose manually:</p>
              <div className="grid grid-cols-8 gap-2">
                {Object.values(emojiCategories).flat().slice(0, 16).map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setGoalForm({...goalForm, icon})}
                    className={`p-2 text-lg border rounded-lg hover:bg-slate-50 transition-all ${
                      goalForm.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveGoal} className="btn btn-primary">
                {editingItem ? 'Update' : 'Create'} Goal
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default HabitsGoals;