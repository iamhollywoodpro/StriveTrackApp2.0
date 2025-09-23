import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-elevation-2">
          <Icon name="TrendingUp" size={28} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold text-foreground">StriveTrack</span>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">
          Continue your fitness transformation journey
        </p>
      </div>

      {/* Motivational Quote */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
        <blockquote className="text-sm text-muted-foreground italic">
          "The only bad workout is the one that didn't happen."
        </blockquote>
        <cite className="text-xs text-muted-foreground/80 mt-1 block">- Fitness Wisdom</cite>
      </div>
    </div>
  );
};

export default LoginHeader;