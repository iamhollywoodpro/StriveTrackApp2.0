import React, { useState } from 'react';
import MediaModeration from '../../components/admin/MediaModeration';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample admin statistics
  const stats = {
    totalUsers: 1247,
    activeUsers: 893,
    totalMedia: 2856,
    flaggedMedia: 12,
    pendingReports: 3,
    todayUploads: 47
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">⚙️ Admin Dashboard</h1>
              <p className="text-slate-600">Manage users, content, and system settings</p>
            </div>
            <a href="/dashboard" className="btn btn-secondary">← Back to Dashboard</a>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-blue-500 text-3xl">👥</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="text-green-500 text-3xl">🟢</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Total Media</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalMedia.toLocaleString()}</p>
              </div>
              <div className="text-purple-500 text-3xl">📸</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">Today's Uploads</p>
                <p className="text-2xl font-bold text-orange-900">{stats.todayUploads}</p>
              </div>
              <div className="text-orange-500 text-3xl">📤</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 font-medium">Flagged Media</p>
                <p className="text-2xl font-bold text-red-900">{stats.flaggedMedia}</p>
              </div>
              <div className="text-red-500 text-3xl">🚩</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 font-medium">Pending Reports</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingReports}</p>
              </div>
              <div className="text-yellow-500 text-3xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              📊 Overview
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'moderation' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              🛡️ Media Moderation
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'users' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              👥 User Management
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-green-500">✅</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">New user registration: john_doe</p>
                      <p className="text-xs text-slate-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-blue-500">📤</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">Media uploaded by fitnessfan23</p>
                      <p className="text-xs text-slate-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-red-500">🚩</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">Content flagged for review</p>
                      <p className="text-xs text-slate-500">12 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">System Health</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Server CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Performance</span>
                      <span>91%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Media Moderation Center</h2>
                <p className="text-slate-600">
                  Review, flag, and manage user-uploaded content across the platform.
                </p>
              </div>
              <MediaModeration />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">User Management</h2>
              <p className="text-slate-600 mb-6">Coming in Phase 6 - Advanced Admin Features</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">🚧 Feature Preview</p>
                <p className="text-blue-700 text-sm mt-1">
                  User management, role assignments, and account moderation tools will be available in the next phase.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">System Settings</h2>
              <p className="text-slate-600 mb-6">Coming in Phase 6 - Advanced Admin Features</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">🚧 Feature Preview</p>
                <p className="text-blue-700 text-sm mt-1">
                  System configuration, feature toggles, and advanced settings will be available in the next phase.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6 mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-outline-primary">
              📊 Generate Reports
            </button>
            <button className="btn btn-outline-primary">
              📧 Send Notifications
            </button>
            <button className="btn btn-outline-primary">
              🔧 System Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;