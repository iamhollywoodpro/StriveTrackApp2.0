import React, { useState } from 'react';
import MediaUpload from '../../components/media/MediaUpload';
import MediaGallery from '../../components/media/MediaGallery';
import BeforeAfterComparison from '../../components/media/BeforeAfterComparison';

function ProgressMedia() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">📈 Progress & Media</h1>
              <p className="text-slate-600">Upload photos, videos, and track your fitness journey</p>
            </div>
            <a href="/dashboard" className="btn btn-secondary">← Back to Dashboard</a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'upload' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              📤 Upload Media
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'gallery' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              🖼️ Media Gallery
            </button>
            <button 
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'comparison' 
                  ? 'bg-purple-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              📊 Before/After
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'upload' && (
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Your Progress</h2>
                <p className="text-slate-600 mb-4">
                  Share photos and videos of your fitness journey. Supports files up to 50MB.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-purple-700">
                    <span className="text-sm">✨ Supported formats:</span>
                    <span className="text-sm font-medium">JPG, PNG, GIF, MP4, MOV, WebM</span>
                  </div>
                </div>
              </div>
              <MediaUpload />
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Media Gallery</h2>
                <p className="text-slate-600">
                  Browse, search, and organize all your uploaded content.
                </p>
              </div>
              <MediaGallery />
            </div>
          )}

          {activeTab === 'comparison' && (
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Progress Comparison</h2>
                <p className="text-slate-600">
                  Compare your before and after photos to visualize your transformation journey.
                </p>
              </div>
              <BeforeAfterComparison />
            </div>
          )}
        </div>

        {/* Success Tips */}
        <div className="card p-6 mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-3">📝 Tips for Better Progress Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Take photos in consistent lighting</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Use the same angles and poses</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Add detailed descriptions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Tag photos with workout types</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Upload regularly for best results</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800 text-sm">Use before/after comparisons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressMedia;