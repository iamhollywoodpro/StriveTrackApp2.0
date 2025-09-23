import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'photo': return 'Camera';
      case 'workout': return 'Dumbbell';
      case 'achievement': return 'Award';
      case 'goal': return 'Target';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'photo': return 'text-green-600 bg-green-50';
      case 'workout': return 'text-blue-600 bg-blue-50';
      case 'achievement': return 'text-yellow-600 bg-yellow-50';
      case 'goal': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Clock" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={18} strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity?.title}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatTimeAgo(activity?.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activity?.description}
              </p>
              
              {activity?.image && (
                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden">
                  <Image 
                    src={activity?.image} 
                    alt={activity?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {activity?.engagement && (
                <div className="flex items-center space-x-4 mt-2">
                  <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Heart" size={14} />
                    <span>{activity?.engagement?.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="MessageCircle" size={14} />
                    <span>{activity?.engagement?.comments}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;