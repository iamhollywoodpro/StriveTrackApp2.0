import React, { useState, useEffect } from 'react';
import adminService from '../../lib/adminService';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers(currentPage, 20, filters);
      if (response.success) {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleUserAction = async (userId, action, value) => {
    try {
      let response;
      if (action === 'role') {
        response = await adminService.updateUserRole(userId, value);
      } else if (action === 'status') {
        response = await adminService.updateUserStatus(userId, value);
      }

      if (response.success) {
        loadUsers(); // Refresh the list
        alert(response.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      const updates = {};
      if (bulkAction.startsWith('role_')) {
        updates.role = bulkAction.replace('role_', '');
      } else if (bulkAction.startsWith('status_')) {
        updates.status = bulkAction.replace('status_', '');
      }

      const response = await adminService.bulkUpdateUsers(selectedUsers, updates);
      if (response.success) {
        loadUsers();
        setSelectedUsers([]);
        setShowBulkModal(false);
        setBulkAction('');
        alert(response.message);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    }
  };

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'banned': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getUserRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-indigo-600 bg-indigo-100';
      case 'moderator': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const UserDetailModal = ({ user, onClose }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
      const loadUserDetails = async () => {
        try {
          const response = await adminService.getUserDetails(user.id);
          if (response.success) {
            setUserDetails(response.user);
          }
        } catch (error) {
          console.error('Error loading user details:', error);
        } finally {
          setLoadingDetails(false);
        }
      };

      if (user) {
        loadUserDetails();
      }
    }, [user]);

    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.displayName}</h2>
                  <p className="text-slate-600">@{user.username}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingDetails ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-slate-200 rounded"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            ) : userDetails && (
              <div className="space-y-6">
                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{userDetails.analytics.totalWorkouts}</div>
                    <div className="text-sm text-blue-600">Total Workouts</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{userDetails.analytics.currentStreak}</div>
                    <div className="text-sm text-green-600">Current Streak</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{userDetails.analytics.socialInteractions.followers}</div>
                    <div className="text-sm text-purple-600">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{userDetails.totalPoints}</div>
                    <div className="text-sm text-orange-600">Total Points</div>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Role:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Joined:</span>
                        <span>{new Date(user.joinedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Login:</span>
                        <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Verified:</span>
                        <span>{user.isVerified ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Fitness Analytics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Avg Workout Time:</span>
                        <span>{userDetails.analytics.averageWorkoutDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Distance:</span>
                        <span>{userDetails.analytics.totalDistance} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Calories Burned:</span>
                        <span>{userDetails.analytics.totalCaloriesBurned.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Favorite Workout:</span>
                        <span>{userDetails.analytics.favoriteWorkoutType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Achievements:</span>
                        <span>{userDetails.analytics.achievementsUnlocked}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <select 
                    onChange={(e) => e.target.value && handleUserAction(user.id, 'role', e.target.value)}
                    className="form-select text-sm"
                    defaultValue=""
                  >
                    <option value="">Change Role</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <select 
                    onChange={(e) => e.target.value && handleUserAction(user.id, 'status', e.target.value)}
                    className="form-select text-sm"
                    defaultValue=""
                  >
                    <option value="">Change Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                  
                  <button className="btn btn-outline-primary text-sm">
                    📧 Send Message
                  </button>
                  
                  <button className="btn btn-outline-secondary text-sm">
                    📋 View Full Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600">Manage users, roles, and permissions across the platform</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="btn btn-primary">
            📊 Export Users
          </button>
          <button className="btn btn-outline-primary">
            ➕ Invite User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input w-full"
            />
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="form-select"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="form-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="form-select text-sm"
              >
                <option value="">Bulk Actions</option>
                <option value="role_user">Set Role: User</option>
                <option value="role_moderator">Set Role: Moderator</option>
                <option value="status_active">Set Status: Active</option>
                <option value="status_suspended">Set Status: Suspended</option>
                <option value="status_banned">Set Status: Banned</option>
              </select>
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={!bulkAction}
                className="btn btn-primary text-sm disabled:opacity-50"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="btn btn-secondary text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-slate-200 rounded"></div>
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedUsers.length === users.length && users.length > 0}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={user.avatar} 
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-slate-900">{user.displayName}</div>
                          <div className="text-sm text-slate-500">@{user.username}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                        {user.isVerified && (
                          <span className="text-blue-500 text-sm">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.flags > 0 && (
                        <span className="ml-2 text-red-500 text-xs">🚩{user.flags}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{user.totalPosts} posts</div>
                      <div>{user.totalFollowers} followers</div>
                      <div className="text-xs text-slate-400">
                        {user.currentStreak} day streak
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{new Date(user.joinedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-400">
                        Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button className="text-slate-600 hover:text-slate-800 text-sm">
                          Edit
                        </button>
                        {user.status !== 'banned' && (
                          <button 
                            onClick={() => handleUserAction(user.id, 'status', 'suspended')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} users
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary text-sm disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="btn btn-secondary text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }} 
        />
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Confirm Bulk Action</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to apply this action to {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkAction}
                className="btn btn-primary flex-1"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;