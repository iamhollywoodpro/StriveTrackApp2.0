import React, { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const GoalProgress = ({ goals, onDeleteGoal }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState(0);

  const getProgressPercentage = (goal) => {
    if (!goal?.progress && !goal?.currentValue) return 0;
    const current = goal?.currentValue || goal?.progress || 0;
    const target = goal?.target || 100;
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const targetDate = new Date(deadline);
    const today = new Date();
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 30) return 'text-orange-600';
    if (daysLeft <= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date)?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setProgressUpdate(goal?.progress || 0);
    setShowUpdateModal(true);
  };

  const handleProgressUpdate = () => {
    // Here you would call a function to update the goal progress
    // For now, just close the modal
    setShowUpdateModal(false);
    setSelectedGoal(null);
  };

  if (!goals?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Target" size={24} color="text-muted-foreground" className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No goals yet</h3>
        <p className="text-muted-foreground mb-4">Set your first goal to start achieving your aspirations.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          {goals?.map((goal) => {
            const progressPercentage = getProgressPercentage(goal);
            const daysRemaining = getDaysRemaining(goal?.targetDate);
            
            return (
              <div
                key={goal?.id}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGoalClick(goal)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Icon name="Target" size={20} color="white" className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{goal?.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {Math.round(progressPercentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation(); // Prevent goal click when deleting
                        onDeleteGoal?.(goal?.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      <Icon name="Trash2" size={14} color="red-600" />
                    </Button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}% complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getUrgencyColor(daysRemaining)}`}>
                        {daysRemaining > 0 ? daysRemaining : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Days left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">
                        {formatDate(goal?.targetDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">Deadline</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Click to update progress
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Goals Overview */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Goals Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {goals?.filter(g => getProgressPercentage(g) >= 100)?.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {goals?.filter(g => getProgressPercentage(g) >= 50 && getProgressPercentage(g) < 100)?.length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {goals?.filter(g => getDaysRemaining(g?.targetDate) <= 30 && getDaysRemaining(g?.targetDate) > 0)?.length}
              </div>
              <div className="text-sm text-muted-foreground">Due Soon</div>
            </div>
          </div>
        </div>
      </div>
      {/* Progress Update Modal */}
      {showUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update Goal Progress</h2>
              <p className="text-sm text-muted-foreground mb-4">{selectedGoal?.title}</p>
              
              <Input
                label={`Progress (Current: ${selectedGoal?.progress || 0}%)`}
                type="number"
                min="0"
                max="100"
                value={progressUpdate}
                onChange={(e) => setProgressUpdate(Number(e?.target?.value))}
                className="mb-4"
              />
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowUpdateModal(false)} fullWidth>
                  Cancel
                </Button>
                <Button onClick={handleProgressUpdate} fullWidth>
                  Update Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoalProgress;