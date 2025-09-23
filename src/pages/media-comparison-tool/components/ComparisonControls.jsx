import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ComparisonControls = ({
  comparisonMode,
  setComparisonMode,
  overlayOpacity,
  setOverlayOpacity,
  splitPosition,
  setSplitPosition,
  zoomLevel,
  setZoomLevel,
  syncZoom,
  setSyncZoom,
  onClearAll,
  onExport,
  hasValidComparison
}) => {
  const comparisonModes = [
    { value: 'side-by-side', label: 'Side by Side', icon: 'Columns' },
    { value: 'overlay', label: 'Overlay', icon: 'Layers' },
    { value: 'split', label: 'Split View', icon: 'SeparatorVertical' }
  ];

  return (
    <div className="space-y-4">
      {/* Comparison Mode Selection */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Comparison Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {comparisonModes?.map(mode => (
            <button
              key={mode?.value}
              onClick={() => setComparisonMode(mode?.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonMode === mode?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={mode?.icon} size={16} strokeWidth={2} />
              <span>{mode?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Mode-specific Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overlay Opacity Control */}
        {comparisonMode === 'overlay' && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Overlay Opacity: {overlayOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {/* Split Position Control */}
        {comparisonMode === 'split' && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Split Position: {splitPosition}%
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={splitPosition}
              onChange={(e) => setSplitPosition(parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {/* Zoom Control */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Zoom: {zoomLevel}%
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="50"
              max="200"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e?.target?.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(100)}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Sync Zoom Toggle */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Zoom Settings
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="syncZoom"
              checked={syncZoom}
              onChange={(e) => setSyncZoom(e?.target?.checked)}
              className="rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="syncZoom" className="text-sm text-foreground">
              Sync zoom between panels
            </label>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={!hasValidComparison}
          className="flex items-center space-x-2"
        >
          <Icon name="RotateCcw" size={16} strokeWidth={2} />
          <span>Clear Selection</span>
        </Button>

        <Button
          onClick={onExport}
          disabled={!hasValidComparison}
          className="flex items-center space-x-2"
        >
          <Icon name="Download" size={16} strokeWidth={2} />
          <span>Export Comparison</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open('/progress-photos', '_blank')}
          className="flex items-center space-x-2"
        >
          <Icon name="ExternalLink" size={16} strokeWidth={2} />
          <span>View All Media</span>
        </Button>
      </div>
    </div>
  );
};

export default ComparisonControls;