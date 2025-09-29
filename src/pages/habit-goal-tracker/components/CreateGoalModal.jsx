import React, { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const CreateGoalModal = ({ isOpen, onClose, onCreateGoal }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });



  const handleSubmit = (e) => {
    e?.preventDefault();
    if (formData?.title?.trim()) {
      onCreateGoal?.(formData);
      setFormData({
        title: '',
        description: '',
        deadline: ''
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
                Goal Title *
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
                Description (optional)
              </label>
              <Input
                type="text"
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                placeholder="Add details about your goal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Date (optional)
              </label>
              <Input
                type="date"
                value={formData?.deadline}
                onChange={(e) => handleInputChange('deadline', e?.target?.value)}
                min={today}
              />
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