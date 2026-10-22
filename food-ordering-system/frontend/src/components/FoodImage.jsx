import { useEffect, useState } from 'react';

// Simple grey picture shown when the image URL is empty or does not load
const fallbackImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#eeeeee"/><text x="50%" y="50%" fill="#888888" font-family="Arial" font-size="20" text-anchor="middle">No image</text></svg>'
  );

function FoodImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      className={className}
      src={failed || !src ? fallbackImage : src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}

export default FoodImage;
