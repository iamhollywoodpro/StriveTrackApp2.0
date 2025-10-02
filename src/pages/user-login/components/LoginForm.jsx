import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { isAdminUser } from '../../../lib/cloudflare';

const LoginForm = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        setError(error?.message || 'Login failed. Please check your credentials.');
      } else if (user) {
        // Fast client check by admin email
        if (isAdminUser(user)) {
          navigate('/admin-dashboard');
          return;
        }
        // Regular user flow
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="flex items-center text-sm font-medium text-muted-foreground mb-3">
            <Icon name="Mail" size={16} className="mr-2 text-primary" />
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData?.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            required
            className="w-full pl-4 pr-4 py-3 text-base bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="flex items-center text-sm font-medium text-muted-foreground mb-3">
            <Icon name="Lock" size={16} className="mr-2 text-primary" />
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Your secure password"
            required
            className="w-full pl-4 pr-4 py-3 text-base bg-background/50 border-border/50 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} color="text-destructive" className="text-destructive" strokeWidth={2} />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-4 text-base font-semibold bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 transform hover:scale-[1.02] transition-all duration-200 shadow-elevation-2"
          disabled={isLoading || loading}
        >
          {isLoading || loading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Signing you in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <Icon name="Zap" size={20} color="currentColor" strokeWidth={2} />
              <span>Power Up & Sign In</span>
              <Icon name="ArrowRight" size={18} color="currentColor" strokeWidth={2} />
            </div>
          )}
        </Button>
      </form>

      {/* Additional Links */}
      <div className="mt-8 text-center space-y-4">
        {/* Quick Login Help */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Quick Tip</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the same email and password you created during registration. Need help? We're here for you! 💪
          </p>
        </div>

        {/* Registration CTA */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            New to StriveTrack?
          </p>
          <button
            type="button"
            onClick={() => navigate('/user-registration')}
            className="group inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 text-green-600 hover:text-green-700 font-semibold rounded-lg border border-green-500/20 hover:border-green-500/30 transition-all duration-200"
            disabled={isLoading}
          >
            <Icon name="UserPlus" size={16} />
            <span>Start Your Transformation</span>
            <Icon name="Sparkles" size={14} className="group-hover:animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;