import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemAnalytics = () => {
  // Mock analytics data
  const analyticsData = {
    userGrowth: [
      { month: 'Jan', users: 1240 },
      { month: 'Feb', users: 1456 },
      { month: 'Mar', users: 1789 },
      { month: 'Apr', users: 2134 },
      { month: 'May', users: 2487 },
      { month: 'Jun', users: 2847 }
    ],
    engagementMetrics: {
      dailyActiveUsers: 1923,
      avgSessionTime: '24m 32s',
      pageViews: 48392,
      bounceRate: '23.4%'
    },
    contentStats: {
      totalWorkouts: 15847,
      photosUploaded: 8932,
      postsShared: 4521,
      commentsPosted: 12847
    },
    popularFeatures: [
      { feature: 'Progress Photos', usage: 87, trend: 'up' },
      { feature: 'Workout Tracker', usage: 92, trend: 'up' },
      { feature: 'Community Hub', usage: 76, trend: 'stable' },
      { feature: 'Achievements', usage: 68, trend: 'up' },
      { feature: 'Nutrition Tracker', usage: 81, trend: 'down' }
    ]
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Icon name="Users" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.engagementMetrics?.dailyActiveUsers?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Daily Active Users
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Icon name="TrendingUp" size={16} className="mr-1" />
            <span>+12% from last week</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.engagementMetrics?.avgSessionTime}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Session Time
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Icon name="TrendingUp" size={16} className="mr-1" />
            <span>+3m 14s from last week</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <Icon name="Eye" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.engagementMetrics?.pageViews?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Page Views
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Icon name="TrendingUp" size={16} className="mr-1" />
            <span>+18% from last week</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Icon name="MousePointer" size={24} color="white" strokeWidth={2} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.engagementMetrics?.bounceRate}
              </div>
              <div className="text-sm text-muted-foreground">
                Bounce Rate
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Icon name="TrendingDown" size={16} className="mr-1" />
            <span>-2.1% from last week</span>
          </div>
        </div>
      </div>

      {/* User Growth Chart Placeholder */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2 text-blue-500" />
          User Growth Trend
        </h3>
        
        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chart visualization would be displayed here</p>
            <p className="text-sm text-muted-foreground mt-2">
              Integration with charting library required (Recharts/Chart.js)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {analyticsData?.userGrowth?.map((data, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-muted-foreground">{data?.month}</div>
              <div className="text-lg font-semibold text-foreground">{data?.users?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Statistics */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="Activity" size={20} className="mr-2 text-green-500" />
          Content Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Icon name="Dumbbell" size={32} className="mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {analyticsData?.contentStats?.totalWorkouts?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Workouts</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Icon name="Camera" size={32} className="mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {analyticsData?.contentStats?.photosUploaded?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Photos Uploaded</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Icon name="Share2" size={32} className="mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {analyticsData?.contentStats?.postsShared?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Posts Shared</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Icon name="MessageCircle" size={32} className="mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {analyticsData?.contentStats?.commentsPosted?.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Comments Posted</div>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="PieChart" size={20} className="mr-2 text-purple-500" />
          Feature Usage Analytics
        </h3>
        
        <div className="space-y-4">
          {analyticsData?.popularFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-foreground">
                  {feature?.feature}
                </div>
                <div className={`flex items-center text-sm ${getTrendColor(feature?.trend)}`}>
                  <Icon name={getTrendIcon(feature?.trend)} size={16} className="mr-1" />
                  <span className="capitalize">{feature?.trend}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {feature?.usage}% usage
                </div>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature?.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Download" size={20} className="mr-2 text-orange-500" />
          Export Analytics Reports
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="FileText" size={24} className="text-blue-500 mb-2" />
            <div className="font-medium text-foreground">User Analytics</div>
            <div className="text-sm text-muted-foreground">Download user engagement report</div>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="BarChart3" size={24} className="text-green-500 mb-2" />
            <div className="font-medium text-foreground">Usage Statistics</div>
            <div className="text-sm text-muted-foreground">Export feature usage data</div>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="TrendingUp" size={24} className="text-purple-500 mb-2" />
            <div className="font-medium text-foreground">Growth Report</div>
            <div className="text-sm text-muted-foreground">Download growth metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;