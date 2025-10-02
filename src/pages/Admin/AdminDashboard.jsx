import React, { useState } from 'react';
import MediaModeration from '../../components/admin/MediaModeration';
import UserManagement from '../../components/admin/UserManagement';
import ContentAnalytics from '../../components/admin/ContentAnalytics';
import SystemConfiguration from '../../components/admin/SystemConfiguration';
import AdminInsights from '../../components/admin/AdminInsights';
import AuditLogs from '../../components/admin/AuditLogs';
import AutomatedModeration from '../../components/admin/AutomatedModeration';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('insights');

  // Sample admin statistics
  const stats = {
    totalUsers: 12567,
    activeUsers: 8934,
    totalMedia: 34567,
    flaggedMedia: 23,
    pendingReports: 7,
    todayUploads: 234,
    systemHealth: 99.9,
    serverLoad: 23,
    storageUsed: 67,
    activeConnections: 1234
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
                <p className="text-xs text-blue-700">+5.2% this month</p>
              </div>
              <div className="text-blue-500 text-3xl">👥</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-green-700">71% engagement rate</p>
              </div>
              <div className="text-green-500 text-3xl">🔥</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Total Content</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalMedia.toLocaleString()}</p>
                <p className="text-xs text-purple-700">{stats.todayUploads} added today</p>
              </div>
              <div className="text-purple-500 text-3xl">📝</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 font-medium">System Health</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.systemHealth}%</p>
                <p className="text-xs text-emerald-700">All systems operational</p>
              </div>
              <div className="text-emerald-500 text-3xl">🟢</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium">Server Load</p>
                <p className="text-2xl font-bold text-slate-900">{stats.serverLoad}%</p>
                <p className="text-xs text-slate-700">CPU utilization</p>
              </div>
              <div className="text-slate-500 text-3xl">⚡</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-orange-900">{stats.storageUsed}%</p>
                <p className="text-xs text-orange-700">Of allocated space</p>
              </div>
              <div className="text-orange-500 text-3xl">💾</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 font-medium">Live Sessions</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.activeConnections.toLocaleString()}</p>
                <p className="text-xs text-indigo-700">Active connections</p>
              </div>
              <div className="text-indigo-500 text-3xl">🌐</div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 font-medium">Action Required</p>
                <p className="text-2xl font-bold text-red-900">{stats.flaggedMedia + stats.pendingReports}</p>
                <p className="text-xs text-red-700">Items need review</p>
              </div>
              <div className="text-red-500 text-3xl">🚨</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-white p-2 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'insights' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>📊 Insights</div>
              <div className="text-xs mt-1 opacity-75">Overview</div>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'users' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>👥 Users</div>
              <div className="text-xs mt-1 opacity-75">Management</div>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'analytics' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>📈 Analytics</div>
              <div className="text-xs mt-1 opacity-75">Content</div>
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'moderation' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>🛡️ Media</div>
              <div className="text-xs mt-1 opacity-75">Moderation</div>
            </button>
            <button 
              onClick={() => setActiveTab('ai-moderation')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'ai-moderation' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>🤖 AI Mod</div>
              <div className="text-xs mt-1 opacity-75">Automated</div>
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'config' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>⚙️ Config</div>
              <div className="text-xs mt-1 opacity-75">System</div>
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-3 rounded-lg font-medium transition-all text-center ${
                activeTab === 'audit' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
              }`}
            >
              <div>📋 Audit</div>
              <div className="text-xs mt-1 opacity-75">Logs</div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'insights' && <AdminInsights />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && <ContentAnalytics />}
          {activeTab === 'moderation' && <MediaModeration />}
          {activeTab === 'ai-moderation' && <AutomatedModeration />}
          {activeTab === 'config' && <SystemConfiguration />}
          {activeTab === 'audit' && <AuditLogs />}
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