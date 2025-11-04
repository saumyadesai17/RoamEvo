'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface TourGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  title?: string;
}

const TourGallery = ({ images, title }: TourGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowFullGallery(true);
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowFullGallery(false);
    // Restore body scroll when overlay is closed
    document.body.style.overflow = 'unset';
  };

  const handleFullGalleryPrevious = () => {
    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
  };

  const handleFullGalleryNext = () => {
    setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
  };

  // Auto-scroll thumbnails to center the selected image
  useEffect(() => {
    if (showFullGallery && thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const selectedThumbnail = container.children[selectedImageIndex] as HTMLElement;
      
      if (selectedThumbnail) {
        const containerWidth = container.clientWidth;
        const thumbnailLeft = selectedThumbnail.offsetLeft;
        const thumbnailWidth = selectedThumbnail.clientWidth;
        const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImageIndex, showFullGallery]);

  // Cleanup effect to restore scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <div className="mb-4 sm:mb-6 lg:mb-8 2xl:mb-12">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-3 xl:gap-4 2xl:gap-6">
          {/* Main large image */}
          <div 
            className="relative rounded-lg 2xl:rounded-xl overflow-hidden h-[350px] xl:h-[400px] 2xl:h-[500px] cursor-pointer group"
            onClick={() => handleImageClick(0)}
          >
            <Image
              src={images[0]?.src || ''}
              alt={images[0]?.alt || 'Main tour image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center justify-center">
              <div className="text-white text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-wider text-center px-4 uppercase">
                {title || 'ROAMEVO'}
              </div>
            </div>
          </div>

          {/* Right side - smaller images */}
          <div className="relative">
            <div className="grid grid-rows-3 gap-3 xl:gap-4 2xl:gap-6 h-[350px] xl:h-[400px] 2xl:h-[500px]">
              {images.slice(1, 4).map((image, index) => (
                <div 
                  key={index + 1} 
                  className="relative rounded-lg 2xl:rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(index + 1)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))}
            </div>

            {/* View all images button */}
            <button
              onClick={() => {
                setSelectedImageIndex(0);
                handleImageClick(0);
              }}
              className="absolute bottom-3 2xl:bottom-4 right-3 2xl:right-4 bg-white/90 hover:bg-white text-gray-800 px-3 2xl:px-4 py-2 2xl:py-3 rounded-lg 2xl:rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 text-sm 2xl:text-base"
            >
              <PhotoIcon className="w-4 h-4 2xl:w-5 2xl:h-5" />
              View All ({images.length})
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Main image for mobile */}
          <div 
            className="relative rounded-lg overflow-hidden h-48 sm:h-64 md:h-80 cursor-pointer"
            onClick={() => handleImageClick(0)}
          >
            <Image
              src={images[0]?.src || ''}
              alt={images[0]?.alt || 'Main tour image'}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center justify-center">
              <div className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-center px-4 uppercase">
                {title || 'ROAMEVO'}
              </div>
            </div>
          </div>

          {/* Limited images grid for mobile - no scrolling */}
          <div className="mt-3">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {images.slice(1, 5).map((image, index) => {
                const actualIndex = index + 1;
                const isLastVisibleImage = index === 3; // Last of the 4 visible images
                const hasMoreImages = images.length > 5; // More than 5 total images (1 main + 4 small)
                
                return (
                  <div 
                    key={actualIndex} 
                    className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleImageClick(actualIndex)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                    {/* Show +X photos overlay on the last visible image if there are more images */}
                    {isLastVisibleImage && hasMoreImages && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-white text-xs sm:text-sm font-semibold text-center">
                          +{images.length - 5}
                          <br />
                          photos
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full Gallery Overlay */}
      {showFullGallery && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200 z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full z-10">
              {selectedImageIndex + 1} of {images.length}
            </div>

            {/* Main image */}
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
              <Image
                src={images[selectedImageIndex]?.src || ''}
                alt={images[selectedImageIndex]?.alt || ''}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation arrows */}
            <button
              onClick={handleFullGalleryPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleFullGalleryNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Thumbnail navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4">
              <div 
                ref={thumbnailContainerRef}
                className="flex gap-3 overflow-x-auto py-2 scrollbar-hide px-4"
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-18 h-18 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === selectedImageIndex 
                        ? 'border-white shadow-lg scale-105' 
                        : 'border-white/30 hover:border-white/70 hover:scale-105'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourGallery;