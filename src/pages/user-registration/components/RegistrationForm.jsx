import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadFile, getFileUrl } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    fitnessGoals: [],
    fitnessLevel: '',
    profilePhoto: null,
    profileVisibility: 'friends'
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fitnessGoalOptions = [
    { id: 'weight-loss', label: 'Weight Loss', description: 'Reduce body weight and fat percentage' },
    { id: 'muscle-gain', label: 'Muscle Gain', description: 'Build lean muscle mass and strength' },
    { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
    { id: 'general-health', label: 'General Health', description: 'Overall wellness and fitness' }
  ];

  const fitnessLevelOptions = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a break' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine for 6+ months' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years' }
  ];

  const privacyOptions = [
    { value: 'private', label: 'Private', description: 'Only you can see your profile' },
    { value: 'friends', label: 'Friends Only', description: 'Only your friends can see your profile' },
    { value: 'public', label: 'Public', description: 'Anyone can see your profile' }
  ];

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpper = /[A-Z]/?.test(password);
    const hasLower = /[a-z]/?.test(password);
    const hasNumber = /\d/?.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation)?.filter(Boolean)?.length - 1;
    
    if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoalChange = (goalId, checked) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: checked 
        ? [...prev?.fitnessGoals, goalId]
        : prev?.fitnessGoals?.filter(id => id !== goalId)
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhotoPreview(e?.target?.result);
      reader?.readAsDataURL(file);
      
      if (errors?.profilePhoto) {
        setErrors(prev => ({ ...prev, profilePhoto: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData?.password)?.isValid) {
      newErrors.password = 'Password must meet all requirements';
    }
    
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData?.fitnessGoals?.length === 0) {
      newErrors.fitnessGoals = 'Please select at least one fitness goal';
    }
    
    if (!formData?.fitnessLevel) {
      newErrors.fitnessLevel = 'Please select your fitness level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Create user account with Supabase Auth
      const { user, error: signUpError } = await signUp(
        formData?.email,
        formData?.password,
        {
          full_name: formData?.fullName,
          fitness_goals: formData?.fitnessGoals?.join(','),
          fitness_level: formData?.fitnessLevel,
          profile_visibility: formData?.profileVisibility
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      if (!user) {
        throw new Error('User creation failed');
      }

      // 2. Upload profile photo if provided
      let profilePictureUrl = null;
      let profilePicturePath = null;

      if (formData?.profilePhoto) {
        try {
          const fileExt = formData?.profilePhoto?.name?.split('.')?.pop();
          const fileName = `${user?.id}/profile.${fileExt}`;
          
          const { error: uploadError } = await uploadFile('profile-images', fileName, formData?.profilePhoto);
          
          if (uploadError) {
            console.warn('Profile photo upload failed:', uploadError);
            // Continue registration even if photo upload fails
          } else {
            const { url, error: urlError } = await getFileUrl('profile-images', fileName, false);
            
            if (!urlError && url) {
              profilePictureUrl = url;
              profilePicturePath = fileName;
            }
          }
        } catch (photoError) {
          console.warn('Profile photo processing failed:', photoError);
          // Continue registration even if photo fails
        }
      }

      // 3. Update user profile with additional data
      if (profilePictureUrl && profilePicturePath) {
        // Update profile with photo information
        // This will be handled by the user profile page later
      }

      // 4. Registration successful - redirect to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ 
        submit: error?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValidation = validatePassword(formData?.password);
  const passwordStrength = getPasswordStrength(formData?.password);
  const isFormValid = formData?.fullName && formData?.email && formData?.password && 
                     formData?.confirmPassword && formData?.fitnessGoals?.length > 0 && 
                     formData?.fitnessLevel && passwordValidation?.isValid && 
                     formData?.password === formData?.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-elevation-3 border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Icon name="UserPlus" size={24} className="sm:w-8 sm:h-8" color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join StriveTrack</h1>
          <p className="text-white/90 text-sm sm:text-base">Start your fitness transformation journey today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="User" size={18} className="sm:w-5 sm:h-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData?.fullName}
                onChange={handleInputChange}
                error={errors?.fullName}
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData?.email}
                onChange={handleInputChange}
                error={errors?.email}
                required
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Lock" size={18} className="sm:w-5 sm:h-5" />
              Security
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData?.password}
                    onChange={handleInputChange}
                    error={errors?.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                  </button>
                </div>
                
                {formData?.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength?.strength === 'Strong' ? 'text-green-600' :
                        passwordStrength?.strength === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength?.strength}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength?.color}`}
                        style={{ width: passwordStrength?.width }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordValidation?.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <Icon name={passwordValidation?.minLength ? "Check" : "X"} size={12} />
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation?.hasUpper ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <Icon name={passwordValidation?.hasUpper ? "Check" : "X"} size={12} />
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation?.hasLower ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <Icon name={passwordValidation?.hasLower ? "Check" : "X"} size={12} />
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation?.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <Icon name={passwordValidation?.hasNumber ? "Check" : "X"} size={12} />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData?.confirmPassword}
                  onChange={handleInputChange}
                  error={errors?.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Target" size={18} className="sm:w-5 sm:h-5" />
              Fitness Goals
            </h2>
            <p className="text-sm text-muted-foreground">Select all that apply to your fitness journey</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fitnessGoalOptions?.map((goal) => (
                <div key={goal?.id} className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors">
                  <Checkbox
                    label={goal?.label}
                    description={goal?.description}
                    checked={formData?.fitnessGoals?.includes(goal?.id)}
                    onChange={(e) => handleGoalChange(goal?.id, e?.target?.checked)}
                  />
                </div>
              ))}
            </div>
            {errors?.fitnessGoals && (
              <p className="text-sm text-destructive">{errors?.fitnessGoals}</p>
            )}
          </div>

          {/* Fitness Level */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="TrendingUp" size={18} className="sm:w-5 sm:h-5" />
              Fitness Level
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fitnessLevelOptions?.map((level) => (
                <label
                  key={level?.value}
                  className={`border border-border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                    formData?.fitnessLevel === level?.value ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value={level?.value}
                      checked={formData?.fitnessLevel === level?.value}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-foreground text-sm sm:text-base">{level?.label}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{level?.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors?.fitnessLevel && (
              <p className="text-sm text-destructive">{errors?.fitnessLevel}</p>
            )}
          </div>

          {/* Profile Photo */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Camera" size={18} className="sm:w-5 sm:h-5" />
              Profile Photo (Optional)
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                {profilePhotoPreview ? (
                  <Image
                    src={profilePhotoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={24} className="sm:w-8 sm:h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="profilePhoto">
                  <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Choose Photo
                  </Button>
                </label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {errors?.profilePhoto && (
                  <p className="text-xs sm:text-sm text-destructive mt-1">{errors?.profilePhoto}</p>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <Icon name="Shield" size={18} className="sm:w-5 sm:h-5" />
              Privacy Settings
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {privacyOptions?.map((option) => (
                <label
                  key={option?.value}
                  className={`border border-border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                    formData?.profileVisibility === option?.value ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option?.value}
                      checked={formData?.profileVisibility === option?.value}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-foreground text-sm sm:text-base">{option?.label}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{option?.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4 pt-4">
            {errors?.submit && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm font-medium">{errors?.submit}</span>
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/user-login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;