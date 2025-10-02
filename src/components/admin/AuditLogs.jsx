import React, { useState, useEffect } from 'react';
import adminService from '../../lib/adminService';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    user: '',
    dateRange: '7d'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAuditLogs(currentPage, 50, filters);
      if (response.success) {
        setLogs(response.logs);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const getActionIcon = (action) => {
    const iconMap = {
      user_login: '🔐',
      user_logout: '🚪',
      user_created: '👤',
      user_updated: '✏️',
      user_deleted: '🗑️',
      user_banned: '🚫',
      user_unbanned: '✅',
      post_created: '📝',
      post_updated: '✏️',
      post_deleted: '🗑️',
      comment_posted: '💬',
      content_flagged: '🚩',
      config_updated: '⚙️',
      backup_created: '💾',
      system_restart: '🔄'
    };
    return iconMap[action] || '📋';
  };

  const getActionColor = (action) => {
    if (action.includes('login') || action.includes('created')) return 'text-green-600 bg-green-100';
    if (action.includes('updated')) return 'text-blue-600 bg-blue-100';
    if (action.includes('deleted') || action.includes('banned')) return 'text-red-600 bg-red-100';
    if (action.includes('flagged')) return 'text-orange-600 bg-orange-100';
    return 'text-slate-600 bg-slate-100';
  };

  const getSuccessIndicator = (success) => {
    return success ? (
      <span className="text-green-600 text-sm">✅ Success</span>
    ) : (
      <span className="text-red-600 text-sm">❌ Failed</span>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - logTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return logTime.toLocaleDateString();
  };

  const exportLogs = (format) => {
    const dataToExport = logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      user: log.userName,
      details: log.details,
      success: log.success,
      ipAddress: log.ipAddress
    }));

    let content;
    let filename;
    let mimeType;

    switch (format) {
      case 'json':
        content = JSON.stringify(dataToExport, null, 2);
        filename = 'audit_logs.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = ['Timestamp', 'Action', 'User', 'Details', 'Success', 'IP Address'];
        const csvContent = [
          headers.join(','),
          ...dataToExport.map(log => [
            log.timestamp,
            log.action,
            log.user,
            `"${log.details}"`,
            log.success,
            log.ipAddress
          ].join(','))
        ].join('\n');
        content = csvContent;
        filename = 'audit_logs.csv';
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = dataToExport.map(log => 
          `[${log.timestamp}] ${log.action} by ${log.user} - ${log.details} (${log.success ? 'SUCCESS' : 'FAILED'}) from ${log.ipAddress}`
        ).join('\n');
        filename = 'audit_logs.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const LogDetailModal = ({ log, onClose }) => {
    if (!log) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getActionIcon(log.action)}</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{log.action.replace(/_/g, ' ').toUpperCase()}</h2>
                  <p className="text-slate-600">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Log Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">User Information</h4>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-slate-600">User ID:</span>
                      <span className="font-mono text-slate-900 ml-2">{log.userId}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">Display Name:</span>
                      <span className="text-slate-900 ml-2">{log.userName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Technical Details</h4>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                    <div className="text-sm">
                      <span className="text-slate-600">IP Address:</span>
                      <span className="font-mono text-slate-900 ml-2">{log.ipAddress}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">Status:</span>
                      <span className="ml-2">{getSuccessIndicator(log.success)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Action Details</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-800">{log.details}</p>
                </div>
              </div>

              {log.metadata && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Metadata</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <button className="btn btn-outline-primary text-sm">
                  🔍 View Related Logs
                </button>
                <button className="btn btn-outline-secondary text-sm">
                  📋 Copy Details
                </button>
                {!log.success && (
                  <button className="btn btn-outline-red text-sm">
                    🚨 Create Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const actionOptions = [
    'all', 'user_login', 'user_logout', 'user_created', 'user_updated', 'user_deleted',
    'post_created', 'post_updated', 'post_deleted', 'comment_posted', 'content_flagged',
    'config_updated', 'backup_created', 'system_restart'
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
          <p className="text-slate-600">Track all system activities and user actions for security and compliance</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="form-select text-sm"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
          
          <button 
            onClick={() => exportLogs(exportFormat)}
            className="btn btn-primary"
          >
            📥 Export Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="form-select w-full"
            >
              {actionOptions.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
            <input
              type="text"
              placeholder="Search by user name or ID..."
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              className="form-input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="form-select w-full"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => {
                setFilters({ action: 'all', user: '', dateRange: '7d' });
                setCurrentPage(1);
              }}
              className="btn btn-secondary w-full"
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Logs</p>
              <p className="text-2xl font-bold text-blue-900">{pagination.total?.toLocaleString() || 0}</p>
            </div>
            <span className="text-blue-500 text-2xl">📋</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-green-900">
                {logs.length > 0 ? Math.round((logs.filter(log => log.success).length / logs.length) * 100) : 0}%
              </p>
            </div>
            <span className="text-green-500 text-2xl">✅</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Failed Actions</p>
              <p className="text-2xl font-bold text-orange-900">
                {logs.filter(log => !log.success).length}
              </p>
            </div>
            <span className="text-orange-500 text-2xl">⚠️</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(logs.map(log => log.userId)).size}
              </p>
            </div>
            <span className="text-purple-500 text-2xl">👥</span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-slate-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-16 h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getActionIcon(log.action)}</span>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{log.userName}</div>
                        <div className="text-sm text-slate-500 font-mono">{log.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getSuccessIndicator(log.success)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600">{log.ipAddress}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-slate-900">{formatTimeAgo(log.timestamp)}</div>
                        <div className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
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
            Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, pagination.total)} of {pagination.total} logs
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

      {/* Log Detail Modal */}
      {showLogModal && (
        <LogDetailModal 
          log={selectedLog} 
          onClose={() => {
            setShowLogModal(false);
            setSelectedLog(null);
          }} 
        />
      )}

      {/* Security Notice */}
      <div className="mt-8 card p-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-3">🔒 Security & Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Data Retention</h4>
            <p className="text-slate-600">Audit logs are retained for 2 years as per compliance requirements. Archived logs are stored securely and can be retrieved upon request.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Access Control</h4>
            <p className="text-slate-600">Only administrators and authorized personnel can access audit logs. All access to this page is logged and monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;