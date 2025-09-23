import React from 'react';
import { Helmet } from 'react-helmet';
import RegistrationForm from './components/RegistrationForm';

const UserRegistration = () => {
  return (
    <>
      <Helmet>
        <title>Join StriveTrack - Start Your Fitness Journey</title>
        <meta name="description" content="Create your StriveTrack account and begin your fitness transformation journey with progress tracking, social motivation, and personalized insights." />
        <meta name="keywords" content="fitness registration, join strivetrack, fitness journey, workout tracker, progress photos" />
        <meta property="og:title" content="Join StriveTrack - Start Your Fitness Journey" />
        <meta property="og:description" content="Create your account and transform your fitness journey with StriveTrack's comprehensive tracking and social features." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <RegistrationForm />
      </div>
    </>
  );
};

export default UserRegistration;