/**
 * Social Service - Handles all social features including posts, challenges, and community interactions
 * Integrates with Cloudflare D1 database and provides real-time social functionality
 */

class SocialService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || '/api';
    this.currentUser = this.getCurrentUser();
  }

  getCurrentUser() {
    // Mock current user - in production this would come from auth service
    return {
      id: 'user_123',
      username: 'fitnesschamp',
      displayName: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      level: 15,
      totalPoints: 2450,
      streak: 7,
      joinedDate: '2024-01-15'
    };
  }

  // =====================
  // COMMUNITY POSTS
  // =====================

  async createPost(postData) {
    try {
      // Simulate API call to create post
      const post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.currentUser.id,
        username: this.currentUser.username,
        displayName: this.currentUser.displayName,
        avatar: this.currentUser.avatar,
        content: postData.content,
        images: postData.images || [],
        tags: postData.tags || [],
        workout: postData.workout || null,
        achievement: postData.achievement || null,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In production, this would make an actual API call to Cloudflare Workers
      // const response = await fetch(`${this.apiUrl}/posts`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(post)
      // });

      return { success: true, post };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeed(page = 1, limit = 10) {
    try {
      // Generate sample feed data
      const posts = this.generateSamplePosts(limit);
      
      return {
        success: true,
        posts,
        pagination: {
          page,
          limit,
          total: 50,
          hasMore: page < 5
        }
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId) {
    try {
      // Simulate API call
      return { success: true, liked: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async commentOnPost(postId, comment) {
    try {
      const newComment = {
        id: `comment_${Date.now()}`,
        userId: this.currentUser.id,
        username: this.currentUser.username,
        displayName: this.currentUser.displayName,
        avatar: this.currentUser.avatar,
        content: comment,
        createdAt: new Date().toISOString()
      };

      return { success: true, comment: newComment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =====================
  // CHALLENGES
  // =====================

  async getChallenges(filter = 'active') {
    try {
      const challenges = this.generateSampleChallenges();
      let filteredChallenges = challenges;

      if (filter === 'active') {
        filteredChallenges = challenges.filter(c => c.status === 'active');
      } else if (filter === 'completed') {
        filteredChallenges = challenges.filter(c => c.status === 'completed');
      } else if (filter === 'my') {
        filteredChallenges = challenges.filter(c => c.isParticipating);
      }

      return { success: true, challenges: filteredChallenges };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async joinChallenge(challengeId) {
    try {
      // Simulate joining challenge
      return { success: true, joined: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateChallengeProgress(challengeId, progress) {
    try {
      // Simulate progress update
      return { success: true, progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =====================
  // LEADERBOARDS
  // =====================

  async getLeaderboard(category = 'points', timeframe = 'week') {
    try {
      const leaderboard = this.generateSampleLeaderboard(category, timeframe);
      return { success: true, leaderboard };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =====================
  // USER INTERACTIONS
  // =====================

  async followUser(userId) {
    try {
      return { success: true, following: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFollowers(userId) {
    try {
      const followers = this.generateSampleUsers(10);
      return { success: true, followers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFollowing(userId) {
    try {
      const following = this.generateSampleUsers(8);
      return { success: true, following };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =====================
  // SAMPLE DATA GENERATORS
  // =====================

  generateSamplePosts(count = 10) {
    const posts = [];
    const workoutTypes = ['Strength Training', 'Cardio', 'Yoga', 'Running', 'Cycling', 'Swimming', 'HIIT', 'Pilates'];
    const achievements = ['First 5K!', 'New PR!', '30-day streak!', 'Lost 10lbs!', 'Gym milestone', 'Flexibility goal'];
    const users = [
      { id: 'user_1', username: 'fitnesschamp', displayName: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_2', username: 'runnerlife', displayName: 'Sarah Martinez', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_3', username: 'strengthguru', displayName: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_4', username: 'yogavibes', displayName: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_5', username: 'cardioking', displayName: 'David Rodriguez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
    ];

    const postTemplates = [
      "Just crushed a {workout} session! Feeling amazing 💪 #{tag}",
      "Week {week} of my fitness journey complete! Progress is progress 🎯",
      "New personal record today: {achievement}! Never giving up 🏆",
      "Morning workout done ✅ Starting the day right with some {workout}",
      "Consistency is key! Day {day} of my fitness challenge 🔥",
      "Grateful for this amazing fitness community! You all inspire me 🙏",
      "Before and after comparison shows real progress! Keep pushing 📈",
      "Rest day wisdom: Recovery is just as important as training 😴"
    ];

    const workoutImages = [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'
    ];

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];
      const workout = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
      const achievement = achievements[Math.floor(Math.random() * achievements.length)];
      const tag = ['fitness', 'motivation', 'healthylifestyle', 'workout', 'progress'][Math.floor(Math.random() * 5)];
      
      const content = template
        .replace('{workout}', workout)
        .replace('{achievement}', achievement)
        .replace('{tag}', tag)
        .replace('{week}', Math.floor(Math.random() * 12) + 1)
        .replace('{day}', Math.floor(Math.random() * 30) + 1);

      const hasImage = Math.random() > 0.4;
      const hasWorkout = Math.random() > 0.6;
      const hasAchievement = Math.random() > 0.7;

      posts.push({
        id: `post_${i + 1}`,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        content,
        images: hasImage ? [workoutImages[Math.floor(Math.random() * workoutImages.length)]] : [],
        tags: [`#${tag}`, '#fitness'],
        workout: hasWorkout ? {
          type: workout,
          duration: Math.floor(Math.random() * 60) + 30,
          calories: Math.floor(Math.random() * 400) + 200
        } : null,
        achievement: hasAchievement ? {
          title: achievement,
          icon: '🏆',
          points: Math.floor(Math.random() * 100) + 50
        } : null,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  generateSampleChallenges() {
    const challenges = [
      {
        id: 'challenge_1',
        title: '30-Day Fitness Streak',
        description: 'Complete a workout every day for 30 days straight',
        type: 'streak',
        duration: '30 days',
        participants: 1247,
        maxParticipants: null,
        rewards: '500 points + Streak Master badge',
        difficulty: 'medium',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'active',
        isParticipating: true,
        progress: 7,
        target: 30,
        icon: '🔥',
        category: 'consistency'
      },
      {
        id: 'challenge_2',
        title: 'October Distance Challenge',
        description: 'Run, walk, or cycle 100 miles this month',
        type: 'distance',
        duration: '31 days',
        participants: 892,
        maxParticipants: null,
        rewards: '750 points + Distance Warrior badge',
        difficulty: 'hard',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'active',
        isParticipating: false,
        progress: 0,
        target: 100,
        icon: '🏃',
        category: 'cardio'
      },
      {
        id: 'challenge_3',
        title: 'Plank Master Challenge',
        description: 'Hold a plank for 5 minutes total by month end',
        type: 'time',
        duration: '31 days',
        participants: 456,
        maxParticipants: 500,
        rewards: '400 points + Core Champion badge',
        difficulty: 'easy',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'active',
        isParticipating: true,
        progress: 180, // seconds
        target: 300,
        icon: '🎯',
        category: 'strength'
      },
      {
        id: 'challenge_4',
        title: 'Mindful Movement',
        description: 'Complete 15 yoga or meditation sessions',
        type: 'sessions',
        duration: '31 days',
        participants: 334,
        maxParticipants: null,
        rewards: '300 points + Zen Master badge',
        difficulty: 'easy',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'active',
        isParticipating: false,
        progress: 0,
        target: 15,
        icon: '🧘',
        category: 'wellness'
      },
      {
        id: 'challenge_5',
        title: 'September Strong',
        description: 'Complete 20 strength training sessions',
        type: 'sessions',
        duration: '30 days',
        participants: 675,
        maxParticipants: null,
        rewards: '600 points + Strength Legend badge',
        difficulty: 'medium',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        status: 'completed',
        isParticipating: true,
        progress: 20,
        target: 20,
        icon: '💪',
        category: 'strength'
      }
    ];

    return challenges;
  }

  generateSampleLeaderboard(category, timeframe) {
    const users = [
      { id: 'user_1', username: 'fitnesschamp', displayName: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_2', username: 'runnerlife', displayName: 'Sarah Martinez', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_3', username: 'strengthguru', displayName: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_4', username: 'yogavibes', displayName: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_5', username: 'cardioking', displayName: 'David Rodriguez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_6', username: 'hiitqueen', displayName: 'Lisa Park', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_7', username: 'cyclepath', displayName: 'Tom Wilson', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_8', username: 'flexmaster', displayName: 'Ana Garcia', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_9', username: 'ironpump', displayName: 'Jake Thompson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { id: 'user_10', username: 'zenwarrior', displayName: 'Maya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' }
    ];

    const leaderboard = users.map((user, index) => {
      let score, unit, change;
      
      switch (category) {
        case 'points':
          score = Math.floor(Math.random() * 1000) + (100 - index * 10);
          unit = 'pts';
          break;
        case 'workouts':
          score = Math.floor(Math.random() * 20) + (25 - index * 2);
          unit = 'workouts';
          break;
        case 'streak':
          score = Math.floor(Math.random() * 10) + (30 - index * 3);
          unit = 'days';
          break;
        case 'distance':
          score = (Math.random() * 20 + (50 - index * 4)).toFixed(1);
          unit = 'miles';
          break;
        default:
          score = Math.floor(Math.random() * 1000) + (100 - index * 10);
          unit = 'pts';
      }

      change = Math.floor(Math.random() * 10) - 5; // -5 to +5 position change

      return {
        rank: index + 1,
        previousRank: Math.max(1, index + 1 + change),
        user,
        score,
        unit,
        change: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
        changeAmount: Math.abs(change),
        isCurrentUser: user.id === this.currentUser.id
      };
    });

    return {
      category,
      timeframe,
      lastUpdated: new Date().toISOString(),
      entries: leaderboard
    };
  }

  generateSampleUsers(count = 5) {
    const names = [
      'Alex Johnson', 'Sarah Martinez', 'Mike Chen', 'Emma Wilson', 'David Rodriguez',
      'Lisa Park', 'Tom Wilson', 'Ana Garcia', 'Jake Thompson', 'Maya Patel'
    ];
    const usernames = [
      'fitnesschamp', 'runnerlife', 'strengthguru', 'yogavibes', 'cardioking',
      'hiitqueen', 'cyclepath', 'flexmaster', 'ironpump', 'zenwarrior'
    ];
    const avatars = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `user_${i + 1}`,
      username: usernames[i % usernames.length],
      displayName: names[i % names.length],
      avatar: avatars[i % avatars.length],
      level: Math.floor(Math.random() * 20) + 1,
      totalPoints: Math.floor(Math.random() * 5000),
      isFollowing: Math.random() > 0.5,
      mutualFollowers: Math.floor(Math.random() * 10)
    }));
  }
}

// Export singleton instance
const socialService = new SocialService();
export default socialService;