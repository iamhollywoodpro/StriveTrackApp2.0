import React, { useState } from 'react';

function SocialSharing({ content, onClose }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      description: 'Share with friends and family'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: '🐦',
      color: 'bg-slate-900',
      description: 'Tweet to your followers'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      description: 'Share to your story'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700',
      description: 'Professional networking'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '📋',
      color: 'bg-slate-600',
      description: 'Copy shareable link'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💚',
      color: 'bg-green-600',
      description: 'Send to contacts'
    }
  ];

  const generateShareText = () => {
    let shareText = '';
    
    if (content.type === 'achievement') {
      shareText = `🏆 Just achieved ${content.title} on StriveTrack! ${content.description}`;
    } else if (content.type === 'workout') {
      shareText = `💪 Just completed a ${content.duration}min ${content.workoutType} workout and burned ${content.calories} calories! #StriveTrack #Fitness`;
    } else if (content.type === 'milestone') {
      shareText = `🎯 Reached a new milestone: ${content.title}! ${content.description} #FitnessJourney #StriveTrack`;
    } else if (content.type === 'challenge') {
      shareText = `🚀 Completed the ${content.title} challenge! ${content.description} #FitnessChallenge #StriveTrack`;
    } else {
      shareText = content.text || 'Check out my fitness progress on StriveTrack!';
    }

    return customMessage || shareText;
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleShare = async () => {
    if (selectedPlatforms.length === 0) return;
    
    setIsSharing(true);
    
    try {
      const shareText = generateShareText();
      const shareUrl = content.url || window.location.href;
      
      for (const platformId of selectedPlatforms) {
        await shareOnPlatform(platformId, shareText, shareUrl);
      }
      
      // Show success message
      alert('Content shared successfully!');
      onClose();
      
    } catch (error) {
      console.error('Error sharing:', error);
      alert('There was an error sharing your content. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const shareOnPlatform = async (platformId, text, url) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    switch (platformId) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        break;
        
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
        
      case 'instagram':
        // Instagram doesn't support direct sharing, so we'll copy the text
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Content copied to clipboard! You can now paste it in your Instagram story.');
        break;
        
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`, '_blank');
        break;
        
      case 'copy':
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copied to clipboard!');
        break;
        
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`, '_blank');
        break;
        
      default:
        console.warn('Unknown platform:', platformId);
    }
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">🚀 Share Your Success</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content Preview */}
          <div className="card p-4 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">
                {content.type === 'achievement' && '🏆'}
                {content.type === 'workout' && '💪'}
                {content.type === 'milestone' && '🎯'}
                {content.type === 'challenge' && '🚀'}
              </div>
              <div>
                <h3 className="font-bold text-purple-900">{content.title}</h3>
                <p className="text-purple-700 text-sm">{content.description}</p>
              </div>
            </div>
            
            {content.image && (
              <img 
                src={content.image} 
                alt="Share content"
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Customize your message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={generateShareText()}
              className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Choose platforms to share</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${selectedPlatforms.includes(platform.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">{platform.icon}</span>
                    <span className="font-medium text-slate-900">{platform.name}</span>
                    {selectedPlatforms.includes(platform.id) && (
                      <span className="text-purple-600">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{platform.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Share Stats Preview */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-slate-900 mb-2">📊 Potential Reach</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Platforms selected:</span>
                <span className="font-medium text-slate-900 ml-1">{selectedPlatforms.length}</span>
              </div>
              <div>
                <span className="text-slate-600">Estimated views:</span>
                <span className="font-medium text-slate-900 ml-1">{selectedPlatforms.length * 50}+</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              disabled={selectedPlatforms.length === 0 || isSharing}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? '🔄 Sharing...' : `📤 Share to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
            </button>
            <button 
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSharing}
            >
              Cancel
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Sharing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use hashtags to reach more people</li>
              <li>• Tag friends who might be inspired</li>
              <li>• Share your progress regularly to stay motivated</li>
              <li>• Engage with others who comment on your posts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialSharing;