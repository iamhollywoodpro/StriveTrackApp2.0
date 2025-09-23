import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsGrid = ({ stats }) => {
  const statItems = [
    {
      id: 'streak',
      label: 'Current Streak',
      value: stats?.currentStreak,
      unit: 'days',
      icon: 'Flame',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'workouts',
      label: 'Total Workouts',
      value: stats?.totalWorkouts,
      unit: 'completed',
      icon: 'Dumbbell',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'photos',
      label: 'Photos Uploaded',
      value: stats?.photosUploaded,
      unit: 'images',
      icon: 'Camera',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'goals',
      label: 'Active Goals',
      value: stats?.activeGoals,
      unit: 'in progress',
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems?.map((item) => (
        <div key={item?.id} className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${item?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={item?.icon} size={24} className={item?.color} strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{item?.value}</div>
              <div className="text-sm text-muted-foreground">{item?.unit}</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{item?.label}</h3>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;