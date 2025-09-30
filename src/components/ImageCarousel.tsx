import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageModal } from './ImageModal';

interface ImageCarouselProps {
  images: { url: string; public_id: string }[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ images, alt, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <>
        <div className={`relative ${className} cursor-pointer`} onClick={() => setIsModalOpen(true)}>
          <img
            src={images[0].url}
            alt={alt}
            className="w-full max-h-64 sm:max-h-96 object-cover rounded-md hover:opacity-90 transition-opacity"
          />
        </div>
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={images}
          currentIndex={0}
          onIndexChange={setCurrentIndex}
        />
      </>
    );
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-md cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={images[currentIndex].url}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="w-full max-h-64 sm:max-h-96 object-cover transition-transform duration-300 ease-in-out hover:opacity-90"
          />
        
        {/* Navigation Buttons */}
        <Button
          variant="secondary"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 p-0 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 p-0 shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-3 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-blue-600 w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </>
  );
}
