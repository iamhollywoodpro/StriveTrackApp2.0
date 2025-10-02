import React, { useState, useEffect } from 'react';
import { mediaService } from '../../lib/mediaService';
import Modal from '../shared/Modal';

function MediaGallery({ onMediaSelect, selectionMode = false, showFilters = true }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [viewingMedia, setViewingMedia] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    startDate: '',
    endDate: '',
    tags: [],
    sortBy: 'newest'
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const mediaTypes = [
    { value: '', label: 'All Types' },
    { value: 'progress_photo', label: 'Progress Photos' },
    { value: 'workout_video', label: 'Workout Videos' },
    { value: 'before_after', label: 'Before/After' },
    { value: 'meal_photo', label: 'Meal Photos' },
    { value: 'achievement', label: 'Achievements' }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'progress', label: 'Progress' },
    { value: 'lifestyle', label: 'Lifestyle' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'size', label: 'File Size' },
    { value: 'type', label: 'File Type' }
  ];

  // Load media on mount and filter changes
  useEffect(() => {
    loadMedia();
  }, [filters]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, using sample data
      // In production, this would call: const result = await mediaService.getMediaGallery(filters);
      const sampleMedia = generateSampleMedia();
      setMedia(sampleMedia);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample media data
  const generateSampleMedia = () => {
    const types = ['progress_photo', 'workout_video', 'meal_photo', 'before_after'];
    const categories = ['fitness', 'nutrition', 'progress'];
    const sampleData = [];

    for (let i = 1; i <= 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const isVideo = type === 'workout_video';
      
      sampleData.push({
        id: `media_${i}`,
        type,
        category,
        description: `Sample ${type.replace('_', ' ')} #${i}`,
        tags: ['fitness', 'progress', 'transformation'].slice(0, Math.floor(Math.random() * 3) + 1),
        uploaded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        file_size: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
        file_type: isVideo ? 'video' : 'image',
        original_name: `${type}_${i}.${isVideo ? 'mp4' : 'jpg'}`,
        thumbnail_url: `https://picsum.photos/400/400?random=${i}`,
        preview_url: `https://picsum.photos/800/800?random=${i}`,
        original_url: `https://picsum.photos/1200/1200?random=${i}`,
        metadata: {
          width: 1200,
          height: 1200,
          duration: isVideo ? Math.floor(Math.random() * 300) + 30 : null
        },
        visibility: ['private', 'friends', 'public'][Math.floor(Math.random() * 3)],
        flagged: Math.random() > 0.9, // 10% chance of being flagged
        flag_reason: Math.random() > 0.9 ? 'inappropriate_content' : null
      });
    }

    return sampleData.filter(item => {
      // Apply filters
      if (filters.type && item.type !== filters.type) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.search && !item.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case 'oldest':
          return new Date(a.uploaded_at) - new Date(b.uploaded_at);
        case 'name':
          return a.original_name.localeCompare(b.original_name);
        case 'size':
          return b.file_size - a.file_size;
        default:
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      }
    });
  };

  const handleMediaClick = (mediaItem) => {
    if (selectionMode) {
      handleMediaSelect(mediaItem);
    } else {
      setViewingMedia(mediaItem);
    }
  };

  const handleMediaSelect = (mediaItem) => {
    if (selectedMedia.find(m => m.id === mediaItem.id)) {
      setSelectedMedia(selectedMedia.filter(m => m.id !== mediaItem.id));
    } else {
      setSelectedMedia([...selectedMedia, mediaItem]);
    }
    onMediaSelect?.(selectedMedia);
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await mediaService.deleteMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError(`Failed to delete media: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMediaIcon = (type) => {
    const icons = {
      progress_photo: '📸',
      workout_video: '🎥',
      before_after: '📊',
      meal_photo: '🍽️',
      achievement: '🏆'
    };
    return icons[type] || '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your media...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">⚠️</span>
          <p className="text-red-700">Error loading media: {error}</p>
        </div>
        <button
          onClick={() => loadMedia()}
          className="mt-2 btn btn-secondary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Filter & Search</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400'}`}
              >
                ☰
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search descriptions..."
                className="input w-full"
              />
            </div>
            
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="input w-full"
              >
                {mediaTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="input w-full"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Your Media ({media.length} items)
            </h3>
            {selectionMode && selectedMedia.length > 0 && (
              <div className="text-sm text-primary-600">
                {selectedMedia.length} selected
              </div>
            )}
          </div>
        </div>

        {media.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No media found</h3>
            <p className="text-slate-600 mb-4">
              {Object.values(filters).some(v => v && v.length > 0) 
                ? 'Try adjusting your filters or search terms'
                : 'Upload your first progress photo or workout video to get started!'
              }
            </p>
            <button
              onClick={() => setFilters({
                type: '',
                category: '',
                search: '',
                startDate: '',
                endDate: '',
                tags: [],
                sortBy: 'newest'
              })}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`p-4 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
              : 'space-y-2'
          }`}>
            {media.map(item => (
              <div
                key={item.id}
                className={`group cursor-pointer transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'relative aspect-square rounded-lg overflow-hidden bg-slate-100 hover:shadow-md'
                    : 'flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50'
                } ${
                  selectionMode && selectedMedia.find(m => m.id === item.id)
                    ? 'ring-2 ring-primary-500'
                    : ''
                }`}
                onClick={() => handleMediaClick(item)}
              >
                {viewMode === 'grid' ? (
                  <>
                    <img
                      src={item.thumbnail_url}
                      alt={item.description}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg">
                            {getMediaIcon(item.type)}
                          </span>
                          {item.file_type === 'video' && (
                            <span className="bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                              ▶️
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Flagged Indicator */}
                    {item.flagged && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        🚩 Flagged
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {selectionMode && (
                      <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                        selectedMedia.find(m => m.id === item.id) 
                          ? 'bg-primary-500' 
                          : 'bg-white/20'
                      }`}>
                        {selectedMedia.find(m => m.id === item.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <img
                      src={item.thumbnail_url}
                      alt={item.description}
                      className="w-12 h-12 object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span>{getMediaIcon(item.type)}</span>
                        <p className="font-medium text-slate-900 truncate">{item.description}</p>
                        {item.flagged && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                            Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>{formatDate(item.uploaded_at)}</span>
                        <span>{mediaService.formatFileSize(item.file_size)}</span>
                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingMedia(item);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(item);
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {viewingMedia && (
        <Modal
          isOpen={!!viewingMedia}
          onClose={() => setViewingMedia(null)}
          title={viewingMedia.description}
          size="xlarge"
        >
          <div className="space-y-4">
            <div className="text-center">
              {viewingMedia.file_type === 'video' ? (
                <video
                  src={viewingMedia.original_url}
                  controls
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              ) : (
                <img
                  src={viewingMedia.original_url}
                  alt={viewingMedia.description}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Type:</strong> {getMediaIcon(viewingMedia.type)} {viewingMedia.type.replace('_', ' ')}</p>
                <p><strong>Category:</strong> {viewingMedia.category}</p>
                <p><strong>Uploaded:</strong> {formatDate(viewingMedia.uploaded_at)}</p>
              </div>
              <div>
                <p><strong>File Size:</strong> {mediaService.formatFileSize(viewingMedia.file_size)}</p>
                <p><strong>Dimensions:</strong> {viewingMedia.metadata.width} × {viewingMedia.metadata.height}</p>
                <p><strong>Visibility:</strong> {viewingMedia.visibility}</p>
              </div>
            </div>
            
            {viewingMedia.tags && viewingMedia.tags.length > 0 && (
              <div>
                <strong>Tags:</strong> {viewingMedia.tags.map(tag => (
                  <span key={tag} className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded ml-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete Media"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to delete "{showDeleteConfirm.description}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMedia(showDeleteConfirm.id)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MediaGallery;