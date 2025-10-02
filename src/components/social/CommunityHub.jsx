import React, { useState, useEffect } from 'react';
import socialService from '../../lib/socialService';

function CommunityHub() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await socialService.getFeed();
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const response = await socialService.createPost({
        content: newPost,
        tags: ['#fitness', '#community']
      });

      if (response.success) {
        setPosts([response.post, ...posts]);
        setNewPost('');
        setShowNewPost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await socialService.likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const PostCard = ({ post }) => (
    <div className="card p-6 mb-6 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={post.avatar} 
            alt={post.displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
          />
          <div>
            <h4 className="font-bold text-slate-900">{post.displayName}</h4>
            <p className="text-sm text-slate-500">@{post.username} • {formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2">
          <span className="text-lg">⋯</span>
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-slate-800 leading-relaxed mb-3">{post.content}</p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Workout Info */}
        {post.workout && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600 text-lg">💪</span>
              <span className="font-medium text-blue-900">{post.workout.type}</span>
            </div>
            <div className="flex space-x-4 text-sm text-blue-700">
              <span>⏱️ {post.workout.duration} min</span>
              <span>🔥 {post.workout.calories} cal</span>
            </div>
          </div>
        )}

        {/* Achievement */}
        {post.achievement && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{post.achievement.icon}</span>
              <div>
                <p className="font-bold text-amber-900">{post.achievement.title}</p>
                <p className="text-sm text-amber-700">+{post.achievement.points} points earned!</p>
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mb-3">
            {post.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt="Post content"
                className="w-full h-64 object-cover rounded-lg border border-slate-200"
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => handleLikePost(post.id)}
            className={`flex items-center space-x-2 transition-colors ${
              post.isLiked ? 'text-red-600' : 'text-slate-500 hover:text-red-600'
            }`}
          >
            <span className={post.isLiked ? '❤️' : '🤍'}></span>
            <span className="text-sm font-medium">{post.likes}</span>
          </button>

          <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors">
            <span>💬</span>
            <span className="text-sm font-medium">{post.comments}</span>
          </button>

          <button className="flex items-center space-x-2 text-slate-500 hover:text-green-600 transition-colors">
            <span>🔄</span>
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>

        <button className="text-slate-500 hover:text-purple-600 transition-colors">
          <span>🔖</span>
        </button>
      </div>
    </div>
  );

  const CreatePostSection = () => (
    <div className="card p-6 mb-6">
      {!showNewPost ? (
        <button 
          onClick={() => setShowNewPost(true)}
          className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <img 
              src={socialService.currentUser.avatar} 
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-slate-500">Share your fitness journey...</span>
          </div>
        </button>
      ) : (
        <div>
          <div className="flex items-start space-x-3 mb-4">
            <img 
              src={socialService.currentUser.avatar} 
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's your fitness story today? Share your workout, achievement, or motivation!"
                className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <span>📷</span>
                <span className="text-sm">Photo</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <span>💪</span>
                <span className="text-sm">Workout</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <span>🏆</span>
                <span className="text-sm">Achievement</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowNewPost(false);
                  setNewPost('');
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'feed' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            🏠 Feed
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'following' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            👥 Following
          </button>
          <button 
            onClick={() => setActiveTab('trending')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'trending' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            🔥 Trending
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      <CreatePostSection />

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="card p-8 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to the Community!</h3>
              <p className="text-slate-600 mb-4">
                Start sharing your fitness journey and connect with other amazing people.
              </p>
              <button 
                onClick={() => setShowNewPost(true)}
                className="btn btn-primary"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center mt-8">
          <button className="btn btn-outline-primary">
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}

export default CommunityHub;