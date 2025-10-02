import React, { useState } from 'react';
import CommunityHub from '../../components/social/CommunityHub';
import Challenges from '../../components/social/Challenges';
import Leaderboards from '../../components/social/Leaderboards';
import UserProfile from '../../components/social/UserProfile';
import Notifications from '../../components/social/Notifications';
import SocialSharing from '../../components/social/SocialSharing';

function Social() {
  const [activeTab, setActiveTab] = useState('community');
  const [showSharing, setShowSharing] = useState(false);
  const [shareContent, setShareContent] = useState(null);

  const handleShare = (content) => {
    setShareContent(content);
    setShowSharing(true);
  };

  const tabs = [
    { 
      id: 'community', 
      label: '🏠 Community', 
      component: CommunityHub,
      description: 'Connect with fitness enthusiasts'
    },
    { 
      id: 'challenges', 
      label: '🏆 Challenges', 
      component: Challenges,
      description: 'Join fitness challenges'
    },
    { 
      id: 'leaderboards', 
      label: '📊 Leaderboards', 
      component: Leaderboards,
      description: 'See how you rank'
    },
    { 
      id: 'profile', 
      label: '👤 Profile', 
      component: UserProfile,
      description: 'Your fitness profile'
    },
    { 
      id: 'notifications', 
      label: '🔔 Notifications', 
      component: Notifications,
      description: 'Stay updated'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">🌟 Social Hub</h1>
              <p className="text-slate-600">Connect, compete, and celebrate your fitness journey together</p>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button 
                onClick={() => handleShare({
                  type: 'milestone',
                  title: 'Joined StriveTrack Community',
                  description: 'Just joined the amazing StriveTrack fitness community! Ready to crush my goals! 💪',
                  url: window.location.href
                })}
                className="btn btn-primary"
              >
                📤 Share Progress
              </button>
              <a href="/dashboard" className="btn btn-secondary">← Dashboard</a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="text-blue-500 text-2xl">👥</div>
              <div>
                <p className="text-blue-600 font-medium">Community</p>
                <p className="text-xl font-bold text-blue-900">12.5K</p>
                <p className="text-xs text-blue-700">Active members</p>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="text-green-500 text-2xl">🏆</div>
              <div>
                <p className="text-green-600 font-medium">Challenges</p>
                <p className="text-xl font-bold text-green-900">47</p>
                <p className="text-xs text-green-700">Active challenges</p>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="text-purple-500 text-2xl">🔥</div>
              <div>
                <p className="text-purple-600 font-medium">Your Streak</p>
                <p className="text-xl font-bold text-purple-900">7</p>
                <p className="text-xs text-purple-700">Days active</p>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="text-orange-500 text-2xl">📊</div>
              <div>
                <p className="text-orange-600 font-medium">Rank</p>
                <p className="text-xl font-bold text-orange-900">#15</p>
                <p className="text-xs text-orange-700">This week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 min-w-max px-4 py-3 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                  }
                `}
              >
                <div className="text-center">
                  <div>{tab.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeTab === tab.id ? 'text-purple-100' : 'text-slate-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Community Highlights */}
        {activeTab === 'community' && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
              <h3 className="font-bold text-amber-900 mb-3">🔥 Trending Now</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-amber-700">#30DayChallenge</span>
                  <span className="text-amber-600 ml-2">1.2K posts</span>
                </div>
                <div className="text-sm">
                  <span className="text-amber-700">#MorningWorkout</span>
                  <span className="text-amber-600 ml-2">893 posts</span>
                </div>
                <div className="text-sm">
                  <span className="text-amber-700">#FitnessMotivation</span>
                  <span className="text-amber-600 ml-2">647 posts</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-bold text-green-900 mb-3">🌟 Top Contributors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" 
                    alt="Top user"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-green-800">Alex Johnson</span>
                  <span className="text-xs text-green-600">2.4K points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face" 
                    alt="Top user"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-green-800">Sarah Martinez</span>
                  <span className="text-xs text-green-600">2.1K points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" 
                    alt="Top user"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-green-800">Mike Chen</span>
                  <span className="text-xs text-green-600">1.9K points</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3">📅 Upcoming Events</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="text-purple-800 font-medium">Community 5K Run</p>
                  <p className="text-purple-600">Oct 15, 2024</p>
                </div>
                <div className="text-sm">
                  <p className="text-purple-800 font-medium">Yoga Challenge Week</p>
                  <p className="text-purple-600">Oct 22-28, 2024</p>
                </div>
                <div className="text-sm">
                  <p className="text-purple-800 font-medium">Fitness Expo 2024</p>
                  <p className="text-purple-600">Nov 5, 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Stories */}
        <div className="mt-12 card p-8 bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">🎉 Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" 
                alt="Success story"
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="font-bold text-slate-900 mb-2">Lost 30 pounds!</h4>
              <p className="text-sm text-slate-600">"StriveTrack's community kept me motivated every single day."</p>
              <p className="text-xs text-slate-500 mt-2">- Jessica M.</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop" 
                alt="Success story"
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="font-bold text-slate-900 mb-2">First Marathon!</h4>
              <p className="text-sm text-slate-600">"The training challenges helped me achieve what I never thought possible."</p>
              <p className="text-xs text-slate-500 mt-2">- Robert K.</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop" 
                alt="Success story"
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="font-bold text-slate-900 mb-2">365-Day Streak!</h4>
              <p className="text-sm text-slate-600">"One full year of consistent workouts thanks to this amazing community."</p>
              <p className="text-xs text-slate-500 mt-2">- Maria L.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Sharing Modal */}
      {showSharing && (
        <SocialSharing 
          content={shareContent}
          onClose={() => {
            setShowSharing(false);
            setShareContent(null);
          }}
        />
      )}
    </div>
  );
}

export default Social;