import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SocialLogin = () => {
  const socialProviders = [
    {
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'Apple',
      icon: 'Apple',
      color: 'bg-gray-900 hover:bg-black',
      textColor: 'text-white'
    }
  ];

  const handleSocialLogin = (provider) => {
    // Mock social login - in real app would integrate with OAuth
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>
      {/* Social Login Buttons */}
      <div className="space-y-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.name}
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleSocialLogin(provider?.name)}
            className="flex items-center justify-center space-x-3 border-2 hover:border-primary/20"
          >
            <Icon name={provider?.icon} size={20} />
            <span>Continue with {provider?.name}</span>
          </Button>
        ))}
      </div>
      {/* Alternative: Single row layout for desktop */}
      <div className="hidden lg:block mt-6">
        <div className="grid grid-cols-3 gap-3">
          {socialProviders?.map((provider) => (
            <Button
              key={provider?.name}
              variant="outline"
              size="lg"
              onClick={() => handleSocialLogin(provider?.name)}
              className="flex items-center justify-center p-3 border-2 hover:border-primary/20"
              aria-label={`Continue with ${provider?.name}`}
            >
              <Icon name={provider?.icon} size={24} />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;