import React from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PhotoViewModal = ({ photo, isOpen, onClose, onEdit, onShare, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotoTypeColor = (type) => {
    switch (type) {
      case 'before':
        return 'bg-blue-100 text-blue-800';
      case 'during':
        return 'bg-yellow-100 text-yellow-800';
      case 'after':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'private':
        return 'Lock';
      case 'friends':
        return 'Users';
      case 'public':
        return 'Globe';
      default:
        return 'Lock';
    }
  };

  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <Icon name="X" size={20} strokeWidth={2} color="currentColor" />
        </Button>

        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          {/* Media Display */}
          <div className="relative bg-black flex items-center justify-center min-h-[400px]">
            {photo?.mediaType === 'video' ? (
              <video
                src={photo?.imageUrl}
                className="max-w-full max-h-[70vh] object-contain"
                controls
                autoPlay
                muted
              >
                <source src={photo?.imageUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={photo?.imageUrl}
                alt={`Progress photo from ${formatDate(photo?.date)}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>

          {/* Photo Information */}
          <div className="p-6 bg-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhotoTypeColor(photo?.type)}`}>
                    {photo?.type?.charAt(0)?.toUpperCase() + photo?.type?.slice(1)}
                  </span>
                  
                  {photo?.mediaType === 'video' && (
                    <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                      <Icon name="Play" size={12} className="text-red-600" color="currentColor" />
                      <span className="text-xs font-medium text-red-600">Video</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name={getPrivacyIcon(photo?.privacy)} size={14} color="currentColor" />
                    <span className="text-sm capitalize">{photo?.privacy}</span>
                  </div>

                  <div className="flex items-center space-x-1 bg-accent/10 px-2 py-1 rounded-full">
                    <Icon name="Star" size={14} className="text-accent" color="currentColor" />
                    <span className="text-sm font-medium text-accent">{photo?.points} pts</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {photo?.filename || 'Progress Photo'}
                </h3>

                <p className="text-muted-foreground mb-3">
                  {formatDate(photo?.date)}
                </p>

                {photo?.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                    <p className="text-foreground bg-muted p-3 rounded-lg">
                      {photo?.notes}
                    </p>
                  </div>
                )}

                {/* File Details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">File Size:</span>
                    <span className="ml-2">{((photo?.file_size || 0) / 1024 / 1024)?.toFixed(2)} MB</span>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2">{photo?.mediaType?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(photo)}
                  iconName="Edit"
                  iconPosition="left"
                >
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare?.(photo)}
                  iconName="Share"
                  iconPosition="left"
                >
                  Share
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = photo?.imageUrl;
                    link.download = photo?.filename || 'progress-photo';
                    link?.click();
                  }}
                  iconName="Download"
                  iconPosition="left"
                >
                  Download
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete?.(photo)}
                  iconName="Trash2"
                  iconPosition="left"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoViewModal;