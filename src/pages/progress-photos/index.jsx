import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { apiGet } from '../../lib/api';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PhotoGallery from './components/PhotoGallery';
import PhotoFilters from './components/PhotoFilters';
import PhotoUploadModal from './components/PhotoUploadModal';
import PhotoComparison from './components/PhotoComparison';
import PhotoViewModal from './components/PhotoViewModal';

const ProgressPhotos = () => {
  const { user } = useAuth();
  
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    privacy: 'all',
    sort: 'newest'
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch photos with enhanced data mapping
  const fetchPhotos = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const res = await apiGet('/media', supabase);
      if (!res || !Array.isArray(res.items)) {
        setError('Failed to load photos. Please refresh the page.');
        setPhotos([]);
        return;
      }
      const data = res.items.map((m) => ({
        id: m.key,
        imageUrl: m.url,
        type: 'progress',
        privacy: 'private',
        notes: m.key.split('/').pop(),
        date: new Date(m.createdAt).toISOString(),
        points: 25,
        filename: m.key.split('/').pop(),
        mediaType: (m.contentType || '').startsWith('video/') ? 'video' : 'image',
        file_size: 0
      }));

      setPhotos(data);
    } catch (error) {
      setError('Failed to load photos. Please refresh the page.');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize photos on component mount
  useEffect(() => {
    if (user?.id) {
      fetchPhotos();
    }
  }, [user?.id]);

  // Filter and sort photos
  useEffect(() => {
    let filtered = [...photos];

    // Filter by type
    if (filters?.type !== 'all') {
      filtered = filtered?.filter(photo => photo?.type === filters?.type);
    }

    // Filter by privacy
    if (filters?.privacy !== 'all') {
      filtered = filtered?.filter(photo => photo?.privacy === filters?.privacy);
    }

    // Sort photos
    filtered?.sort((a, b) => {
      switch (filters?.sort) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'points':
          return b?.points - a?.points;
        case 'type':
          const typeOrder = { before: 0, during: 1, after: 2, progress: 1 };
          return typeOrder?.[a?.type] - typeOrder?.[b?.type];
        case 'newest':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredPhotos(filtered);
  }, [photos, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      privacy: 'all',
      sort: 'newest'
    });
  };

  const handlePhotoSelect = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev?.includes(photoId)) {
        return prev?.filter(id => id !== photoId);
      } else if (prev?.length < 2) {
        return [...prev, photoId];
      } else {
        return [prev?.[1], photoId];
      }
    });
  };

  const handlePhotoUpload = (newPhoto) => {
    // Refresh photos after upload
    fetchPhotos();
  };

  // Added view photo handler
  const handlePhotoView = (photo) => {
    setViewingPhoto(photo);
    setShowViewModal(true);
  };

  // Enhanced photo edit handler
  const handlePhotoEdit = (photo) => {
    // You can implement edit functionality here
    console.log('Edit photo:', photo);
    // For now, we'll just show an alert
    alert('Edit functionality coming soon!');
  };

  // Enhanced photo share handler
  const handlePhotoShare = (photo) => {
    // Implement share functionality
    if (navigator?.share) {
      navigator.share({
        title: `My Progress Photo - ${photo?.type}`,
        text: photo?.notes || 'Check out my progress!',
        url: photo?.imageUrl
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator?.clipboard?.writeText(photo?.imageUrl);
      alert('Photo URL copied to clipboard!');
    }
  };

  const handlePhotoDelete = async (photo) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const session = await supabase?.auth?.getSession();
        const accessToken = session?.data?.session?.access_token;
        const API_BASE = import.meta.env?.VITE_MEDIA_API_BASE;
        const resp = await fetch(`${API_BASE}/media/${encodeURIComponent(photo?.id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!resp.ok) throw new Error('Delete failed');

        // Remove from local state
        setPhotos(prev => prev?.filter(p => p?.id !== photo?.id));
        setSelectedPhotos(prev => prev?.filter(id => id !== photo?.id));
      } catch (error) {
        setError('Failed to delete photo. Please try again.');
      }
    }
  };

  const handleComparePhotos = () => {
    if (selectedPhotos?.length === 2) {
      setShowComparison(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedPhotos([]);
  };

  // Calculate journey days
  const journeyDays = photos?.length > 0 
    ? Math.ceil((new Date() - new Date(Math.min(...photos.map(p => new Date(p.date))))) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Progress Photos</h1>
              <p className="text-muted-foreground">
                Document your transformation journey and track your amazing progress
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {selectedPhotos?.length === 2 && (
                <Button
                  variant="outline"
                  onClick={handleComparePhotos}
                  iconName="ArrowLeftRight"
                  iconPosition="left"
                >
                  Compare
                </Button>
              )}
              
              {selectedPhotos?.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleClearSelection}
                  iconName="X"
                  iconPosition="left"
                >
                  Clear ({selectedPhotos?.length})
                </Button>
              )}
              
              <Button
                onClick={() => setShowUploadModal(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Upload Photo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Camera" size={20} className="text-blue-600" color="blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                  <p className="text-xl font-semibold">{photos?.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-green-600" color="green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress Updates</p>
                  <p className="text-xl font-semibold">
                    {photos?.filter(p => p?.type === 'progress')?.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Star" size={20} className="text-yellow-600" color="yellow" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-xl font-semibold">
                    {photos?.reduce((total, photo) => total + photo?.points, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={20} className="text-purple-600" color="purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Journey Days</p>
                  <p className="text-xl font-semibold">{journeyDays}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <PhotoFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            photoCount={filteredPhotos?.length}
            selectedCount={selectedPhotos?.length}
          />

          {/* Photo Gallery with enhanced handlers */}
          <PhotoGallery
            photos={filteredPhotos}
            selectedPhotos={selectedPhotos}
            onPhotoSelect={handlePhotoSelect}
            onPhotoView={handlePhotoView}
            onPhotoEdit={handlePhotoEdit}
            onPhotoShare={handlePhotoShare}
            onPhotoDelete={handlePhotoDelete}
            loading={loading}
          />
        </div>
      </main>
      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handlePhotoUpload}
      />
      {/* Comparison Modal */}
      {showComparison && (
        <PhotoComparison
          photos={photos}
          selectedPhotos={selectedPhotos}
          onClose={() => setShowComparison(false)}
          onPhotoSelect={() => {
            setShowComparison(false);
            setSelectedPhotos([]);
          }}
        />
      )}
      {/* View Modal */}
      <PhotoViewModal
        photo={viewingPhoto}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingPhoto(null);
        }}
        onEdit={handlePhotoEdit}
        onShare={handlePhotoShare}
        onDelete={handlePhotoDelete}
      />
    </div>
  );
};

export default ProgressPhotos;