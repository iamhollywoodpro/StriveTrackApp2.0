import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const LoginFooter = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="mt-8 space-y-6">
      {/* Registration CTA */}
      <div className="text-center p-6 bg-muted/30 rounded-lg border border-border">
        <p className="text-muted-foreground mb-4">
          New to StriveTrack? Start your transformation today!
        </p>
        <Link to="/user-registration">
          <Button variant="outline" size="lg" fullWidth>
            Create New Account
          </Button>
        </Link>
      </div>

      {/* Features Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="space-y-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary font-bold text-lg">📸</span>
          </div>
          <h3 className="font-medium text-sm">Progress Photos</h3>
          <p className="text-xs text-muted-foreground">Track visual changes</p>
        </div>
        <div className="space-y-2">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-secondary font-bold text-lg">🏆</span>
          </div>
          <h3 className="font-medium text-sm">Achievements</h3>
          <p className="text-xs text-muted-foreground">Earn points & badges</p>
        </div>
        <div className="space-y-2">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-accent font-bold text-lg">👥</span>
          </div>
          <h3 className="font-medium text-sm">Community</h3>
          <p className="text-xs text-muted-foreground">Connect & motivate</p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-center space-y-4 pt-6 border-t border-border">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Help Center
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          © {currentYear} StriveTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginFooter;