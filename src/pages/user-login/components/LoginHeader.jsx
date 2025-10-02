import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import PWAInstallButton from '../../../components/PWAInstallButton';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* PWA Install Button - Top Right */}
      <div className="flex justify-end mb-4">
        <PWAInstallButton size="sm" variant="outline" />
      </div>

      {/* Enhanced Logo */}
      <Link to="/" className="inline-flex flex-col items-center space-y-4 mb-8">
        {/* Logo Container */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-primary rounded-2xl flex items-center justify-center shadow-elevation-3 border-2 border-white/20">
            <Icon name="TrendingUp" size={36} color="white" strokeWidth={2.5} />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-primary/30 scale-110 animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-secondary/20 scale-125"></div>
        </div>
        
        {/* App Name */}
        <div className="space-y-1">
          <span className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            StriveTrack
          </span>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Fitness Reimagined
          </p>
        </div>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-3 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back, Warrior!</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
          Ready to continue crushing your goals? Let's see what amazing progress you've made! 💪
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <Icon name="Camera" size={20} className="mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Progress Photos</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
          <Icon name="Trophy" size={20} className="mx-auto mb-2 text-secondary" />
          <p className="text-xs text-muted-foreground font-medium">Achievements</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
          <Icon name="Target" size={20} className="mx-auto mb-2 text-green-600" />
          <p className="text-xs text-muted-foreground font-medium">Goal Tracking</p>
        </div>
      </div>

      {/* Motivational Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-xl border border-primary/10 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">10k+</div>
            <div className="text-xs text-muted-foreground">Transformations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">98%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">24/7</div>
            <div className="text-xs text-muted-foreground">Support</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-primary/10">
          <blockquote className="text-sm text-muted-foreground italic">
            "Your only limit is you. Push past it and watch magic happen." ✨
          </blockquote>
        </div>
      </div>

      {/* Quick Access Badges */}
      <div className="flex justify-center space-x-2 mt-4">
        <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
          🔥 Streak Ready
        </div>
        <div className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
          📈 Progress Waiting
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;