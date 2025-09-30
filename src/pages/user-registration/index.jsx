import React from 'react';
import { Helmet } from 'react-helmet';
import RegistrationForm from './components/RegistrationForm';

const UserRegistration = () => {
  return (
    <>
      <Helmet>
        <title>Join StriveTracker | A Complete Fitness Tracker Reimagined</title>
        <meta name="description" content="Create your StriveTracker account and begin your fitness transformation journey with comprehensive progress tracking, nutrition monitoring, and achievement systems." />
        <meta name="keywords" content="fitness registration, join strivetracker, fitness journey, workout tracker, progress photos, nutrition tracker" />
        <meta property="og:title" content="Join StriveTracker | A Complete Fitness Tracker Reimagined" />
        <meta property="og:description" content="Create your account and transform your fitness journey with StriveTracker's comprehensive tracking and achievement features." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <RegistrationForm />
      </div>
    </>
  );
};

export default UserRegistration;