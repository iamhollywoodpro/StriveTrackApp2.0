import React from 'react';

function ProgressMedia() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">📈 Progress & Media</h1>
          <p className="text-slate-600 mb-6">50MB file upload system coming in Phase 4!</p>
          <a href="/dashboard" className="btn btn-primary">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

export default ProgressMedia;