import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreatePostModal = ({ isOpen, onClose, onCreatePost }) => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'progress',
    tags: [],
    media: []
  });
  const [newTag, setNewTag] = useState('');

  const postTypes = [
    { value: 'progress', label: 'Progress Update' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'workout', label: 'Workout' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'motivation', label: 'Motivation' }
  ];

  const popularTags = [
    'transformation', 'fitness', 'motivation', 'strength', 'cardio',
    'nutrition', 'health', 'goals', 'workout', 'progress'
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (formData?.content?.trim()) {
      onCreatePost?.(formData);
      setFormData({
        content: '',
        type: 'progress',
        tags: [],
        media: []
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag) => {
    if (tag && !formData?.tags?.includes(tag) && formData?.tags?.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev?.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e?.target?.files);
    // Mock file handling - in real app, you'd upload to storage
    const newMedia = files?.map(file => ({
      type: file?.type?.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file?.name
    }));
    
    setFormData(prev => ({
      ...prev,
      media: [...prev?.media, ...newMedia]
    }));
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev?.media?.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" onClick={onClose}></div>

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Create Post</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Post Type
              </label>
              <Select
                value={formData?.type}
                onChange={(e) => handleInputChange('type', e?.target?.value)}
                options={postTypes}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What's on your mind?
              </label>
              <textarea
                value={formData?.content}
                onChange={(e) => handleInputChange('content', e?.target?.value)}
                placeholder="Share your progress, achievement, or motivate others..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none resize-none"
                rows="4"
                required
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Add Media
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Icon name="Upload" size={32} className="text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload photos or videos
                  </span>
                </label>
              </div>

              {/* Preview uploaded media */}
              {formData?.media?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {formData?.media?.map((item, index) => (
                    <div key={index} className="relative">
                      {item?.type === 'image' ? (
                        <img
                          src={item?.url}
                          alt="Upload preview"
                          className="w-full h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                          <Icon name="Video" size={24} className="text-muted-foreground" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (max 5)
              </label>
              
              {/* Add custom tag */}
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e?.target?.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), addTag(newTag))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(newTag)}
                  disabled={!newTag || formData?.tags?.length >= 5}
                >
                  <Icon name="Plus" size={16} />
                </Button>
              </div>

              {/* Popular tags */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-1">
                  {popularTags?.slice(0, 8)?.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={formData?.tags?.includes(tag) || formData?.tags?.length >= 5}
                      className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected tags */}
              {formData?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary/80"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Users" size={16} />
                <span>Visible to friends</span>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!formData?.content?.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;