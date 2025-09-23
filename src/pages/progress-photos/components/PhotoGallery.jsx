import React from 'react';
import PhotoCard from './PhotoCard';
import Icon from '../../../components/AppIcon';

const PhotoGallery = ({ 
  photos, 
  selectedPhotos, 
  onPhotoSelect, 
  onPhotoView, 
  onPhotoEdit, 
  onPhotoShare, 
  onPhotoDelete, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 })?.map((_, index) => (
          <div key={index} className="bg-card rounded-lg shadow-elevation-1 overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (photos?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
          <Icon name="Camera" size={32} color="text-muted-foreground" className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start your transformation journey by uploading your first progress photo. 
          Document your journey and track your amazing progress over time!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos?.map((photo) => (
        <PhotoCard
          key={photo?.id}
          photo={photo}
          isSelected={selectedPhotos?.includes(photo?.id)}
          onSelect={onPhotoSelect}
          onView={onPhotoView}
          onEdit={onPhotoEdit}
          onShare={onPhotoShare}
          onDelete={onPhotoDelete}
          onCompare={() => {}}
        />
      ))}
    </div>
  );
};

export default PhotoGallery;