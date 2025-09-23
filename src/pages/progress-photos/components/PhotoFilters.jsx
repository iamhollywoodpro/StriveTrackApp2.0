import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PhotoFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  photoCount,
  selectedCount 
}) => {
  const photoTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'before', label: 'Before Photos' },
    { value: 'during', label: 'Progress Updates' },
    { value: 'after', label: 'After Photos' }
  ];

  const privacyOptions = [
    { value: 'all', label: 'All Privacy Levels' },
    { value: 'private', label: 'Private Only' },
    { value: 'friends', label: 'Friends Only' },
    { value: 'public', label: 'Public Only' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'points', label: 'Highest Points' },
    { value: 'type', label: 'By Photo Type' }
  ];

  const hasActiveFilters = filters?.type !== 'all' || filters?.privacy !== 'all' || filters?.sort !== 'newest';

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <Select
              placeholder="Filter by type"
              options={photoTypeOptions}
              value={filters?.type}
              onChange={(value) => onFilterChange('type', value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              placeholder="Filter by privacy"
              options={privacyOptions}
              value={filters?.privacy}
              onChange={(value) => onFilterChange('privacy', value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Select
              placeholder="Sort by"
              options={sortOptions}
              value={filters?.sort}
              onChange={(value) => onFilterChange('sort', value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={14}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'} found
          </span>
          {selectedCount > 0 && (
            <span className="text-primary font-medium">
              {selectedCount} selected
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="Filter" size={14} className="text-primary" />
            <span className="text-primary font-medium">Filters active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoFilters;