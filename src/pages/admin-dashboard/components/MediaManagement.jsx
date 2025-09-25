import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import UserMediaModal from './UserMediaModal';
import { supabase } from '../../../lib/supabase';

// Admin Media Management without RPCs
// - Loads users from profiles
// - Loads media from media_files
// - Generates signed URLs from user-media bucket
// - Supports flag/unflag/delete/download and filtering

const BUCKET = 'user-media';

const MediaManagement = () => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [mediaData, setMediaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [userMediaLoading, setUserMediaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Load all users from profiles
  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        ?.from('profiles')
        ?.select('id, email, full_name, is_admin, created_at, is_active')
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      const processed = (data || []).map((u) => ({
        id: u?.id,
        name: u?.full_name || u?.email || 'Unknown User',
        email: u?.email || 'No email',
        isAdmin: u?.is_admin === true,
        mediaCount: 0, // will fill after media load
        createdAt: u?.created_at,
        is_active: u?.is_active !== false,
      }));

      setAllUsers(processed);
    } catch (e) {
      console.error('Failed to load users:', e);
      setError(`Failed to load users: ${e?.message}`);
      setAllUsers([]);
    }
  };

  // Load media files from media_files; optional filter by user
  const loadMediaFiles = async (specificUserId = null) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        ?.from('media_files')
        ?.select('*')
        ?.order('uploaded_at', { ascending: false });

      if (specificUserId) query = query?.eq('user_id', specificUserId);

      const { data, error } = await query;
      if (error) throw error;

      // Build user map for enrichment
      let users = allUsers;
      if (!users || users.length === 0) {
        const { data: profiles, error: pErr } = await supabase
          ?.from('profiles')
          ?.select('id, email, full_name, is_admin');
        if (pErr) throw pErr;
        users = (profiles || []).map((p) => ({
          id: p?.id,
          email: p?.email,
          name: p?.full_name || p?.email || 'Unknown User',
          isAdmin: p?.is_admin === true,
        }));
        setAllUsers(users);
      }
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Build proxied URLs through R2 media Worker (no signed URLs)
      const API_BASE = import.meta.env?.VITE_MEDIA_API_BASE;
      const processed = (data || []).map((m) => {
        const u = userMap.get(m?.user_id);
        const url = m?.file_path ? `${API_BASE}/media/${encodeURIComponent(m.file_path)}` : null;
        return {
          id: m?.id,
          type: m?.media_type || (m?.mime_type?.startsWith('video') ? 'video' : 'image'),
          filename: m?.filename || m?.file_path?.split('/')?.pop() || 'File',
          uploadDate: m?.uploaded_at ? new Date(m?.uploaded_at) : null,
          size: m?.file_size ? `${(m?.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
          userName: u?.name || 'Unknown User',
          userEmail: u?.email || 'No email available',
          userFullName: u?.name || null,
          userId: m?.user_id,
          userIsAdmin: u?.isAdmin || false,
          flagged: m?.status === 'flagged',
          url,
          filePath: m?.file_path,
          mimeType: m?.mime_type,
          status: m?.status,
          progressType: m?.progress_type,
          privacyLevel: m?.privacy_level,
          description: m?.description || null,
          views: Math.floor(Math.random() * 1000),
        };
      });

      // backfill mediaCount per user for dropdown
      const counts = new Map();
      processed.forEach((m) => counts.set(m.userId, (counts.get(m.userId) || 0) + 1));
      setAllUsers((prev) =>
        (prev || []).map((u) => ({ ...u, mediaCount: counts.get(u.id) || 0 }))
      );

      setMediaData(processed);
    } catch (e) {
      console.error('Failed to load media files:', e);
      setError(`Failed to load media: ${e?.message}`);
      setMediaData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load media for a user (modal)
  const loadUserMedia = async (userId) => {
    if (!userId) return;
    try {
      setUserMediaLoading(true);
      const { data, error } = await supabase
        ?.from('media_files')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.neq('status', 'deleted')
        ?.order('uploaded_at', { ascending: false });

      if (error) throw error;

      const processed = await Promise.all(
        (data || []).map(async (m) => {
          let signedUrl = null;
          if (m?.file_path) {
            try {
              const { data: urlData, error: urlErr } = await supabase
                ?.storage
                ?.from(BUCKET)
                ?.createSignedUrl(m?.file_path, 3600);
              if (!urlErr) signedUrl = urlData?.signedUrl || null;
            } catch (e) {
              console.warn('Signed URL generation failed:', e);
            }
          }
          return {
            id: m?.id,
            name: m?.filename || m?.file_path?.split('/')?.pop(),
            type: m?.media_type || (m?.mime_type?.startsWith('video') ? 'video' : 'image'),
            size: m?.file_size ? `${(m?.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            uploadDate: m?.uploaded_at ? new Date(m?.uploaded_at).toLocaleDateString() : 'Unknown',
            url: signedUrl,
            filePath: m?.file_path,
            status: m?.status,
            progressType: m?.progress_type,
            description: m?.description,
            mimeType: m?.mime_type,
            userName: undefined,
            userEmail: undefined,
            userFullName: undefined,
          };
        })
      );

      setUserMedia(processed);
    } catch (e) {
      console.error('Error loading user media:', e);
      setUserMedia([]);
    } finally {
      setUserMediaLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadAllUsers();
      await loadMediaFiles();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when user filter changes
  useEffect(() => {
    if (selectedUserId) {
      loadMediaFiles(selectedUserId);
    } else {
      loadMediaFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  // Filtering
  const filteredMedia = mediaData?.filter((media) => {
    const matchesType = filterType === 'all' || media?.type === filterType;
    const matchesStatus = filterStatus === 'all' || media?.status === filterStatus;
    const matchesSearch = !searchTerm ||
      media?.filename?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      media?.userName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      media?.userEmail?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const sortedMedia = [...(filteredMedia || [])]?.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return (new Date(b?.uploadDate) - new Date(a?.uploadDate)) || 0;
      case 'oldest':
        return (new Date(a?.uploadDate) - new Date(b?.uploadDate)) || 0;
      case 'size': {
        const pa = parseFloat(a?.size) || 0;
        const pb = parseFloat(b?.size) || 0;
        return pb - pa;
      }
      case 'user':
        return (a?.userName || '')?.localeCompare(b?.userName || '');
      default:
        return 0;
    }
  });

  const formatUploadTime = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = Math.abs(now - date);
    const diffMin = Math.ceil(diffMs / (1000 * 60));
    const diffHr = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return 'yesterday';
    return `${diffDay} days ago`;
  };

  // Media actions
  const handleMediaAction = async (mediaId, action, media = null) => {
    try {
      const mediaItem = media || sortedMedia?.find((m) => m?.id === mediaId);
      if (!mediaItem) {
        alert('Media item not found.');
        return;
      }

      switch (action) {
        case 'view': {
          const user = {
            full_name: mediaItem?.userFullName || mediaItem?.userName,
            email: mediaItem?.userEmail,
            id: mediaItem?.userId,
          };
          setViewingUser(user);
          await loadUserMedia(mediaItem?.userId);
          break;
        }
        case 'download': {
          if (!mediaItem?.filePath) {
            alert('File path not available.');
            return;
          }
          // Download via R2 proxy
          const session = await supabase?.auth?.getSession();
          const accessToken = session?.data?.session?.access_token;
          const API_BASE = import.meta.env?.VITE_MEDIA_API_BASE;
          const resp = await fetch(`${API_BASE}/media/${encodeURIComponent(mediaItem?.filePath)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!resp.ok) throw new Error('Download failed');
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = mediaItem?.filename || 'download';
          document.body?.appendChild(link);
          link?.click();
          document.body?.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        case 'flag':
        case 'unflag': {
          const newStatus = action === 'flag' ? 'flagged' : 'active';
          const { error: flagError } = await supabase
            ?.from('media_files')
            ?.update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            ?.eq('id', mediaItem?.id);
          if (flagError) throw flagError;
          await loadMediaFiles(selectedUserId);
          break;
        }
        case 'delete': {
          if (!confirm(`Delete "${mediaItem?.filename}"? This cannot be undone.`)) return;
          const { error: dbError } = await supabase
            ?.from('media_files')
            ?.update({ status: 'deleted', updated_at: new Date().toISOString() })
            ?.eq('id', mediaItem?.id);
          if (dbError) throw dbError;
          if (mediaItem?.filePath) {
            try {
              const session = await supabase?.auth?.getSession();
              const accessToken = session?.data?.session?.access_token;
              const API_BASE = import.meta.env?.VITE_MEDIA_API_BASE;
              await fetch(`${API_BASE}/media/${encodeURIComponent(mediaItem?.filePath)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
              });
            } catch (e) {
              console.warn('R2 deletion failed:', e);
            }
          }
          await loadMediaFiles(selectedUserId);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error(`Error performing ${action}:`, e);
      alert(`Error performing ${action}. ${e?.message || ''}`);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedMedia?.length === 0) {
      alert('Please select media files first');
      return;
    }

    const label = { delete: 'delete', flag: 'flag', unflag: 'unflag', download: 'download' }[action];
    if (!confirm(`Are you sure you want to ${label} ${selectedMedia?.length} selected files?`)) return;

    try {
      for (const id of selectedMedia) {
        const media = sortedMedia?.find((m) => m?.id === id);
        if (media) {
          await handleMediaAction(id, action, media);
          await new Promise((r) => setTimeout(r, 150));
        }
      }
      setSelectedMedia([]);
      setBulkActionMode(false);
    } catch (e) {
      console.error('Bulk action error:', e);
      alert(`Error during bulk ${label} operation.`);
    }
  };

  const handleUserMediaAction = async (action, mediaItem) => {
    await handleMediaAction(mediaItem?.id, action, mediaItem);
    if (viewingUser?.id) await loadUserMedia(viewingUser?.id);
  };

  const toggleMediaSelection = (mediaId) => {
    setSelectedMedia((prev) => (prev?.includes(mediaId) ? prev?.filter((id) => id !== mediaId) : [...prev, mediaId]));
  };

  const toggleSelectAll = () => {
    if (selectedMedia?.length === filteredMedia?.length) setSelectedMedia([]);
    else setSelectedMedia(filteredMedia?.map((m) => m?.id) || []);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="text-center">
          <p className="text-foreground font-medium">Loading Media Management Dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedUserId ? 'Loading user-specific media files...' : 'Fetching all user media files...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} color="text-red-500" className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Media Files</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => loadMediaFiles(selectedUserId)} iconName="RefreshCw" iconPosition="left">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location?.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <Icon name="Image" size={28} className="text-primary" strokeWidth={2} />
              <span>Media Management Center</span>
              {selectedUserId && (
                <span className="text-lg text-primary ml-2">
                  • {allUsers?.find((u) => u?.id === selectedUserId)?.name || 'Selected User'}'s Media
                </span>
              )}
            </h2>
            <p className="text-muted-foreground mt-2">
              {selectedUserId
                ? `Viewing media for specific user • ${mediaData?.length} files found`
                : `Admin access to all user media files • Total: ${mediaData?.length} files`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {bulkActionMode && selectedMedia?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMedia([]);
                  setBulkActionMode(false);
                }}
              >
                Cancel Bulk Actions
              </Button>
            )}
          </div>
        </div>

        {/* Quick stats */}
        {mediaData?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{mediaData?.filter((m) => m?.type === 'image')?.length}</p>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600">{mediaData?.filter((m) => m?.type === 'video')?.length}</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">{mediaData?.filter((m) => m?.flagged)?.length}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{mediaData?.filter((m) => m?.status === 'active')?.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">{mediaData?.filter((m) => m?.status === 'deleted')?.length}</p>
              <p className="text-xs text-muted-foreground">Deleted</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* User Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filter by User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e?.target?.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="">All Users ({allUsers?.length} total)</option>
                {allUsers?.map((user) => (
                  <option key={user?.id} value={user?.id}>
                    {user?.name} ({user?.email}) - {user?.mediaCount} files {user?.isAdmin ? '👑' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Media</label>
              <div className="relative">
                <Icon name="Search" size={18} color="text-muted-foreground" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  placeholder="Search by filename, user name, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Media Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e?.target?.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Media</option>
                  <option value="image">📷 Images Only</option>
                  <option value="video">🎥 Videos Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e?.target?.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">✅ Active</option>
                  <option value="flagged">🚩 Flagged</option>
                  <option value="deleted">🗑️ Deleted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sort and Bulk Actions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="recent">🕒 Most Recent</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="size">📊 File Size</option>
                <option value="user">👤 By User Name</option>
              </select>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setBulkActionMode(!bulkActionMode)}
                iconName={bulkActionMode ? 'X' : 'CheckSquare'}
                iconPosition="left"
                className="w-full"
              >
                {bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
              </Button>

              {bulkActionMode && (
                <div className="space-y-2">
                  <Button variant="outline" onClick={toggleSelectAll} className="w-full text-xs">
                    {selectedMedia?.length === filteredMedia?.length ? 'Deselect All' : 'Select All'}
                  </Button>

                  {selectedMedia?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('flag')} className="text-orange-600 hover:bg-orange-50">
                        Flag ({selectedMedia?.length})
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-600 hover:bg-red-50">
                        Delete ({selectedMedia?.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => loadMediaFiles(selectedUserId)}
                iconName="RefreshCw"
                iconPosition="left"
                className="flex-1"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedUserId('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="px-4"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing <strong>{sortedMedia?.length}</strong> of <strong>{mediaData?.length}</strong> media files
          {selectedUserId && (
            <span>
              {' '}
              for user <strong>{allUsers?.find((u) => u?.id === selectedUserId)?.name}</strong>
            </span>
          )}
          {searchTerm && (
            <span>
              {' '}
              matching "<strong>{searchTerm}</strong>"
            </span>
          )}
          {bulkActionMode && selectedMedia?.length > 0 && (
            <span className="ml-4 text-primary font-medium">• {selectedMedia?.length} files selected</span>
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        {sortedMedia?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedMedia?.map((media) => (
              <div
                key={media?.id}
                className={`relative group rounded-xl border overflow-hidden hover:shadow-elevation-3 transition-all duration-200 ${
                  media?.flagged ? 'border-red-300 bg-red-50' : 'border-border bg-background hover:bg-accent/5'
                } ${bulkActionMode && selectedMedia?.includes(media?.id) ? 'ring-2 ring-primary' : ''}`}
              >
                {/* Selection Checkbox */}
                {bulkActionMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedMedia?.includes(media?.id)}
                      onChange={() => toggleMediaSelection(media?.id)}
                      className="rounded border-border text-primary focus:ring-primary bg-white/90 backdrop-blur-sm shadow-sm w-5 h-5"
                    />
                  </div>
                )}

                {/* Status Indicators */}
                <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1">
                  {media?.userIsAdmin && (
                    <div className="bg-yellow-500 text-white p-1.5 rounded-full shadow-lg" title="Admin User">
                      <Icon name="Crown" size={12} color="white" />
                    </div>
                  )}
                  {media?.flagged && (
                    <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                      <Icon name="Flag" size={12} color="white" />
                    </div>
                  )}
                  {media?.progressType && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full shadow-lg">
                      {media?.progressType}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full shadow-lg ${
                      media?.status === 'active'
                        ? 'bg-green-500 text-white'
                        : media?.status === 'flagged'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {media?.status}
                  </span>
                </div>

                {/* Media Preview */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {media?.url ? (
                    <img
                      src={media?.url}
                      alt={media?.filename}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
                    style={{ display: media?.url ? 'none' : 'flex' }}
                  >
                    <Icon name={media?.type === 'video' ? 'Video' : 'Image'} size={48} color="text-muted-foreground" />
                    <p className="text-sm mt-2 text-center px-2">
                      {media?.type === 'video' ? 'Video File' : 'Image File'}
                    </p>
                  </div>

                  {media?.type === 'video' && media?.url && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4 shadow-lg">
                        <Icon name="Play" size={24} color="text-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => handleMediaAction(media?.id, 'view', media)} title="View all media by this user" className="shadow-lg">
                      <Icon name="Eye" size={16} color="currentColor" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleMediaAction(media?.id, 'download', media)} title="Download this file" className="shadow-lg">
                      <Icon name="Download" size={16} color="currentColor" />
                    </Button>
                    <Button
                      size="sm"
                      variant={media?.flagged ? 'secondary' : 'secondary'}
                      onClick={() => handleMediaAction(media?.id, media?.flagged ? 'unflag' : 'flag', media)}
                      title={media?.flagged ? 'Remove flag' : 'Flag content'}
                      className="shadow-lg"
                    >
                      <Icon name="Flag" size={16} color="currentColor" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleMediaAction(media?.id, 'delete', media)} title="Delete this file" className="shadow-lg">
                      <Icon name="Trash2" size={16} color="currentColor" />
                    </Button>
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground truncate" title={media?.filename}>
                        {media?.filename}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Icon name={media?.type === 'image' ? 'Camera' : 'Video'} size={12} color="currentColor" className="mr-1" />
                        {media?.size}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2 text-right">
                      <div className="capitalize">{media?.privacyLevel}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={12} color="currentColor" />
                      <span className="font-medium">
                        {media?.userName} {media?.userIsAdmin && '👑'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Mail" size={12} color="currentColor" />
                      <span className="truncate">{media?.userEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} color="currentColor" />
                      <span>{formatUploadTime(media?.uploadDate)}</span>
                    </div>
                    {media?.description && (
                      <div className="text-xs italic bg-accent/20 p-2 rounded">&quot;{media?.description}&quot;</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleMediaAction(media?.id, 'view', media)} iconName="Users" iconPosition="left">
                      View User
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleMediaAction(media?.id, 'download', media)} title="Download" className="px-2">
                      <Icon name="Download" size={14} color="currentColor" />
                    </Button>
                    <Button
                      size="sm"
                      variant={media?.flagged ? 'destructive' : 'outline'}
                      onClick={() => handleMediaAction(media?.id, media?.flagged ? 'unflag' : 'flag', media)}
                      title={media?.flagged ? 'Remove flag' : 'Flag content'}
                      className="px-2"
                    >
                      <Icon name="Flag" size={14} color="currentColor" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon name="Image" size={64} color="text-muted-foreground" className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {selectedUserId ? 'No media files found for this user' : 'No media files found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedUserId
                ? 'This user has not uploaded any media files yet.'
                : 'No media files have been uploaded by any users yet.'}
            </p>
            {selectedUserId && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUserId('');
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                View All Users' Media
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User Media Modal */}
      {viewingUser && (
        <UserMediaModal
          user={viewingUser}
          media={userMedia}
          loading={userMediaLoading}
          onClose={() => {
            setViewingUser(null);
            setUserMedia([]);
          }}
          onMediaAction={handleUserMediaAction}
        />
      )}
    </div>
  );
};

export default MediaManagement;
