import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { isAdminUser } from '../../../lib/supabase';

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
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData?.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
            className="w-full"
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
          className="w-full"
          disabled={isLoading || loading}
        >
          {isLoading || loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Icon name="LogIn" size={18} color="currentColor" strokeWidth={2} />
              <span>Sign In</span>
            </div>
          )}
        </Button>
      </form>

      {/* Additional Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/user-registration')}
            className="text-primary hover:text-primary/80 font-medium"
            disabled={isLoading}
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;