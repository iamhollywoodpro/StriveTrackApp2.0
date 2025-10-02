import React, { useState, useEffect } from 'react';
import adminService from '../../lib/adminService';

function AdminInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadInsights();
  }, [selectedTimeframe]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardInsights();
      if (response.success) {
        setInsights(response.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  const timeframes = [
    { key: '1d', label: 'Last 24 Hours' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 3 Months' }
  ];

  const MetricCard = ({ title, value, subtitle, icon, color, trend, onClick }) => (
    <div 
      className={`card p-6 bg-gradient-to-r ${color} border-l-4 cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.positive ? 'text-green-700' : 'text-red-700'}`}>
                {trend.positive ? '↗' : '↘'} {trend.value}%
              </span>
              <span className="text-xs opacity-75 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className="text-4xl opacity-75">{icon}</div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => {
    const alertColors = {
      success: 'from-green-50 to-emerald-50 border-green-500',
      warning: 'from-yellow-50 to-amber-50 border-yellow-500',
      error: 'from-red-50 to-pink-50 border-red-500',
      info: 'from-blue-50 to-indigo-50 border-blue-500'
    };

    const alertIcons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };

    return (
      <div className={`p-4 rounded-lg bg-gradient-to-r ${alertColors[alert.type]} border-l-4`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl">{alertIcons[alert.type]}</span>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">{alert.title}</h4>
            <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const TopPerformersList = ({ performers, type }) => (
    <div className="space-y-3">
      {performers.map((performer, index) => (
        <div key={performer.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
          }`}>
            {index + 1}
          </div>
          
          <img 
            src={performer.avatar} 
            alt={performer.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">{performer.displayName}</h4>
            <p className="text-sm text-slate-500">@{performer.username}</p>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-slate-900">{performer.score}</p>
            <p className="text-xs text-slate-500">
              {type === 'activity' && 'points'}
              {type === 'content' && 'posts'}
              {type === 'engagement' && 'followers'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const SystemHealthIndicator = ({ health }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.uptime}%</div>
        <div className="text-sm text-slate-600">Uptime</div>
        <div className={`w-full h-2 rounded-full mt-2 ${health.uptime >= 99 ? 'bg-green-200' : 'bg-yellow-200'}`}>
          <div 
            className={`h-2 rounded-full ${health.uptime >= 99 ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${health.uptime}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.responseTime}ms</div>
        <div className="text-sm text-slate-600">Response Time</div>
        <div className={`text-xs mt-1 ${health.responseTime < 200 ? 'text-green-600' : health.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'}`}>
          {health.responseTime < 200 ? 'Excellent' : health.responseTime < 500 ? 'Good' : 'Needs Attention'}
        </div>
      </div>

      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.errorRate}%</div>
        <div className="text-sm text-slate-600">Error Rate</div>
        <div className={`text-xs mt-1 ${health.errorRate < 0.1 ? 'text-green-600' : health.errorRate < 1 ? 'text-yellow-600' : 'text-red-600'}`}>
          {health.errorRate < 0.1 ? 'Excellent' : health.errorRate < 1 ? 'Acceptable' : 'High'}
        </div>
      </div>

      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.storageUsed}%</div>
        <div className="text-sm text-slate-600">Storage Used</div>
        <div className={`w-full h-2 rounded-full mt-2 ${health.storageUsed < 70 ? 'bg-green-200' : health.storageUsed < 85 ? 'bg-yellow-200' : 'bg-red-200'}`}>
          <div 
            className={`h-2 rounded-full ${health.storageUsed < 70 ? 'bg-green-500' : health.storageUsed < 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${health.storageUsed}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.bandwidthUsage}%</div>
        <div className="text-sm text-slate-600">Bandwidth</div>
        <div className={`text-xs mt-1 ${health.bandwidthUsage < 80 ? 'text-green-600' : 'text-yellow-600'}`}>
          {health.bandwidthUsage < 80 ? 'Normal' : 'High Usage'}
        </div>
      </div>

      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <div className="text-2xl font-bold text-slate-900">{health.activeConnections.toLocaleString()}</div>
        <div className="text-sm text-slate-600">Active Connections</div>
        <div className="text-xs text-green-600 mt-1">Live</div>
      </div>
    </div>
  );

  const RevenueChart = ({ metrics }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-green-900">${metrics.monthlyRecurringRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-600">Monthly Recurring Revenue</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">${metrics.averageRevenuePerUser}</div>
          <div className="text-sm text-blue-600">Average Revenue Per User</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">{metrics.conversionRate}%</div>
          <div className="text-xs text-slate-600">Conversion Rate</div>
        </div>
        
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">-${Math.abs(metrics.churnValue)}</div>
          <div className="text-xs text-slate-600">Churn Value</div>
        </div>
        
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">${metrics.lifetimeValue}</div>
          <div className="text-xs text-slate-600">Lifetime Value</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Insights Available</h3>
        <p className="text-slate-600">Unable to load admin insights at this time.</p>
        <button onClick={loadInsights} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Insights</h2>
          <p className="text-slate-600">Comprehensive platform analytics and performance metrics</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="form-select"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.key} value={timeframe.key}>
                {timeframe.label}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-primary"
          >
            {refreshing ? '🔄' : '⟳'} Refresh
          </button>
          
          <button className="btn btn-outline-primary">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={insights.userMetrics.totalUsers}
          subtitle={`${insights.userMetrics.activeUsers} active`}
          icon="👥"
          color="from-blue-50 to-indigo-50 border-blue-500"
          trend={{ positive: true, value: 12.5 }}
        />
        
        <MetricCard
          title="Daily Active Users"
          value={insights.userMetrics.dailyActiveUsers}
          subtitle={`${insights.userMetrics.newUsersToday} new today`}
          icon="🔥"
          color="from-green-50 to-emerald-50 border-green-500"
          trend={{ positive: true, value: 8.3 }}
        />
        
        <MetricCard
          title="Content Engagement"
          value={`${insights.contentMetrics.engagementRate}%`}
          subtitle={`${insights.contentMetrics.postsToday} posts today`}
          icon="❤️"
          color="from-purple-50 to-violet-50 border-purple-500"
          trend={{ positive: true, value: 15.2 }}
        />
        
        <MetricCard
          title="System Health"
          value={`${insights.systemHealth.uptime}%`}
          subtitle={`${insights.systemHealth.responseTime}ms response`}
          icon="🟢"
          color="from-emerald-50 to-green-50 border-emerald-500"
          trend={{ positive: false, value: 0.1 }}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Analytics */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">👥 User Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Monthly Active Users</span>
              <span className="font-bold text-slate-900">{insights.userMetrics.monthlyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Weekly Active Users</span>
              <span className="font-bold text-slate-900">{insights.userMetrics.weeklyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Session Time</span>
              <span className="font-bold text-slate-900">{insights.userMetrics.averageSessionTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Churn Rate</span>
              <span className="font-bold text-slate-900">{insights.userMetrics.churnRate}%</span>
            </div>
          </div>
        </div>

        {/* Content Analytics */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">📝 Content Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Posts</span>
              <span className="font-bold text-slate-900">{insights.contentMetrics.totalPosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Avg Posts Per User</span>
              <span className="font-bold text-slate-900">{insights.contentMetrics.avgPostsPerUser}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Comments</span>
              <span className="font-bold text-slate-900">{insights.contentMetrics.totalComments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Viral Posts</span>
              <span className="font-bold text-slate-900">{insights.contentMetrics.viralPosts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">🔧 System Health</h3>
        <SystemHealthIndicator health={insights.systemHealth} />
      </div>

      {/* Revenue Metrics */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">💰 Revenue Metrics</h3>
        <RevenueChart metrics={insights.revenueMetrics} />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🏆 Most Active Users</h3>
          <TopPerformersList performers={insights.topPerformers.mostActiveUsers} type="activity" />
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📝 Top Content Creators</h3>
          <TopPerformersList performers={insights.topPerformers.topContentCreators} type="content" />
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📈 High Engagement Users</h3>
          <TopPerformersList performers={insights.topPerformers.highEngagementUsers} type="engagement" />
        </div>
      </div>

      {/* System Alerts */}
      {insights.alerts && insights.alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">🚨 System Alerts</h3>
          <div className="space-y-4">
            {insights.alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="mt-8 card p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
        <h3 className="text-lg font-bold text-orange-900 mb-4">📋 Recommended Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-orange-600">•</span>
            <span className="text-orange-800">Monitor server load - consider scaling if usage continues to grow</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-orange-600">•</span>
            <span className="text-orange-800">Review flagged content - {insights.contentMetrics.totalComments} items pending moderation</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-orange-600">•</span>
            <span className="text-orange-800">Storage cleanup recommended - {insights.systemHealth.storageUsed}% capacity used</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-orange-600">•</span>
            <span className="text-orange-800">User retention campaign - churn rate at {insights.userMetrics.churnRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInsights;