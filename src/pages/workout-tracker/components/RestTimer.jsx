import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RestTimer = ({ isActive, duration = 90, onComplete, onSkip, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
      setIsPaused(false);
    }
  }, [isActive, duration]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            onComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const addTime = (seconds) => {
    setTimeLeft(prev => prev + seconds);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-elevation-3 w-full max-w-md p-8 text-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Rest Timer</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Progress Ring */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`}
                className="text-primary transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Play/Pause */}
          <div className="flex justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsPaused(!isPaused)}
              className="w-24"
            >
              <Icon name={isPaused ? 'Play' : 'Pause'} size={20} />
            </Button>
          </div>

          {/* Time Adjustment */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(-15)}
              disabled={timeLeft <= 15}
            >
              <Icon name="Minus" size={16} className="mr-1" />
              15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(30)}
            >
              <Icon name="Plus" size={16} className="mr-1" />
              30s
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              <Icon name="SkipForward" size={16} className="mr-2" />
              Skip Rest
            </Button>
            <Button
              variant="default"
              onClick={onComplete}
              className="flex-1"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Done
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {isPaused ? 'Timer paused' : timeLeft === 0 ? 'Rest complete!' : 'Rest in progress...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;