import { TripVibeCheckProps } from '@/types/tour';

const TripVibeCheck = ({
  adventureLevel = 0,
  spiritualLevel = 0,
  chillLevel = 0,
  natureLevel = 0,
  culturalLevel = 0,
}: TripVibeCheckProps) => {
  const vibes = [
    {
      category: 'Adventure',
      level: adventureLevel,
      icon: '🔥',
      color: 'text-orange-500',
    },
    {
      category: 'Nature',
      level: natureLevel,
      icon: '🌲',
      color: 'text-green-500',
    },
    {
      category: 'Spiritual',
      level: spiritualLevel,
      icon: '🙏',
      color: 'text-yellow-500',
    },
    {
      category: 'Chill',
      level: chillLevel,
      icon: '😎',
      color: 'text-blue-500',
    },
    {
      category: 'Cultural',
      level: culturalLevel,
      icon: '🏛️',
      color: 'text-purple-500',
    },
  ].filter(vibe => vibe.level > 0); // Only show vibes with a level set

  if (vibes.length === 0) {
    return null; // Don't render if no vibes are set
  }

  const renderLevel = (level: number, icon: string, color: string) => {
    return (
      <div className="flex gap-1 2xl:gap-1.5">
        {[...Array(level)].map((_, index) => (
          <span
            key={index}
            className={`text-sm sm:text-base 2xl:text-lg ${color}`}
          >
            {icon}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 sm:mt-6 2xl:mt-8">
      <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl text-[#000000B2] mb-2 sm:mb-3 2xl:mb-4">Trip&apos;s Vibe Check</h3>
      <div className="grid grid-cols-2 gap-y-2 sm:gap-y-3 2xl:gap-y-4 gap-x-2 sm:gap-x-3 2xl:gap-x-4">
        {vibes.map((vibe) => (
          <div key={vibe.category} className="flex flex-col">
            <span className="text-sm sm:text-base lg:text-lg 2xl:text-xl text-[#000000B2] mb-1 2xl:mb-2">{vibe.category}</span>
            {renderLevel(vibe.level, vibe.icon, vibe.color)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripVibeCheck;