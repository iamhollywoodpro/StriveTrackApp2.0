// Confetti Animation Hook for Achievements
import { useCallback } from 'react';

export const useConfetti = () => {
  const playConfetti = useCallback((achievement) => {
    // Create confetti elements
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confettiContainer);

    // Play achievement sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRpQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YagEAABBhyEjq7sheRuUtCVNCmYkXYYnZv0nCvQnSQYoODon9N0nKsEo7ZcoGQop4QgqfgcqHsQqaxMrKx0rZiErUx4r+sAqXr0qds4qF+Qq+SUqOEoqTAoq7a8pNrQpLq4pkLUpQREqm8kpTzAq5qIpQPEmQzEpXg8p0YskvuYitw0jDAEj5/wiNdgi3sEi8KQj7tIh7K8hICwh+AQhqykj2tch9ych0R8hegQhgPEl+8cgJq4gg+Ag0QUhbf0f6eYfKCog5OQf4A8g4zUgkPsf1MYfC9YfxbYftg8gQqcfSVkgAPEfhd0f4pMgAoQfWbUf6T0g3i0g2S0g5iEgCfog8Q8g8rEf');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if sound fails
    } catch (e) {
      // Fallback silent
    }

    // Create confetti particles
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full animate-pulse';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        
        // Random starting position at top
        particle.style.top = '-10px';
        
        confettiContainer.appendChild(particle);

        // Animate falling
        const animation = particle.animate([
          { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: 1
          },
          { 
            transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 720 - 360}deg)`,
            opacity: 0
          }
        ], {
          duration: 3000 + Math.random() * 2000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.addEventListener('finish', () => {
          particle.remove();
        });
      }, i * 50);
    }

    // Show achievement notification
    showAchievementNotification(achievement);

    // Clean up container after animations
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.remove();
      }
    }, 6000);
  }, []);

  const showAchievementNotification = (achievement) => {
    // Create achievement popup
    const popup = document.createElement('div');
    popup.className = `
      fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 
      text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-yellow-300
      transform transition-all duration-500 ease-out
      max-w-sm animate-bounce
    `;
    
    popup.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">${achievement?.icon || '🏆'}</div>
        <div>
          <div class="font-bold text-lg">Achievement Unlocked!</div>
          <div class="text-sm opacity-90">${achievement?.title || 'New Achievement'}</div>
          <div class="text-xs opacity-75">+${achievement?.points || 0} points</div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
      popup.style.transform = 'translateX(0) scale(1)';
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      popup.style.transform = 'translateX(400px) scale(0.8)';
      popup.style.opacity = '0';
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 500);
    }, 4000);
  };

  return { playConfetti };
};

export default useConfetti;