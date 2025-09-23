import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PhotoCard = ({ photo, onEdit, onShare, onCompare, onDelete, onView, isSelected, onSelect }) => {
  const [showMenu, setShowMenu] = useState(false);

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

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative bg-card rounded-lg shadow-elevation-1 overflow-hidden transition-all duration-200 hover:shadow-elevation-2 ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={() => onSelect(photo?.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected 
              ? 'bg-primary border-primary' :'bg-white/80 border-white/80 hover:bg-white'
          }`}
        >
          {isSelected && <Icon name="Check" size={14} color="white" strokeWidth={2.5} />}
        </button>
      </div>
      
      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-10">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-white/80 hover:bg-white"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Icon name="MoreVertical" size={16} color="currentColor" />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-elevation-2 py-1 min-w-[120px] z-20">
              <button
                onClick={() => {
                  onView?.(photo);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Icon name="Eye" size={14} color="currentColor" />
                <span>View</span>
              </button>
              
              <button
                onClick={() => {
                  onEdit?.(photo);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Icon name="Edit" size={14} color="currentColor" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={() => {
                  onShare?.(photo);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Icon name="Share" size={14} color="currentColor" />
                <span>Share</span>
              </button>
              
              <hr className="my-1 border-border" />
              
              <button
                onClick={() => {
                  onDelete?.(photo);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center space-x-2"
              >
                <Icon name="Trash2" size={14} color="currentColor" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Photo Image - Click to view */}
      <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => onView?.(photo)}>
        {photo?.mediaType === 'video' ? (
          <video
            src={photo?.imageUrl}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            muted
            loop
            onMouseEnter={(e) => e?.target?.play()}
            onMouseLeave={(e) => e?.target?.pause()}
          >
            <source src={photo?.imageUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={photo?.imageUrl}
            alt={`Progress photo from ${formatDate(photo?.date)}`}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        )}
      </div>

      {/* Photo Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhotoTypeColor(photo?.type)}`}>
              {photo?.type?.charAt(0)?.toUpperCase() + photo?.type?.slice(1)}
            </span>
            {photo?.mediaType === 'video' && (
              <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                <Icon name="Play" size={10} className="text-red-600" color="currentColor" />
                <span className="text-xs font-medium text-red-600">Video</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Icon name={getPrivacyIcon(photo?.privacy)} size={14} className="text-muted-foreground" color="currentColor" />
            <div className="flex items-center space-x-1 bg-accent/10 px-2 py-1 rounded-full">
              <Icon name="Star" size={12} className="text-accent" color="currentColor" />
              <span className="text-xs font-medium text-accent">{photo?.points}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-1">
          {formatDate(photo?.date)}
        </div>

        {photo?.filename && (
          <p className="text-xs text-muted-foreground mb-1">
            {photo?.filename}
          </p>
        )}

        {photo?.notes && (
          <p className="text-sm text-foreground line-clamp-2">
            {photo?.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;