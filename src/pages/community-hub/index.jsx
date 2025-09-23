import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import SocialFeed from './components/SocialFeed';
import FriendsList from './components/FriendsList';
import Leaderboards from './components/Leaderboards';
import FriendChallenges from './components/FriendChallenges';
import ChatInterface from './components/ChatInterface';
import CreatePostModal from './components/CreatePostModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const CommunityHub = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from database
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalFriends: 0,
    activeChallenges: 0,
    postsThisWeek: 0
  });

  // Load all community data from database
  useEffect(() => {
    if (user?.id) {
      loadCommunityData();
    }
  }, [user?.id]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load posts from social_posts table with user profile info
      const { data: postsData, error: postsError } = await supabase?.from('social_posts')?.select(`
          *,
          profiles:user_id (
            id,
            name,
            username,
            points,
            user_profiles!inner (
              full_name,
              profile_picture_url
            )
          )
        `)?.order('created_at', { ascending: false })?.limit(20);

      if (postsError) {
        console.error('Posts loading error:', postsError);
      } else {
        const formattedPosts = postsData?.map(post => ({
          id: post?.id,
          user: {
            id: post?.profiles?.id,
            name: post?.profiles?.user_profiles?.[0]?.full_name || post?.profiles?.name || 'Anonymous',
            avatar: post?.profiles?.user_profiles?.[0]?.profile_picture_url || null,
            level: Math.floor((post?.profiles?.points || 0) / 100) + 1,
            isOnline: false
          },
          type: 'post',
          content: post?.content || '',
          media: post?.media_url ? [{
            type: 'image',
            url: post?.media_url,
            caption: 'User shared media'
          }] : [],
          timestamp: new Date(post?.created_at),
          engagement: { 
            likes: post?.likes || 0, 
            comments: 0, 
            shares: 0 
          },
          isLiked: false,
          achievements: [],
          tags: []
        })) || [];
        setPosts(formattedPosts);
      }

      // Load friends from friendships table
      const { data: friendshipsData, error: friendshipsError } = await supabase?.from('friendships')?.select(`
          *,
          friend:friend_id (
            id,
            name,
            username,
            points,
            created_at,
            user_profiles!inner (
              full_name,
              profile_picture_url
            )
          )
        `)?.eq('user_id', user?.id)?.eq('status', 'accepted');

      if (friendshipsError) {
        console.error('Friends loading error:', friendshipsError);
      } else {
        const formattedFriends = friendshipsData?.map(friendship => ({
          id: friendship?.friend?.id,
          name: friendship?.friend?.user_profiles?.[0]?.full_name || friendship?.friend?.name || 'Friend',
          avatar: friendship?.friend?.user_profiles?.[0]?.profile_picture_url || null,
          level: Math.floor((friendship?.friend?.points || 0) / 100) + 1,
          isOnline: false,
          lastActivity: 'Offline',
          mutualFriends: 0,
          streak: 0,
          points: friendship?.friend?.points || 0
        })) || [];
        setFriends(formattedFriends);
      }

      // Load challenges from challenges table
      const { data: challengesData, error: challengesError } = await supabase?.from('challenges')?.select(`
          *,
          creator:creator_id (
            id,
            name,
            user_profiles!inner (
              full_name,
              profile_picture_url
            )
          )
        `)?.order('created_at', { ascending: false })?.limit(10);

      if (challengesError) {
        console.error('Challenges loading error:', challengesError);
      } else {
        const formattedChallenges = challengesData?.map(challenge => ({
          id: challenge?.id,
          title: challenge?.title,
          participants: [],
          endDate: challenge?.end_date ? new Date(challenge?.end_date) : new Date(),
          prize: 'Community Recognition',
          type: 'general',
          description: challenge?.description || ''
        })) || [];
        setChallenges(formattedChallenges);
      }

      // Calculate stats
      const weekAgo = new Date();
      weekAgo?.setDate(weekAgo?.getDate() - 7);

      const postsThisWeek = postsData?.filter(post => 
        new Date(post?.created_at) >= weekAgo
      )?.length || 0;

      setStats({
        totalFriends: friendshipsData?.length || 0,
        activeChallenges: challengesData?.length || 0,
        postsThisWeek
      });

    } catch (error) {
      console.error('Community data loading error:', error);
      setError('Failed to load community data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    { id: 'feed', label: 'Feed', icon: 'Home' },
    { id: 'friends', label: 'Friends', icon: 'Users' },
    { id: 'leaderboards', label: 'Leaderboards', icon: 'Trophy' },
    { id: 'challenges', label: 'Challenges', icon: 'Target' }
  ];

  const handleLikePost = async (postId) => {
    try {
      const post = posts?.find(p => p?.id === postId);
      if (!post) return;

      const newLikesCount = post?.isLiked 
        ? post?.engagement?.likes - 1 
        : post?.engagement?.likes + 1;

      // Update in database
      const { error } = await supabase?.from('social_posts')?.update({ likes: newLikesCount })?.eq('id', postId);

      if (!error) {
        // Update local state
        setPosts(prev => prev?.map(p => 
          p?.id === postId 
            ? { 
                ...p, 
                isLiked: !p?.isLiked,
                engagement: {
                  ...p?.engagement,
                  likes: newLikesCount
                }
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Like post error:', error);
    }
  };

  const handleCreatePost = async (newPost) => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase?.from('social_posts')?.insert({
          user_id: user?.id,
          content: newPost?.content,
          media_url: newPost?.media?.[0]?.url || null
        })?.select(`
          *,
          profiles:user_id (
            id,
            name,
            username,
            points,
            user_profiles!inner (
              full_name,
              profile_picture_url
            )
          )
        `)?.single();

      if (!error && data) {
        const formattedPost = {
          id: data?.id,
          user: {
            id: user?.id,
            name: userProfile?.full_name || 'You',
            avatar: userProfile?.profile_picture_url || null,
            level: Math.floor((userProfile?.points || 0) / 100) + 1,
            isOnline: true
          },
          type: 'post',
          content: data?.content || '',
          media: data?.media_url ? [{
            type: 'image',
            url: data?.media_url,
            caption: 'Your shared media'
          }] : [],
          timestamp: new Date(data?.created_at),
          engagement: { 
            likes: 0, 
            comments: 0, 
            shares: 0 
          },
          isLiked: false,
          achievements: [],
          tags: []
        };

        setPosts(prev => [formattedPost, ...prev]);
        setIsCreatePostModalOpen(false);
      }
    } catch (error) {
      console.error('Create post error:', error);
    }
  };

  const handleStartChat = (user) => {
    setActiveChatUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading community data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadCommunityData}>Try Again</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Community Hub
              </h1>
              <p className="text-muted-foreground">
                Connect, share progress, and motivate each other on your fitness journey
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>New Post</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card rounded-lg p-1 mb-8 border border-border">
            <nav className="flex space-x-1 overflow-x-auto">
              {tabItems?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'feed' && (
                <SocialFeed 
                  posts={posts} 
                  onLikePost={handleLikePost}
                />
              )}
              
              {activeTab === 'friends' && (
                <FriendsList 
                  friends={friends}
                  onStartChat={handleStartChat}
                />
              )}
              
              {activeTab === 'leaderboards' && (
                <Leaderboards friends={friends} />
              )}
              
              {activeTab === 'challenges' && (
                <FriendChallenges challenges={challenges} />
              )}
            </div>

            {/* Sidebar - Friends List (always visible on desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Online Friends</h3>
                    <span className="text-sm text-muted-foreground">
                      {friends?.filter(f => f?.isOnline)?.length || 0} online
                    </span>
                  </div>
                  {friends?.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No friends yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start connecting with other users!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends?.slice(0, 5)?.map((friend) => (
                        <div 
                          key={friend?.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => handleStartChat(friend)}
                        >
                          <div className="relative">
                            {friend?.avatar ? (
                              <img
                                src={friend?.avatar}
                                alt={friend?.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Icon name="User" size={16} className="text-muted-foreground" />
                              </div>
                            )}
                            {friend?.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {friend?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {friend?.lastActivity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Friends</span>
                      <span className="text-sm font-medium text-foreground">{stats?.totalFriends}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Challenges</span>
                      <span className="text-sm font-medium text-foreground">{stats?.activeChallenges}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Posts This Week</span>
                      <span className="text-sm font-medium text-foreground">{stats?.postsThisWeek}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Chat Interface */}
      {activeChatUser && (
        <ChatInterface
          user={activeChatUser}
          onClose={() => setActiveChatUser(null)}
        />
      )}
    </div>
  );
};

export default CommunityHub;