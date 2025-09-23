import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { format, differenceInDays } from 'date-fns';

const FriendChallenges = ({ challenges }) => {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active Challenges', count: challenges?.length },
    { id: 'completed', label: 'Completed', count: 3 },
    { id: 'create', label: 'Create New', icon: 'Plus' }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getDaysRemaining = (endDate) => {
    return differenceInDays(new Date(endDate), new Date());
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'streak': return 'Zap';
      case 'goal': return 'Target';
      case 'workout': return 'Dumbbell';
      case 'points': return 'Award';
      default: return 'Trophy';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'streak': return 'text-purple-600 bg-purple-100';
      case 'goal': return 'text-blue-600 bg-blue-100';
      case 'workout': return 'text-green-600 bg-green-100';
      case 'points': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-card rounded-xl p-1 border border-border">
        <nav className="flex space-x-1">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                activeTab === tab?.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab?.icon && <Icon name={tab?.icon} size={18} />}
              <span>{tab?.label}</span>
              {tab?.count && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab?.id 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {tab?.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Challenges */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {challenges?.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge?.endDate);
            
            return (
              <div
                key={challenge?.id}
                className="bg-card rounded-xl border border-border shadow-elevation-1 overflow-hidden"
              >
                {/* Challenge Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {challenge?.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge?.type)}`}>
                          <Icon name={getTypeIcon(challenge?.type)} size={12} className="mr-1" />
                          {challenge?.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {challenge?.description}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Challenge ended'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ends {format(new Date(challenge?.endDate), 'MMM dd')}
                      </div>
                    </div>
                  </div>

                  {/* Prize Info */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <Icon name="Gift" size={16} />
                    <span>Prize: {challenge?.prize}</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="px-6 pb-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Participants ({challenge?.participants?.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {challenge?.participants?.map((participant, index) => {
                      const isLeading = index === 0 || participant?.progress === Math.max(...challenge?.participants?.map(p => p?.progress));
                      
                      return (
                        <div
                          key={participant?.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            participant?.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={participant?.avatar}
                                alt={participant?.name}
                                className="w-10 h-10 rounded-full border-2 border-border"
                              />
                              {isLeading && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Icon name="Crown" size={12} color="white" />
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">
                                  {participant?.name}
                                </span>
                                {isLeading && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                    Leading
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {participant?.progress}% complete
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="w-24 bg-muted rounded-full h-2 mb-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(participant?.progress)}`}
                                style={{ width: `${participant?.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Challenge Actions */}
                <div className="px-6 py-4 bg-muted/30 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Chat
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Share" size={16} className="mr-2" />
                        Share
                      </Button>
                      <Button size="sm">
                        <Icon name="Eye" size={16} className="mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Challenge */}
      {activeTab === 'create' && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Plus" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Create New Challenge
            </h3>
            <p className="text-muted-foreground">
              Challenge your friends to achieve goals together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { type: 'streak', title: 'Consistency Challenge', desc: 'Maintain daily habits', icon: 'Zap' },
              { type: 'goal', title: 'Goal Challenge', desc: 'Race to achieve targets', icon: 'Target' },
              { type: 'workout', title: 'Workout Challenge', desc: 'Complete most workouts', icon: 'Dumbbell' },
              { type: 'points', title: 'Points Challenge', desc: 'Earn the most points', icon: 'Award' }
            ]?.map((template) => (
              <div
                key={template?.type}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(template?.type)}`}>
                    <Icon name={template?.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {template?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {template?.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button className="w-full sm:w-auto">
              <Icon name="Plus" size={18} className="mr-2" />
              Start Creating Challenge
            </Button>
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {[1, 2, 3]?.map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border opacity-75"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Completed Challenge {i}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Finished {i * 5} days ago
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-medium">
                    🏆 Won
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +500 points
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendChallenges;