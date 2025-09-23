import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ExerciseLibrary = ({ onSelectExercise, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  const muscleGroupOptions = [
    { value: '', label: 'All Muscle Groups' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'arms', label: 'Arms' },
    { value: 'legs', label: 'Legs' },
    { value: 'core', label: 'Core' },
    { value: 'cardio', label: 'Cardio' }
  ];

  const equipmentOptions = [
    { value: '', label: 'All Equipment' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'machine', label: 'Machine' },
    { value: 'cable', label: 'Cable' },
    { value: 'cardio-machine', label: 'Cardio Machine' }
  ];

  const exercises = [
    {
      id: 1,
      name: 'Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      difficulty: 'Intermediate',
      type: 'strength',
      instructions: 'Lie on bench, grip bar wider than shoulders, lower to chest, press up'
    },
    {
      id: 2,
      name: 'Squats',
      muscleGroup: 'legs',
      equipment: 'barbell',
      difficulty: 'Beginner',
      type: 'strength',
      instructions: 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'
    },
    {
      id: 3,
      name: 'Pull-ups',
      muscleGroup: 'back',
      equipment: 'bodyweight',
      difficulty: 'Advanced',
      type: 'strength',
      instructions: 'Hang from bar, pull body up until chin over bar, lower with control'
    },
    {
      id: 4,
      name: 'Push-ups',
      muscleGroup: 'chest',
      equipment: 'bodyweight',
      difficulty: 'Beginner',
      type: 'strength',
      instructions: 'Start in plank position, lower chest to ground, push back up'
    },
    {
      id: 5,
      name: 'Deadlift',
      muscleGroup: 'back',
      equipment: 'barbell',
      difficulty: 'Advanced',
      type: 'strength',
      instructions: 'Stand with feet hip-width, grip bar, lift by extending hips and knees'
    },
    {
      id: 6,
      name: 'Running',
      muscleGroup: 'cardio',
      equipment: 'cardio-machine',
      difficulty: 'Beginner',
      type: 'cardio',
      instructions: 'Maintain steady pace, focus on breathing and form'
    },
    {
      id: 7,
      name: 'Dumbbell Rows',
      muscleGroup: 'back',
      equipment: 'dumbbells',
      difficulty: 'Intermediate',
      type: 'strength',
      instructions: 'Bend over, pull dumbbell to hip, squeeze shoulder blade'
    },
    {
      id: 8,
      name: 'Shoulder Press',
      muscleGroup: 'shoulders',
      equipment: 'dumbbells',
      difficulty: 'Intermediate',
      type: 'strength',
      instructions: 'Press dumbbells overhead from shoulder height, lower with control'
    }
  ];

  const filteredExercises = exercises?.filter(exercise => {
    const matchesSearch = exercise?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || exercise?.muscleGroup === selectedMuscleGroup;
    const matchesEquipment = !selectedEquipment || exercise?.equipment === selectedEquipment;
    return matchesSearch && matchesMuscleGroup && matchesEquipment;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-50';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'Advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Exercise Library</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="search"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
            <Select
              placeholder="Filter by muscle group"
              options={muscleGroupOptions}
              value={selectedMuscleGroup}
              onChange={setSelectedMuscleGroup}
            />
            <Select
              placeholder="Filter by equipment"
              options={equipmentOptions}
              value={selectedEquipment}
              onChange={setSelectedEquipment}
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises?.map((exercise) => (
              <div
                key={exercise?.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-all duration-200 cursor-pointer"
                onClick={() => onSelectExercise(exercise)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{exercise?.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise?.difficulty)}`}>
                    {exercise?.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={16} />
                    <span className="capitalize">{exercise?.muscleGroup}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Dumbbell" size={16} />
                    <span className="capitalize">{exercise?.equipment?.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name={exercise?.type === 'cardio' ? 'Heart' : 'Zap'} size={16} />
                    <span className="capitalize">{exercise?.type}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {exercise?.instructions}
                </p>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Add to Workout
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredExercises?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No exercises found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;