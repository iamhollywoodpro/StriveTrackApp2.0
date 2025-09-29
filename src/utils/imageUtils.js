// Image utility functions for StriveTrack nutrition tracker

// High-quality fallback food images by category
export const FALLBACK_FOOD_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', 
  dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  snacks: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  
  // Specific food type fallbacks
  meat: 'https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?w=400&q=80',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  fruits: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80',
  dairy: 'https://images.unsplash.com/photo-1571212515416-621c8dbc1318?w=400&q=80',
  grains: 'https://images.unsplash.com/photo-1574843007114-f6eb3a2a2de8?w=400&q=80',
  seafood: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  beverages: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80'
};

// Get appropriate fallback image for food
export const getFoodImage = (food) => {
  // Return existing image if available
  if (food?.image && food.image.trim()) {
    return food.image;
  }
  
  // Get fallback based on category
  return FALLBACK_FOOD_IMAGES[food?.category] || FALLBACK_FOOD_IMAGES.default;
};

// Get addon category fallback image
export const getAddonImage = (addon) => {
  // Return existing image if available
  if (addon?.image && addon.image.trim()) {
    return addon.image;
  }
  
  // Fallback based on addon category
  const categoryImages = {
    cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80',
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
    meat: 'https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?w=200&q=80',
    sauce: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80',
    bread: 'https://images.unsplash.com/photo-1574843007114-f6eb3a2a2de8?w=200&q=80',
    nuts: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
    fruit: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&q=80',
    dairy: 'https://images.unsplash.com/photo-1571212515416-621c8dbc1318?w=200&q=80',
    sweetener: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&q=80'
  };
  
  return categoryImages[addon?.category] || FALLBACK_FOOD_IMAGES.default;
};

// Enhanced image loading with retry and fallback
export const createImageLoader = (primarySrc, fallbackSrc, onLoad, onError) => {
  const img = new Image();
  let hasLoaded = false;
  
  img.onload = () => {
    if (!hasLoaded) {
      hasLoaded = true;
      onLoad?.(primarySrc);
    }
  };
  
  img.onerror = () => {
    if (!hasLoaded && fallbackSrc) {
      hasLoaded = true;
      onLoad?.(fallbackSrc);
    } else {
      onError?.();
    }
  };
  
  img.src = primarySrc;
  
  // Timeout fallback
  setTimeout(() => {
    if (!hasLoaded && fallbackSrc) {
      hasLoaded = true;
      onLoad?.(fallbackSrc);
    }
  }, 3000);
  
  return img;
};

export default {
  getFoodImage,
  getAddonImage,
  createImageLoader,
  FALLBACK_FOOD_IMAGES
};