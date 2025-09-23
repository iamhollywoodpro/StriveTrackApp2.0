import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContentModeration = () => {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock flagged content data
  const flaggedContent = [
    {
      id: 1,
      type: 'image',
      content: 'Progress photo with inappropriate pose',
      userName: 'Unknown User',
      reportedBy: 'Sarah Chen',
      reportReason: 'Inappropriate content',
      reportDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      severity: 'medium',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      type: 'post',
      content: 'Sharing workout routine with offensive language in description',
      userName: 'Mike Wilson',
      reportedBy: 'Alex Johnson',
      reportReason: 'Offensive language',
      reportDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'reviewed',
      severity: 'high',
      url: null
    },
    {
      id: 3,
      type: 'comment',
      content: 'Spam comment promoting external products',
      userName: 'Spam Account',
      reportedBy: 'Emma Davis',
      reportReason: 'Spam/Commercial',
      reportDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'pending',
      severity: 'low',
      url: null
    },
    {
      id: 4,
      type: 'video',
      content: 'Workout video with background music copyright issues',
      userName: 'James Brown',
      reportedBy: 'System Auto-Detection',
      reportReason: 'Copyright violation',
      reportDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'resolved',
      severity: 'high',
      url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'post': return 'FileText';
      case 'comment': return 'MessageCircle';
      default: return 'File';
    }
  };

  const handleModerationAction = (contentId, action) => {
    console.log(`Performing ${action} on content ${contentId}`);
  };

  const formatReportTime = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

  const filteredContent = flaggedContent?.filter(item => {
    return filterType === 'all' || item?.status === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Moderation Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">
                {flaggedContent?.filter(item => item?.status === 'pending')?.length}
              </p>
            </div>
            <Icon name="Clock" size={24} className="text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Under Review</p>
              <p className="text-2xl font-bold text-foreground">
                {flaggedContent?.filter(item => item?.status === 'reviewed')?.length}
              </p>
            </div>
            <Icon name="Eye" size={24} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Severity</p>
              <p className="text-2xl font-bold text-foreground">
                {flaggedContent?.filter(item => item?.severity === 'high')?.length}
              </p>
            </div>
            <Icon name="AlertTriangle" size={24} className="text-red-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold text-foreground">
                {flaggedContent?.filter(item => item?.status === 'resolved')?.length}
              </p>
            </div>
            <Icon name="CheckCircle" size={24} className="text-green-500" />
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e?.target?.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="severity">Severity</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" iconName="RefreshCw">
              Refresh Queue
            </Button>
            <Button variant="outline" iconName="Download">
              Export Report
            </Button>
          </div>
        </div>
      </div>
      {/* Flagged Content List */}
      <div className="space-y-4">
        {filteredContent?.map((item) => (
          <div key={item?.id} className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <Icon name={getContentIcon(item?.type)} size={20} color="white" strokeWidth={2} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-foreground">
                      {item?.type?.charAt(0)?.toUpperCase() + item?.type?.slice(1)} Report
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(item?.severity)}`}>
                      {item?.severity} severity
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item?.status)}`}>
                      {item?.status}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">
                    {item?.content}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Reported by:</span>
                      <div className="text-muted-foreground">{item?.reportedBy}</div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Content owner:</span>
                      <div className="text-muted-foreground">{item?.userName}</div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Reason:</span>
                      <div className="text-muted-foreground">{item?.reportReason}</div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Reported:</span>
                      <div className="text-muted-foreground">{formatReportTime(item?.reportDate)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content Preview */}
              {item?.url && (
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden ml-4">
                  <img
                    src={item?.url}
                    alt="Content preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModerationAction(item?.id, 'view')}
                  iconName="Eye"
                  iconPosition="left"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModerationAction(item?.id, 'user-profile')}
                  iconName="User"
                  iconPosition="left"
                >
                  View Profile
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {item?.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerationAction(item?.id, 'dismiss')}
                      iconName="X"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerationAction(item?.id, 'remove')}
                      iconName="Trash2"
                    >
                      Remove Content
                    </Button>
                  </>
                )}
                
                {item?.status === 'reviewed' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerationAction(item?.id, 'approve')}
                      iconName="Check"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerationAction(item?.id, 'reject')}
                      iconName="X"
                    >
                      Reject
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModerationAction(item?.id, 'warn-user')}
                  iconName="AlertTriangle"
                >
                  Warn User
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredContent?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Shield" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No flagged content</h3>
          <p className="text-muted-foreground">
            All content has been reviewed. Great job maintaining community standards!
          </p>
        </div>
      )}
      {/* Community Guidelines */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="FileText" size={20} className="mr-2 text-blue-500" />
          Community Guidelines Quick Reference
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Content Violations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Inappropriate or explicit content</li>
              <li>• Harassment or bullying behavior</li>
              <li>• Spam or commercial promotion</li>
              <li>• Copyright infringement</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Severity Levels</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <span className="text-red-600">High</span>: Immediate action required</li>
              <li>• <span className="text-orange-600">Medium</span>: Review within 24 hours</li>
              <li>• <span className="text-green-600">Low</span>: Review within 7 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;