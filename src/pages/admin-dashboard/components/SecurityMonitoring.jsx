import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SecurityMonitoring = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock security data
  const securityData = {
    loginAttempts: {
      successful: 3247,
      failed: 89,
      suspicious: 12
    },
    systemAlerts: [
      {
        id: 1,
        type: 'failed_login',
        severity: 'medium',
        message: 'Multiple failed login attempts from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        details: 'User attempted to login 5 times in 10 minutes',
        resolved: false
      },
      {
        id: 2,
        type: 'suspicious_activity',
        severity: 'high',
        message: 'Unusual upload pattern detected',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'User uploaded 50+ images in rapid succession',
        resolved: false
      },
      {
        id: 3,
        type: 'account_creation',
        severity: 'low',
        message: 'High volume of new account registrations',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        details: '15 new accounts created from similar IP range',
        resolved: true
      }
    ],
    accessLogs: [
      {
        id: 1,
        user: 'admin@strivetrack.com',
        action: 'Dashboard Access',
        ip: '192.168.1.50',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success',
        location: 'New York, USA'
      },
      {
        id: 2,
        user: 'alex@example.com',
        action: 'Profile Update',
        ip: '192.168.1.75',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'success',
        location: 'Los Angeles, USA'
      },
      {
        id: 3,
        user: 'unknown',
        action: 'Failed Login Attempt',
        ip: '123.456.789.100',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'failed',
        location: 'Unknown Location'
      }
    ]
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'failed_login': return 'UserX';
      case 'suspicious_activity': return 'AlertTriangle';
      case 'account_creation': return 'UserPlus';
      default: return 'Shield';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Performing ${action} on alert ${alertId}`);
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Icon name="Shield" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {securityData?.loginAttempts?.successful?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Successful Logins
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Icon name="TrendingUp" size={16} className="mr-1" />
            <span>Normal activity</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
              <Icon name="UserX" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {securityData?.loginAttempts?.failed}
              </div>
              <div className="text-sm text-muted-foreground">
                Failed Attempts
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-red-600">
            <Icon name="AlertTriangle" size={16} className="mr-1" />
            <span>Monitor closely</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Icon name="Eye" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {securityData?.loginAttempts?.suspicious}
              </div>
              <div className="text-sm text-muted-foreground">
                Suspicious Activity
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-orange-600">
            <Icon name="Clock" size={16} className="mr-1" />
            <span>Requires attention</span>
          </div>
        </div>
      </div>
      {/* Security Alerts */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="AlertTriangle" size={20} className="mr-2 text-red-500" />
            Security Alerts
          </h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" iconName="RefreshCw">
              Refresh
            </Button>
            <Button variant="outline" size="sm" iconName="Settings">
              Alert Settings
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {securityData?.systemAlerts?.map((alert) => (
            <div
              key={alert?.id}
              className={`p-4 border rounded-lg ${
                alert?.resolved ? 'bg-muted/30 border-border' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert?.resolved ? 'bg-green-100' : getSeverityColor(alert?.severity)?.replace('text-', 'bg-')?.replace('-800', '-100')
                  }`}>
                    <Icon 
                      name={alert?.resolved ? 'CheckCircle' : getAlertIcon(alert?.type)} 
                      size={20} 
                      className={alert?.resolved ? 'text-green-600' : 'text-red-600'}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-foreground">
                        {alert?.message}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert?.severity)}`}>
                        {alert?.severity}
                      </span>
                      {alert?.resolved && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert?.details}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(alert?.timestamp)}
                    </div>
                  </div>
                </div>
                
                {!alert?.resolved && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert?.id, 'investigate')}
                      iconName="Search"
                    >
                      Investigate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert?.id, 'resolve')}
                      iconName="Check"
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Access Logs */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Activity" size={20} className="mr-2 text-blue-500" />
            Recent Access Logs
          </h3>
          <div className="flex space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e?.target?.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button variant="outline" size="sm" iconName="Download">
              Export Logs
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {securityData?.accessLogs?.map((log) => (
                <tr key={log?.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-xs">
                          {log?.user?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {log?.user}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {log?.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                    {log?.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {log?.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatTimestamp(log?.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-sm font-medium ${getStatusColor(log?.status)}`}>
                      <Icon 
                        name={log?.status === 'success' ? 'CheckCircle' : 'XCircle'} 
                        size={16} 
                        className="mr-1"
                      />
                      {log?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Security Settings */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Settings" size={20} className="mr-2 text-purple-500" />
          Security Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Authentication Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Two-Factor Authentication</span>
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Session Timeout</span>
                <span className="text-sm text-muted-foreground">30 minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Password Requirements</span>
                <span className="text-sm text-green-600 font-medium">Strong</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Monitoring Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Failed Login Threshold</span>
                <span className="text-sm text-muted-foreground">5 attempts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">IP Blocking</span>
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Real-time Alerts</span>
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitoring;