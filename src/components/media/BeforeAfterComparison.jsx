import React, { useState, useRef } from 'react';

function BeforeAfterComparison({ beforeImage, afterImage, className = '' }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0]);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      updateSliderPosition(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (event) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  if (!beforeImage || !afterImage) {
    return (
      <div className={`bg-slate-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-4xl mb-4">📸</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Before/After Comparison</h3>
        <p className="text-slate-600">Select two images to create a comparison</p>
      </div>
    );
  }

  return (
    <div className={`relative select-none ${className}`}>
      {/* Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage.url || afterImage.preview_url || afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage.url || beforeImage.preview_url || beforeImage}
            alt="Before"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        />

        {/* Slider Handle */}
        <div
          className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center border-2 border-slate-300"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium">
          BEFORE
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium">
          AFTER
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded text-xs">
          Drag to compare
        </div>
      </div>

      {/* Metadata Display */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-50 p-3 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Before</h4>
          {beforeImage.date && (
            <p className="text-slate-600">📅 {new Date(beforeImage.date).toLocaleDateString()}</p>
          )}
          {beforeImage.description && (
            <p className="text-slate-600 mt-1">{beforeImage.description}</p>
          )}
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">After</h4>
          {afterImage.date && (
            <p className="text-slate-600">📅 {new Date(afterImage.date).toLocaleDateString()}</p>
          )}
          {afterImage.description && (
            <p className="text-slate-600 mt-1">{afterImage.description}</p>
          )}
        </div>
      </div>

      {/* Progress Indicators */}
      {beforeImage.date && afterImage.date && (
        <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-3">Progress Timeline</h4>
          <div className="relative">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs text-slate-600">Start</p>
                <p className="text-xs font-medium">
                  {new Date(beforeImage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-0.5 bg-gradient-to-r from-red-500 to-green-500 rounded"></div>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <p className="text-xs text-slate-600">Current</p>
                <p className="text-xs font-medium">
                  {new Date(afterImage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-sm text-slate-600">
                Progress Duration: {' '}
                <span className="font-medium">
                  {Math.ceil((new Date(afterImage.date) - new Date(beforeImage.date)) / (1000 * 60 * 60 * 24))} days
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Comparison Gallery Component
function ComparisonGallery({ comparisons = [], onCreateComparison, onViewComparison }) {
  const [selectedComparison, setSelectedComparison] = useState(null);

  // Sample comparisons for demo
  const sampleComparisons = comparisons.length > 0 ? comparisons : [
    {
      id: 1,
      title: '3 Month Transformation',
      beforeImage: {
        url: 'https://picsum.photos/400/400?random=1',
        date: '2024-06-01',
        description: 'Starting my fitness journey'
      },
      afterImage: {
        url: 'https://picsum.photos/400/400?random=2',
        date: '2024-09-01',
        description: 'After 3 months of consistent training'
      },
      category: 'body_transformation',
      tags: ['fitness', 'weight_loss', 'muscle_gain'],
      created_at: '2024-09-01',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: 'Face Gains Progress',
      beforeImage: {
        url: 'https://picsum.photos/400/400?random=3',
        date: '2024-07-15',
        description: 'Before weight loss'
      },
      afterImage: {
        url: 'https://picsum.photos/400/400?random=4',
        date: '2024-09-15',
        description: 'After 2 months'
      },
      category: 'face_progress',
      tags: ['weight_loss', 'confidence', 'health'],
      created_at: '2024-09-15',
      likes: 36,
      comments: 12
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Progress Comparisons</h3>
          <p className="text-slate-600">Track your transformation journey with before/after comparisons</p>
        </div>
        <button
          onClick={onCreateComparison}
          className="btn btn-primary"
        >
          📸 Create Comparison
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleComparisons.map(comparison => (
          <div
            key={comparison.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={() => setSelectedComparison(comparison)}
          >
            {/* Preview */}
            <div className="relative aspect-square">
              <div className="absolute inset-0 grid grid-cols-2">
                <img
                  src={comparison.beforeImage.url}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <img
                  src={comparison.afterImage.url}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-semibold mb-1">{comparison.title}</h4>
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>
                      {Math.ceil((new Date(comparison.afterImage.date) - new Date(comparison.beforeImage.date)) / (1000 * 60 * 60 * 24))} days
                    </span>
                    <div className="flex items-center space-x-3">
                      <span>❤️ {comparison.likes}</span>
                      <span>💬 {comparison.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Before/After Labels */}
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                BEFORE
              </div>
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                AFTER
              </div>
            </div>

            {/* Metadata */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {new Date(comparison.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm text-primary-600 capitalize">
                  {comparison.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {comparison.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Comparison Modal */}
      {selectedComparison && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedComparison.title}
                </h3>
                <button
                  onClick={() => setSelectedComparison(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <BeforeAfterComparison
                beforeImage={selectedComparison.beforeImage}
                afterImage={selectedComparison.afterImage}
                className="mb-6"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-red-600">
                    <span>❤️</span>
                    <span>{selectedComparison.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600">
                    <span>💬</span>
                    <span>{selectedComparison.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-green-600">
                    <span>📤</span>
                    <span>Share</span>
                  </button>
                </div>
                
                <button
                  onClick={() => onViewComparison?.(selectedComparison)}
                  className="btn btn-primary"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sampleComparisons.length === 0 && (
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No comparisons yet</h3>
          <p className="text-slate-600 mb-4">
            Create your first before/after comparison to track your progress visually
          </p>
          <button
            onClick={onCreateComparison}
            className="btn btn-primary"
          >
            Create Your First Comparison
          </button>
        </div>
      )}
    </div>
  );
}

export default BeforeAfterComparison;
export { ComparisonGallery };