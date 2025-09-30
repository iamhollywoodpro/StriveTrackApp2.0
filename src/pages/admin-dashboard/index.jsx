import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet, apiSend } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin email allowlist - must match Worker ADMIN_EMAILS
  const ADMIN_EMAILS = ['iamhollywoodpro@protonmail.com', 'iamhollywoodpro@gmail.com'];
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (user?.email && isAdmin) {
      loadUsers();
    } else if (user?.email && !isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet('/admin/users', supabase);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (userId) => {
    try {
      setMediaLoading(true);
      setSelectedUser(userId);
      
      // Load user's media
      const mediaResponse = await apiGet(`/admin/user/${userId}/media`, supabase);
      setUserMedia(mediaResponse.media || []);
    } catch (error) {
      console.error('Error loading user media:', error);
      setError('Failed to load user media: ' + (error.message || 'Unknown error'));
      setUserMedia([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const deleteMedia = async (mediaKey) => {
    if (!confirm('Are you sure you want to delete this media file?')) {
      return;
    }

    try {
      await apiSend('DELETE', `/admin/media/${encodeURIComponent(mediaKey)}`, null, supabase);
      
      // Refresh the media list
      if (selectedUser) {
        selectUser(selectedUser);
      }
      
      alert('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media: ' + (error.message || 'Unknown error'));
    }
  };

  const downloadMedia = (mediaUrl, fileName) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || 'media-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flagMedia = async (mediaKey) => {
    const reason = prompt('Enter reason for flagging this media (optional):');
    if (reason === null) return; // User cancelled
    
    try {
      await apiSend('POST', `/admin/media/${encodeURIComponent(mediaKey)}/flag`, { reason }, supabase);
      
      // Refresh the media list
      if (selectedUser) {
        selectUser(selectedUser);
      }
      
      alert('Media flagged successfully');
    } catch (error) {
      console.error('Error flagging media:', error);
      alert('Failed to flag media: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" strokeWidth={1} />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-red-600">You don't have admin privileges to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard 👑
            </h1>
            <p className="text-muted-foreground">
              Manage users and their content across StriveTrack.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={20} className="text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users List */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Users</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadUsers}
                    disabled={loading}
                  >
                    <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                            selectedUser === user.id
                              ? 'bg-primary/10 border-primary/20'
                              : 'bg-background hover:bg-muted border-border'
                          }`}
                          onClick={() => selectUser(user.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <Icon name="User" size={16} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.name || 'Unnamed User'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                          {user.bio && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          {user.updated_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated: {formatDate(user.updated_at)}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* User Details & Media */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      User Details
                    </h3>
                    {(() => {
                      const user = users.find(u => u.id === selectedUser);
                      return user ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-foreground">{user.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">User ID</label>
                            <p className="text-foreground font-mono text-sm">{user.id}</p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                            <p className="text-foreground">{user.bio || 'No bio provided'}</p>
                          </div>
                          {user.targets && Object.keys(user.targets).length > 0 && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-muted-foreground">Targets</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                                {user.targets.height && (
                                  <div className="text-sm">
                                    <span className="font-medium">Height:</span> {user.targets.height}
                                  </div>
                                )}
                                {user.targets.weight && (
                                  <div className="text-sm">
                                    <span className="font-medium">Weight:</span> {user.targets.weight}
                                  </div>
                                )}
                                {user.targets.goals && (
                                  <div className="text-sm sm:col-span-3">
                                    <span className="font-medium">Goals:</span> {user.targets.goals}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">User not found</p>
                      );
                    })()}
                  </div>

                  {/* User Media */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      User Media ({userMedia.length})
                    </h3>

                    {mediaLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading media...</p>
                      </div>
                    ) : userMedia.length === 0 ? (
                      <div className="text-center py-8">
                        <Icon name="Image" size={48} className="text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                        <p className="text-muted-foreground">No media files found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userMedia.map((media) => (
                          <div key={media.key} className={`border rounded-lg overflow-hidden ${media.flagged ? 'border-red-300 bg-red-50' : 'border-border'}`}>
                            {/* Flagged Badge */}
                            {media.flagged && (
                              <div className="bg-red-100 border-b border-red-200 px-3 py-2">
                                <div className="flex items-center space-x-2">
                                  <Icon name="Flag" size={14} className="text-red-600" />
                                  <span className="text-xs text-red-800 font-medium">FLAGGED</span>
                                </div>
                                {media.flag_reason && (
                                  <p className="text-xs text-red-600 mt-1">{media.flag_reason}</p>
                                )}
                              </div>
                            )}
                            {/* Media Preview */}
                            <div className="aspect-square bg-muted flex items-center justify-center">
                              {media.contentType?.startsWith('image/') ? (
                                <img
                                  src={media.url}
                                  alt="User media"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : media.contentType?.startsWith('video/') ? (
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover"
                                  controls={false}
                                  muted
                                />
                              ) : (
                                <Icon name="File" size={32} className="text-muted-foreground" />
                              )}
                              <div className="hidden w-full h-full items-center justify-center">
                                <Icon name="ImageOff" size={32} className="text-muted-foreground" />
                              </div>
                            </div>

                            {/* Media Info & Actions */}
                            <div className="p-3">
                              <p className="text-xs text-muted-foreground mb-2 truncate">
                                {media.key.split('/').pop()}
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                {media.createdAt ? formatDate(media.createdAt) : 'Unknown date'}
                              </p>
                              
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(media.url, '_blank')}
                                  className="flex-1"
                                >
                                  <Icon name="Eye" size={14} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadMedia(media.url, media.key.split('/').pop())}
                                  className="flex-1"
                                >
                                  <Icon name="Download" size={14} />
                                </Button>
                                <Button
                                  variant={media.flagged ? "destructive" : "secondary"}
                                  size="sm"
                                  onClick={() => flagMedia(media.key)}
                                  className="flex-1"
                                  title={media.flagged ? `Flagged: ${media.flag_reason || 'No reason'}` : 'Flag this media'}
                                >
                                  <Icon name="Flag" size={14} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteMedia(media.key)}
                                  className="flex-1"
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a User</h3>
                    <p className="text-muted-foreground">
                      Choose a user from the list to view their profile and manage their media files.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;