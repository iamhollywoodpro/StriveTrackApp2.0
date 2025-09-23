import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MediaSelector = ({ 
  mediaFiles, 
  loading, 
  selectedMedia, 
  onMediaSelect, 
  onRefresh 
}) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'videos'
  const [dateRange, setDateRange] = useState('all'); // 'all', 'week', 'month', '3months'

  const filteredMedia = mediaFiles?.filter(media => {
    // Filter by type
    if (filterType === 'images' && media?.type !== 'image') return false;
    if (filterType === 'videos' && media?.type !== 'video') return false;

    // Filter by date range
    if (dateRange !== 'all') {
      const mediaDate = new Date(media.created_at || media.updated_at);
      const now = new Date();
      const daysAgo = {
        week: 7,
        month: 30,
        '3months': 90
      }?.[dateRange];

      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      if (mediaDate < cutoffDate) return false;
    }

    return true;
  }) || [];

  const isSelected = (media) => {
    return selectedMedia?.left?.fullPath === media?.fullPath || 
           selectedMedia?.right?.fullPath === media?.fullPath;
  };

  const getSelectionLabel = (media) => {
    if (selectedMedia?.left?.fullPath === media?.fullPath) return 'LEFT';
    if (selectedMedia?.right?.fullPath === media?.fullPath) return 'RIGHT';
    return null;
  };

  const handleMediaClick = (media) => {
    // Determine which position to assign based on current selections
    if (!selectedMedia?.left) {
      onMediaSelect(media, 'left');
    } else if (!selectedMedia?.right) {
      onMediaSelect(media, 'right');
    } else {
      // Both positions filled, replace the left one
      onMediaSelect(media, 'left');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Media Library</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <Icon name="RotateCcw" size={16} strokeWidth={2} />
        </Button>
      </div>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Media Type Filter */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Media Type
          </label>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All', icon: 'FileImage' },
              { value: 'images', label: 'Images', icon: 'Image' },
              { value: 'videos', label: 'Videos', icon: 'Video' }
            ]?.map(type => (
              <button
                key={type?.value}
                onClick={() => setFilterType(type?.value)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filterType === type?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={type?.icon} size={14} strokeWidth={2} />
                <span>{type?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
        </div>
      </div>
      {/* Selection Instructions */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground">
          Click media to select for comparison. First click assigns to LEFT panel, second click to RIGHT panel.
        </p>
      </div>
      {/* Media Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredMedia?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="ImageOff" size={32} className="text-muted-foreground mb-2 mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              {mediaFiles?.length === 0 ? 'No media files found' : 'No files match your filters'}
            </p>
          </div>
        ) : (
          filteredMedia?.map((media, index) => (
            <div
              key={media?.fullPath || index}
              onClick={() => handleMediaClick(media)}
              className={`relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected(media)
                  ? 'bg-primary/10 border-2 border-primary' :'bg-muted/50 hover:bg-muted border-2 border-transparent'
              }`}
            >
              {/* Media Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                {media?.type === 'image' ? (
                  <img
                    src={media?.url}
                    alt={media?.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Icon name="Video" size={20} className="text-muted-foreground" strokeWidth={2} />
                )}
              </div>

              {/* Media Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {media?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {media?.date} • {media?.type}
                </p>
              </div>

              {/* Selection Badge */}
              {isSelected(media) && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                  {getSelectionLabel(media)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Selection Summary */}
      {(selectedMedia?.left || selectedMedia?.right) && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-xs font-medium text-foreground mb-2">Selected for Comparison:</div>
          <div className="space-y-1">
            {selectedMedia?.left && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">LEFT: {selectedMedia?.left?.name}</span>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onMediaSelect(null, 'left');
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Icon name="X" size={12} strokeWidth={2} />
                </button>
              </div>
            )}
            {selectedMedia?.right && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">RIGHT: {selectedMedia?.right?.name}</span>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onMediaSelect(null, 'right');
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Icon name="X" size={12} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelector;