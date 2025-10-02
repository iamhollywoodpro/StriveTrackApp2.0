import React, { useState, useEffect } from 'react';
import adminService from '../../lib/adminService';

function SystemConfiguration() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSystemConfig();
      if (response.success) {
        setConfig(response.config);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = async (section, key, value) => {
    try {
      const configPath = `${section}.${key}`;
      const response = await adminService.updateSystemConfig(configPath, value);
      
      if (response.success) {
        // Update local state
        setConfig(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [key]: typeof value === 'object' ? { ...prev[section][key], ...value } : value
          }
        }));
        
        setUnsavedChanges(false);
        
        // Show success message briefly
        const successElement = document.getElementById('save-success');
        if (successElement) {
          successElement.classList.remove('hidden');
          setTimeout(() => successElement.classList.add('hidden'), 2000);
        }
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert('Error updating configuration');
    }
  };

  const handleToggleFeature = (key, enabled) => {
    handleConfigChange('features', key, { ...config.features[key], enabled });
  };

  const tabs = [
    { id: 'features', label: '🎯 Features', description: 'Enable/disable platform features' },
    { id: 'limits', label: '⚖️ Limits', description: 'System limits and quotas' },
    { id: 'moderation', label: '🛡️ Moderation', description: 'Content moderation settings' },
    { id: 'notifications', label: '🔔 Notifications', description: 'Notification preferences' },
    { id: 'security', label: '🔒 Security', description: 'Security and access controls' },
    { id: 'analytics', label: '📊 Analytics', description: 'Data and tracking settings' }
  ];

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500
        ${enabled ? 'bg-purple-500' : 'bg-slate-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-7' : 'translate-x-1'}
        `}
      />
    </button>
  );

  const ConfigSection = ({ title, items, section, type = 'toggle' }) => {
    const filteredItems = Object.entries(items).filter(([key, value]) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        key.toLowerCase().includes(searchLower) ||
        (typeof value === 'object' && value.description?.toLowerCase().includes(searchLower))
      );
    });

    if (filteredItems.length === 0) return null;

    return (
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
        <div className="space-y-4">
          {filteredItems.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-slate-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </div>
                {typeof value === 'object' && value.description && (
                  <div className="text-sm text-slate-600 mt-1">{value.description}</div>
                )}
                {typeof value === 'string' && type === 'value' && (
                  <div className="text-sm text-slate-500 mt-1">Current: {value}</div>
                )}
              </div>
              
              <div className="ml-4">
                {type === 'toggle' && typeof value === 'object' ? (
                  <ToggleSwitch
                    enabled={value.enabled}
                    onChange={(enabled) => handleToggleFeature(key, enabled)}
                  />
                ) : type === 'input' ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setUnsavedChanges(true);
                      handleConfigChange(section, key, e.target.value);
                    }}
                    className="form-input text-sm w-32"
                  />
                ) : type === 'number' ? (
                  <input
                    type="number"
                    value={typeof value === 'string' ? parseInt(value) : value}
                    onChange={(e) => {
                      setUnsavedChanges(true);
                      handleConfigChange(section, key, parseInt(e.target.value));
                    }}
                    className="form-input text-sm w-24"
                  />
                ) : type === 'select' ? (
                  <select
                    value={value}
                    onChange={(e) => handleConfigChange(section, key, e.target.value)}
                    className="form-select text-sm"
                  >
                    {key === 'sessionSecurity' && (
                      <>
                        <option value="standard">Standard</option>
                        <option value="high">High</option>
                        <option value="maximum">Maximum</option>
                      </>
                    )}
                    {key === 'retentionPeriod' && (
                      <>
                        <option value="1 year">1 Year</option>
                        <option value="2 years">2 Years</option>
                        <option value="5 years">5 Years</option>
                        <option value="forever">Forever</option>
                      </>
                    )}
                  </select>
                ) : (
                  <ToggleSwitch
                    enabled={value}
                    onChange={(enabled) => handleConfigChange(section, key, enabled)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SystemStatus = () => (
    <div className="card p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
      <h3 className="text-lg font-bold text-green-900 mb-4">🟢 System Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-900">99.9%</div>
          <div className="text-green-700 text-sm">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-900">145ms</div>
          <div className="text-green-700 text-sm">Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-900">1,234</div>
          <div className="text-green-700 text-sm">Active Sessions</div>
        </div>
      </div>
    </div>
  );

  const DangerZone = () => (
    <div className="card p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
      <h3 className="text-lg font-bold text-red-900 mb-4">⚠️ Danger Zone</h3>
      <p className="text-red-700 text-sm mb-6">
        These actions are irreversible and can affect system stability. Use with extreme caution.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-red-900">Reset All User Sessions</div>
            <div className="text-sm text-red-600">Force logout all users immediately</div>
          </div>
          <button className="btn bg-red-600 text-white hover:bg-red-700 text-sm">
            Reset Sessions
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-red-900">Clear All Cache</div>
            <div className="text-sm text-red-600">Clear system cache and temporary data</div>
          </div>
          <button className="btn bg-red-600 text-white hover:bg-red-700 text-sm">
            Clear Cache
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-red-900">Maintenance Mode</div>
            <div className="text-sm text-red-600">Put system in maintenance mode</div>
          </div>
          <button className="btn bg-orange-600 text-white hover:bg-orange-700 text-sm">
            Enable Maintenance
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Configuration Unavailable</h3>
        <p className="text-slate-600">Unable to load system configuration at this time.</p>
        <button onClick={loadConfiguration} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
          <p className="text-slate-600">Manage platform settings, features, and system behavior</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div
            id="save-success"
            className="hidden bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm"
          >
            ✅ Settings saved successfully
          </div>
          
          <button className="btn btn-outline-primary">
            📋 Export Config
          </button>
          
          <button className="btn btn-outline-secondary">
            📂 Import Config
          </button>
        </div>
      </div>

      {/* System Status */}
      <SystemStatus />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search configuration settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input w-full md:w-1/3"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-max px-4 py-3 rounded-lg font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }
              `}
            >
              <div className="text-center">
                <div>{tab.label}</div>
                <div className={`text-xs mt-1 ${
                  activeTab === tab.id ? 'text-purple-100' : 'text-slate-500'
                }`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'features' && (
          <ConfigSection 
            title="Platform Features" 
            items={config.features} 
            section="features" 
            type="toggle" 
          />
        )}

        {activeTab === 'limits' && (
          <ConfigSection 
            title="System Limits & Quotas" 
            items={config.limits} 
            section="limits" 
            type="input" 
          />
        )}

        {activeTab === 'moderation' && (
          <ConfigSection 
            title="Content Moderation" 
            items={config.moderation} 
            section="moderation" 
            type="toggle" 
          />
        )}

        {activeTab === 'notifications' && (
          <ConfigSection 
            title="Notification Settings" 
            items={config.notifications} 
            section="notifications" 
            type="toggle" 
          />
        )}

        {activeTab === 'security' && (
          <>
            <ConfigSection 
              title="Security & Access Control" 
              items={config.security} 
              section="security" 
              type="mixed" 
            />
            <DangerZone />
          </>
        )}

        {activeTab === 'analytics' && (
          <ConfigSection 
            title="Analytics & Data Collection" 
            items={config.analytics} 
            section="analytics" 
            type="mixed" 
          />
        )}
      </div>

      {/* Configuration Backup */}
      <div className="mt-12 card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">💾 Configuration Backup</h3>
        <p className="text-blue-700 text-sm mb-6">
          Regularly backup your configuration to prevent data loss and enable quick recovery.
        </p>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <button className="btn btn-primary">
            📥 Create Backup
          </button>
          <button className="btn btn-outline-primary">
            📤 Restore from Backup
          </button>
          <button className="btn btn-outline-secondary">
            📋 View Backup History
          </button>
          <div className="text-sm text-blue-600 md:ml-auto md:mt-2">
            Last backup: 2 hours ago
          </div>
        </div>
      </div>

      {/* Recent Changes */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Recent Configuration Changes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Social Features Enabled</div>
              <div className="text-sm text-slate-600">By Admin • 2 hours ago</div>
            </div>
            <span className="text-green-600 text-sm">✅ Applied</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Max File Size Updated</div>
              <div className="text-sm text-slate-600">Changed from 25MB to 50MB • By Admin • 1 day ago</div>
            </div>
            <span className="text-green-600 text-sm">✅ Applied</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Auto Moderation Enabled</div>
              <div className="text-sm text-slate-600">By Admin • 3 days ago</div>
            </div>
            <span className="text-green-600 text-sm">✅ Applied</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemConfiguration;