'use client';

import { HiCalendar, HiUsers } from 'react-icons/hi2';

interface TourDate {
  id: string;
  start_date: string;
  end_date: string;
  available_slots: number;
  is_active: boolean;
}

interface TourDatesProps {
  dates: TourDate[];
}

const TourDates = ({ dates }: TourDatesProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getSlotStatus = (slots: number) => {
    if (slots <= 2) return { text: 'Almost Full', color: 'text-red-600', emoji: '🔥' };
    if (slots <= 5) return { text: 'Filling Fast', color: 'text-orange-500', emoji: '⚡' };
    return { text: 'Available', color: 'text-green-600', emoji: '✓' };
  };

  if (!dates || dates.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-6 2xl:mt-8">
      <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl text-[#000000B2] mb-2 sm:mb-3 2xl:mb-4">
        Upcoming Departures
      </h3>
      <div className="space-y-2 sm:space-y-2.5 2xl:space-y-3">
        {dates.slice(0, 5).map((date) => {
          const slotStatus = getSlotStatus(date.available_slots);
          
          return (
            <div
              key={date.id}
              className="p-3 sm:p-3.5 2xl:p-4 bg-[#F5F5F0] hover:bg-[#EBEBDE] rounded-lg transition-colors duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 2xl:mb-2">
                <HiCalendar className="text-[#4A5B2D] text-base sm:text-lg 2xl:text-xl shrink-0" />
                <span className="text-sm sm:text-base 2xl:text-lg font-medium text-[#313825]">
                  {formatDateRange(date.start_date, date.end_date)}
                </span>
              </div>
              
              <div className="flex items-center justify-between pl-6 sm:pl-7 2xl:pl-8">
                <div className="flex items-center gap-1.5">
                  <HiUsers className="text-[#000000B2] text-xs sm:text-sm 2xl:text-base" />
                  <span className="text-xs sm:text-sm 2xl:text-base text-[#000000B2]">
                    {date.available_slots} {date.available_slots === 1 ? 'slot' : 'slots'}
                  </span>
                </div>
                <span className={`text-xs sm:text-sm 2xl:text-base font-medium ${slotStatus.color} flex items-center gap-1`}>
                  <span>{slotStatus.emoji}</span>
                  {slotStatus.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {dates.length > 5 && (
        <p className="text-xs sm:text-sm 2xl:text-base text-[#000000B2] text-center mt-2 sm:mt-3 2xl:mt-4">
          +{dates.length - 5} more {dates.length - 5 === 1 ? 'date' : 'dates'} available
        </p>
      )}
    </div>
  );
};

export default TourDates;
