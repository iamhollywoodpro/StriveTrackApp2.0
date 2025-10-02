import React, { useState, useEffect } from 'react';

function AutomatedModeration() {
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [aiSettings, setAiSettings] = useState({
    profanityFilter: { enabled: true, sensitivity: 'medium' },
    spamDetection: { enabled: true, sensitivity: 'high' },
    toxicityDetection: { enabled: true, threshold: 0.7 },
    imageModeration: { enabled: true, adultContent: true, violence: true },
    autoApproval: { enabled: false, scoreThreshold: 0.95 }
  });

  useEffect(() => {
    loadModerationQueue();
  }, []);

  const loadModerationQueue = () => {
    setLoading(true);
    
    // Generate sample moderation queue
    const sampleQueue = [
      {
        id: 'mod_1',
        type: 'post',
        content: 'Check out my amazing transformation! Lost 30 pounds in 3 months 💪',
        author: 'fitnessjourney23',
        flaggedFor: ['suspicious_claim'],
        aiConfidence: 0.65,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'pending',
        autoFlags: ['health_claim_unverified']
      },
      {
        id: 'mod_2',
        type: 'comment',
        content: 'This workout routine is terrible and dangerous!!!',
        author: 'critic_user',
        flaggedFor: ['toxicity', 'negative_sentiment'],
        aiConfidence: 0.82,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'pending',
        autoFlags: ['high_toxicity', 'aggressive_language']
      },
      {
        id: 'mod_3',
        type: 'image',
        content: '[Image: Before/After comparison photo]',
        author: 'transformation_king',
        flaggedFor: ['potentially_inappropriate'],
        aiConfidence: 0.45,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'pending',
        autoFlags: ['body_image_sensitive']
      },
      {
        id: 'mod_4',
        type: 'post',
        content: 'Buy my supplements! 50% off today only! DM me now!!! 💊💰',
        author: 'supplement_seller',
        flaggedFor: ['spam', 'commercial'],
        aiConfidence: 0.91,
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: 'pending',
        autoFlags: ['spam_detected', 'commercial_content', 'excessive_punctuation']
      },
      {
        id: 'mod_5',
        type: 'comment',
        content: 'Great progress! Keep up the good work 👏',
        author: 'supportive_user',
        flaggedFor: ['false_positive'],
        aiConfidence: 0.15,
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: 'approved',
        autoFlags: ['reviewed_clean']
      }
    ];

    setTimeout(() => {
      setModerationQueue(sampleQueue);
      setLoading(false);
    }, 500);
  };

  const handleModerationAction = (itemId, action) => {
    setModerationQueue(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: action, moderatedAt: new Date().toISOString() }
          : item
      )
    );
    
    // Show success message
    alert(`Content ${action} successfully`);
  };

  const handleBulkAction = (action) => {
    const pendingItems = moderationQueue.filter(item => item.status === 'pending');
    setModerationQueue(prev => 
      prev.map(item => 
        item.status === 'pending' 
          ? { ...item, status: action, moderatedAt: new Date().toISOString() }
          : item
      )
    );
    
    alert(`${pendingItems.length} items ${action} successfully`);
  };

  const updateAiSetting = (category, setting, value) => {
    setAiSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [setting]: value }
    }));
    
    // In production, this would save to backend
    console.log('AI setting updated:', category, setting, value);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-red-600 bg-red-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const ModerationItem = ({ item }) => (
    <div className="card p-6 mb-4 border-l-4 border-purple-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-lg">
              {item.type === 'post' && '📝'}
              {item.type === 'comment' && '💬'}
              {item.type === 'image' && '📸'}
            </span>
            <div>
              <h4 className="font-medium text-slate-900">Content by @{item.author}</h4>
              <p className="text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status.toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <p className="text-slate-800">{item.content}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium text-slate-900 mb-2">AI Analysis</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Confidence Score</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.aiConfidence)}`}>
                    {Math.round(item.aiConfidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.aiConfidence >= 0.8 ? 'bg-red-500' : 
                      item.aiConfidence >= 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.aiConfidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-slate-900 mb-2">Flagged For</h5>
              <div className="flex flex-wrap gap-1">
                {item.flaggedFor.map((flag, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {flag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium text-slate-900 mb-2">Auto-Detection Flags</h5>
            <div className="flex flex-wrap gap-1">
              {item.autoFlags.map((flag, index) => (
                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {item.status === 'pending' && (
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => handleModerationAction(item.id, 'approved')}
              className="btn btn-success text-sm"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleModerationAction(item.id, 'rejected')}
              className="btn btn-danger text-sm"
            >
              ❌ Reject
            </button>
            <button className="btn btn-outline-secondary text-sm">
              🔍 Details
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const AISettingsPanel = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🤖 AI Moderation Settings</h3>
        
        <div className="space-y-6">
          {Object.entries(aiSettings).map(([category, settings]) => (
            <div key={category} className="border-b border-slate-200 pb-4 last:border-b-0">
              <h4 className="font-medium text-slate-900 mb-3 capitalize">
                {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </h4>
              
              <div className="space-y-3">
                {Object.entries(settings).map(([setting, value]) => (
                  <div key={setting} className="flex items-center justify-between">
                    <span className="text-slate-700 capitalize">
                      {setting.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    
                    {typeof value === 'boolean' ? (
                      <button
                        onClick={() => updateAiSetting(category, setting, !value)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : typeof value === 'string' ? (
                      <select
                        value={value}
                        onChange={(e) => updateAiSetting(category, setting, e.target.value)}
                        className="form-select text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={value}
                        onChange={(e) => updateAiSetting(category, setting, parseFloat(e.target.value))}
                        className="form-input text-sm w-20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">📊 AI Performance Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">94.2%</div>
            <div className="text-sm text-blue-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">2.1%</div>
            <div className="text-sm text-blue-600">False Positives</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">1,247</div>
            <div className="text-sm text-blue-600">Items Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">89ms</div>
            <div className="text-sm text-blue-600">Avg Processing Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Automated Moderation</h2>
          <p className="text-slate-600">AI-powered content moderation with manual oversight</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="btn btn-outline-primary">
            📊 View Reports
          </button>
          <button className="btn btn-primary">
            ⚡ Retrain AI Model
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-red-900">
                {moderationQueue.filter(item => item.status === 'pending').length}
              </p>
            </div>
            <span className="text-red-500 text-2xl">⏳</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Auto Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {moderationQueue.filter(item => item.status === 'approved').length}
              </p>
            </div>
            <span className="text-green-500 text-2xl">✅</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-orange-900">
                {moderationQueue.filter(item => item.status === 'rejected').length}
              </p>
            </div>
            <span className="text-orange-500 text-2xl">❌</span>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">AI Confidence</p>
              <p className="text-2xl font-bold text-blue-900">94%</p>
            </div>
            <span className="text-blue-500 text-2xl">🤖</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'queue' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            📋 Moderation Queue
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            ⚙️ AI Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && (
        <div>
          {/* Bulk Actions */}
          {moderationQueue.filter(item => item.status === 'pending').length > 0 && (
            <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {moderationQueue.filter(item => item.status === 'pending').length} items pending review
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBulkAction('approved')}
                    className="btn btn-success text-sm"
                  >
                    ✅ Approve All
                  </button>
                  <button
                    onClick={() => handleBulkAction('rejected')}
                    className="btn btn-danger text-sm"
                  >
                    ❌ Reject All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Moderation Queue */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-20 bg-slate-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : moderationQueue.length > 0 ? (
            <div>
              {moderationQueue.map(item => (
                <ModerationItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">All Clear!</h3>
              <p className="text-slate-600">No items in the moderation queue right now.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && <AISettingsPanel />}

      {/* Training Data Notice */}
      <div className="mt-8 card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-4">🧠 AI Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-purple-900 mb-2">Current Model</h4>
            <p className="text-purple-700">ContentModerator v2.1 - Last updated 3 days ago</p>
            <p className="text-purple-600">Trained on 2.3M fitness community posts and comments</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-2">Next Training</h4>
            <p className="text-purple-700">Scheduled for next week with 50K new samples</p>
            <p className="text-purple-600">Expected accuracy improvement: 2-3%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutomatedModeration;