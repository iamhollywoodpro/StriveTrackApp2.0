import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const GoalDeadlines = ({ goals }) => {
  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 3) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 7) return 'text-orange-600 bg-orange-50';
    if (daysRemaining <= 14) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Deadlines</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {goals?.map((goal) => {
          const daysRemaining = getDaysRemaining(goal?.deadline);
          return (
            <div key={goal?.id} className="p-4 rounded-lg border border-border hover:shadow-elevation-1 transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    {goal?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {goal?.description}
                  </p>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(daysRemaining)}`}>
                  {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{goal?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal?.progress)}`}
                    style={{ width: `${Math.min(goal?.progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Icon name="Target" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Target: {goal?.target} {goal?.unit}
                  </span>
                </div>
                <button className="text-xs text-primary hover:text-primary/80 font-medium">
                  Update Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {goals?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Target" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No active goals with deadlines</p>
          <Button variant="outline" size="sm">
            Set Your First Goal
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoalDeadlines;