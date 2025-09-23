import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateGoalModal = ({ isOpen, onClose, onCreateGoal }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'fitness',
    target: '',
    unit: '',
    deadline: '',
    icon: 'Target',
    color: 'bg-blue-500'
  });

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'personal', label: 'Personal' },
    { value: 'nutrition', label: 'Nutrition' }
  ];

  const icons = [
    'Target', 'TrendingUp', 'Award', 'Zap', 'Star', 'Trophy',
    'BookOpen', 'Heart', 'Brain', 'Dumbbell', 'Apple', 'CheckCircle'
  ];

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-orange-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-teal-500', 'bg-lime-500', 'bg-amber-500'
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (formData?.title?.trim() && formData?.target && formData?.deadline) {
      onCreateGoal?.({
        ...formData,
        target: parseFloat(formData?.target),
        deadline: new Date(formData?.deadline)
      });
      setFormData({
        title: '',
        category: 'fitness',
        target: '',
        unit: '',
        deadline: '',
        icon: 'Target',
        color: 'bg-blue-500'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date()?.toISOString()?.split('T')?.[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Create New Goal</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Goal Title
              </label>
              <Input
                type="text"
                value={formData?.title}
                onChange={(e) => handleInputChange('title', e?.target?.value)}
                placeholder="e.g., Lose 20 pounds, Run 5K under 25 minutes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Select
                value={formData?.category}
                onChange={(e) => handleInputChange('category', e?.target?.value)}
                options={categories}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Value
                </label>
                <Input
                  type="number"
                  value={formData?.target}
                  onChange={(e) => handleInputChange('target', e?.target?.value)}
                  placeholder="20"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unit
                </label>
                <Input
                  type="text"
                  value={formData?.unit}
                  onChange={(e) => handleInputChange('unit', e?.target?.value)}
                  placeholder="lbs, minutes, books"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Deadline
              </label>
              <Input
                type="date"
                value={formData?.deadline}
                onChange={(e) => handleInputChange('deadline', e?.target?.value)}
                min={today}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {icons?.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleInputChange('icon', iconName)}
                    className={`p-2 rounded-lg border border-border hover:bg-muted transition-colors ${
                      formData?.icon === iconName ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <Icon name={iconName} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors?.map((colorClass) => (
                  <button
                    key={colorClass}
                    type="button"
                    onClick={() => handleInputChange('color', colorClass)}
                    className={`w-8 h-8 rounded-lg ${colorClass} ${
                      formData?.color === colorClass ? 'ring-2 ring-foreground ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Goal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;