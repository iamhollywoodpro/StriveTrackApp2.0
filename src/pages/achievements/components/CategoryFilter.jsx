import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, searchTerm, onSearchChange }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'all': return 'Grid3X3';
      case 'consistency': return 'Calendar';
      case 'progress': return 'TrendingUp';
      case 'social': return 'Users';
      case 'special': return 'Star';
      default: return 'Award';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'all': return 'All';
      case 'consistency': return 'Consistency';
      case 'progress': return 'Progress';
      case 'social': return 'Social';
      case 'special': return 'Special Events';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Search</h3>
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
        <div className="space-y-2">
          {categories?.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-elevation-1'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon 
                name={getCategoryIcon(category)} 
                size={20} 
                strokeWidth={selectedCategory === category ? 2.5 : 2}
              />
              <span className="text-sm font-medium">
                {getCategoryLabel(category)}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Achievement Tips */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-elevation-1">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2 text-yellow-500" />
          Achievement Tips
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• Complete daily workouts to unlock consistency badges</p>
          <p>• Upload progress photos regularly for visual milestones</p>
          <p>• Engage with the community for social achievements</p>
          <p>• Participate in seasonal challenges for special badges</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;