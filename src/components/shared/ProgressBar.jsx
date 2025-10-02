import React from 'react';

function ProgressBar({ 
  current, 
  target, 
  label, 
  showPercentage = true, 
  showNumbers = true,
  color = 'primary',
  size = 'medium'
}) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  return (
    <div className="w-full">
      {/* Label and Numbers */}
      {(label || showNumbers) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {showNumbers && (
            <span className="text-sm text-slate-600">
              {current.toLocaleString()} / {target.toLocaleString()}
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      <div className={`w-full bg-slate-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Percentage */}
      {showPercentage && (
        <div className="text-right mt-1">
          <span className="text-xs text-slate-500">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;