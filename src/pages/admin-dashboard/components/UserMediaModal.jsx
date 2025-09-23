import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const UserMediaModal = ({ 
  user, 
  media, 
  loading, 
  onClose, 
  onMediaAction 
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const handleBulkAction = async (action, selectedItems) => {
    if (!selectedItems || selectedItems?.length === 0) {
      alert('Please select items first');
      return;
    }

    if (confirm(`Are you sure you want to ${action} ${selectedItems?.length} items?`)) {
      for (const item of selectedItems) {
        await onMediaAction(action, item);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {user?.full_name || user?.email}'s Media
            </h3>
            <p className="text-sm text-muted-foreground">
              Total: {media?.length || 0} files
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Icon 
                name={viewMode === 'grid' ? 'List' : 'Grid3x3'} 
                size={16} 
                strokeWidth={2} 
              />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <Icon name="X" size={20} strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : media?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Image" size={48} className="text-muted-foreground mb-4 mx-auto" strokeWidth={1.5} />
              <h4 className="text-lg font-medium text-foreground mb-2">No Media Found</h4>
              <p className="text-muted-foreground">This user hasn't uploaded any media yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* View Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {media?.length} files
                  </span>
                </div>
              </div>

              {/* Media Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media?.map((mediaItem, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => handleMediaClick(mediaItem)}
                      >
                        {mediaItem?.type === 'image' ? (
                          <img
                            src={mediaItem?.url}
                            alt={mediaItem?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="Video" size={32} className="text-muted-foreground" strokeWidth={2} />
                          </div>
                        )}
                      </div>
                      
                      {/* Media Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs truncate">{mediaItem?.name}</p>
                        <p className="text-xs text-gray-300">{mediaItem?.uploadDate}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e?.stopPropagation();
                              onMediaAction('download', mediaItem);
                            }}
                            className="text-white hover:text-white hover:bg-white/20 bg-black/50"
                          >
                            <Icon name="Download" size={14} strokeWidth={2} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e?.stopPropagation();
                              onMediaAction('flag', mediaItem);
                            }}
                            className="text-white hover:text-white hover:bg-white/20 bg-black/50"
                          >
                            <Icon name="Flag" size={14} strokeWidth={2} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e?.stopPropagation();
                              onMediaAction('delete', mediaItem);
                            }}
                            className="text-white hover:text-white hover:bg-white/20 bg-black/50"
                          >
                            <Icon name="Trash2" size={14} strokeWidth={2} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {media?.map((mediaItem, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {mediaItem?.type === 'image' ? (
                          <img
                            src={mediaItem?.url}
                            alt={mediaItem?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="Video" size={20} className="text-muted-foreground" strokeWidth={2} />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{mediaItem?.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{mediaItem?.type}</span>
                          <span>{mediaItem?.size}</span>
                          <span>{mediaItem?.uploadDate}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMediaAction('download', mediaItem)}
                        >
                          <Icon name="Download" size={14} strokeWidth={2} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMediaAction('flag', mediaItem)}
                        >
                          <Icon name="Flag" size={14} strokeWidth={2} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMediaAction('delete', mediaItem)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={14} strokeWidth={2} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-60">
          <div className="max-w-4xl max-h-[90vh] p-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-10 text-white hover:text-white hover:bg-white/20"
              >
                <Icon name="X" size={24} strokeWidth={2} />
              </Button>
              
              {selectedMedia?.type === 'image' ? (
                <img
                  src={selectedMedia?.url}
                  alt={selectedMedia?.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia?.url}
                  controls
                  className="max-w-full max-h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMediaModal;