import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadFile, getFileUrl, deleteFile } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

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

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      setAchievementsLoading(true);

      // Get all available achievements
      const { data: allAchievementsData, error: achievementsError } = await supabase
        ?.from('achievements')
        ?.select('*')
        ?.eq('is_active', true)
        ?.order('points', { ascending: false });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
      } else {
        setAllAchievements(allAchievementsData || []);
      }

      // Get user's earned achievements
      const { data: earnedAchievements, error: userError } = await supabase
        ?.from('user_achievements')
        ?.select(`
          id,
          earned_at,
          achievement_id,
          achievements (
            id,
            name,
            description,
            icon,
            points,
            category,
            frequency
          )
        `)
        ?.eq('user_id', user?.id)
        ?.order('earned_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user achievements:', userError);
      } else {
        setUserAchievements(earnedAchievements || []);
      }

    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
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
      const { error } = await updateProfile(formData);
      
      if (error) {
        throw error;
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file || !user?.id) return;

    // Validate file size (5MB limit)
    if (file?.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
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
      if (userProfile?.profile_picture_path) {
        await deleteFile('profile-images', userProfile?.profile_picture_path);
      }

      // Upload new profile picture
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${user?.id}/profile.${fileExt}`;
      
      const { error: uploadError } = await uploadFile('profile-images', fileName, file);
      
      if (uploadError) throw uploadError;

      // Get the file URL (signed URL for private bucket)
      const { url, error: urlError } = await getFileUrl('profile-images', fileName, false);
      
      if (urlError) throw urlError;

      // Update user profile with new picture URL and path
      const { error: updateError } = await updateProfile({
        profile_picture_url: url,
        profile_picture_path: fileName
      });

      if (updateError) throw updateError;

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
                      src={userProfile?.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={32} color="white" strokeWidth={2} />
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