import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkoutSummary = ({ workout, onSave, onDiscard, onShare }) => {
  const calculateTotalVolume = () => {
    let totalVolume = 0;
    workout?.exercises?.forEach(exercise => {
      if (exercise?.sets) {
        exercise?.sets?.forEach(set => {
          if (set?.completed && set?.reps && set?.weight) {
            totalVolume += parseInt(set?.reps) * parseFloat(set?.weight);
          }
        });
      }
    });
    return totalVolume;
  };

  const calculateTotalSets = () => {
    let totalSets = 0;
    workout?.exercises?.forEach(exercise => {
      if (exercise?.sets) {
        totalSets += exercise?.sets?.filter(set => set?.completed)?.length;
      }
    });
    return totalSets;
  };

  const calculateEstimatedCalories = () => {
    const duration = workout?.duration || 45; // minutes
    const intensity = 6; // METs for weight training
    const weight = 70; // kg (average)
    return Math.round((intensity * weight * duration) / 60);
  };

  const calculatePointsEarned = () => {
    const baseSets = calculateTotalSets();
    const volumeBonus = Math.floor(calculateTotalVolume() / 1000);
    const durationBonus = Math.floor((workout?.duration || 45) / 15);
    return (baseSets * 5) + volumeBonus + durationBonus;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Icon name="Trophy" size={24} color="white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Workout Complete!</h2>
              <p className="text-muted-foreground">Great job on finishing your workout</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Icon name="Clock" size={24} className="mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(workout?.duration || 45)}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Icon name="Zap" size={24} className="mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-foreground">
                {calculateTotalSets()}
              </div>
              <div className="text-sm text-muted-foreground">Sets Completed</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Icon name="TrendingUp" size={24} className="mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-foreground">
                {calculateTotalVolume()?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Volume (lbs)</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Icon name="Flame" size={24} className="mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-foreground">
                {calculateEstimatedCalories()}
              </div>
              <div className="text-sm text-muted-foreground">Est. Calories</div>
            </div>
          </div>

          {/* Points Earned */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Points Earned</h3>
                <p className="text-sm text-muted-foreground">Added to your total score</p>
              </div>
              <div className="text-3xl font-bold text-primary">
                +{calculatePointsEarned()}
              </div>
            </div>
          </div>

          {/* Exercise Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Exercises Completed</h3>
            <div className="space-y-3">
              {workout?.exercises?.map((exercise, index) => {
                const completedSets = exercise?.sets?.filter(set => set?.completed)?.length || 0;
                let totalSets = exercise?.sets?.length || 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Dumbbell" size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{exercise?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {completedSets}/{totalSets} sets completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {completedSets > 0 ? 'Completed' : 'Skipped'}
                      </div>
                      {completedSets > 0 && (
                        <Icon name="CheckCircle" size={16} className="text-success ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              variant="default"
              onClick={onSave}
              className="flex-1"
            >
              <Icon name="Save" size={18} className="mr-2" />
              Save Workout
            </Button>
            
            <Button
              variant="outline"
              onClick={onShare}
              className="flex-1"
            >
              <Icon name="Share2" size={18} className="mr-2" />
              Share Progress
            </Button>
            
            <Button
              variant="ghost"
              onClick={onDiscard}
              className="text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;