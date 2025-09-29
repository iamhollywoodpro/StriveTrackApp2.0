import React, { useState } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  fallback = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = (e) => {
    if (!hasErrored && fallback && imgSrc !== fallback) {
      setHasErrored(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc || fallback}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

export default Image;
