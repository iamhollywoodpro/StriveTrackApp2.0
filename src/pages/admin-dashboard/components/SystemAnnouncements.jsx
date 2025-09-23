import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SystemAnnouncements = () => {
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all'
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock announcements data
  const announcements = [
    {
      id: 1,
      title: 'System Maintenance Scheduled',
      message: 'We will be performing routine maintenance on our servers this Sunday from 2 AM to 4 AM EST. The platform may experience brief periods of downtime.',
      type: 'warning',
      targetAudience: 'all',
      createdBy: 'System Admin',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      views: 1247,
      interactions: 89
    },
    {
      id: 2,
      title: 'New Achievement System Launched',
      message: 'We are excited to announce the launch of our new achievement system! Earn badges and points for reaching your fitness milestones.',
      type: 'success',
      targetAudience: 'all',
      createdBy: 'Product Team',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      views: 2134,
      interactions: 234
    },
    {
      id: 3,
      title: 'Premium Feature Update',
      message: 'Premium subscribers now have access to advanced analytics and detailed progress reports. Upgrade your plan to unlock these features.',
      type: 'info',
      targetAudience: 'free',
      createdBy: 'Marketing Team',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'draft',
      views: 567,
      interactions: 43
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'archived': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleCreateAnnouncement = (e) => {
    e?.preventDefault();
    console.log('Creating announcement:', newAnnouncement);
    // Implementation for creating announcement
    setNewAnnouncement({ title: '', message: '', type: 'info', targetAudience: 'all' });
    setShowCreateForm(false);
  };

  const handleAnnouncementAction = (announcementId, action) => {
    console.log(`Performing ${action} on announcement ${announcementId}`);
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Announcement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Announcements</p>
              <p className="text-2xl font-bold text-foreground">{announcements?.length}</p>
            </div>
            <Icon name="Megaphone" size={24} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">
                {announcements?.filter(a => a?.status === 'active')?.length}
              </p>
            </div>
            <Icon name="Radio" size={24} className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold text-foreground">
                {announcements?.reduce((sum, a) => sum + a?.views, 0)?.toLocaleString()}
              </p>
            </div>
            <Icon name="Eye" size={24} className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interactions</p>
              <p className="text-2xl font-bold text-foreground">
                {announcements?.reduce((sum, a) => sum + a?.interactions, 0)}
              </p>
            </div>
            <Icon name="MessageSquare" size={24} className="text-orange-500" />
          </div>
        </div>
      </div>
      {/* Create Announcement */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Plus" size={20} className="mr-2 text-blue-500" />
            Create New Announcement
          </h3>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            iconName={showCreateForm ? "X" : "Plus"}
            iconPosition="left"
          >
            {showCreateForm ? 'Cancel' : 'New Announcement'}
          </Button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Announcement Title
                </label>
                <Input
                  placeholder="Enter announcement title"
                  value={newAnnouncement?.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e?.target?.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={newAnnouncement?.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e?.target?.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Audience
              </label>
              <select
                value={newAnnouncement?.targetAudience}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e?.target?.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Users</option>
                <option value="free">Free Users</option>
                <option value="premium">Premium Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                placeholder="Enter your announcement message..."
                value={newAnnouncement?.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e?.target?.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" iconName="Send" iconPosition="left">
                Send Announcement
              </Button>
              <Button type="button" variant="outline" iconName="Save" iconPosition="left">
                Save as Draft
              </Button>
              <Button type="button" variant="outline" iconName="Clock" iconPosition="left">
                Schedule Later
              </Button>
            </div>
          </form>
        )}
      </div>
      {/* Existing Announcements */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="List" size={20} className="mr-2 text-green-500" />
          Recent Announcements
        </h3>

        <div className="space-y-4">
          {announcements?.map((announcement) => (
            <div key={announcement?.id} className="border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(announcement?.type)?.replace('text-', 'bg-')?.replace('-800', '-100')}`}>
                    <Icon 
                      name={getTypeIcon(announcement?.type)} 
                      size={20} 
                      className={getTypeColor(announcement?.type)?.split(' ')?.[1]?.replace('text-', 'text-')}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-foreground">
                        {announcement?.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(announcement?.type)}`}>
                        {announcement?.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(announcement?.status)}`}>
                        {announcement?.status}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {announcement?.message}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Created by:</span>
                        <div className="text-muted-foreground">{announcement?.createdBy}</div>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Target:</span>
                        <div className="text-muted-foreground capitalize">{announcement?.targetAudience} users</div>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Views:</span>
                        <div className="text-muted-foreground">{announcement?.views?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Created:</span>
                        <div className="text-muted-foreground">{formatDate(announcement?.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Icon name="Eye" size={16} className="mr-1" />
                    <span>{announcement?.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <Icon name="MessageSquare" size={16} className="mr-1" />
                    <span>{announcement?.interactions} interactions</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnnouncementAction(announcement?.id, 'edit')}
                    iconName="Edit"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnnouncementAction(announcement?.id, 'duplicate')}
                    iconName="Copy"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnnouncementAction(announcement?.id, 'analytics')}
                    iconName="BarChart3"
                  />
                  {announcement?.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnnouncementAction(announcement?.id, 'pause')}
                      iconName="Pause"
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnnouncementAction(announcement?.id, 'activate')}
                      iconName="Play"
                    />
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAnnouncementAction(announcement?.id, 'delete')}
                    iconName="Trash2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Megaphone" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">
              Create your first announcement to communicate with your users.
            </p>
          </div>
        )}
      </div>
      {/* Announcement Templates */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="FileTemplate" size={20} className="mr-2 text-purple-500" />
          Quick Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="Wrench" size={24} className="text-orange-500 mb-2" />
            <div className="font-medium text-foreground">Maintenance Notice</div>
            <div className="text-sm text-muted-foreground">Scheduled downtime notification</div>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="Sparkles" size={24} className="text-blue-500 mb-2" />
            <div className="font-medium text-foreground">New Feature</div>
            <div className="text-sm text-muted-foreground">Feature release announcement</div>
          </button>
          
          <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <Icon name="Gift" size={24} className="text-green-500 mb-2" />
            <div className="font-medium text-foreground">Promotion</div>
            <div className="text-sm text-muted-foreground">Special offer or promotion</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemAnnouncements;