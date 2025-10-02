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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
        {/* Mobile Bottom Navigation Spacer */}
        <div className="pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-6 max-w-lg">
            {/* Header Section */}
            <LoginHeader />

            {/* Main Login Form */}
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-elevation-3 p-6 md:p-8 border border-white/20 dark:border-white/10">
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

        {/* Enhanced Background Decorative Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Fitness-themed gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-48 h-48 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-gradient-to-br from-secondary/15 via-secondary/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-gradient-to-br from-green-500/10 via-emerald-500/8 to-transparent rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LDEwMiwyNDEsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>
      </div>
    </>
  );
};

export default UserLogin;