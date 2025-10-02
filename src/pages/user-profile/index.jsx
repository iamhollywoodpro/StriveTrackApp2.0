import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, storage } from '../../lib/cloudflare';
import { apiGet, apiSend } from '../../lib/api';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';

const UserProfile = () => {
  const { user, userProfile, updateProfile, loading, profileLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    height: '',
    weight: '',
    goals: ''
  });
  const fileInputRef = useRef(null);

  // Initialize form data when userProfile loads
  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFormData({
        full_name: userProfile?.full_name || '',
        bio: userProfile?.bio || '',
        height: userProfile?.height || '',
        weight: userProfile?.weight || '',
        goals: userProfile?.goals || ''
      });
    }
  }, [userProfile, isEditing]);

  // Load profile from Worker API
  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔍 Loading profile for user:', user.id);
      const profile = await apiGet('/profile');
      console.log('📄 Profile data received:', profile);
      
      if (profile) {
        // Build profile picture URL if we have a key
        let profilePictureUrl = null;
        if (profile.profile_picture) {
          const { data: sessionData } = await auth.getSession();
          const token = sessionData?.session?.access_token;
          const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
          profilePictureUrl = `${API_BASE}/media/${encodeURIComponent(profile.profile_picture)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        }
        
        const updatedProfile = {
          id: user.id,
          full_name: profile.name || '',
          bio: profile.bio || '',
          height: profile.targets?.height || '',
          weight: profile.targets?.weight || '',
          goals: profile.targets?.goals || '',
          profile_picture_path: profile.profile_picture,
          profile_picture_url: profilePictureUrl,
          points: profile.total_points || 0
        };
        
        // Update the auth context with profile data
        updateProfile(updatedProfile);
        setFormData({
          full_name: updatedProfile.full_name,
          bio: updatedProfile.bio,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          goals: updatedProfile.goals
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      setAchievementsLoading(true);
      console.log('🏆 Loading achievements for user:', user.id);

      // Get achievements from Worker API (100% cloud-native)
      const achievementsData = await apiGet('/achievements');
      console.log('🎯 Achievements data received:', achievementsData);
      const earnedAchievements = achievementsData?.items || [];
      
      // Create achievement catalog (no more Supabase dependency!)
      const achievementCatalog = [
        { code: 'first_upload', name: 'First Progress Upload!', description: 'You uploaded your first progress photo!', points: 25, category: 'progress' },
        { code: 'daily_progress_photo', name: 'Daily Progress Hero', description: 'You captured your progress today!', points: 10, category: 'progress' },
        { code: 'daily_login', name: 'Daily Check-in', description: 'You logged in today!', points: 5, category: 'engagement' },
        { code: 'first_habit_log', name: 'First Habit Completed', description: 'You completed your first habit!', points: 10, category: 'habits' },
        { code: 'daily_habit_complete', name: 'Habit Hero', description: 'You completed a habit today!', points: 10, category: 'habits' }
      ];
      
      setAllAchievements(achievementCatalog);

      // Process earned achievements from Worker with proper display names
      const processedAchievements = earnedAchievements?.map(achievement => {
        // Find the achievement definition from our catalog
        const achievementDef = achievementCatalog.find(def => def.code === achievement.code) || {};
        
        return {
          id: achievement.id,
          code: achievement.code,
          name: achievementDef.name || achievement.code,
          description: achievementDef.description || 'Achievement earned!',
          points: achievement.points,
          created_at: achievement.created_at,
          category: achievementDef.category || 'general'
        };
      }) || [];

      setUserAchievements(processedAchievements);
      
      // Update profile with total points from achievements API
      if (achievementsData?.total_points !== undefined && userProfile) {
        const updatedProfile = { ...userProfile, points: achievementsData.total_points };
        updateProfile(updatedProfile);
      }

    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      fetchAchievements();
    }
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    
    try {
      // Use Worker API to save profile
      const profileData = {
        name: formData.full_name,
        bio: formData.bio,
        targets: {
          height: formData.height,
          weight: formData.weight,
          goals: formData.goals
        }
      };
      
      await apiSend('PUT', '/profile', profileData);
      
      // Update local userProfile state
      const updatedProfile = {
        ...userProfile,
        full_name: formData.full_name,
        bio: formData.bio,
        height: formData.height,
        weight: formData.weight,
        goals: formData.goals
      };
      
      // Update the auth context
      updateProfile(updatedProfile);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file || !user?.id) return;

    // Validate file size (10MB limit for Worker API)
    if (file?.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file?.type?.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      // Delete old profile picture if exists
      if (userProfile?.profile_picture_url) {
        try {
          // Extract the key from the existing URL to delete old image
          const urlParts = userProfile.profile_picture_url.split('/api/media/');
          if (urlParts.length > 1) {
            const oldKey = decodeURIComponent(urlParts[1].split('?')[0]);
            await apiSend('DELETE', `/media/${encodeURIComponent(oldKey)}`, null);
          }
        } catch (deleteError) {
          console.warn('Could not delete old profile picture:', deleteError);
        }
      }

      // Upload new profile picture using our bulletproof upload system
      const { uploadToR2 } = await import('../../lib/simpleUpload');
      
      const progressCallback = (progress, status) => {
        console.log(`Profile upload: ${progress}% - ${status}`);
      };
      
      // Use the same reliable upload system as progress photos
      const result = await uploadToR2(file, progressCallback);
      
      // Build the media URL with auth token
      const { data: sessionData } = await auth.getSession();
      const token = sessionData?.session?.access_token;
      const API_BASE = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
      const newProfilePictureUrl = `${API_BASE}/media/${encodeURIComponent(result.key)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

      // Save profile picture to backend (only send the key)
      await apiSend('PUT', '/profile', {
        profile_picture: result.key
      });
      
      // Update user profile with new picture URL
      const updatedProfile = {
        ...userProfile,
        profile_picture_url: newProfilePictureUrl,
        profile_picture_path: result.key
      };
      
      // Update the auth context
      updateProfile(updatedProfile);

      alert('Profile picture updated successfully!');

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef?.current?.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate real stats from user data
  const stats = {
    totalPoints: userProfile?.points || 0,
    totalAchievements: userAchievements?.length || 0,
    recentAchievements: userAchievements?.slice(0, 3) || [],
    completionRate: allAchievements?.length > 0 ? 
      Math.round((userAchievements?.length / allAchievements?.length) * 100) : 0
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {userProfile?.profile_picture_url ? (
                    <img
                      src={userProfile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load profile picture');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon name="User" size={32} className="text-white" />
                  )}
                </div>
                <button
                  onClick={triggerFileUpload}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Icon name="Camera" size={16} strokeWidth={2} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {userProfile?.full_name || userProfile?.name || 'Update Your Name'}
                </h1>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {userProfile?.created_at ? formatDate(userProfile?.created_at) : 'Recently'}
                </p>
              </div>

              {/* Edit Button */}
              <div className="flex space-x-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Icon name="Edit" size={16} strokeWidth={2} />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original values
                        setFormData({
                          full_name: userProfile?.full_name || '',
                          bio: userProfile?.bio || '',
                          height: userProfile?.height || '',
                          weight: userProfile?.weight || '',
                          goals: userProfile?.goals || ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2"
                    >
                      <Icon name="Save" size={16} strokeWidth={2} />
                      <span>Save</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Trophy" size={24} className="text-primary" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.totalPoints?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Award" size={24} className="text-secondary" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.totalAchievements}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Target" size={24} className="text-green-500" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Calendar" size={24} className="text-purple-500" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-foreground">{allAchievements?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>

          {/* Recent Achievements Section */}
          {!achievementsLoading && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Achievements</h2>
                {userAchievements?.length > 3 && (
                  <Button variant="outline" size="sm">
                    View All ({userAchievements?.length})
                  </Button>
                )}
              </div>

              {userAchievements?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats?.recentAchievements?.map((achievement) => (
                    <div key={achievement?.id} className="bg-background rounded-lg p-4 border border-border">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement?.achievements?.icon || '🏆'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            {achievement?.achievements?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {achievement?.achievements?.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-primary font-medium">
                              +{achievement?.achievements?.points} points
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(achievement?.earned_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="Award" size={48} color="currentColor" className="text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                  <p className="text-muted-foreground mb-4">No achievements earned yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start completing habits and goals to earn your first achievements!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Profile Details */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Profile Details</h2>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground">{userProfile?.full_name || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="text-foreground">{userProfile?.bio || 'No bio provided'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                    <p className="text-foreground">{userProfile?.height || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weight</label>
                    <p className="text-foreground">{userProfile?.weight || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Goals</label>
                  <p className="text-foreground">{userProfile?.goals || 'No goals set'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData?.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="text-sm font-medium text-muted-foreground">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData?.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="height" className="text-sm font-medium text-muted-foreground">
                      Height
                    </label>
                    <Input
                      id="height"
                      name="height"
                      value={formData?.height}
                      onChange={handleInputChange}
                      placeholder="e.g., 5'9'' or 175cm"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="text-sm font-medium text-muted-foreground">
                      Weight
                    </label>
                    <Input
                      id="weight"
                      name="weight"
                      value={formData?.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 150lbs or 68kg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="goals" className="text-sm font-medium text-muted-foreground">
                    Fitness Goals
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData?.goals}
                    onChange={handleInputChange}
                    placeholder="What are your fitness goals?"
                    rows={3}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;