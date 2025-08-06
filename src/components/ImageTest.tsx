import React from 'react';

interface ImageTestProps {
  images?: { url: string; public_id: string }[];
}

const ImageTest: React.FC<ImageTestProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return <div className="text-red-500">No images found</div>;
  }

  return (
    <div className="border-2 border-red-500 p-4">
      <h3 className="text-red-500 font-bold">Image Test Component</h3>
      <p className="text-sm">Found {images.length} images</p>
      {images.map((image, index) => (
        <div key={image.public_id} className="mt-2">
          <p className="text-xs">Image {index + 1}:</p>
          <p className="text-xs">URL: {image.url}</p>
          <p className="text-xs">Public ID: {image.public_id}</p>
          <img 
            src={image.url} 
            alt={`Test image ${index + 1}`}
            className="w-32 h-32 object-cover border"
            onError={(e) => {
              console.error('Image failed to load:', image.url);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', image.url);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageTest; 