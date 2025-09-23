import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'photo',
      label: 'Upload Progress Photo',
      description: 'Document your transformation',
      icon: 'Camera',
      variant: 'default',
      onClick: () => navigate('/progress-photos')
    },
    {
      id: 'workout',
      label: 'Log Workout',
      description: 'Track your training session',
      icon: 'Dumbbell',
      variant: 'outline',
      onClick: () => navigate('/workout-tracker')
    },
    {
      id: 'meal',
      label: 'Track Meal',
      description: 'Log your nutrition intake',
      icon: 'Apple',
      variant: 'outline',
      onClick: () => navigate('/nutrition-tracker')
    },
    {
      id: 'goal',
      label: 'Set New Goal',
      description: 'Define your next milestone',
      icon: 'Target',
      variant: 'secondary',
      onClick: () => navigate('/dashboard') // Will be updated when goals page is created
    }
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            onClick={action?.onClick}
            iconName={action?.icon}
            iconPosition="left"
            className="h-auto p-4 justify-start text-left"
            fullWidth
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{action?.label}</span>
              <span className="text-xs opacity-70 mt-1">{action?.description}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;