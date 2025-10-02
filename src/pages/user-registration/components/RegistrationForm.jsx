import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { storage } from '../../../lib/cloudflare';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import PWAInstallButton from '../../../components/PWAInstallButton';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex items-center justify-center p-4">
      {/* PWA Install Button - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <PWAInstallButton size="sm" variant="outline" />
      </div>

      <div className="w-full max-w-2xl bg-card/95 backdrop-blur-xl rounded-3xl shadow-elevation-3 border border-white/20 dark:border-white/10 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-primary via-secondary to-primary p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          {/* Logo */}
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-elevation-2 border border-white/30">
              <Icon name="Sparkles" size={32} className="sm:w-10 sm:h-10" color="white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join the StriveTrack Family!</h1>
            <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto">
              Ready to unlock your potential? Let's create your transformation story together! 🚀
            </p>
            
            {/* Success Stats */}
            <div className="flex justify-center space-x-6 mt-4 text-white/80">
              <div className="text-center">
                <div className="text-lg font-bold">10k+</div>
                <div className="text-xs">Transformations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">98%</div>
                <div className="text-xs">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">24/7</div>
                <div className="text-xs">Support</div>
              </div>
            </div>
          </div>
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
              className="bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 transform hover:scale-[1.02] transition-all duration-200 shadow-elevation-2 py-4 text-base font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Your Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Icon name="Sparkles" size={20} color="currentColor" strokeWidth={2} />
                  <span>Start My Transformation!</span>
                  <Icon name="ArrowRight" size={18} color="currentColor" strokeWidth={2} />
                </div>
              )}
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

      {/* Enhanced Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Fitness-themed gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-48 h-48 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-gradient-to-br from-secondary/15 via-secondary/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-gradient-to-br from-green-500/10 via-emerald-500/8 to-transparent rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-500/10 via-pink-500/8 to-transparent rounded-full blur-xl animate-pulse animation-delay-3000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LDEwMiwyNDEsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>
    </div>
  );
};

export default RegistrationForm;