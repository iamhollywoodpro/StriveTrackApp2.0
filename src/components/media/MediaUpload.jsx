import React, { useState, useRef, useCallback } from 'react';
import { mediaService } from '../../lib/mediaService';

function MediaUpload({ onUploadComplete, onUploadError, className = '' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);

  // Media type options
  const mediaTypes = [
    { value: 'progress_photo', label: 'Progress Photo', icon: '📸' },
    { value: 'workout_video', label: 'Workout Video', icon: '🎥' },
    { value: 'before_after', label: 'Before/After', icon: '📊' },
    { value: 'meal_photo', label: 'Meal Photo', icon: '🍽️' },
    { value: 'achievement', label: 'Achievement', icon: '🏆' }
  ];

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'progress', label: 'Progress' },
    { value: 'lifestyle', label: 'Lifestyle' }
  ];

  // Form state
  const [uploadForm, setUploadForm] = useState({
    type: 'progress_photo',
    category: 'fitness',
    description: '',
    tags: '',
    visibility: 'private'
  });

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // File selection handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Process selected files
  const handleFiles = (files) => {
    if (files.length === 0) return;

    // Validate and preview files
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const validation = mediaService.validateFile(file);
      if (validation.isValid) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          preview: URL.createObjectURL(file),
          type: validation.fileType,
          size: file.size,
          name: file.name
        });
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const results = [];
    const errors = [];

    try {
      for (const fileData of selectedFiles) {
        try {
          // Prepare metadata
          const metadata = {
            ...uploadForm,
            tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            originalName: fileData.name,
            fileSize: fileData.size
          };

          // Start upload
          const uploadId = Date.now() + Math.random();
          
          // Track progress
          const trackProgress = () => {
            const progress = mediaService.getUploadProgress(uploadId);
            if (progress) {
              setUploadProgress(prev => ({
                ...prev,
                [fileData.id]: progress
              }));
              
              if (progress.status === 'completed' || progress.status === 'error') {
                clearInterval(progressInterval.current);
              }
            }
          };
          
          progressInterval.current = setInterval(trackProgress, 100);

          // Upload file
          const result = await mediaService.uploadMedia(fileData.file, metadata);
          results.push(result);
          
          // Clean up
          URL.revokeObjectURL(fileData.preview);
          mediaService.clearUploadProgress(uploadId);
          
        } catch (error) {
          errors.push(`${fileData.name}: ${error.message}`);
        }
      }

      // Handle results
      if (results.length > 0) {
        onUploadComplete?.(results);
        setSelectedFiles([]);
        setUploadForm({
          type: 'progress_photo',
          category: 'fitness',
          description: '',
          tags: '',
          visibility: 'private'
        });
      }

      if (errors.length > 0) {
        onUploadError?.(errors.join('\n'));
      }

    } finally {
      setUploading(false);
      setUploadProgress({});
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : selectedFiles.length > 0
            ? 'border-green-300 bg-green-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">
            {isDragOver ? '📤' : selectedFiles.length > 0 ? '✅' : '📱'}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isDragOver 
                ? 'Drop files here!' 
                : selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected`
                : 'Upload Progress Photos & Videos'
              }
            </h3>
            <p className="text-slate-600 mb-4">
              Drag and drop files here, or click to browse<br/>
              <span className="text-sm text-slate-500">
                Supports images and videos up to 50MB • JPG, PNG, MP4, MOV, and more
              </span>
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary disabled:opacity-50"
          >
            📁 Choose Files
          </button>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Selected Files:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFiles.map(fileData => (
              <div key={fileData.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  {fileData.type === 'image' ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={fileData.preview}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  
                  {/* Upload Progress Overlay */}
                  {uploading && uploadProgress[fileData.id] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-2xl mb-2">⏳</div>
                        <div className="text-sm font-medium">
                          {uploadProgress[fileData.id].progress}%
                        </div>
                        <div className="text-xs">
                          {uploadProgress[fileData.id].stage}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeFile(fileData.id)}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  ×
                </button>
                
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-slate-700 truncate">{fileData.name}</p>
                  <p className="text-xs text-slate-500">{mediaService.formatFileSize(fileData.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Settings */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-4">Upload Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                className="input w-full"
                disabled={uploading}
              >
                {mediaTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                className="input w-full"
                disabled={uploading}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your progress, workout, or achievement..."
              className="input w-full h-20 resize-none"
              disabled={uploading}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
            <input
              type="text"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="workout, progress, transformation (comma separated)"
              className="input w-full"
              disabled={uploading}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Visibility</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={uploadForm.visibility === 'private'}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, visibility: e.target.value }))}
                  className="mr-2"
                  disabled={uploading}
                />
                <span className="text-sm">🔒 Private (only you)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="friends"
                  checked={uploadForm.visibility === 'friends'}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, visibility: e.target.value }))}
                  className="mr-2"
                  disabled={uploading}
                />
                <span className="text-sm">👥 Friends</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={uploadForm.visibility === 'public'}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, visibility: e.target.value }))}
                  className="mr-2"
                  disabled={uploading}
                />
                <span className="text-sm">🌍 Public</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setSelectedFiles([])}
            disabled={uploading}
            className="btn btn-secondary disabled:opacity-50"
          >
            Clear All
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>🚀 Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default MediaUpload;