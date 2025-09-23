import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const AchievementConfetti = ({ 
  trigger = false, 
  duration = 3000, 
  particleCount = 100,
  spread = 70,
  origin = { y: 0.6 },
  colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#98FB98'],
  onComplete = null 
}) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (trigger) {
      // Clear any existing timeout
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef?.current);
      }

      // Fire confetti burst
      const fireConfetti = () => {
        confetti({
          particleCount,
          spread,
          origin,
          colors,
          ticks: 300,
          gravity: 0.8,
          decay: 0.94,
          startVelocity: 30,
          shapes: ['star', 'circle']
        });
      };

      // Fire multiple bursts for celebration effect
      fireConfetti();
      setTimeout(fireConfetti, 150);
      setTimeout(fireConfetti, 300);
      
      // Optional callback when confetti is done
      if (onComplete) {
        timeoutRef.current = setTimeout(() => {
          onComplete();
        }, duration);
      }
    }

    return () => {
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef?.current);
      }
    };
  }, [trigger, duration, particleCount, spread, origin, colors, onComplete]);

  return null; // This component doesn't render anything visible
};

export default AchievementConfetti;