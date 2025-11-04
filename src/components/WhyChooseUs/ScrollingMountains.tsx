'use client';
import { useEffect, useRef, forwardRef } from 'react';
import Image from 'next/image';

// Forward ref to the underlying img element in next/image
const CustomImage = forwardRef<HTMLImageElement, React.ComponentProps<typeof Image>>(
  (props, ref) => (
    <Image
      {...props}
      ref={ref}
      priority
      alt='Himalaya Mountains'
      draggable={false}
      className={
        "absolute left-0 bottom-0 w-full h-auto object-cover will-change-transform " +
        (props.className || "")
      }
      style={{ 
        minHeight: '100%', 
        maxHeight: 'none', 
        transition: 'none', // Remove transition for smoother scroll-driven animation
        ...(props.style || {}) 
      }}
    />
  )
);
CustomImage.displayName = 'CustomImage';

const ScrollingMountains = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        if (!containerRef.current || !imageRef.current) {
          ticking = false;
          return;
        }

        // Find the parent section (WhyChooseUs)
        const section = containerRef.current.closest('section');
        if (!section) {
          ticking = false;
          return;
        }
        
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate when section is in viewport
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        
        // Section is completely above viewport - keep at final position
        if (sectionBottom <= 0) {
          imageRef.current.style.transform = 'translateY(15%)';
          ticking = false;
          return;
        }

        // Section is completely below viewport - keep at starting position
        if (sectionTop >= windowHeight) {
          imageRef.current.style.transform = 'translateY(70%)';
          ticking = false;
          return;
        }

        // Section is in viewport - calculate smooth progress
        // Progress from 0 (section entering from bottom) to 1 (section leaving from top)
        const viewportRange = windowHeight + rect.height;
        const scrollProgress = (windowHeight - sectionTop) / viewportRange;
        const progress = Math.max(0, Math.min(1, scrollProgress));

        // Smoother easing function for natural movement
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);

        // Move mountains from 70% (starting - more hidden) to 15% (final - more visible)
        const startPosition = 70;
        const endPosition = 15;
        const translateY = startPosition - easedProgress * (startPosition - endPosition);
        imageRef.current.style.transform = `translateY(${translateY}%)`;
        
        ticking = false;
      });
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 bottom-0 w-full overflow-hidden h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
      style={{ zIndex: 2, pointerEvents: 'none', userSelect: 'none' }}
    >
      <CustomImage
        ref={imageRef}
        src="/images/himalaya.png"
        alt="Himalaya Mountains"
        width={1920}
        height={400}
      />
      {/* Gradient overlay for blending with next section */}
      <div
        className="absolute left-0 bottom-0 w-full h-12 sm:h-16 md:h-20"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #fff 100%)',
          zIndex: 3,
        }}
      />
    </div>
  );
};

export default ScrollingMountains;