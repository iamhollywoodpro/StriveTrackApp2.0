import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import ExerciseLibrary from './components/ExerciseLibrary';
import RestTimer from './components/RestTimer';
import ExerciseCard from './components/ExerciseCard';
import WorkoutSummary from './components/WorkoutSummary';
import WorkoutTemplates from './components/WorkoutTemplates';

const WorkoutTracker = () => {
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [showWorkoutTemplates, setShowWorkoutTemplates] = useState(false);
  const [restDuration, setRestDuration] = useState(90);

  // Timer for workout duration
  useEffect(() => {
    let interval = null;
    if (workoutStartTime && currentWorkout) {
      interval = setInterval(() => {
        setWorkoutDuration(Math.floor((Date.now() - workoutStartTime) / 1000 / 60));
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutStartTime, currentWorkout]);

  const startNewWorkout = () => {
    const newWorkout = {
      id: Date.now(),
      name: 'New Workout',
      startTime: new Date(),
      exercises: []
    };
    setCurrentWorkout(newWorkout);
    setWorkoutStartTime(Date.now());
    setWorkoutDuration(0);
  };

  const startFromTemplate = (template) => {
    const newWorkout = {
      id: Date.now(),
      name: template?.name,
      startTime: new Date(),
      exercises: template?.exercises?.map((exerciseName, index) => ({
        id: index + 1,
        name: exerciseName,
        muscleGroup: 'mixed',
        equipment: 'various',
        difficulty: template?.difficulty,
        type: 'strength',
        instructions: `Perform ${exerciseName} with proper form`,
        sets: [{ id: 1, reps: '', weight: '', completed: false, previous: '' }]
      }))
    };
    setCurrentWorkout(newWorkout);
    setWorkoutStartTime(Date.now());
    setWorkoutDuration(0);
    setShowWorkoutTemplates(false);
  };

  const addExerciseToWorkout = (exercise) => {
    if (currentWorkout) {
      const newExercise = {
        ...exercise,
        sets: [{ id: 1, reps: '', weight: '', completed: false, previous: '' }]
      };
      setCurrentWorkout({
        ...currentWorkout,
        exercises: [...currentWorkout?.exercises, newExercise]
      });
    }
    setShowExerciseLibrary(false);
  };

  const updateExerciseSet = (exerciseId, updatedSets) => {
    if (currentWorkout) {
      const updatedExercises = currentWorkout?.exercises?.map(exercise =>
        exercise?.id === exerciseId ? { ...exercise, sets: updatedSets } : exercise
      );
      setCurrentWorkout({
        ...currentWorkout,
        exercises: updatedExercises
      });
    }
  };

  const removeExerciseFromWorkout = (exerciseId) => {
    if (currentWorkout) {
      const updatedExercises = currentWorkout?.exercises?.filter(exercise => exercise?.id !== exerciseId);
      setCurrentWorkout({
        ...currentWorkout,
        exercises: updatedExercises
      });
    }
  };

  const startRestTimer = () => {
    setShowRestTimer(true);
  };

  const completeRestTimer = () => {
    setShowRestTimer(false);
  };

  const skipRestTimer = () => {
    setShowRestTimer(false);
  };

  const finishWorkout = () => {
    if (currentWorkout) {
      const workoutWithDuration = {
        ...currentWorkout,
        duration: workoutDuration,
        endTime: new Date()
      };
      setCurrentWorkout(workoutWithDuration);
      setShowWorkoutSummary(true);
    }
  };

  const saveWorkout = () => {
    // In a real app, this would save to backend
    console.log('Saving workout:', currentWorkout);
    setShowWorkoutSummary(false);
    setCurrentWorkout(null);
    setWorkoutStartTime(null);
    setWorkoutDuration(0);
  };

  const discardWorkout = () => {
    setShowWorkoutSummary(false);
    setCurrentWorkout(null);
    setWorkoutStartTime(null);
    setWorkoutDuration(0);
  };

  const shareWorkout = () => {
    // In a real app, this would share to social media
    console.log('Sharing workout:', currentWorkout);
    alert('Workout shared successfully!');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const recentWorkouts = [
    {
      id: 1,
      name: 'Push Day',
      date: '2025-01-20',
      duration: '52 min',
      exercises: 6,
      volume: '12,450 lbs'
    },
    {
      id: 2,
      name: 'Pull Day',
      date: '2025-01-18',
      duration: '48 min',
      exercises: 5,
      volume: '10,200 lbs'
    },
    {
      id: 3,
      name: 'Leg Day',
      date: '2025-01-16',
      duration: '65 min',
      exercises: 7,
      volume: '15,800 lbs'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Workout Tracker</h1>
              <p className="text-muted-foreground">Track your exercises and monitor your progress</p>
            </div>
            
            {!currentWorkout && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkoutTemplates(true)}
                >
                  <Icon name="BookOpen" size={18} className="mr-2" />
                  Templates
                </Button>
                <Button
                  variant="default"
                  onClick={startNewWorkout}
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Start Workout
                </Button>
              </div>
            )}
          </div>

          {/* Active Workout */}
          {currentWorkout ? (
            <div className="space-y-6">
              {/* Workout Header */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={24} color="white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{currentWorkout?.name}</h2>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={16} />
                          <span>{formatDuration(workoutDuration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="List" size={16} />
                          <span>{currentWorkout?.exercises?.length} exercises</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowExerciseLibrary(true)}
                    >
                      <Icon name="Plus" size={18} className="mr-2" />
                      Add Exercise
                    </Button>
                    <Button
                      variant="default"
                      onClick={finishWorkout}
                      disabled={currentWorkout?.exercises?.length === 0}
                    >
                      <Icon name="Check" size={18} className="mr-2" />
                      Finish
                    </Button>
                  </div>
                </div>
              </div>

              {/* Exercise Cards */}
              {currentWorkout?.exercises?.length > 0 ? (
                <div className="space-y-6">
                  {currentWorkout?.exercises?.map((exercise) => (
                    <ExerciseCard
                      key={exercise?.id}
                      exercise={exercise}
                      onUpdateSet={updateExerciseSet}
                      onRemoveExercise={removeExerciseFromWorkout}
                      onStartRest={startRestTimer}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Icon name="Dumbbell" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No exercises added yet</h3>
                  <p className="text-muted-foreground mb-6">Add exercises from the library to start your workout</p>
                  <Button
                    variant="default"
                    onClick={() => setShowExerciseLibrary(true)}
                  >
                    <Icon name="Plus" size={18} className="mr-2" />
                    Add First Exercise
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* No Active Workout */
            (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Start */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-8 text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon name="Play" size={32} color="white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Train?</h2>
                  <p className="text-muted-foreground mb-6">Start a new workout or choose from your templates</p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={startNewWorkout}
                    >
                      <Icon name="Plus" size={20} className="mr-2" />
                      Start New Workout
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowWorkoutTemplates(true)}
                    >
                      <Icon name="BookOpen" size={20} className="mr-2" />
                      Use Template
                    </Button>
                  </div>
                </div>

                {/* Recent Workouts */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Workouts</h3>
                  <div className="space-y-4">
                    {recentWorkouts?.map((workout) => (
                      <div
                        key={workout?.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Dumbbell" size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{workout?.name}</div>
                            <div className="text-sm text-muted-foreground">{workout?.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">{workout?.duration}</div>
                          <div className="text-xs text-muted-foreground">
                            {workout?.exercises} exercises • {workout?.volume}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link to="/progress-photos">
                      <Button variant="outline" className="w-full">
                        <Icon name="TrendingUp" size={18} className="mr-2" />
                        View All Progress
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">This Week</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name="Calendar" size={16} className="text-primary" />
                        <span className="text-sm text-muted-foreground">Workouts</span>
                      </div>
                      <span className="font-semibold text-foreground">3/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={16} className="text-secondary" />
                        <span className="text-sm text-muted-foreground">Total Time</span>
                      </div>
                      <span className="font-semibold text-foreground">2h 45m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name="TrendingUp" size={16} className="text-accent" />
                        <span className="text-sm text-muted-foreground">Volume</span>
                      </div>
                      <span className="font-semibold text-foreground">38,450 lbs</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowExerciseLibrary(true)}
                      className="w-full justify-start"
                    >
                      <Icon name="Search" size={18} className="mr-3" />
                      Browse Exercises
                    </Button>
                    <Link to="/nutrition-tracker">
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="Apple" size={18} className="mr-3" />
                        Log Nutrition
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="BarChart3" size={18} className="mr-3" />
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>)
          )}
        </div>
      </main>
      {/* Modals */}
      {showExerciseLibrary && (
        <ExerciseLibrary
          onSelectExercise={addExerciseToWorkout}
          onClose={() => setShowExerciseLibrary(false)}
        />
      )}
      {showRestTimer && (
        <RestTimer
          isActive={showRestTimer}
          duration={restDuration}
          onComplete={completeRestTimer}
          onSkip={skipRestTimer}
          onClose={() => setShowRestTimer(false)}
        />
      )}
      {showWorkoutSummary && currentWorkout && (
        <WorkoutSummary
          workout={currentWorkout}
          onSave={saveWorkout}
          onDiscard={discardWorkout}
          onShare={shareWorkout}
        />
      )}
      {showWorkoutTemplates && (
        <WorkoutTemplates
          onSelectTemplate={startFromTemplate}
          onClose={() => setShowWorkoutTemplates(false)}
        />
      )}
    </div>
  );
};

export default WorkoutTracker;