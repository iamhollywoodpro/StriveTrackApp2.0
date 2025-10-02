import React, { useState, useEffect } from 'react';
import adminService from '../../lib/adminService';

function ContentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('posts');

  useEffect(() => {
    loadAnalytics();
  }, [activeTimeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getContentAnalytics(activeTimeframe);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeframes = [
    { key: 'day', label: 'Last 24 Hours' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'year', label: 'Last 12 Months' }
  ];

  const MetricCard = ({ title, value, icon, color, growth, subtitle }) => (
    <div className={`card p-6 bg-gradient-to-r ${color} border-l-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
          {growth && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${parseFloat(growth) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {parseFloat(growth) >= 0 ? '↗' : '↘'} {Math.abs(growth)}%
              </span>
              <span className="text-xs opacity-75 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className="text-4xl opacity-75">{icon}</div>
      </div>
    </div>
  );

  const SimpleChart = ({ data, selectedMetric }) => {
    const maxValue = Math.max(...data.map(item => item[selectedMetric]));
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600 mb-4">
          <span>Trend over time</span>
          <span className="font-medium">{selectedMetric}</span>
        </div>
        <div className="grid grid-cols-12 gap-1 h-32">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col justify-end">
              <div 
                className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t transition-all hover:opacity-80 cursor-pointer"
                style={{ height: `${(item[selectedMetric] / maxValue) * 100}%`, minHeight: '4px' }}
                title={`Period ${item.period}: ${item[selectedMetric]}`}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
    );
  };

  const TopContentTable = ({ content }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Content</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engagement</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {content.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-500">ID: {item.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-slate-900">{item.author}</div>
              </td>
              <td className="px-4 py-4">
                <div className="flex space-x-4 text-xs text-slate-600">
                  <span>❤️ {item.likes}</span>
                  <span>💬 {item.comments}</span>
                  <span>🔄 {item.shares}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Total: {item.likes + item.comments + item.shares}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'achievement' ? 'bg-yellow-100 text-yellow-800' :
                  item.type === 'workout' ? 'bg-blue-100 text-blue-800' :
                  item.type === 'milestone' ? 'bg-green-100 text-green-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {item.type}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-slate-600">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ContentTypeBreakdown = ({ contentTypes }) => {
    const total = Object.values(contentTypes).reduce((sum, value) => sum + value, 0);
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Content Distribution</h4>
        {Object.entries(contentTypes).map(([type, percentage]) => (
          <div key={type} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize text-slate-700">{type.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  type === 'workoutPosts' ? 'bg-blue-500' :
                  type === 'achievementPosts' ? 'bg-yellow-500' :
                  type === 'motivationalPosts' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ModerationOverview = ({ moderationStats }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
        <div className="text-2xl font-bold text-red-900">{moderationStats.autoFlagged}</div>
        <div className="text-sm text-red-600">Auto Flagged</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-900">{moderationStats.manualReports}</div>
        <div className="text-sm text-orange-600">Manual Reports</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
        <div className="text-2xl font-bold text-green-900">{moderationStats.resolved}</div>
        <div className="text-sm text-green-600">Resolved</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-900">{moderationStats.pending}</div>
        <div className="text-sm text-blue-600">Pending</div>
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

  if (!analytics) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Analytics Data</h3>
        <p className="text-slate-600">Unable to load content analytics at this time.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Analytics</h2>
          <p className="text-slate-600">Track content performance, engagement, and user behavior</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <select
            value={activeTimeframe}
            onChange={(e) => setActiveTimeframe(e.target.value)}
            className="form-select"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.key} value={timeframe.key}>
                {timeframe.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Posts"
          value={analytics.totalPosts}
          icon="📝"
          color="from-blue-50 to-indigo-50 border-blue-500"
          growth={analytics.growthMetrics.postsGrowth}
        />
        
        <MetricCard
          title="Engagement Rate"
          value={`${((analytics.totalLikes + analytics.totalComments) / analytics.totalPosts).toFixed(1)}x`}
          icon="💫"
          color="from-purple-50 to-violet-50 border-purple-500"
          growth={analytics.growthMetrics.engagementGrowth}
          subtitle="avg per post"
        />
        
        <MetricCard
          title="Total Interactions"
          value={analytics.totalLikes + analytics.totalComments + analytics.totalShares}
          icon="❤️"
          color="from-pink-50 to-rose-50 border-pink-500"
          growth="12.5"
        />
        
        <MetricCard
          title="Flagged Content"
          value={analytics.flaggedContent}
          icon="🚩"
          color="from-red-50 to-orange-50 border-red-500"
          subtitle={`${((analytics.flaggedContent / analytics.totalPosts) * 100).toFixed(1)}% of posts`}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Engagement Breakdown */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Engagement Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-red-500 text-xl">❤️</span>
                  <span className="font-medium text-slate-900">Likes</span>
                </div>
                <span className="font-bold text-red-700">{analytics.totalLikes.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-xl">💬</span>
                  <span className="font-medium text-slate-900">Comments</span>
                </div>
                <span className="font-bold text-blue-700">{analytics.totalComments.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">🔄</span>
                  <span className="font-medium text-slate-900">Shares</span>
                </div>
                <span className="font-bold text-green-700">{analytics.totalShares.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Activity Trends</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="form-select text-sm"
              >
                <option value="posts">Posts</option>
                <option value="users">Active Users</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
            <SimpleChart data={analytics.timeSeriesData} selectedMetric={selectedMetric} />
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Content Type Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Content Types</h3>
          <ContentTypeBreakdown contentTypes={analytics.contentTypes} />
        </div>

        {/* Moderation Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Moderation Status</h3>
          <ModerationOverview moderationStats={analytics.moderationStats} />
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Resolution Rate</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${(analytics.moderationStats.resolved / (analytics.moderationStats.resolved + analytics.moderationStats.pending)) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-700">
                {Math.round((analytics.moderationStats.resolved / (analytics.moderationStats.resolved + analytics.moderationStats.pending)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Content</h3>
        <TopContentTable content={analytics.topContent} />
      </div>

      {/* Growth Insights */}
      <div className="card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-4">📈 Growth Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900 mb-2">
              +{analytics.growthMetrics.postsGrowth}%
            </div>
            <div className="text-purple-700 text-sm">Content Growth</div>
            <div className="text-purple-600 text-xs mt-1">vs previous period</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900 mb-2">
              +{analytics.growthMetrics.engagementGrowth}%
            </div>
            <div className="text-purple-700 text-sm">Engagement Growth</div>
            <div className="text-purple-600 text-xs mt-1">interactions per post</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900 mb-2">
              +{analytics.growthMetrics.userGrowth}%
            </div>
            <div className="text-purple-700 text-sm">User Growth</div>
            <div className="text-purple-600 text-xs mt-1">active content creators</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentAnalytics;