import React, { useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';

const ComparisonPanel = ({
  leftMedia,
  rightMedia,
  comparisonMode,
  overlayOpacity,
  splitPosition,
  setSplitPosition,
  zoomLevel,
  syncZoom
}) => {
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSplitMove = (e) => {
    if (!isDragging) return;
    
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = e?.clientX - rect?.left;
    const percentage = (x / rect?.width) * 100;
    
    // Keep split between 10% and 90%
    const clampedPercentage = Math.min(Math.max(percentage, 10), 90);
    setSplitPosition(clampedPercentage);
  };

  const renderMediaElement = (media, className = '') => {
    if (!media) return null;

    const commonProps = {
      className: `w-full h-full object-contain ${className}`,
      style: syncZoom ? { transform: `scale(${zoomLevel / 100})` } : {}
    };

    if (media?.type === 'video') {
      return (
        <video
          {...commonProps}
          controls
          preload="metadata"
        >
          <source src={media?.url} />Your browser does not support video playback.
                  </video>
      );
    }

    return (
      <img
        {...commonProps}
        src={media?.url}
        alt={media?.name}
        loading="lazy"
      />
    );
  };

  const renderSideBySide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Left Panel */}
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            BEFORE
          </span>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {leftMedia ? (
            renderMediaElement(leftMedia)
          ) : (
            <div className="text-center">
              <Icon name="Image" size={32} className="text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Select left media</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            AFTER
          </span>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {rightMedia ? (
            renderMediaElement(rightMedia)
          ) : (
            <div className="text-center">
              <Icon name="Image" size={32} className="text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Select right media</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOverlay = () => (
    <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
      <div className="absolute top-2 left-2 z-10">
        <div className="flex space-x-2">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            OVERLAY
          </span>
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
            {overlayOpacity}%
          </span>
        </div>
      </div>
      
      <div className="relative w-full h-full">
        {/* Background (Left) Media */}
        <div className="absolute inset-0 flex items-center justify-center">
          {leftMedia && renderMediaElement(leftMedia)}
        </div>
        
        {/* Overlay (Right) Media */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: overlayOpacity / 100 }}
        >
          {rightMedia && renderMediaElement(rightMedia)}
        </div>
      </div>
    </div>
  );

  const renderSplit = () => (
    <div 
      className="relative bg-muted rounded-lg overflow-hidden aspect-video cursor-col-resize"
      onMouseMove={handleSplitMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <div className="absolute top-2 left-2 z-10">
        <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          SPLIT VIEW
        </span>
      </div>

      <div className="relative w-full h-full overflow-hidden">
        {/* Left Media */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
        >
          {leftMedia && renderMediaElement(leftMedia)}
        </div>

        {/* Right Media */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
        >
          {rightMedia && renderMediaElement(rightMedia)}
        </div>

        {/* Split Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20 cursor-col-resize"
          style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Icon name="GripVertical" size={16} className="text-muted-foreground" strokeWidth={2} />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            BEFORE
          </span>
        </div>
        <div className="absolute bottom-2 right-2 z-10">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            AFTER
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {comparisonMode === 'side-by-side' && renderSideBySide()}
      {comparisonMode === 'overlay' && renderOverlay()}
      {comparisonMode === 'split' && renderSplit()}
    </div>
  );
};

export default ComparisonPanel;