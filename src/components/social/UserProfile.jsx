import React, { useState, useEffect } from 'react';
import socialService from '../../lib/socialService';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUser = socialService.getCurrentUser();
  const isOwnProfile = !userId || userId === currentUser.id;
  const profileUser = isOwnProfile ? currentUser : null;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch user data from API
      if (isOwnProfile) {
        setUser(currentUser);
        await loadUserData(currentUser.id);
      } else {
        // Load other user's profile
        const mockUser = {
          id: userId,
          username: 'fitnessfriend',
          displayName: 'Sarah Martinez',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
          level: 12,
          totalPoints: 1850,
          streak: 15,
          joinedDate: '2024-02-20',
          bio: 'Fitness enthusiast | Marathon runner | Yoga lover 🧘‍♀️',
          location: 'San Francisco, CA',
          isFollowing: false
        };
        setUser(mockUser);
        await loadUserData(userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (targetUserId) => {
    try {
      // Load followers
      const followersResponse = await socialService.getFollowers(targetUserId);
      if (followersResponse.success) {
        setFollowers(followersResponse.followers);
      }

      // Load following
      const followingResponse = await socialService.getFollowing(targetUserId);
      if (followingResponse.success) {
        setFollowing(followingResponse.following);
      }

      // Load user posts (mock data)
      const postsResponse = await socialService.getFeed();
      if (postsResponse.success) {
        // Filter posts by user (in real app, this would be a separate API call)
        const filteredPosts = postsResponse.posts.filter(post => 
          isOwnProfile ? post.userId === currentUser.id : post.userId === targetUserId
        ).slice(0, 5);
        setUserPosts(filteredPosts);
      }

      // Generate stats
      setStats({
        totalWorkouts: 147,
        totalDistance: 423.5,
        averageWorkoutTime: 45,
        favoriteWorkout: 'Running',
        weeklyGoal: 5,
        weeklyCompleted: 3,
        badges: [
          { id: 'streak_7', name: '7-Day Streak', icon: '🔥', earned: '2024-09-25' },
          { id: 'distance_100', name: '100 Mile Club', icon: '🏃', earned: '2024-09-15' },
          { id: 'early_bird', name: 'Early Bird', icon: '🌅', earned: '2024-09-10' },
          { id: 'consistency', name: 'Consistency King', icon: '👑', earned: '2024-09-01' }
        ]
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await socialService.followUser(user.id);
      if (response.success) {
        setUser({ ...user, isFollowing: !user.isFollowing });
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const ProfileHeader = () => (
    <div className="card p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.displayName}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-200"
            />
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white px-3 py-1 rounded-full font-bold">
              L{user.level}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.displayName}</h1>
            <p className="text-slate-600 text-lg mb-2">@{user.username}</p>
            
            {user.bio && (
              <p className="text-slate-700 mb-3">{user.bio}</p>
            )}
            
            {user.location && (
              <p className="text-slate-500 flex items-center justify-center md:justify-start">
                <span className="mr-2">📍</span>
                {user.location}
              </p>
            )}
            
            <p className="text-slate-500 text-sm mt-2">
              Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">{user.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-purple-600">Points</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{followers.length}</div>
            <div className="text-sm text-green-600">Followers</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{following.length}</div>
            <div className="text-sm text-blue-600">Following</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{user.streak}</div>
            <div className="text-sm text-orange-600">Day Streak</div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex space-x-3">
            <button 
              onClick={handleFollow}
              className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
            >
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            <button className="btn btn-outline-primary">
              Message
            </button>
          </div>
        )}

        {isOwnProfile && (
          <div className="flex space-x-3">
            <button className="btn btn-primary">
              Edit Profile
            </button>
            <button className="btn btn-outline-primary">
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ActivityFeed = () => (
    <div className="space-y-6">
      {userPosts.length > 0 ? (
        userPosts.map((post) => (
          <div key={post.id} className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={post.avatar} 
                alt={post.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-slate-900">{post.displayName}</h4>
                <p className="text-sm text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <p className="text-slate-800 mb-3">{post.content}</p>
            
            {post.workout && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <span>💪</span>
                  <span className="font-medium">{post.workout.type}</span>
                  <span className="text-sm text-blue-600">
                    {post.workout.duration}min • {post.workout.calories}cal
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>🔄 {post.shares}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Posts Yet</h3>
          <p className="text-slate-600">
            {isOwnProfile 
              ? "Start sharing your fitness journey with the community!" 
              : "This user hasn't posted anything yet."
            }
          </p>
        </div>
      )}
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      {/* Workout Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Workout Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-xl font-bold text-slate-900">{stats.totalWorkouts}</div>
            <div className="text-sm text-slate-600">Total Workouts</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-xl font-bold text-slate-900">{stats.totalDistance}</div>
            <div className="text-sm text-slate-600">Miles Covered</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-xl font-bold text-slate-900">{stats.averageWorkoutTime}</div>
            <div className="text-sm text-slate-600">Avg Duration (min)</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-xl font-bold text-slate-900">{stats.favoriteWorkout}</div>
            <div className="text-sm text-slate-600">Favorite Type</div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📅 This Week's Progress</h3>
        <div className="flex justify-between text-sm mb-2">
          <span>Weekly Goal: {stats.weeklyGoal} workouts</span>
          <span>{stats.weeklyCompleted}/{stats.weeklyGoal} completed</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(stats.weeklyCompleted / stats.weeklyGoal) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-600">
          {stats.weeklyCompleted >= stats.weeklyGoal 
            ? "🎉 Weekly goal achieved! Great job!" 
            : `${stats.weeklyGoal - stats.weeklyCompleted} more workout${stats.weeklyGoal - stats.weeklyCompleted > 1 ? 's' : ''} to reach your goal.`
          }
        </p>
      </div>

      {/* Badges */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.badges?.map((badge) => (
            <div key={badge.id} className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-medium text-slate-900 text-sm">{badge.name}</div>
              <div className="text-xs text-slate-500">
                {new Date(badge.earned).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SocialTab = () => (
    <div className="space-y-6">
      {/* Followers */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Followers ({followers.length})</h3>
        {followers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.slice(0, 6).map((follower) => (
              <div key={follower.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={follower.avatar} 
                    alt={follower.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-slate-900">{follower.displayName}</h4>
                    <p className="text-sm text-slate-500">@{follower.username}</p>
                  </div>
                </div>
                <button className="btn btn-outline-primary text-sm">
                  Follow Back
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No followers yet.</p>
        )}
        {followers.length > 6 && (
          <button className="btn btn-outline-primary w-full mt-4">
            View All Followers
          </button>
        )}
      </div>

      {/* Following */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">👤 Following ({following.length})</h3>
        {following.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.slice(0, 6).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.avatar} 
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-slate-900">{user.displayName}</h4>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </div>
                <button className="btn btn-secondary text-sm">
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">
            {isOwnProfile ? "You're not following anyone yet." : "Not following anyone yet."}
          </p>
        )}
        {following.length > 6 && (
          <button className="btn btn-outline-primary w-full mt-4">
            View All Following
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="card p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
        <p className="text-slate-600">The user profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <ProfileHeader />

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'activity' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            📝 Activity
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'stats' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            📊 Stats
          </button>
          <button 
            onClick={() => setActiveTab('social')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'social' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            👥 Social
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'activity' && <ActivityFeed />}
      {activeTab === 'stats' && <StatsTab />}
      {activeTab === 'social' && <SocialTab />}
    </div>
  );
}

export default UserProfile;