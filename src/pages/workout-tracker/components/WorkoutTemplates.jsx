import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const WorkoutTemplates = ({ onSelectTemplate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'Push Day',
      category: 'strength',
      duration: '45-60 min',
      difficulty: 'Intermediate',
      exercises: [
        'Bench Press',
        'Shoulder Press',
        'Incline Dumbbell Press',
        'Lateral Raises',
        'Tricep Dips',
        'Push-ups'
      ],
      description: 'Focus on chest, shoulders, and triceps',
      lastUsed: '2 days ago'
    },
    {
      id: 2,
      name: 'Pull Day',
      category: 'strength',
      duration: '45-60 min',
      difficulty: 'Intermediate',
      exercises: [
        'Pull-ups',
        'Deadlift',
        'Dumbbell Rows',
        'Lat Pulldowns',
        'Barbell Curls',
        'Face Pulls'
      ],
      description: 'Focus on back and biceps',
      lastUsed: '4 days ago'
    },
    {
      id: 3,
      name: 'Leg Day',
      category: 'strength',
      duration: '60-75 min',
      difficulty: 'Advanced',
      exercises: [
        'Squats',
        'Romanian Deadlift',
        'Leg Press',
        'Walking Lunges',
        'Calf Raises',
        'Leg Curls'
      ],
      description: 'Complete lower body workout',
      lastUsed: '1 week ago'
    },
    {
      id: 4,
      name: 'HIIT Cardio',
      category: 'cardio',
      duration: '20-30 min',
      difficulty: 'Beginner',
      exercises: [
        'Jumping Jacks',
        'Burpees',
        'Mountain Climbers',
        'High Knees',
        'Plank Jacks',
        'Rest Intervals'
      ],
      description: 'High-intensity interval training',
      lastUsed: 'Never'
    },
    {
      id: 5,
      name: 'Full Body Beginner',
      category: 'strength',
      duration: '30-45 min',
      difficulty: 'Beginner',
      exercises: [
        'Bodyweight Squats',
        'Push-ups',
        'Plank',
        'Glute Bridges',
        'Wall Sit',
        'Arm Circles'
      ],
      description: 'Perfect for getting started',
      lastUsed: 'Never'
    },
    {
      id: 6,
      name: 'Core Blast',
      category: 'core',
      duration: '15-25 min',
      difficulty: 'Intermediate',
      exercises: [
        'Plank',
        'Russian Twists',
        'Bicycle Crunches',
        'Dead Bug',
        'Mountain Climbers',
        'Leg Raises'
      ],
      description: 'Targeted core strengthening',
      lastUsed: '3 days ago'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'core', label: 'Core' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         template?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-50';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'Advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'strength': return 'Dumbbell';
      case 'cardio': return 'Heart';
      case 'core': return 'Target';
      default: return 'Activity';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Workout Templates</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
              />
            </div>
            <div className="flex space-x-2">
              {categories?.map((category) => (
                <Button
                  key={category?.value}
                  variant={selectedCategory === category?.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category?.value)}
                >
                  {category?.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates?.map((template) => (
              <div
                key={template?.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-all duration-200"
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getCategoryIcon(template?.category)} size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{template?.name}</h3>
                      <p className="text-sm text-muted-foreground">{template?.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template?.difficulty)}`}>
                    {template?.difficulty}
                  </span>
                </div>

                {/* Template Info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={16} />
                    <span>{template?.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="List" size={16} />
                    <span>{template?.exercises?.length} exercises</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={16} />
                    <span>Last used: {template?.lastUsed}</span>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Exercises:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template?.exercises?.slice(0, 4)?.map((exercise, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded"
                      >
                        {exercise}
                      </span>
                    ))}
                    {template?.exercises?.length > 4 && (
                      <span className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded">
                        +{template?.exercises?.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="default"
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Start Workout
                </Button>
              </div>
            ))}
          </div>

          {filteredTemplates?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTemplates;