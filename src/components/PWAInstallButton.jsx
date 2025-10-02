import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import Button from './ui/Button';
import Icon from './AppIcon';

const PWAInstallModal = ({ isOpen, onClose, instructions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl shadow-elevation-3 border border-border p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name={instructions.icon} size={24} color="white" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{instructions.title}</h2>
          <p className="text-sm text-muted-foreground">
            Get the full StriveTrack experience on your device
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {instructions.steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Got it!
        </Button>
      </div>
    </div>
  );
};

const PWAInstallButton = ({ className = '', variant = 'default', size = 'default', showText = true }) => {
  const { showInstallButton, isInstalled, isIOS, installPWA, getInstallInstructions, canInstall } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // Don't render if app is already installed or can't be installed
  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const result = await installPWA();
    
    if (result === 'ios-instructions') {
      setShowModal(true);
    }
  };

  const instructions = getInstallInstructions();

  return (
    <>
      <Button
        onClick={handleInstall}
        variant={variant}
        size={size}
        className={`${className} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0`}
      >
        <Icon name="Download" size={16} className="mr-2" />
        {showText && (
          <span className="hidden sm:inline">
            {isIOS ? 'Install App' : 'Install StriveTrack'}
          </span>
        )}
        <span className="sm:hidden">Install</span>
      </Button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        instructions={instructions}
      />
    </>
  );
};

export default PWAInstallButton;