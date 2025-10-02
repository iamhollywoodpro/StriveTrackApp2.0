import React, { useState, useEffect } from 'react';
import socialService from '../../lib/socialService';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, [activeFilter]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const response = await socialService.getChallenges(activeFilter);
      if (response.success) {
        setChallenges(response.challenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const response = await socialService.joinChallenge(challengeId);
      if (response.success) {
        setChallenges(challenges.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, isParticipating: true, participants: challenge.participants + 1 }
            : challenge
        ));
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'consistency': return 'text-purple-600 bg-purple-100';
      case 'cardio': return 'text-blue-600 bg-blue-100';
      case 'strength': return 'text-red-600 bg-red-100';
      case 'wellness': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getProgressPercentage = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
  };

  const formatProgress = (challenge) => {
    const { progress, target, type } = challenge;
    
    switch (type) {
      case 'streak':
      case 'sessions':
        return `${progress}/${target} ${type === 'streak' ? 'days' : 'sessions'}`;
      case 'distance':
        return `${progress}/${target} miles`;
      case 'time':
        return `${Math.floor(progress / 60)}m ${progress % 60}s / ${Math.floor(target / 60)}m ${target % 60}s`;
      default:
        return `${progress}/${target}`;
    }
  };

  const ChallengeCard = ({ challenge }) => {
    const progressPercentage = getProgressPercentage(challenge.progress, challenge.target);
    const isCompleted = challenge.status === 'completed' || progressPercentage >= 100;
    
    return (
      <div className={`card p-6 hover:shadow-lg transition-all cursor-pointer ${
        challenge.isParticipating ? 'ring-2 ring-purple-200 bg-purple-50' : ''
      }`}
      onClick={() => setSelectedChallenge(challenge)}
      >
        {/* Challenge Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{challenge.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">{challenge.title}</h3>
              <p className="text-slate-600 text-sm">{challenge.duration}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}>
              {challenge.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-700 mb-4">{challenge.description}</p>

        {/* Progress Bar */}
        {challenge.isParticipating && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium text-slate-900">{formatProgress(challenge)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-purple-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {isCompleted && (
              <div className="text-green-600 text-sm font-medium mt-1 flex items-center">
                <span className="mr-1">🎉</span> Challenge completed!
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{challenge.participants.toLocaleString()}</span>
              {challenge.maxParticipants && (
                <span>/{challenge.maxParticipants.toLocaleString()}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {challenge.status === 'completed' ? (
              <span className="text-green-600 font-medium text-sm">✅ Completed</span>
            ) : challenge.isParticipating ? (
              <span className="text-purple-600 font-medium text-sm">🎯 Participating</span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinChallenge(challenge.id);
                }}
                className="btn btn-primary text-sm"
              >
                Join Challenge
              </button>
            )}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">🎁</span>
            <span className="text-yellow-800 font-medium text-sm">{challenge.rewards}</span>
          </div>
        </div>
      </div>
    );
  };

  const ChallengeModal = ({ challenge, onClose }) => {
    if (!challenge) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{challenge.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{challenge.title}</h2>
                  <p className="text-slate-600">{challenge.duration} • {challenge.participants.toLocaleString()} participants</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Challenge Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700">{challenge.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Difficulty</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Category</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(challenge.category)}`}>
                    {challenge.category}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Timeline</h4>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span>Start: {new Date(challenge.startDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>End: {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {challenge.isParticipating && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Your Progress</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{formatProgress(challenge)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(challenge.progress, challenge.target)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">🎁 Rewards</h4>
                <p className="text-amber-800">{challenge.rewards}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                {challenge.isParticipating ? (
                  <button className="btn btn-primary flex-1">
                    📊 View Detailed Progress
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleJoinChallenge(challenge.id);
                      onClose();
                    }}
                    className="btn btn-primary flex-1"
                  >
                    🚀 Join Challenge
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🏆 Fitness Challenges</h1>
        <p className="text-slate-600">Join challenges, compete with others, and push your limits!</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          {[
            { key: 'active', label: '🔥 Active', count: challenges.filter(c => c.status === 'active').length },
            { key: 'my', label: '🎯 My Challenges', count: challenges.filter(c => c.isParticipating).length },
            { key: 'completed', label: '✅ Completed', count: challenges.filter(c => c.status === 'completed').length },
            { key: 'all', label: '📋 All', count: challenges.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeFilter === tab.key
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-white text-purple-500'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : challenges.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {activeFilter === 'my' ? 'No Challenges Joined Yet' : 'No Challenges Found'}
          </h3>
          <p className="text-slate-600 mb-4">
            {activeFilter === 'my' 
              ? 'Join some challenges to start your fitness journey with the community!'
              : 'Check back later for new challenges or try a different filter.'
            }
          </p>
          {activeFilter === 'my' && (
            <button 
              onClick={() => setActiveFilter('active')}
              className="btn btn-primary"
            >
              Browse Active Challenges
            </button>
          )}
        </div>
      )}

      {/* Challenge Detail Modal */}
      <ChallengeModal 
        challenge={selectedChallenge} 
        onClose={() => setSelectedChallenge(null)} 
      />
    </div>
  );
}

export default Challenges;