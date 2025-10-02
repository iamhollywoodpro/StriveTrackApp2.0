// Cloudflare R2 Media Service for StriveTrack 2.1
// Handles 50MB+ file uploads, optimization, and storage management

import { api } from './api';

const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
  'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif'
];

const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'video/ogg', 'video/3gpp', 'video/x-ms-wmv', 'video/x-flv'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const THUMBNAIL_MAX_SIZE = 800; // pixels
const PREVIEW_MAX_SIZE = 1200; // pixels

class MediaService {
  constructor() {
    this.uploadProgress = {};
    this.compressionWorker = null;
  }

  // File validation
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum limit of ${this.formatFileSize(MAX_FILE_SIZE)}`);
    }

    // Type validation
    const isImage = SUPPORTED_IMAGE_FORMATS.includes(file.type);
    const isVideo = SUPPORTED_VIDEO_FORMATS.includes(file.type);
    
    if (!isImage && !isVideo) {
      errors.push(`File type "${file.type}" is not supported. Please use images (JPG, PNG, WebP, etc.) or videos (MP4, AVI, MOV, etc.)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileType: isImage ? 'image' : isVideo ? 'video' : 'unknown',
      isImage,
      isVideo
    };
  }

  // Generate thumbnails and previews
  async processImageFile(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate dimensions for thumbnail and preview
          const thumbnailDimensions = this.calculateDimensions(img.width, img.height, THUMBNAIL_MAX_SIZE);
          const previewDimensions = this.calculateDimensions(img.width, img.height, PREVIEW_MAX_SIZE);
          
          // Generate thumbnail
          canvas.width = thumbnailDimensions.width;
          canvas.height = thumbnailDimensions.height;
          ctx.drawImage(img, 0, 0, thumbnailDimensions.width, thumbnailDimensions.height);
          
          canvas.toBlob((thumbnailBlob) => {
            // Generate preview
            canvas.width = previewDimensions.width;
            canvas.height = previewDimensions.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, previewDimensions.width, previewDimensions.height);
            
            canvas.toBlob((previewBlob) => {
              resolve({
                original: file,
                thumbnail: thumbnailBlob,
                preview: previewBlob,
                metadata: {
                  originalDimensions: { width: img.width, height: img.height },
                  thumbnailDimensions,
                  previewDimensions,
                  aspectRatio: img.width / img.height
                }
              });
            }, 'image/jpeg', 0.8);
          }, 'image/jpeg', 0.6);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate video thumbnail
  async processVideoFile(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Seek to 25% of video duration for thumbnail
        video.currentTime = video.duration * 0.25;
      };
      
      video.onseeked = () => {
        try {
          const dimensions = this.calculateDimensions(video.videoWidth, video.videoHeight, THUMBNAIL_MAX_SIZE);
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          
          ctx.drawImage(video, 0, 0, dimensions.width, dimensions.height);
          
          canvas.toBlob((thumbnailBlob) => {
            resolve({
              original: file,
              thumbnail: thumbnailBlob,
              preview: thumbnailBlob, // Use same thumbnail as preview for videos
              metadata: {
                originalDimensions: { width: video.videoWidth, height: video.videoHeight },
                thumbnailDimensions: dimensions,
                previewDimensions: dimensions,
                duration: video.duration,
                aspectRatio: video.videoWidth / video.videoHeight
              }
            });
          }, 'image/jpeg', 0.7);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
      video.load();
    });
  }

  // Calculate proportional dimensions
  calculateDimensions(originalWidth, originalHeight, maxSize) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: Math.min(originalWidth, maxSize),
        height: Math.min(originalWidth, maxSize) / aspectRatio
      };
    } else {
      return {
        width: Math.min(originalHeight, maxSize) * aspectRatio,
        height: Math.min(originalHeight, maxSize)
      };
    }
  }

  // Upload media to Cloudflare R2
  async uploadMedia(file, metadata = {}) {
    const uploadId = Date.now() + Math.random();
    
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Initialize progress tracking
      this.uploadProgress[uploadId] = {
        status: 'processing',
        progress: 0,
        stage: 'Processing file...'
      };

      // Process file based on type
      let processedFile;
      if (validation.isImage) {
        this.uploadProgress[uploadId].stage = 'Generating thumbnails...';
        processedFile = await this.processImageFile(file);
      } else if (validation.isVideo) {
        this.uploadProgress[uploadId].stage = 'Extracting video thumbnail...';
        processedFile = await this.processVideoFile(file);
      }

      this.uploadProgress[uploadId].progress = 25;

      // Prepare upload data
      const uploadData = {
        type: metadata.type || 'progress_photo',
        description: metadata.description || '',
        category: metadata.category || 'fitness',
        tags: metadata.tags || [],
        visibility: metadata.visibility || 'private',
        fileType: validation.fileType,
        originalName: file.name,
        fileSize: file.size,
        metadata: {
          ...processedFile.metadata,
          uploadedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      this.uploadProgress[uploadId].stage = 'Uploading to Cloudflare R2...';
      this.uploadProgress[uploadId].progress = 50;

      // Create FormData for upload
      const formData = new FormData();
      formData.append('original', processedFile.original);
      formData.append('thumbnail', processedFile.thumbnail);
      formData.append('preview', processedFile.preview);
      formData.append('metadata', JSON.stringify(uploadData));

      // Upload to Cloudflare via API
      const response = await this.uploadWithProgress(formData, uploadId);
      
      this.uploadProgress[uploadId] = {
        status: 'completed',
        progress: 100,
        stage: 'Upload complete!',
        result: response
      };

      return {
        success: true,
        uploadId,
        media: response,
        metadata: uploadData
      };

    } catch (error) {
      this.uploadProgress[uploadId] = {
        status: 'error',
        progress: 0,
        stage: `Upload failed: ${error.message}`,
        error: error.message
      };

      throw error;
    }
  }

  // Upload with progress tracking
  async uploadWithProgress(formData, uploadId) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = 50 + (event.loaded / event.total) * 45; // 50-95%
          this.uploadProgress[uploadId].progress = Math.round(progress);
        }
      });
      
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      xhr.open('POST', `${api.API_BASE || 'https://strivetrack-api.iamhollywoodpro.workers.dev/api'}/media/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }

  // Get upload progress
  getUploadProgress(uploadId) {
    return this.uploadProgress[uploadId] || null;
  }

  // Clear upload progress
  clearUploadProgress(uploadId) {
    delete this.uploadProgress[uploadId];
  }

  // Get user's media gallery
  async getMediaGallery(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      params.append('limit', filters.limit || 50);
      params.append('offset', filters.offset || 0);
      
      return await api.request(`/media?${params}`);
    } catch (error) {
      console.error('Failed to fetch media gallery:', error);
      throw error;
    }
  }

  // Delete media
  async deleteMedia(mediaId) {
    try {
      return await api.request(`/media/${mediaId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  }

  // Update media metadata
  async updateMediaMetadata(mediaId, updates) {
    try {
      return await api.request(`/media/${mediaId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update media metadata:', error);
      throw error;
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate media URL for display
  getMediaUrl(media, size = 'preview') {
    if (!media) return null;
    
    const baseUrl = 'https://strivetrack-media.iamhollywoodpro.workers.dev'; // Your R2 domain
    
    switch (size) {
      case 'thumbnail':
        return `${baseUrl}/${media.thumbnail_path}`;
      case 'preview':
        return `${baseUrl}/${media.preview_path}`;
      case 'original':
        return `${baseUrl}/${media.original_path}`;
      default:
        return `${baseUrl}/${media.preview_path}`;
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;