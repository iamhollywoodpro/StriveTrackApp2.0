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
import { socialAPI } from '../../config/api';

const CommunityHub = () => {
  const { user, userProfile } = useAuth();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get session for API calls
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    
    if (user?.id) {
      getSession();
    }
  }, [user?.id]);

  // Real data from database
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalFriends: 0,
    activeChallenges: 0,
    postsThisWeek: 0
  });

  // Load all community data from database
  useEffect(() => {
    if (user?.id && session?.access_token) {
      loadCommunityData();
    } else {
      console.log('Waiting for authentication...', { user: !!user?.id, session: !!session?.access_token });
      setError('Please log in to access Community Hub');
      setLoading(false);
    }
  }, [user?.id, session?.access_token]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid session before making API calls
      if (!session?.access_token) {
        console.log('No valid session found, skipping API calls');
        setError('Please log in to view community features');
        setLoading(false);
        return;
      }
      
      console.log('Loading community data with session:', !!session?.access_token);
      
      // Load posts using our amazing new social API! 🚀
      const result = await socialAPI.getPosts(20, session);

      if (result.error) {
        console.error('Posts loading error:', result.error);
        setError('Failed to load posts');
      } else {
        const formattedPosts = result.posts?.map(post => ({
          id: post?.id,
          user: {
            id: post?.user_id,
            name: post?.user_name || post?.user_email?.split('@')[0] || 'Anonymous',
            avatar: post?.profile_picture_url || null,
            level: Math.floor((post?.total_points || 0) / 100) + 1,
            isOnline: post?.online_status === 'online'
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
            likes: post?.likes_count || 0, 
            comments: post?.comments_count || 0, 
            shares: 0 
          },
          isLiked: post?.is_liked || false,
          achievements: [],
          tags: post?.tags || []
        })) || [];
        setPosts(formattedPosts);
      }

      // Load friends using our amazing new friends API! 👥
      const friendsResult = await socialAPI.getFriends(session);

      if (friendsResult.error) {
        console.error('Friends loading error:', friendsResult.error);
      } else {
        const formattedFriends = friendsResult.friends?.map(friendship => ({
          id: friendship?.friend_id,
          name: friendship?.friend_name || friendship?.friend_email?.split('@')[0] || 'Friend',
          avatar: friendship?.friend_avatar || null,
          level: Math.floor((friendship?.friend_points || 0) / 100) + 1,
          isOnline: friendship?.last_active && new Date() - new Date(friendship.last_active) < 5 * 60 * 1000, // 5 min ago = online
          lastActivity: friendship?.last_active ? new Date(friendship.last_active).toLocaleString() : 'Offline',
          mutualFriends: 0,
          streak: 0,
          points: friendship?.friend_points || 0
        })) || [];
        setFriends(formattedFriends);
      }

      // Load leaderboard using our amazing leaderboard API! 🏆
      const leaderboardResult = await socialAPI.getLeaderboard('friends', session);

      if (leaderboardResult.error) {
        console.error('Leaderboard loading error:', leaderboardResult.error);
      } else {
        setLeaderboard(leaderboardResult.leaderboard || []);
      }

      // Load challenges using our amazing challenges API! 🎯
      const challengesResult = await socialAPI.getChallenges(session);

      if (challengesResult.error) {
        console.error('Challenges loading error:', challengesResult.error);
      } else {
        const formattedChallenges = challengesResult.challenges?.map(challenge => ({
          id: challenge?.id,
          title: challenge?.title,
          participants: [
            {
              name: challenge?.challenger_name || 'Challenger',
              progress: challenge?.challenger_progress || 0
            },
            {
              name: challenge?.challenged_name || 'Challenged',
              progress: challenge?.challenged_progress || 0
            }
          ],
          endDate: challenge?.end_date ? new Date(challenge?.end_date) : new Date(),
          prize: `${challenge?.points_reward || 50} Points`,
          type: challenge?.challenge_type || 'general',
          description: challenge?.description || '',
          target: challenge?.target_value,
          progress: Math.max(challenge?.challenger_progress || 0, challenge?.challenged_progress || 0)
        })) || [];
        setChallenges(formattedChallenges);
      }

      // Calculate stats from our API results
      const weekAgo = new Date();
      weekAgo?.setDate(weekAgo?.getDate() - 7);

      const postsThisWeek = result.posts?.filter(post => 
        new Date(post?.created_at) >= weekAgo
      )?.length || 0;

      setStats({
        totalFriends: friendsResult.friends?.length || 0,
        activeChallenges: challengesResult.challenges?.length || 0,
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

      // Use our amazing like API! 👍
      const result = await socialAPI.likePost(postId, session);

      if (result.success) {
        // Update local state based on API response
        const newLikesCount = result.action === 'liked' 
          ? post?.engagement?.likes + 1 
          : post?.engagement?.likes - 1;

        setPosts(prev => prev?.map(p => 
          p?.id === postId 
            ? { 
                ...p, 
                isLiked: result.action === 'liked',
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
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      console.log('Creating post with data:', newPost);

      // Use our amazing new social API helper! 🚀
      const result = await socialAPI.createPost({
        content: newPost?.content,
        media_url: newPost?.media?.[0]?.url || null,
        post_type: newPost?.type || 'progress',
        tags: newPost?.tags || [],
        visibility: 'friends'
      }, session);

      if (result.error) {
        console.error('Post creation error:', result.error);
        alert(result.error || 'Failed to create post. Please try again.');
        return;
      }

      if (result.success && result.post) {
        console.log('Post created successfully with +5 points! 🎉', result.post);
        
        const formattedPost = {
          id: result.post?.id,
          user: {
            id: user?.id,
            name: userProfile?.full_name || user?.email?.split('@')[0] || 'You',
            avatar: userProfile?.profile_picture_url || null,
            level: Math.floor((userProfile?.points || 0) / 100) + 1,
            isOnline: true
          },
          type: 'post',
          content: result.post?.content || '',
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
          tags: newPost?.tags || []
        };

        setPosts(prev => [formattedPost, ...prev]);
        setIsCreatePostModalOpen(false);
        
        // Refresh stats
        setStats(prev => ({
          ...prev,
          postsThisWeek: prev.postsThisWeek + 1
        }));
      }
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleStartChat = (user) => {
    setActiveChatUser(user);
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      if (window.confirm('Are you sure you want to remove this friend?')) {
        // Delete from database
        const { error } = await supabase?.from('friendships')
          ?.delete()
          ?.eq('user_id', user?.id)
          ?.eq('friend_id', friendId);
        
        if (!error) {
          // Remove from local state
          setFriends(prev => prev?.filter(f => f?.id !== friendId));
          setStats(prev => ({
            ...prev,
            totalFriends: Math.max(0, prev.totalFriends - 1)
          }));
        } else {
          console.error('Delete friend error:', error);
        }
      }
    } catch (error) {
      console.error('Delete friend error:', error);
    }
  };

  const handleToggleFriend = async (friendId, action) => {
    try {
      if (action === 'add') {
        // Add mock friend for demo
        const newFriend = {
          id: friendId,
          name: `Suggested Friend ${friendId.split('-')[1]}`,
          avatar: `https://images.unsplash.com/photo-1500000000${friendId.split('-')[1]}?w=400&h=400&fit=crop&crop=face`,
          level: Math.floor(Math.random() * 10) + 1,
          isOnline: Math.random() > 0.5,
          lastActivity: Math.random() > 0.5 ? 'Online' : '2 hours ago',
          mutualFriends: Math.floor(Math.random() * 5),
          streak: Math.floor(Math.random() * 30),
          points: Math.floor(Math.random() * 10000)
        };
        
        setFriends(prev => [...prev, newFriend]);
        setStats(prev => ({
          ...prev,
          totalFriends: prev.totalFriends + 1
        }));
      } else if (action === 'remove') {
        // Just ignore the suggestion
        console.log('Ignored friend suggestion:', friendId);
      }
    } catch (error) {
      console.error('Toggle friend error:', error);
    }
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
                <div className="mb-6">
                  <Icon name="Users" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Hub</h2>
                  <p className="text-red-500 mb-4">{error}</p>
                </div>
                
                {error?.includes('log in') ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.href = '/user-login'} 
                      className="bg-primary text-white px-6 py-2 rounded-lg"
                    >
                      Sign In to Continue
                    </Button>
                    <p className="text-sm text-gray-600">
                      Join our fitness community to share progress, challenge friends, and climb the leaderboards! 🚀
                    </p>
                  </div>
                ) : (
                  <Button onClick={loadCommunityData} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Try Again
                  </Button>
                )}
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
                  onDeleteFriend={handleDeleteFriend}
                  onToggleFriend={handleToggleFriend}
                />
              )}
              
              {activeTab === 'leaderboards' && (
                <Leaderboards friends={friends} leaderboard={leaderboard} />
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