import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, getFileUrl } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import MediaSelector from './components/MediaSelector';
import ComparisonPanel from './components/ComparisonPanel';
import ComparisonControls from './components/ComparisonControls';

const MediaComparisonTool = () => {
  const { user } = useAuth();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState({
    left: null,
    right: null
  });
  const [comparisonMode, setComparisonMode] = useState('side-by-side'); // 'side-by-side', 'overlay', 'split'
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [splitPosition, setSplitPosition] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [syncZoom, setSyncZoom] = useState(true);

  // Load user's media files
  useEffect(() => {
    loadMediaFiles();
  }, [user]);

  const loadMediaFiles = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // List files from user's folder
      const { data: files, error } = await supabase?.storage?.from('user-media')?.list(`${user?.id}/progress`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Generate signed URLs for media files
      const mediaWithUrls = await Promise.all(
        files
          ?.filter(file => {
            const isMedia = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i?.test(file?.name);
            return isMedia && file?.name !== '.emptyFolderPlaceholder';
          })
          ?.map(async (file) => {
            const filePath = `${user?.id}/progress/${file?.name}`;
            const { url } = await getFileUrl('user-media', filePath, false);
            
            return {
              ...file,
              fullPath: filePath,
              url,
              type: /\.(mp4|mov|avi|webm)$/i?.test(file?.name) ? 'video' : 'image',
              date: new Date(file.created_at || file.updated_at)?.toLocaleDateString()
            };
          }) || []
      );

      setMediaFiles(mediaWithUrls?.filter(media => media?.url));
    } catch (error) {
      console.error('Error loading media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (media, position) => {
    setSelectedMedia(prev => ({
      ...prev,
      [position]: media
    }));
  };

  const clearSelection = (position) => {
    setSelectedMedia(prev => ({
      ...prev,
      [position]: null
    }));
  };

  const clearAllSelections = () => {
    setSelectedMedia({
      left: null,
      right: null
    });
  };

  const exportComparison = async () => {
    if (!selectedMedia?.left || !selectedMedia?.right) {
      alert('Please select both media files to export comparison');
      return;
    }

    // Create a canvas to combine the images
    const canvas = document.createElement('canvas');
    const ctx = canvas?.getContext('2d');
    
    try {
      // For now, we'll just download each image separately
      // A full implementation would combine them on canvas
      const link = document.createElement('a');
      
      // Download left image
      link.href = selectedMedia?.left?.url;
      link.download = `comparison_before_${selectedMedia?.left?.name}`;
      link?.click();
      
      // Download right image
      setTimeout(() => {
        link.href = selectedMedia?.right?.url;
        link.download = `comparison_after_${selectedMedia?.right?.name}`;
        link?.click();
      }, 500);

    } catch (error) {
      console.error('Error exporting comparison:', error);
      alert('Failed to export comparison');
    }
  };

  const hasValidComparison = selectedMedia?.left && selectedMedia?.right;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Media Comparison Tool
            </h1>
            <p className="text-muted-foreground">
              Compare your progress photos and videos side-by-side to track your transformation journey
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Media Selection Panel */}
            <div className="lg:col-span-1">
              <MediaSelector
                mediaFiles={mediaFiles}
                loading={loading}
                selectedMedia={selectedMedia}
                onMediaSelect={handleMediaSelect}
                onRefresh={loadMediaFiles}
              />
            </div>

            {/* Comparison Display */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Comparison Controls */}
                <ComparisonControls
                  comparisonMode={comparisonMode}
                  setComparisonMode={setComparisonMode}
                  overlayOpacity={overlayOpacity}
                  setOverlayOpacity={setOverlayOpacity}
                  splitPosition={splitPosition}
                  setSplitPosition={setSplitPosition}
                  zoomLevel={zoomLevel}
                  setZoomLevel={setZoomLevel}
                  syncZoom={syncZoom}
                  setSyncZoom={setSyncZoom}
                  onClearAll={clearAllSelections}
                  onExport={exportComparison}
                  hasValidComparison={hasValidComparison}
                />

                {/* Comparison Display Area */}
                <div className="mt-6">
                  {hasValidComparison ? (
                    <ComparisonPanel
                      leftMedia={selectedMedia?.left}
                      rightMedia={selectedMedia?.right}
                      comparisonMode={comparisonMode}
                      overlayOpacity={overlayOpacity}
                      splitPosition={splitPosition}
                      zoomLevel={zoomLevel}
                      syncZoom={syncZoom}
                    />
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-center p-8">
                      <Icon name="Images" size={48} className="text-muted-foreground mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Select Two Media Files to Compare
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Choose images or videos from your progress library to start comparing your transformation journey
                      </p>
                      {mediaFiles?.length === 0 && !loading && (
                        <div className="mt-6">
                          <p className="text-sm text-muted-foreground mb-4">
                            No media files found. Upload some progress photos first.
                          </p>
                          <Button onClick={() => window.location.href = '/progress-photos'}>
                            Go to Progress Photos
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Comparison Info */}
                {hasValidComparison && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Before</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedMedia?.left?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMedia?.left?.date}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">After</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedMedia?.right?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMedia?.right?.date}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaComparisonTool;