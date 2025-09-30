import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { uploadToR2, validateFile, verifyUpload } from '../../../lib/simpleUpload';
import { useConfetti } from '../../../hooks/useConfetti';

const PhotoUploadModal = ({ isOpen, onClose, onUpload }) => {
  const { user } = useAuth();
  const { triggerConfetti } = useConfetti();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [progressType, setProgressType] = useState('progress');
  const [privacyLevel, setPrivacyLevel] = useState('private');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Updated file size and type limits
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
  ];
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 
    'video/webm', 'video/3gpp', 'video/x-flv', 'video/mov'
  ];
  const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

  // File validation is now handled by the bulletproof upload system

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    
    try {
      if (file) {
        // Use bulletproof validation
        validateFile(file);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
        setUploadProgress(0);
        setUploadStatus('');
      }
    } catch (err) {
      setError(err?.message);
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadProgress(0);
      setUploadStatus('');
      if (event?.target) {
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);
      setUploadStatus('Preparing upload...');

      if (!user?.id) {
        throw new Error('You must be logged in to upload photos');
      }

      // Progress callback for upload status
      const progressCallback = (progress, status) => {
        setUploadProgress(progress);
        setUploadStatus(status || `Uploading... ${Math.round(progress)}%`);
      };

      // Use simple, reliable upload system
      const result = await uploadToR2(selectedFile, supabase, progressCallback);
      
      if (!result?.key) {
        throw new Error('Upload failed - no file key returned');
      }

      // 🎉 Trigger confetti for any achievements earned!
      if (result.achievements && result.achievements.length > 0) {
        console.log('🎉 Achievements earned:', result.achievements);
        result.achievements.forEach(achievement => {
          triggerConfetti(achievement.title, achievement.description, achievement.points);
        });
      }

      setUploadStatus('Verifying upload...');
      
      // Verify the upload was successful
      const isVerified = await verifyUpload(result.key, supabase);
      if (!isVerified) {
        throw new Error('Upload verification failed. Please try again.');
      }

      // Save metadata to backend database (not just localStorage)
      const metadata = {
        progressType: progressType,
        privacy: privacyLevel,
        description: description?.trim() || '',
        uploadedAt: new Date().toISOString(),
        filename: selectedFile?.name,
        mediaType: selectedFile?.type?.startsWith('video/') ? 'video' : 'image',
        contentType: selectedFile?.type,
        uploadMethod: result.uploadMethod,
        verified: true
      };

      // Save to backend
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const API_BASE = (import.meta.env && import.meta.env.VITE_MEDIA_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
        
        await fetch(`${API_BASE}/media/${encodeURIComponent(result.key)}/metadata`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(metadata)
        });
      } catch (metadataError) {
        console.error('Failed to save metadata to backend:', metadataError);
      }

      // Also keep in localStorage as backup
      const mediaMetadata = JSON.parse(localStorage.getItem('strivetrack-media-metadata') || '{}');
      mediaMetadata[result.key] = metadata;
      localStorage.setItem('strivetrack-media-metadata', JSON.stringify(mediaMetadata));

      // Get session token for building the view URL
      const session = await supabase?.auth?.getSession();
      const accessToken = session?.data?.session?.access_token;
      
      // Build the media view URL
      const API_BASE = (import.meta.env && import.meta.env.VITE_MEDIA_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
      const mediaUrl = `${API_BASE}/media/${encodeURIComponent(result.key)}${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''}`;

      // Determine media type based on file type
      const isVideo = selectedFile?.type?.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';

      // Create the photo object for the parent component
      const newPhoto = {
        id: result.key,
        key: result.key,
        imageUrl: mediaUrl,
        type: progressType,
        privacy: privacyLevel,
        notes: description?.trim() || selectedFile?.name,
        date: new Date().toISOString(),
        points: 25,
        filename: selectedFile?.name,
        mediaType,
        contentType: selectedFile?.type,
        uploadMethod: result.uploadMethod,
        verified: true
      };

      setUploadStatus('Upload successful!');
      
      // Notify parent component
      onUpload?.(newPhoto);

      // Reset form and close modal
      setSelectedFile(null);
      setPreviewUrl('');
      setDescription('');
      setProgressType('progress');
      setPrivacyLevel('private');
      setError('');
      setUploadProgress(0);
      setUploadStatus('');
      onClose();

    } catch (error) {
      console.error('Upload error:', error);
      setError(error?.message || 'Failed to upload media. Please try again.');
      setUploadProgress(0);
      setUploadStatus('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Upload Progress Media</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="font-medium">Upload Failed</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}
        
        {uploading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Uploading Media</span>
              <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">{uploadStatus}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image or Video (Max 50MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: JPEG, PNG, WebP, GIF, MP4, MOV, AVI, WebM, 3GP, FLV (up to 50MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Type
            </label>
            <select
              value={progressType}
              onChange={(e) => setProgressType(e?.target?.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={uploading}
            >
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="progress">Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level
            </label>
            <select
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e?.target?.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={uploading}
            >
              <option value="private">Private</option>
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
              <div className="relative">
                {selectedFile?.type?.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md border"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    className="w-full h-48 object-cover rounded-md border"
                    controls
                    muted
                  />
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {selectedFile?.type?.startsWith('video/') ? 'Video' : 'Image'} - {progressType?.charAt(0)?.toUpperCase() + progressType?.slice(1)}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e?.target?.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Add a description for this media..."
              disabled={uploading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;