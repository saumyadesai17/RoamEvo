// Modular skeleton component for tour cards on homepage

export const TourCardSkeleton = () => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-52 w-full bg-gray-200 rounded-lg"></div>

      <div className="mt-4 space-y-3">
        {/* Location and rating skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Itinerary dots skeleton */}
        <div className="py-4 relative">
          <div className="relative h-12">
            <div className="absolute inset-0 flex items-center justify-between px-[25px]">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="shrink-0 relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price skeleton */}
        <div className="flex justify-between items-center pt-4">
          <div className="space-y-1">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-gray-200 rounded-md mt-4"></div>
      </div>
    </div>
  );
};
