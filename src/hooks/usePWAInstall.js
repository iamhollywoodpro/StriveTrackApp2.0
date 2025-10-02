import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // For PWA
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // For iOS
      if (window.navigator && window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }
      
      // Check for Android TWA
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    // Check if device is iOS
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
      
      // For iOS, show install button if not already installed
      if (isIOSDevice && !isInstalled) {
        setShowInstallButton(true);
      }
    };

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();
    checkIfIOS();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const installPWA = async () => {
    if (!deferredPrompt && !isIOS) {
      return false;
    }

    if (isIOS) {
      // For iOS, we can't programmatically install, so we show instructions
      return 'ios-instructions';
    }

    // For Android/Desktop
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // We no longer need the prompt. Clear it up.
      setDeferredPrompt(null);
      setShowInstallButton(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Install StriveTrack on iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install StriveTrack',
          'Find StriveTrack on your home screen!'
        ],
        icon: 'share'
      };
    }
    
    return {
      title: 'Install StriveTrack',
      steps: [
        'Tap "Install" when prompted',
        'Or use your browser\'s menu',
        'Look for "Install App" or "Add to Home Screen"',
        'Enjoy StriveTrack as a native app!'
      ],
      icon: 'download'
    };
  };

  return {
    showInstallButton,
    isInstalled,
    isIOS,
    installPWA,
    getInstallInstructions,
    canInstall: showInstallButton && (deferredPrompt || isIOS)
  };
};