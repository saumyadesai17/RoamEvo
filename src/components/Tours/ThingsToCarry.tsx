import { ThingsToCarryProps } from '@/types/tour';

const ThingsToCarry = ({ items }: ThingsToCarryProps) => {
  if (!items || items.length === 0) {
    return null; // Don't render if no items
  }

  return (
    <div className="mt-4 sm:mt-6 2xl:mt-8">
      <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl text-[#000000B2] mb-2 sm:mb-3 2xl:mb-4">Things to Carry</h3>
      <div className="space-y-1.5 2xl:space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="text-gray-400 mr-2 2xl:mr-3">•</span>
            <span className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThingsToCarry;
