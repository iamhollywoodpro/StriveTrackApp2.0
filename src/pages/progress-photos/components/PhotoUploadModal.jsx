import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const PhotoUploadModal = ({ isOpen, onClose, onUpload }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [progressType, setProgressType] = useState('progress');
  const [privacyLevel, setPrivacyLevel] = useState('private');
  const [uploading, setUploading] = useState(false);
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

  const validateFile = (file) => {
    if (!file) {
      throw new Error('Please select a file');
    }

    if (file?.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 50MB');
    }

    if (!ALLOWED_TYPES?.includes(file?.type)) {
      throw new Error('Only image files (JPEG, PNG, WebP, GIF) and video files (MP4, MOV, AVI, WebM, 3GP, FLV) are allowed');
    }

    return true;
  };

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    
    try {
      if (file) {
        validateFile(file);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      }
    } catch (err) {
      setError(err?.message);
      setSelectedFile(null);
      setPreviewUrl('');
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
      validateFile(selectedFile);
      setUploading(true);
      setError('');

      if (!user?.id) {
        throw new Error('You must be logged in to upload photos');
      }

      // Create a unique filename with timestamp
      const timestamp = new Date()?.getTime();
      const fileName = `${user?.id}/${timestamp}-${selectedFile?.name?.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Step 1: Upload file to Cloudflare R2 via Worker proxy
      // Worker expects: Authorization: Bearer <supabase access token>
      const session = await supabase?.auth?.getSession();
      const accessToken = session?.data?.session?.access_token;
      if (!accessToken) throw new Error('Missing auth token');

      const API_BASE = (import.meta.env && import.meta.env.VITE_MEDIA_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';

      const r2UploadResp = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': selectedFile?.type || 'application/octet-stream',
          'x-file-name': selectedFile?.name || 'upload.bin'
        },
        body: selectedFile
      });

      if (!r2UploadResp.ok) {
        const msg = await r2UploadResp.text();
        throw new Error(`Upload failed: ${msg}`);
      }
      const { key } = await r2UploadResp.json();

      // Step 2: Determine media type based on file type
      const isVideo = selectedFile?.type?.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';

      // Step 3: Worker already writes a media row into D1.
      // Build a proxied view URL from Worker (no signed URL needed)
      const API_BASE_2 = (import.meta.env && import.meta.env.VITE_MEDIA_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api';
      const r2ViewUrl = `${API_BASE_2}/media/${encodeURIComponent(key)}`;

      // Step 4: Notify parent with minimal card data; caller will refresh list from /api/media
      const newPhoto = {
        key,
        imageUrl: r2ViewUrl,
        type: progressType,
        privacy: privacyLevel,
        notes: description?.trim() || selectedFile?.name,
        date: new Date().toISOString(),
        points: 25,
        filename: selectedFile?.name,
        mediaType
      };

      onUpload?.(newPhoto);

      // Reset form and close modal
      setSelectedFile(null);
      setPreviewUrl('');
      setDescription('');
      setProgressType('progress');
      setPrivacyLevel('private');
      setError('');
      onClose();

    } catch (error) {
      setError(error?.message || 'Failed to upload media. Please try again.');
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
            {error}
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
              <option value="during">During</option>
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