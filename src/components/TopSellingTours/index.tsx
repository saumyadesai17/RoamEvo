'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { HiCalendar } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase';
import { TourCardSkeleton } from './TourCardSkeleton';

interface TourData {
  slug: string;
  destination?: { name: string } | { name: string }[]; // Supabase returns array
  rating_average: number;
  reviews_count: number;
  title: string;
  cover_image?: string;
  base_price: number;
  duration_days: number;
  duration_nights: number;
  metadata?: { 
    destination_name?: string; 
    breadcrumbs?: string[];
    [key: string]: unknown;
  };
  itinerary?: { city?: string }[];
}

interface TourCardProps {
  destination: string;
  rating: number;
  reviews: string;
  title: string;
  imageSrc: string;
  price: string;
  slug: string;
  itinerary: { city: string; isStart?: boolean; isEnd?: boolean }[];
  nextDepartureDate?: string;
}

const TourCard = ({ destination, rating, reviews, title, imageSrc, price, slug, itinerary, nextDepartureDate }: TourCardProps) => {
  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <Link href={`/tours/${slug}`} className="relative h-52 w-full overflow-hidden cursor-pointer group">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Next Departure Badge - Overlay on Image */}
        {nextDepartureDate && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 z-10">
            <HiCalendar className="text-[#1d2952] text-lg" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-600 font-medium uppercase tracking-wide">Next Trip</span>
              <span className="text-xs font-bold text-[#1d2952]">{formatDate(nextDepartureDate)}</span>
            </div>
          </div>
        )}
      </Link>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IoLocationSharp className="text-[#1d2952]" />
            <span className="font-medium text-[#1d2952]">{destination}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaStar className="text-[#C2FD02B2]" />
            <span className="text-[#000000B2]">{rating}</span>
            <span className="text-gray-500 text-sm">({reviews})</span>
          </div>
        </div>

        <Link href={`/tours/${slug}`}>
          <h3 className="text-xl text-[#1d2952] font-medium hover:text-[#4A5B2D] transition-colors cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Itinerary Points with City Names */}
        <div className="py-4 relative">
          {/* Dots with curved connecting lines */}
          <div className="relative h-12">
            {/* SVG for curved lines */}
            <svg 
              className="absolute inset-0 w-full h-full px-[25px]" 
              style={{ zIndex: 0 }}
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
            >
              {itinerary.map((_, index) => {
                if (index === itinerary.length - 1) return null;
                
                const startX = (index / (itinerary.length - 1)) * 1000;
                const endX = ((index + 1) / (itinerary.length - 1)) * 1000;
                const midX = (startX + endX) / 2;
                const controlY = index % 2 === 0 ? 10 : 90; // Increased curve depth
                
                return (
                  <path
                    key={`curve-${index}`}
                    d={`M ${startX} 50 Q ${midX} ${controlY}, ${endX} 50`}
                    stroke="#9ca3af"
                    strokeWidth="2"
                    fill="none"
                  />
                );
              })}
            </svg>

            {/* Dots with city names positioned relative to each dot */}
            <div className="absolute inset-0 flex items-center justify-between px-[25px]" style={{ zIndex: 1 }}>
              {itinerary.map((stop, index) => (
                <div key={index} className="shrink-0 relative">
                  {/* City name above (even indices: 0, 2, 4) */}
                  {index % 2 === 0 && stop.city && !/\d+D\s*\//.test(stop.city) && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-[10px] text-gray-600 leading-tight text-center">
                        {stop.city}
                      </div>
                    </div>
                  )}
                  
                  {/* The dot */}
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1d2952]"></div>
                  
                  {/* City name below (odd indices: 1, 3) */}
                  {index % 2 !== 0 && stop.city && !/\d+D\s*\//.test(stop.city) && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-[10px] text-gray-600 leading-tight text-center">
                        {stop.city}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Duration display for tours without city names */}
          {itinerary.length > 0 && itinerary[0].city && /\d+D\s*\//.test(itinerary[0].city) && (
            <div className="text-sm text-gray-600 text-center mt-4">
              {itinerary[0].city}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div>
            <span className="text-xl font-bold text-[#1d2952]">₹{price}</span>
            <span className="text-gray-600 ml-1">per person</span>
          </div>
        </div>

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

const TopSellingTours = () => {
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(3); // Default to 3

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Fetch bestseller tours with itinerary
        const { data: dbTours } = await supabase
          .from('tours')
          .select(`
            id, 
            title, 
            slug, 
            base_price, 
            cover_image, 
            rating_average, 
            reviews_count, 
            duration_days, 
            duration_nights, 
            metadata, 
            destination:destinations(name)
          `)
          .eq('status', 'published')
          .eq('is_bestseller', true)
          .order('bookings_count', { ascending: false })
          .limit(3);

        // Fallback to featured tours if no bestsellers
        let displayTours = dbTours && dbTours.length > 0 ? dbTours : null;
        
        if (!displayTours) {
          const fallback = await supabase
            .from('tours')
            .select(`
              id, 
              title, 
              slug, 
              base_price, 
              cover_image, 
              rating_average, 
              reviews_count, 
              duration_days, 
              duration_nights, 
              metadata, 
              destination:destinations(name)
            `)
            .eq('status', 'published')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(3);
          displayTours = fallback.data;
        }

        if (displayTours && displayTours.length > 0) {
          // Set skeleton count to match actual tour count
          setSkeletonCount(displayTours.length);
          
          // Fetch next departure date for each tour using slug-based API
          const toursWithDates = await Promise.all(
            displayTours.map(async (tour: TourData) => {
              let nextDate: string | undefined;
              
              try {
                const response = await fetch(`/api/tours/${tour.slug}/dates`);
                
                // Check if response is actually JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  console.error(`Tour ${tour.slug} dates API returned non-JSON response (${response.status})`);
                  return { tour, nextDate };
                }
                
                const data = await response.json();
                
                if (response.ok && data.success && data.dates && data.dates.length > 0) {
                  nextDate = data.dates[0].start_date;
                  console.log(`Tour ${tour.slug} has next date:`, nextDate);
                } else {
                  console.log(`Tour ${tour.slug} has no upcoming dates`, data);
                }
              } catch (error) {
                console.error(`Error fetching dates for tour ${tour.slug}:`, error);
              }
              
              return { tour, nextDate };
            })
          );

          const formattedTours = toursWithDates.map(({ tour, nextDate }) => {
            const destinationName = Array.isArray(tour.destination) && tour.destination.length > 0
              ? tour.destination[0].name
              : tour.destination && 'name' in tour.destination
              ? tour.destination.name
              : tour.metadata?.destination_name || tour.title.split(' ')[0];

            // Build breadcrumb itinerary from metadata.breadcrumbs
            let breadcrumbs: { city: string; isStart?: boolean; isEnd?: boolean }[] = [];
            
            // Check if breadcrumbs exist in metadata
            if (tour.metadata && tour.metadata.breadcrumbs && Array.isArray(tour.metadata.breadcrumbs) && tour.metadata.breadcrumbs.length > 0) {
              // Use all breadcrumbs from metadata
              const cities = tour.metadata.breadcrumbs;
              breadcrumbs = cities.map((city: string, idx: number) => ({
                city: city,
                isStart: idx === 0,
                isEnd: idx === cities.length - 1
              }));
            } else {
              // Fallback to duration display if no breadcrumbs
              breadcrumbs = [
                { city: `${tour.duration_days}D / ${tour.duration_nights}N`, isStart: true },
                { city: '' },
                { city: '', isEnd: true }
              ];
            }

            console.log(`Tour ${tour.slug} (${tour.title}) - Next date:`, nextDate);

            return {
              destination: destinationName,
              rating: tour.rating_average > 0 ? Number(tour.rating_average.toFixed(1)) : 4.5,
              reviews: tour.reviews_count > 0 ? tour.reviews_count.toString() : '0',
              title: tour.title,
              slug: tour.slug,
              imageSrc: tour.cover_image || '/tours/adventure.png',
              price: tour.base_price.toLocaleString('en-IN'),
              itinerary: breadcrumbs,
              nextDepartureDate: nextDate
            };
          });
          
          console.log('Final formatted tours with dates:', formattedTours.map(t => ({ title: t.title, nextDate: t.nextDepartureDate })));
          setTours(formattedTours);
        }
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-[#f9f9f5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-16">
            <p className="text-gray-500 mb-4 md:mb-0">
              Experience, Trust, and Adventures Tailored Just for You.
            </p>
            <div className="w-full md:w-64 h-px bg-gray-300"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-medium text-[#1d2952] mb-12">
            Our Top Selling Tours
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(skeletonCount)].map((_, index) => (
              <TourCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return null; // Don't show section if no tours
  }

  return (
    <section className="py-20 px-6 bg-[#f9f9f5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-16">
          <p className="text-gray-500 mb-4 md:mb-0">
            Experience, Trust, and Adventures Tailored Just for You.
          </p>
          <div className="w-full md:w-64 h-px bg-gray-300"></div>
        </div>

        <h2 className="text-4xl md:text-5xl font-medium text-[#1d2952] mb-12">
          Our Top Selling Tours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <TourCard
              key={index}
              destination={tour.destination}
              rating={tour.rating}
              reviews={tour.reviews}
              title={tour.title}
              slug={tour.slug}
              imageSrc={tour.imageSrc}
              price={tour.price}
              itinerary={tour.itinerary}
              nextDepartureDate={tour.nextDepartureDate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopSellingTours;