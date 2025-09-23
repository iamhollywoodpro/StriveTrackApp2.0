import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateHabitModal = ({ isOpen, onClose, onCreateHabit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'fitness',
    frequency: 'daily',
    target: 1,
    icon: 'Target',
    color: 'bg-blue-500'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'personal', label: 'Personal' },
    { value: 'nutrition', label: 'Nutrition' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' }
  ];

  const icons = [
    'Target', 'Dumbbell', 'Heart', 'Brain', 'BookOpen', 'Coffee',
    'Droplets', 'Sunrise', 'Moon', 'Apple', 'Zap', 'CheckCircle'
  ];

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-orange-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-teal-500', 'bg-lime-500', 'bg-amber-500'
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.title?.trim()) {
      setError('Habit name is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Map form data to database schema fields only
      const habitData = {
        name: formData?.title?.trim(), // Map 'title' to 'name' (database field)
        emoji: formData?.icon ? getEmojiForIcon(formData?.icon) : '💪',
        difficulty: mapFrequencyToDifficulty(formData?.frequency),
        days_of_week: mapFrequencyToDaysOfWeek(formData?.frequency)
      };

      await onCreateHabit?.(habitData);
      
      // Reset form and close modal on success
      setFormData({
        title: '',
        category: 'fitness',
        frequency: 'daily',
        target: 1,
        icon: 'Target',
        color: 'bg-blue-500'
      });
      onClose?.();
    } catch (error) {
      console.error('Error creating habit:', error);
      setError('Failed to create habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced mapping functions
  const mapFrequencyToDifficulty = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Easy';
      case 'weekly': return 'Medium';
      case 'custom': return 'Hard';
      default: return 'Medium';
    }
  };

  const mapFrequencyToDaysOfWeek = (frequency) => {
    switch (frequency) {
      case 'daily': return [0, 1, 2, 3, 4, 5, 6]; // All days
      case 'weekly': return [1, 3, 5]; // Mon, Wed, Fri
      case 'custom': return [0, 1, 2, 3, 4]; // Weekdays
      default: return [0, 1, 2, 3, 4, 5, 6]; // Default to daily
    }
  };

  // Helper function to convert icon names to emojis
  const getEmojiForIcon = (iconName) => {
    const iconEmojiMap = {
      'Target': '🎯',
      'Dumbbell': '🏋️',
      'Heart': '❤️',
      'Brain': '🧠',
      'BookOpen': '📖',
      'Coffee': '☕',
      'Droplets': '💧',
      'Sunrise': '🌅',
      'Moon': '🌙',
      'Apple': '🍎',
      'Zap': '⚡',
      'CheckCircle': '✅'
    };
    return iconEmojiMap?.[iconName] || '💪';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  // Enhanced modal close handler
  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setFormData({
        title: '',
        category: 'fitness',
        frequency: 'daily',
        target: 1,
        icon: 'Target',
        color: 'bg-blue-500'
      });
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" 
          onClick={handleClose}
        ></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Habit</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="rounded-full"
              disabled={isLoading}
              type="button"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                className="text-xs text-red-500 underline mt-1"
                onClick={() => navigator?.clipboard?.writeText(error)}
              >
                Copy error message
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Habit Name *
              </label>
              <Input
                type="text"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                placeholder="e.g., Daily workout, Read for 30 minutes"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <Select
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                options={[
                  { value: 'fitness', label: 'Fitness' },
                  { value: 'wellness', label: 'Wellness' },
                  { value: 'personal', label: 'Personal' },
                  { value: 'nutrition', label: 'Nutrition' }
                ]}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Frequency
                </label>
                <Select
                  value={formData?.frequency}
                  onChange={(value) => handleInputChange('frequency', value)}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'custom', label: 'Custom' }
                  ]}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target
                </label>
                <Input
                  type="number"
                  value={formData?.target}
                  onChange={(e) => handleInputChange('target', parseInt(e?.target?.value) || 1)}
                  min="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {['Target', 'Dumbbell', 'Heart', 'Brain', 'BookOpen', 'Coffee',
                  'Droplets', 'Sunrise', 'Moon', 'Apple', 'Zap', 'CheckCircle']?.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleInputChange('icon', iconName)}
                    disabled={isLoading}
                    className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData?.icon === iconName ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <Icon name={iconName} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData?.title?.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHabitModal;