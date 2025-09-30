import React from 'react';
import { Helmet } from 'react-helmet';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SocialLogin from './components/SocialLogin';
import LoginFooter from './components/LoginFooter';

const UserLogin = () => {
  return (
    <>
      <Helmet>
        <title>Sign In | StriveTracker - A Complete Fitness Tracker Reimagined</title>
        <meta name="description" content="Sign in to StriveTracker to continue tracking your fitness transformation with progress photos, workouts, nutrition, and achievement systems." />
        <meta name="keywords" content="fitness login, workout tracker, progress photos, fitness app sign in, nutrition tracker" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Mobile Bottom Navigation Spacer */}
        <div className="pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-8 max-w-lg">
            {/* Header Section */}
            <LoginHeader />

            {/* Main Login Form */}
            <div className="bg-card rounded-2xl shadow-elevation-2 p-6 md:p-8 border border-border">
              <LoginForm />
              
              {/* Social Login Options */}
              <div className="mt-6">
                <SocialLogin />
              </div>
            </div>

            {/* Footer Section */}
            <LoginFooter />
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </>
  );
};

export default UserLogin;