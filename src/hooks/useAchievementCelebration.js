import { useState, useCallback } from 'react';
import { useSound } from 'use-sound';

// Import success sound (you can add sound files to public/sounds/)
// For now, we'll use a browser-generated success sound

const useAchievementCelebration = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratingAchievement, setCelebratingAchievement] = useState(null);

  // Optional: Add sound effect (requires sound file)
  // const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.6 });

  // Browser-generated success sound as fallback
  const playSuccessSound = useCallback(() => {
    try {
      // Create audio context for browser-generated sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a success sound using oscillator
      const oscillator = audioContext?.createOscillator();
      const gainNode = audioContext?.createGain();
      
      oscillator?.connect(gainNode);
      gainNode?.connect(audioContext?.destination);
      
      // Success chord progression
      const playNote = (frequency, startTime, duration) => {
        const osc = audioContext?.createOscillator();
        const gain = audioContext?.createGain();
        
        osc?.connect(gain);
        gain?.connect(audioContext?.destination);
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        gain?.gain?.setValueAtTime(0.1, startTime);
        gain?.gain?.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc?.start(startTime);
        osc?.stop(startTime + duration);
      };
      
      // Play success chord (C major chord)
      const now = audioContext?.currentTime;
      playNote(261.63, now, 0.3); // C4
      playNote(329.63, now, 0.3); // E4
      playNote(392.00, now, 0.3); // G4
      playNote(523.25, now + 0.1, 0.4); // C5 (octave)
      
    } catch (error) {
      // Fallback to console sound if audio context fails
      console.log('🎉 Achievement Unlocked! 🎉');
    }
  }, []);

  const celebrate = useCallback((achievement) => {
    setCelebratingAchievement(achievement);
    setShowConfetti(true);
    playSuccessSound();

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
      setCelebratingAchievement(null);
    }, 3000);
  }, [playSuccessSound]);

  const stopCelebration = useCallback(() => {
    setShowConfetti(false);
    setCelebratingAchievement(null);
  }, []);

  return {
    celebrate,
    stopCelebration,
    showConfetti,
    celebratingAchievement,
    isActive: showConfetti && celebratingAchievement
  };
};

export default useAchievementCelebration;