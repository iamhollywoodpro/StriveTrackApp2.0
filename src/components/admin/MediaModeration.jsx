import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { mediaService } from '../../lib/mediaService';
import Modal from '../shared/Modal';

function MediaModeration() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [viewingMedia, setViewingMedia] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [bulkAction, setBulkAction] = useState('');

  // Filters for admin view
  const [filters, setFilters] = useState({
    status: 'all', // all, flagged, approved, pending
    user: '',
    type: '',
    category: '',
    dateRange: '30', // days
    sortBy: 'newest'
  });

  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    approved: 0,
    pending: 0,
    totalSize: 0
  });

  const flagReasons = [
    { value: 'inappropriate_content', label: '🚫 Inappropriate Content' },
    { value: 'spam', label: '📢 Spam' },
    { value: 'harassment', label: '⚠️ Harassment' },
    { value: 'misinformation', label: '❌ Misinformation' },
    { value: 'copyright', label: '©️ Copyright Violation' },
    { value: 'other', label: '⚡ Other' }
  ];

  const bulkActions = [
    { value: '', label: 'Select Action...' },
    { value: 'approve', label: '✅ Approve Selected' },
    { value: 'flag', label: '🚩 Flag Selected' },
    { value: 'delete', label: '🗑️ Delete Selected' },
    { value: 'download', label: '💾 Download Selected' }
  ];

  // Load admin media data
  useEffect(() => {
    if (user?.is_admin) {
      loadAdminMedia();
    }
  }, [filters, user]);

  const loadAdminMedia = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, using sample admin data
      // In production: const result = await api.getAllMedia(filters);
      const adminData = generateAdminMediaData();
      setMedia(adminData.media);
      setStats(adminData.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample admin media data
  const generateAdminMediaData = () => {
    const users = ['john_doe', 'jane_smith', 'fitness_guru', 'healthy_life', 'gym_beast'];
    const types = ['progress_photo', 'workout_video', 'meal_photo', 'before_after'];
    const categories = ['fitness', 'nutrition', 'progress'];
    const media = [];

    for (let i = 1; i <= 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const isFlagged = Math.random() > 0.7; // 30% flagged
      const isApproved = !isFlagged && Math.random() > 0.3; // 70% of non-flagged are approved
      
      media.push({
        id: `admin_media_${i}`,
        user_id: `user_${Math.floor(Math.random() * 100)}`,
        username: user,
        email: `${user}@example.com`,
        type,
        category,
        description: `User ${type.replace('_', ' ')} #${i}`,
        file_size: Math.floor(Math.random() * 40000000) + 1000000, // 1-40MB
        file_type: type === 'workout_video' ? 'video' : 'image',
        original_name: `${type}_${i}.${type === 'workout_video' ? 'mp4' : 'jpg'}`,
        thumbnail_url: `https://picsum.photos/400/400?random=${i + 100}`,
        preview_url: `https://picsum.photos/800/800?random=${i + 100}`,
        original_url: `https://picsum.photos/1200/1200?random=${i + 100}`,
        uploaded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        flagged: isFlagged,
        flag_reason: isFlagged ? flagReasons[Math.floor(Math.random() * flagReasons.length)].value : null,
        flag_count: isFlagged ? Math.floor(Math.random() * 5) + 1 : 0,
        approved: isApproved,
        approved_by: isApproved ? 'admin_user' : null,
        approved_at: isApproved ? new Date().toISOString() : null,
        visibility: ['private', 'friends', 'public'][Math.floor(Math.random() * 3)],
        download_count: Math.floor(Math.random() * 50),
        view_count: Math.floor(Math.random() * 500),
        tags: ['fitness', 'progress', 'transformation'].slice(0, Math.floor(Math.random() * 3) + 1),
        metadata: {
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: 'Mozilla/5.0...',
          location: ['New York', 'Los Angeles', 'Chicago'][Math.floor(Math.random() * 3)]
        }
      });
    }

    // Apply filters
    const filteredMedia = media.filter(item => {
      if (filters.status === 'flagged' && !item.flagged) return false;
      if (filters.status === 'approved' && !item.approved) return false;
      if (filters.status === 'pending' && (item.flagged || item.approved)) return false;
      if (filters.user && !item.username.toLowerCase().includes(filters.user.toLowerCase())) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.category && item.category !== filters.category) return false;
      
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case 'oldest':
          return new Date(a.uploaded_at) - new Date(b.uploaded_at);
        case 'size':
          return b.file_size - a.file_size;
        case 'flags':
          return b.flag_count - a.flag_count;
        default:
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      }
    });

    const stats = {
      total: media.length,
      flagged: media.filter(m => m.flagged).length,
      approved: media.filter(m => m.approved).length,
      pending: media.filter(m => !m.flagged && !m.approved).length,
      totalSize: media.reduce((sum, m) => sum + m.file_size, 0)
    };

    return { media: filteredMedia, stats };
  };

  const handleMediaSelect = (mediaId) => {
    if (selectedMedia.includes(mediaId)) {
      setSelectedMedia(selectedMedia.filter(id => id !== mediaId));
    } else {
      setSelectedMedia([...selectedMedia, mediaId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === media.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(media.map(m => m.id));
    }
  };

  const handleFlagMedia = async (mediaItem, reason, unflag = false) => {
    try {
      if (unflag) {
        await api.unflagMedia(mediaItem.id);
        setMedia(media.map(m => 
          m.id === mediaItem.id 
            ? { ...m, flagged: false, flag_reason: null, flag_count: 0 }
            : m
        ));
      } else {
        await api.flagMedia(mediaItem.id, reason);
        setMedia(media.map(m => 
          m.id === mediaItem.id 
            ? { ...m, flagged: true, flag_reason: reason, flag_count: (m.flag_count || 0) + 1 }
            : m
        ));
      }
      setShowFlagModal(null);
    } catch (error) {
      setError(`Failed to ${unflag ? 'unflag' : 'flag'} media: ${error.message}`);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await mediaService.deleteMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
      setSelectedMedia(selectedMedia.filter(id => id !== mediaId));
      setShowDeleteModal(null);
    } catch (error) {
      setError(`Failed to delete media: ${error.message}`);
    }
  };

  const handleDownloadMedia = (mediaItem) => {
    // Create download link
    const link = document.createElement('a');
    link.href = mediaItem.original_url;
    link.download = mediaItem.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedMedia.length === 0) return;

    try {
      switch (bulkAction) {
        case 'approve':
          // Approve selected media
          setMedia(media.map(m => 
            selectedMedia.includes(m.id) 
              ? { ...m, approved: true, flagged: false, approved_by: user.email, approved_at: new Date().toISOString() }
              : m
          ));
          break;
        
        case 'flag':
          setShowFlagModal({ bulk: true, items: selectedMedia });
          return;
          
        case 'delete':
          setShowDeleteModal({ bulk: true, items: selectedMedia });
          return;
          
        case 'download':
          selectedMedia.forEach(mediaId => {
            const mediaItem = media.find(m => m.id === mediaId);
            if (mediaItem) handleDownloadMedia(mediaItem);
          });
          break;
      }
      
      setSelectedMedia([]);
      setBulkAction('');
    } catch (error) {
      setError(`Bulk action failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => mediaService.formatFileSize(bytes);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (mediaItem) => {
    if (mediaItem.flagged) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">🚩 Flagged</span>;
    }
    if (mediaItem.approved) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">✅ Approved</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">⏳ Pending</span>;
  };

  if (!user?.is_admin) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
        <p className="text-slate-600">You need admin privileges to access media moderation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Media Moderation</h2>
            <p className="text-slate-600">Monitor, review, and moderate user-uploaded content</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Storage Used</p>
            <p className="text-xl font-bold text-slate-900">{formatFileSize(stats.totalSize)}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-600">Total Media</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
            <p className="text-sm text-slate-600">Flagged</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-slate-600">Approved</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-slate-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input w-full"
            >
              <option value="all">All Status</option>
              <option value="flagged">🚩 Flagged Only</option>
              <option value="approved">✅ Approved Only</option>
              <option value="pending">⏳ Pending Only</option>
            </select>
          </div>
          
          <div>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              placeholder="Search by username..."
              className="input w-full"
            />
          </div>
          
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input w-full"
            >
              <option value="">All Types</option>
              <option value="progress_photo">Progress Photos</option>
              <option value="workout_video">Workout Videos</option>
              <option value="meal_photo">Meal Photos</option>
              <option value="before_after">Before/After</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="input w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="size">Largest First</option>
              <option value="flags">Most Flagged</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="input flex-1"
              disabled={selectedMedia.length === 0}
            >
              {bulkActions.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedMedia.length === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Media List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMedia.length === media.length && media.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
              {selectedMedia.length > 0 && (
                <span className="text-sm text-primary-600">
                  {selectedMedia.length} selected
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading media...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">Error: {error}</p>
          </div>
        ) : media.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No media found</h3>
            <p className="text-slate-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {media.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedMedia.includes(item.id)}
                    onChange={() => handleMediaSelect(item.id)}
                    className="mt-1"
                  />
                  
                  <img
                    src={item.thumbnail_url}
                    alt={item.description}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                    onClick={() => setViewingMedia(item)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.description}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-slate-600">@{item.username}</span>
                          {getStatusBadge(item)}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <span>{formatDate(item.uploaded_at)}</span>
                          <span>{formatFileSize(item.file_size)}</span>
                          <span>{item.file_type.toUpperCase()}</span>
                          <span>{item.view_count} views</span>
                          {item.flag_count > 0 && (
                            <span className="text-red-600">🚩 {item.flag_count} flags</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingMedia(item)}
                          className="text-slate-400 hover:text-slate-600"
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDownloadMedia(item)}
                          className="text-slate-400 hover:text-blue-600"
                          title="Download"
                        >
                          💾
                        </button>
                        <button
                          onClick={() => setShowFlagModal(item)}
                          className="text-slate-400 hover:text-yellow-600"
                          title={item.flagged ? "Unflag" : "Flag"}
                        >
                          {item.flagged ? '🏳️' : '🚩'}
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item)}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
          title={`${viewingMedia.username}: ${viewingMedia.description}`}
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
                <p><strong>User:</strong> {viewingMedia.username} ({viewingMedia.email})</p>
                <p><strong>Upload Date:</strong> {formatDate(viewingMedia.uploaded_at)}</p>
                <p><strong>File Size:</strong> {formatFileSize(viewingMedia.file_size)}</p>
                <p><strong>Views:</strong> {viewingMedia.view_count}</p>
              </div>
              <div>
                <p><strong>Status:</strong> {getStatusBadge(viewingMedia)}</p>
                <p><strong>Visibility:</strong> {viewingMedia.visibility}</p>
                <p><strong>Downloads:</strong> {viewingMedia.download_count}</p>
                <p><strong>IP Address:</strong> {viewingMedia.metadata.ip_address}</p>
              </div>
            </div>
            
            {viewingMedia.flagged && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">
                  <strong>Flag Reason:</strong> {flagReasons.find(r => r.value === viewingMedia.flag_reason)?.label || viewingMedia.flag_reason}
                </p>
                <p className="text-red-700">
                  <strong>Flag Count:</strong> {viewingMedia.flag_count}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <Modal
          isOpen={!!showFlagModal}
          onClose={() => setShowFlagModal(null)}
          title={showFlagModal.bulk ? `Flag ${showFlagModal.items.length} Items` : showFlagModal.flagged ? 'Unflag Media' : 'Flag Media'}
          size="medium"
        >
          <div className="space-y-4">
            {showFlagModal.flagged ? (
              <p className="text-slate-600">
                Remove flag from this media item? This will make it visible again.
              </p>
            ) : (
              <div>
                <p className="text-slate-600 mb-4">
                  Select a reason for flagging this content:
                </p>
                <div className="space-y-2">
                  {flagReasons.map(reason => (
                    <button
                      key={reason.value}
                      onClick={() => {
                        if (showFlagModal.bulk) {
                          // Handle bulk flag
                          showFlagModal.items.forEach(mediaId => {
                            const mediaItem = media.find(m => m.id === mediaId);
                            if (mediaItem) handleFlagMedia(mediaItem, reason.value);
                          });
                        } else {
                          handleFlagMedia(showFlagModal, reason.value);
                        }
                      }}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFlagModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              {showFlagModal.flagged && (
                <button
                  onClick={() => handleFlagMedia(showFlagModal, null, true)}
                  className="btn btn-primary"
                >
                  Unflag
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          title={showDeleteModal.bulk ? `Delete ${showDeleteModal.items.length} Items` : 'Delete Media'}
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              {showDeleteModal.bulk 
                ? `Are you sure you want to delete ${showDeleteModal.items.length} media items?`
                : `Are you sure you want to delete "${showDeleteModal.description}"?`
              } This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteModal.bulk) {
                    showDeleteModal.items.forEach(mediaId => handleDeleteMedia(mediaId));
                  } else {
                    handleDeleteMedia(showDeleteModal.id);
                  }
                }}
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

export default MediaModeration;