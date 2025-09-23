import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ExerciseCard = ({ exercise, onUpdateSet, onRemoveExercise, onStartRest }) => {
  const [sets, setSets] = useState(exercise?.sets || [
    { id: 1, reps: '', weight: '', completed: false, previous: '12 x 135 lbs' }
  ]);

  const addSet = () => {
    const newSet = {
      id: sets?.length + 1,
      reps: '',
      weight: '',
      completed: false,
      previous: sets?.length > 0 ? sets?.[sets?.length - 1]?.previous : ''
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (setId, field, value) => {
    const updatedSets = sets?.map(set => 
      set?.id === setId ? { ...set, [field]: value } : set
    );
    setSets(updatedSets);
    onUpdateSet(exercise?.id, updatedSets);
  };

  const completeSet = (setId) => {
    const updatedSets = sets?.map(set => 
      set?.id === setId ? { ...set, completed: !set?.completed } : set
    );
    setSets(updatedSets);
    onUpdateSet(exercise?.id, updatedSets);
    
    // Start rest timer after completing a set
    if (!sets?.find(s => s?.id === setId)?.completed) {
      onStartRest();
    }
  };

  const removeSet = (setId) => {
    if (sets?.length > 1) {
      const updatedSets = sets?.filter(set => set?.id !== setId);
      setSets(updatedSets);
      onUpdateSet(exercise?.id, updatedSets);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-50';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'Advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      {/* Exercise Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-foreground">{exercise?.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise?.difficulty)}`}>
              {exercise?.difficulty}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Target" size={16} />
              <span className="capitalize">{exercise?.muscleGroup}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Dumbbell" size={16} />
              <span className="capitalize">{exercise?.equipment?.replace('-', ' ')}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveExercise(exercise?.id)}
          className="text-destructive hover:text-destructive"
        >
          <Icon name="Trash2" size={18} />
        </Button>
      </div>
      {/* Sets Table */}
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
          <div className="col-span-1">Set</div>
          <div className="col-span-3">Previous</div>
          <div className="col-span-2">Reps</div>
          <div className="col-span-3">Weight</div>
          <div className="col-span-2">Actions</div>
          <div className="col-span-1">✓</div>
        </div>

        {/* Sets */}
        {sets?.map((set, index) => (
          <div key={set?.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-center font-medium text-foreground">
              {index + 1}
            </div>
            
            <div className="col-span-3 text-sm text-muted-foreground">
              {set?.previous || '—'}
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="0"
                value={set?.reps}
                onChange={(e) => updateSet(set?.id, 'reps', e?.target?.value)}
                className="text-center"
              />
            </div>
            
            <div className="col-span-3">
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  placeholder="0"
                  value={set?.weight}
                  onChange={(e) => updateSet(set?.id, 'weight', e?.target?.value)}
                  className="text-center"
                />
                <span className="text-sm text-muted-foreground">lbs</span>
              </div>
            </div>
            
            <div className="col-span-2 flex items-center space-x-1">
              {sets?.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSet(set?.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Icon name="Minus" size={14} />
                </Button>
              )}
            </div>
            
            <div className="col-span-1 text-center">
              <Button
                variant={set?.completed ? "default" : "outline"}
                size="icon"
                onClick={() => completeSet(set?.id)}
                className="h-8 w-8"
              >
                <Icon name="Check" size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Add Set Button */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={addSet}
          className="w-full"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Set
        </Button>
      </div>
      {/* Exercise Notes */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Instructions:</strong> {exercise?.instructions}
        </p>
      </div>
    </div>
  );
};

export default ExerciseCard;