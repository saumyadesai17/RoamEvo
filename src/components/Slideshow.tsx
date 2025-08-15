'use client';

import { useState, useEffect } from 'react';

// This interface will be used for CMS integration later
interface SlideImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  isActive: boolean;
}

interface HeroSlideshowProps {
  onSlideChange?: (title: string) => void;
}

const HeroSlideshow = ({ onSlideChange }: HeroSlideshowProps) => {
  // Structured for CMS - each image has metadata that can be managed from admin
  const backgroundImages: SlideImage[] = [
    {
      id: 'slide-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      alt: 'Scenic mountain landscape with lake reflection',
      title: 'Mountain Adventures',
      isActive: true
    },
    {
      id: 'slide-2', 
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
      alt: 'Tropical beach paradise with crystal clear water',
      title: 'Beach Escapes',
      isActive: true
    },
    {
      id: 'slide-3',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      alt: 'Majestic Himalayan peaks with snow-covered mountains',
      title: 'Himalayan Retreats',
      isActive: true
    },
    {
      id: 'slide-4',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
      alt: 'Dense forest path leading to adventure',
      title: 'Forest Expeditions',
      isActive: true
    },
    {
      id: 'slide-5',
      url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      alt: 'Desert landscape with sand dunes',
      title: 'Desert Safaris',
      isActive: true
    }
  ];

  // Filter only active images (useful for CMS where admin can enable/disable slides)
  const activeImages = backgroundImages.filter(image => image.isActive);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Notify parent component of the current slide title
    if (onSlideChange && activeImages[currentImageIndex]?.title) {
      onSlideChange(activeImages[currentImageIndex].title);
    }
  }, [currentImageIndex, activeImages, onSlideChange]);

  useEffect(() => {
    // Only start slideshow if there are active images
    if (activeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === activeImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds - this can be configurable from CMS

    return () => clearInterval(interval);
  }, [activeImages.length]);

  return (
    <div className="absolute inset-0 z-0">
      {activeImages.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image.url}')`,
          }}
          role="img"
          aria-label={image.alt}
        />
      ))}
      
      {/* Optional: Slide indicators (dots) - can be enabled/disabled from CMS */}
      {activeImages.length > 1 && (
        <div className="absolute bottom-32 md:bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {activeImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white opacity-100' 
                  : 'bg-white opacity-50 hover:opacity-75'
              }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              suppressHydrationWarning={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlideshow;
