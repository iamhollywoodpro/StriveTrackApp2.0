import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FriendsList = ({ friends, onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Friends', count: friends?.length },
    { id: 'online', label: 'Online', count: friends?.filter(f => f?.isOnline)?.length },
    { id: 'recent', label: 'Recently Active', count: friends?.filter(f => !f?.isOnline)?.length }
  ];

  const filteredFriends = friends?.filter(friend => {
    const matchesSearch = friend?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    switch (activeFilter) {
      case 'online':
        return matchesSearch && friend?.isOnline;
      case 'recent':
        return matchesSearch && !friend?.isOnline;
      default:
        return matchesSearch;
    }
  });

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 21) return 'text-blue-600';
    if (streak >= 7) return 'text-green-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto">
            {filters?.map((filter) => (
              <Button
                key={filter?.id}
                variant={activeFilter === filter?.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter?.id)}
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <span>{filter?.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter?.id 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {filter?.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFriends?.map((friend) => (
          <div
            key={friend?.id}
            className="bg-card rounded-xl border border-border shadow-elevation-1 p-6 hover:shadow-elevation-2 transition-shadow"
          >
            {/* Friend Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={friend?.avatar}
                    alt={friend?.name}
                    className="w-12 h-12 rounded-full border-2 border-border"
                  />
                  {friend?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {friend?.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Level {friend?.level}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className={`text-sm ${
                      friend?.isOnline ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {friend?.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <Icon name="MoreVertical" size={18} />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${getStreakColor(friend?.streak)}`}>
                  {friend?.streak}
                </div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {friend?.points?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {friend?.mutualFriends}
                </div>
                <div className="text-xs text-muted-foreground">Mutual</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => onStartChat?.(friend)}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Icon name="MessageCircle" size={16} />
                <span>Message</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
              >
                <Icon name="UserCheck" size={16} />
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Activity" size={14} />
                <span>Completed morning workout</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredFriends?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="UserX" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No friends found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No friends match "${searchTerm}"` 
              : 'Try adjusting your filters or search term.'
            }
          </p>
        </div>
      )}
      {/* Suggested Friends */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Suggested Friends
        </h3>
        <div className="space-y-3">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=400&fit=crop&crop=face`}
                  alt="Suggested friend"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">Friend {i}</p>
                  <p className="text-sm text-muted-foreground">2 mutual friends</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Icon name="UserPlus" size={14} />
                </Button>
                <Button size="sm" variant="ghost">
                  <Icon name="X" size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsList;