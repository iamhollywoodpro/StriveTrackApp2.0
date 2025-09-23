import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const SocialFeed = ({ posts, onLikePost }) => {
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const togglePostExpansion = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(postId)) {
        newSet?.delete(postId);
      } else {
        newSet?.add(postId);
      }
      return newSet;
    });
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'progress': return 'TrendingUp';
      case 'achievement': return 'Award';
      case 'workout': return 'Dumbbell';
      case 'nutrition': return 'Apple';
      default: return 'MessageCircle';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'progress': return 'text-blue-600 bg-blue-100';
      case 'achievement': return 'text-purple-600 bg-purple-100';
      case 'workout': return 'text-green-600 bg-green-100';
      case 'nutrition': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {posts?.map((post) => {
        const isExpanded = expandedPosts?.has(post?.id);
        const shouldTruncate = post?.content?.length > 150;
        
        return (
          <div
            key={post?.id}
            className="bg-card rounded-xl border border-border shadow-elevation-1 overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={post?.user?.avatar}
                    alt={post?.user?.name}
                    className="w-12 h-12 rounded-full border-2 border-border"
                  />
                  {post?.user?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground">
                      {post?.user?.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Level {post?.user?.level}
                    </span>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post?.type)}`}>
                      <Icon name={getPostTypeIcon(post?.type)} size={12} className="mr-1" />
                      {post?.type}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(post?.timestamp, { addSuffix: true })}
                  </p>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <div className="text-foreground">
                {shouldTruncate && !isExpanded 
                  ? (
                    <>
                      {post?.content?.slice(0, 150)}...
                      <button
                        onClick={() => togglePostExpansion(post?.id)}
                        className="text-primary hover:underline ml-2"
                      >
                        Read more
                      </button>
                    </>
                  )
                  : (
                    <>
                      {post?.content}
                      {shouldTruncate && isExpanded && (
                        <button
                          onClick={() => togglePostExpansion(post?.id)}
                          className="text-primary hover:underline ml-2"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )
                }
              </div>

              {/* Tags */}
              {post?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post?.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {post?.achievements?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post?.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      <Icon name="Award" size={12} className="mr-1" />
                      {achievement}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            {post?.media?.length > 0 && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-1 gap-3">
                  {post?.media?.map((item, index) => (
                    <div key={index} className="relative">
                      {item?.type === 'image' ? (
                        <img
                          src={item?.url}
                          alt={item?.caption || 'Post image'}
                          className="w-full rounded-lg max-h-96 object-cover"
                        />
                      ) : item?.type === 'video' ? (
                        <div className="relative">
                          <img
                            src={item?.thumbnail}
                            alt="Video thumbnail"
                            className="w-full rounded-lg max-h-96 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Icon name="Play" size={24} className="text-gray-800 ml-1" />
                            </div>
                          </div>
                          {item?.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {item?.duration}
                            </div>
                          )}
                        </div>
                      ) : null}
                      
                      {item?.caption && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {item?.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Bar */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => onLikePost?.(post?.id)}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      post?.isLiked 
                        ? 'text-red-500 hover:text-red-600' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon 
                      name="Heart" 
                      size={18} 
                      fill={post?.isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{post?.engagement?.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="MessageCircle" size={18} />
                    <span>{post?.engagement?.comments}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="Share" size={18} />
                    <span>{post?.engagement?.shares}</span>
                  </button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Icon name="Bookmark" size={18} />
                </Button>
              </div>
            </div>

            {/* Quick Comment */}
            <div className="px-6 pb-4 border-t border-border">
              <div className="flex items-center space-x-3 mt-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full"
                />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-muted rounded-full text-sm border border-transparent focus:border-primary focus:outline-none transition-colors"
                />
                <Button size="sm" className="rounded-full">
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      {posts?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No posts yet
          </h3>
          <p className="text-muted-foreground">
            Follow friends or create your first post to see content here.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;