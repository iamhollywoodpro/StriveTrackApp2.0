import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PhotoComparison = ({ photos, selectedPhotos, onClose, onPhotoSelect }) => {
  const [comparisonMode, setComparisonMode] = useState('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);

  // Get actual photo objects from IDs
  const photo1 = photos?.find(p => p?.id === selectedPhotos?.[0]);
  const photo2 = photos?.find(p => p?.id === selectedPhotos?.[1]);
  
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date)?.toLocaleDateString();
  };

  const handleClearSelection = () => {
    if (onPhotoSelect) {
      onPhotoSelect();
    }
  };

  // Add navigation to dedicated comparison tool
  const openComparisonTool = () => {
    window.location.href = '/media-comparison-tool';
  };

  const handleModeChange = (mode) => {
    setComparisonMode(mode);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">Photo Comparison</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={openComparisonTool}
              className="flex items-center space-x-2"
            >
              <Icon name="ExternalLink" size={16} strokeWidth={2} />
              <span>Advanced Comparison</span>
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <Icon name="X" size={20} strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Comparison Mode Toggle */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant={comparisonMode === 'side-by-side' ? 'default' : 'outline'}
              onClick={() => handleModeChange('side-by-side')}
              size="sm"
            >
              Side by Side
            </Button>
            <Button
              variant={comparisonMode === 'overlay' ? 'default' : 'outline'}
              onClick={() => handleModeChange('overlay')}
              size="sm"
            >
              Overlay
            </Button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6">
          {comparisonMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Photo 1 */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photo1?.imageUrl}
                    alt={`Progress photo from ${formatDate(photo1?.date)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      photo1?.type === 'before' ? 'bg-blue-100 text-blue-800' :
                      photo1?.type === 'during' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {photo1?.type?.charAt(0)?.toUpperCase() + photo1?.type?.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-accent">
                      <Icon name="Star" size={14} />
                      <span className="text-sm font-medium">{photo1?.points} pts</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(photo1?.date)}</p>
                  {photo1?.notes && (
                    <p className="text-sm text-foreground">{photo1?.notes}</p>
                  )}
                </div>
              </div>

              {/* Photo 2 */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photo2?.imageUrl}
                    alt={`Progress photo from ${formatDate(photo2?.date)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      photo2?.type === 'before' ? 'bg-blue-100 text-blue-800' :
                      photo2?.type === 'during' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {photo2?.type?.charAt(0)?.toUpperCase() + photo2?.type?.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-accent">
                      <Icon name="Star" size={14} />
                      <span className="text-sm font-medium">{photo2?.points} pts</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(photo2?.date)}</p>
                  {photo2?.notes && (
                    <p className="text-sm text-foreground">{photo2?.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Overlay Mode */
            (<div className="max-w-2xl mx-auto">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {/* Base Image */}
                <Image
                  src={photo1?.imageUrl}
                  alt={`Progress photo from ${formatDate(photo1?.date)}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Image with Slider */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <Image
                    src={photo2?.imageUrl}
                    alt={`Progress photo from ${formatDate(photo2?.date)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Slider Line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <Icon name="Move" size={16} className="text-gray-600" />
                  </div>
                </div>
                
                {/* Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e?.target?.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {/* Photo Info */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <h4 className="font-medium mb-1">Before</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(photo1?.date)}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-1">After</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(photo2?.date)}</p>
                </div>
              </div>
            </div>)
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClearSelection}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Select Different Photos
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
              onClick={() => console.log('Share comparison')}
            >
              Share Comparison
            </Button>
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={() => console.log('Save image')}
            >
              Save Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoComparison;