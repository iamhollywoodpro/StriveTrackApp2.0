import React, { useState, useEffect } from 'react';
import { supabase, getFileUrl } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import UserMediaModal from './UserMediaModal';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [userMedia, setUserMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load from profiles directly (no RPC)
      const { data, error } = await supabase
        ?.from('profiles')
        ?.select('id, email, full_name, is_admin, is_active, created_at, bio, goals, profile_picture_url')
        ?.order('created_at', { ascending: false });
      if (error) throw error;

      const processed = (data || []).map((u) => ({
        id: u?.id,
        email: u?.email,
        full_name: u?.full_name,
        name: u?.full_name || u?.email || 'Unknown User',
        role: u?.is_admin ? 'admin' : 'user',
        is_active: u?.is_active !== false,
        created_at: u?.created_at,
        source_table: 'profiles',
        bio: u?.bio || null,
        goals: u?.goals || null,
        profile_picture_url: u?.profile_picture_url || null,
      }));

      setUsers(processed);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (!userToDelete?.id || userToDelete?.id === user?.id) {
      alert('Cannot delete your own account or invalid user');
      return;
    }

    try {
      setDeleteLoading(userToDelete?.id);
      
      // Soft disable user in profiles instead of RPC delete
      const { error } = await supabase
        ?.from('profiles')
        ?.update({ is_active: false })
        ?.eq('id', userToDelete?.id);
      if (error) throw error;

      alert(`User "${userToDelete?.email}" has been disabled (soft deleted).`);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error?.message}`);
    } finally {
      setDeleteLoading(null);
      setShowDeleteConfirm(null);
    }
  };

  const loadUserMedia = async (userId) => {
    if (!userId) return;

    setMediaLoading(true);
    try {
      // List all media files for the user
      const { data: files, error } = await supabase?.storage?.from('user-media')?.list(`${userId}`, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Fetch media records from DB to get statuses and IDs for admin actions
      const { data: mediaRecords } = await supabase
        ?.from('media_files')
        ?.select('id, file_path, status')
        ?.eq('user_id', userId)
        ?.neq('status', 'deleted');

      const recordMap = Object.fromEntries((mediaRecords || []).map(r => [r.file_path, r]));

      // Generate signed URLs for all media files and merge DB status
      const mediaWithUrls = await Promise.all(
        (files || [])
          ?.filter(file => {
            const isMedia = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i?.test(file?.name);
            return isMedia && file?.name !== '.emptyFolderPlaceholder';
          })
          ?.map(async (file) => {
            const filePath = `${userId}/${file?.name}`;
            const { url } = await getFileUrl('user-media', filePath, false);
            const record = recordMap[filePath];
            
            return {
              ...file,
              fullPath: filePath,
              url,
              dbId: record?.id || null,
              status: record?.status || 'active',
              type: /\.(mp4|mov|avi|webm)$/i?.test(file?.name) ? 'video' : 'image',
              uploadDate: new Date(file.created_at || file.updated_at)?.toLocaleDateString(),
              size: (file?.metadata?.size ? (file?.metadata?.size / 1024 / 1024)?.toFixed(2) : 'Unknown') + ' MB'
            };
          }) || []
      );

      setUserMedia(mediaWithUrls?.filter(media => media?.url));
    } catch (error) {
      console.error('Error loading user media:', error);
      setUserMedia([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleUserClick = async (selectedUser) => {
    // Navigate to dedicated admin user profile page
    navigate(`/admin-dashboard/users/${selectedUser?.id}`);
  };

  const handleViewMedia = (user) => {
    setSelectedUser(user);
    setShowMediaModal(true);
    loadUserMedia(user?.id);
  };

  const handleMediaAction = async (action, media) => {
    if (!selectedUser || !media) return;

    try {
      switch (action) {
        case 'flag':
        case 'unflag': {
          const newStatus = action === 'flag' ? 'flagged' : 'active';
          const { error } = await supabase
            ?.from('media_files')
            ?.update({ status: newStatus, updated_at: new Date().toISOString() })
            ?.match({ user_id: selectedUser?.id, file_path: media?.fullPath });
          if (error) throw error;
          await loadUserMedia(selectedUser?.id);
          alert(`Media ${newStatus === 'flagged' ? 'flagged' : 'unflagged'} successfully`);
          break;
        }
        
        case 'delete':
          if (confirm(`Are you sure you want to delete "${media?.name}"? This action cannot be undone.`)) {
            const { error } = await supabase?.storage?.from('user-media')?.remove([media?.fullPath]);
            
            if (error) throw error;
            
            // Reload user media
            await loadUserMedia(selectedUser?.id);
            alert('Media deleted successfully');
          }
          break;
          
        case 'download':
          // Download the file
          const { data, error } = await supabase?.storage?.from('user-media')?.download(media?.fullPath);
          
          if (error) throw error;
          
          // Create download link
          const url = URL.createObjectURL(data);
          const link = document.createElement('a');
          link.href = url;
          link.download = media?.name;
          document.body?.appendChild(link);
          link?.click();
          document.body?.removeChild(link);
          URL.revokeObjectURL(url);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Failed to ${action} media. Please try again.`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Icon name="Shield" size={48} className="text-muted-foreground mb-4 mx-auto" strokeWidth={1.5} />
        <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">You don't have permission to access this section.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">View and manage all registered users ({users?.length} total)</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <Icon name="RotateCcw" size={16} strokeWidth={2} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Account Status Check - Show if issues detected */}
      {users?.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 mr-3 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-yellow-800 font-medium mb-1">No Users Found</h4>
              <p className="text-yellow-700 text-sm">
                If you expect to see users here, there might be a data consolidation issue. 
                Check if user accounts exist in the profiles table but not in user_profiles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Source</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.map((userData) => (
                <tr 
                  key={userData?.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleUserClick(userData)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        {userData?.profile_picture_url ? (
                          <img
                            src={userData?.profile_picture_url}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Icon name="User" size={20} color="white" strokeWidth={2} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {userData?.full_name || userData?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {userData?.id?.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{userData?.email || 'No email'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      userData?.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {userData?.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">
                      {userData?.created_at ? new Date(userData?.created_at)?.toLocaleDateString() : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      userData?.is_active !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {userData?.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      userData?.source_table === 'user_profiles' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    }`}>
                      {userData?.source_table === 'user_profiles' || userData?.source_table === 'profiles' ? 'Complete' : 'Legacy'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleViewMedia(userData);
                        }}
                      >
                        <Icon name="Image" size={14} strokeWidth={2} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e?.stopPropagation();
                          navigate(`/admin-dashboard/users/${userData?.id}`)
                        }}
                      >
                        <Icon name="Eye" size={14} strokeWidth={2} />
                      </Button>
                      {userData?.id !== user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteLoading === userData?.id}
                          onClick={(e) => {
                            e?.stopPropagation();
                            setShowDeleteConfirm(userData);
                          }}
                        >
                          {deleteLoading === userData?.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent" />
                          ) : (
                            <Icon name="Trash2" size={14} strokeWidth={2} />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-muted-foreground mb-4 mx-auto" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-foreground mb-2">No Users Found</h3>
              <p className="text-muted-foreground">No registered users found in the system.</p>
              <Button 
                onClick={loadUsers} 
                className="mt-4"
                variant="outline"
              >
                <Icon name="RotateCcw" size={16} strokeWidth={2} className="mr-2" />
                Try Refreshing
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Icon name="AlertTriangle" size={24} className="text-red-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete User Account</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-foreground mb-2">
                Are you sure you want to delete the account for:
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground">{showDeleteConfirm?.full_name || showDeleteConfirm?.name}</p>
                <p className="text-sm text-muted-foreground">{showDeleteConfirm?.email}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will permanently delete all user data including habits, goals, progress photos, and social posts.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteLoading === showDeleteConfirm?.id}
                onClick={() => handleDeleteUser(showDeleteConfirm)}
              >
                {deleteLoading === showDeleteConfirm?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">User Details</h3>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowUserDetails(false)}
              >
                <Icon name="X" size={20} strokeWidth={2} />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">Full Name:</span>
                      <p className="text-sm text-muted-foreground">{selectedUser?.full_name || selectedUser?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Email:</span>
                      <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Bio:</span>
                      <p className="text-sm text-muted-foreground">{selectedUser?.bio || 'No bio provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Goals:</span>
                      <p className="text-sm text-muted-foreground">{selectedUser?.goals || 'No goals set'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Account Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">User ID:</span>
                      <p className="text-sm text-muted-foreground font-mono">{selectedUser?.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Role:</span>
                      <p className="text-sm text-muted-foreground">{selectedUser?.role || 'user'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Created:</span>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser?.created_at ? new Date(selectedUser?.created_at)?.toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Status:</span>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser?.is_active !== false ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Data Source:</span>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser?.source_table === 'user_profiles' ? 'Complete Profile' : 'Legacy Profile'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Media */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Media Uploads ({userMedia?.length || 0})</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowMediaModal(true);
                      setShowUserDetails(false);
                    }}
                  >
                    <Icon name="ExternalLink" size={14} strokeWidth={2} className="mr-2" />
                    View All Media
                  </Button>
                </div>

                {mediaLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : userMedia?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userMedia?.slice(0, 8)?.map((media, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          {media?.type === 'image' ? (
                            <img
                              src={media?.url}
                              alt={media?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="Video" size={24} className="text-muted-foreground" strokeWidth={2} />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMediaAction('download', media)}
                              className="text-white hover:text-white hover:bg-white/20"
                            >
                              <Icon name="Download" size={14} strokeWidth={2} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMediaAction(media?.status === 'flagged' ? 'unflag' : 'flag', media)}
                              className="text-white hover:text-white hover:bg-white/20"
                            >
                              <Icon name="Flag" size={14} strokeWidth={2} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMediaAction('delete', media)}
                              className="text-white hover:text-white hover:bg-white/20"
                            >
                              <Icon name="Trash2" size={14} strokeWidth={2} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Image" size={32} className="text-muted-foreground mb-2 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">No media uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Media Modal */}
      {showMediaModal && selectedUser && (
        <UserMediaModal
          user={selectedUser}
          media={userMedia}
          loading={mediaLoading}
          onClose={() => setShowMediaModal(false)}
          onMediaAction={handleMediaAction}
        />
      )}
    </div>
  );
};

export default UserManagement;