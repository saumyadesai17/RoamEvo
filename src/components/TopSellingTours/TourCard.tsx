import Image from 'next/image';
import { IoLocationSharp } from 'react-icons/io5';

interface TourCardProps {
  destination: string;
  rating: number;
  reviews: string;
  title: string;
  imageSrc: string;
  price: string;
  itinerary: { city: string }[];
}

const TourCardComponent = ({ destination, rating, reviews, title, imageSrc, price, itinerary }: TourCardProps) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      {/* Tour Image */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg">
        <Image 
          src={imageSrc} 
          alt={`${title} - ${destination} tour package featuring ${itinerary.map(stop => stop.city).join(', ')} destinations`}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-lg"
        />
      </div>
      
      <div className="mt-4 space-y-3">
        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#1d2952] rounded-full p-1.5 mr-2">
              <IoLocationSharp className="text-white text-sm" />
            </div>
            <span className="font-medium text-[#1d2952]">{destination}</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="text-[#1d2952] font-medium">{rating}</span>
            <span className="text-gray-500 text-sm ml-1">({reviews})</span>
          </div>
        </div>
        
        {/* Tour Title */}
        <h3 className="text-xl text-[#1d2952] font-medium">{title}</h3>
        
        {/* Itinerary Path - With Curved Lines */}
        <div className="relative py-6 mt-2">
          <svg 
            className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2" 
            style={{ zIndex: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {itinerary.map((_, index) => {
              if (index === itinerary.length - 1) return null;
              
              const startX = (index / (itinerary.length - 1)) * 100;
              const endX = ((index + 1) / (itinerary.length - 1)) * 100;
              const midX = (startX + endX) / 2;
              const controlY = index % 2 === 0 ? 20 : 80; // Alternate curve direction
              
              return (
                <path
                  key={index}
                  d={`M ${startX} 50 Q ${midX} ${controlY} ${endX} 50`}
                  stroke="#0000aa"
                  strokeWidth="2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          
          <div className="relative flex items-center justify-between" style={{ zIndex: 1 }}>
            {itinerary.map((stop, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#1d2952] rounded-full flex items-center justify-center text-white text-xs">
                  {stop.city.substring(0, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cities */}
        <div className="flex justify-between text-sm text-[#1d2952] mt-0">
          {itinerary.map((stop, index) => (
            <div key={index} className="text-[#1d2952]">
              {stop.city}
            </div>
          ))}
        </div>
        
        {/* Price */}
        <div className="pt-3">
          <span className="text-xl font-bold text-[#1d2952]">₹{price}</span>
          <span className="text-gray-600 ml-1">per person</span>
        </div>
        
        {/* Button */}
        <a
          href="tel:+919665398773"
          className="block w-full py-3.5 bg-[#1d2952] text-white rounded-md text-center hover:bg-opacity-90 transition mt-4"
        >
          Request a callback
        </a>
      </div>
    </div>
  );
};

export default TourCardComponent;