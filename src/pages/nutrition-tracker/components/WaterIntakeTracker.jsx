import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WaterIntakeTracker = ({ currentIntake, targetIntake, onAddWater }) => {
  const percentage = Math.min((currentIntake / targetIntake) * 100, 100);
  const glasses = Math.floor(currentIntake / 250); // Assuming 250ml per glass

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Droplets" size={20} className="mr-2 text-blue-500" />
          Water Intake
        </h3>
        <span className="text-sm text-muted-foreground">{currentIntake}ml / {targetIntake}ml</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Water Level Indicator */}
        <div className="relative w-16 h-32 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500 ease-in-out rounded-full"
            style={{ height: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</span>
          </div>
        </div>

        {/* Glass Icons */}
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[...Array(8)]?.map((_, index) => (
              <div key={index} className="flex justify-center">
                <Icon 
                  name="Wine" 
                  size={24} 
                  className={index < glasses ? 'text-blue-500' : 'text-gray-300'} 
                />
              </div>
            ))}
          </div>
          
          {/* Quick Add Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddWater(250)}
              iconName="Plus"
              iconSize={16}
            >
              250ml
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddWater(500)}
              iconName="Plus"
              iconSize={16}
            >
              500ml
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeTracker;