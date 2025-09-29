import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const QuickAddDropdown = ({ onSelectMeal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
    { value: 'lunch', label: 'Lunch', icon: 'Utensils' },
    { value: 'dinner', label: 'Dinner', icon: 'UtensilsCrossed' },
    { value: 'snacks', label: 'Snacks', icon: 'Cookie' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMealSelect = (mealType) => {
    onSelectMeal(mealType);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Icon name="Plus" size={16} />
        <span>Quick Add Food</span>
        <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-elevation-2 z-50">
          <div className="py-1">
            {mealOptions.map((meal) => (
              <button
                key={meal.value}
                onClick={() => handleMealSelect(meal.value)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <Icon name={meal.icon} size={18} className="text-primary" />
                <span className="text-foreground font-medium">{meal.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddDropdown;