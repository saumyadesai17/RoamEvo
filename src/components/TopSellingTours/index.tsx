'use client';
import { useEffect, useState, Fragment } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { IoLocationSharp } from 'react-icons/io5';
import { supabase } from '@/lib/supabase';

interface TourCardProps {
  destination: string;
  rating: number;
  reviews: string;
  title: string;
  imageSrc: string;
  price: string;
  itinerary: { city: string; isStart?: boolean; isEnd?: boolean }[];
}

const TourCard = ({ destination, rating, reviews, title, imageSrc, price, itinerary }: TourCardProps) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="rounded-lg object-cover"
        />
      </div>

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

        <h3 className="text-xl text-[#1d2952] font-medium">{title}</h3>

        {/* Itinerary Points with City Names */}
        <div className="py-4">
          {/* City names above (even indices: 0, 2, 4) */}
          <div className="flex items-center mb-1 min-h-[20px]">
            {itinerary.map((stop, index) => (
              <Fragment key={`top-${index}`}>
                <div className="flex-shrink-0 flex justify-center" style={{ width: '50px' }}>
                  <div className="text-[12px] text-gray-600 leading-tight text-center">
                    {index % 2 === 0 && stop.city && !/\d+D\s*\//.test(stop.city) ? stop.city : ''}
                  </div>
                </div>
                {index < itinerary.length - 1 && <div className="flex-1"></div>}
              </Fragment>
            ))}
          </div>

          {/* Dots with connecting lines */}
          <div className="flex items-center">
            {itinerary.map((stop, index) => (
              <Fragment key={index}>
                <div className="flex-shrink-0 flex justify-center" style={{ width: '50px' }}>
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1d2952]"></div>
                </div>
                {index < itinerary.length - 1 && (
                  <div className="flex-1 h-[1px] bg-gray-400"></div>
                )}
              </Fragment>
            ))}
          </div>

          {/* City names below (odd indices: 1, 3) */}
          <div className="flex items-center mt-1 min-h-[20px]">
            {itinerary.map((stop, index) => (
              <Fragment key={`bottom-${index}`}>
                <div className="flex-shrink-0 flex justify-center" style={{ width: '50px' }}>
                  <div className="text-[12px] text-gray-600 leading-tight text-center">
                    {index % 2 !== 0 && stop.city && !/\d+D\s*\//.test(stop.city) ? stop.city : ''}
                  </div>
                </div>
                {index < itinerary.length - 1 && <div className="flex-1"></div>}
              </Fragment>
            ))}
          </div>

          {/* Duration display for tours without city names */}
          {itinerary.length > 0 && itinerary[0].city && /\d+D\s*\//.test(itinerary[0].city) && (
            <div className="text-sm text-gray-600 text-center mt-2">
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
          const formattedTours = displayTours.map((tour: {
            id: number;
            title: string;
            slug: string;
            base_price: number;
            cover_image: string | null;
            rating_average: number;
            reviews_count: number;
            duration_days: number;
            duration_nights: number;
            metadata: {
              breadcrumbs?: string[];
              destination_name?: string;
            } | null;
            destination: { name: string }[] | { name: string } | null;
          }) => {
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
              console.log('Tour:', tour.title, 'Breadcrumbs:', cities, 'Length:', cities.length); // Debug log
              breadcrumbs = cities.map((city: string, idx: number) => ({
                city: city,
                isStart: idx === 0,
                isEnd: idx === cities.length - 1
              }));
              console.log('Formatted breadcrumbs:', breadcrumbs); // Debug log
            } else {
              // Fallback to duration display if no breadcrumbs
              breadcrumbs = [
                { city: `${tour.duration_days}D / ${tour.duration_nights}N`, isStart: true },
                { city: '' },
                { city: '', isEnd: true }
              ];
            }

            return {
              destination: destinationName,
              rating: tour.rating_average > 0 ? Number(tour.rating_average.toFixed(1)) : 4.5,
              reviews: tour.reviews_count > 0 ? tour.reviews_count.toString() : '0',
              title: tour.title,
              imageSrc: tour.cover_image || '/tours/adventure.png',
              price: tour.base_price.toLocaleString('en-IN'),
              itinerary: breadcrumbs
            };
          });
          
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
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Loading tours...</p>
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
              imageSrc={tour.imageSrc}
              price={tour.price}
              itinerary={tour.itinerary}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopSellingTours;