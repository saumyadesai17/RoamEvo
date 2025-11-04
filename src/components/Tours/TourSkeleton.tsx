// Modular skeleton components for tour pages

export const TourHeaderSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 sm:h-10 lg:h-12 2xl:h-14 bg-gray-200 rounded w-3/4 mb-4"></div>
    </div>
  );
};

export const TourGallerySkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] 2xl:h-[600px] bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 2xl:gap-4 mt-3 sm:mt-4 2xl:mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 sm:h-20 lg:h-24 2xl:h-28 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export const TourContentSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Overview Section */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Itinerary Section */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TourPricingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-2 sm:space-y-3 2xl:space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-10 sm:h-12 bg-gray-200 rounded w-3/4"></div>
      <div className="h-10 sm:h-11 bg-gray-200 rounded-full w-full"></div>
      <div className="h-10 sm:h-11 bg-gray-200 rounded-full w-full"></div>
    </div>
  );
};

export const TourDatesSkeleton = () => {
  return (
    <div className="animate-pulse mt-4 sm:mt-6 2xl:mt-8">
      <div className="h-6 sm:h-7 2xl:h-8 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3 2xl:mb-4"></div>
      <div className="space-y-2 sm:space-y-2.5 2xl:space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 sm:p-3.5 2xl:p-4 bg-gray-100 rounded-lg space-y-2">
            <div className="h-4 sm:h-5 2xl:h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 sm:h-4 2xl:h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TripVibeCheckSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-2 bg-gray-200 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ThingsToCarrySkeleton = () => {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};
