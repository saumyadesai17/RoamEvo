import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { IoLocationSharp } from 'react-icons/io5';

export const metadata: Metadata = {
  title: "Domestic Tours in India | Roamevo Adventure Packages",
  description: "Explore our curated collection of domestic tours across India. From Himalayan treks to cultural journeys, find your perfect adventure.",
  keywords: ["domestic tours India", "adventure tours", "trekking packages", "cultural tours", "India travel packages"],
  openGraph: {
    title: "Domestic Tours in India | Roamevo Adventure Packages",
    description: "Explore our curated collection of domestic tours across India.",
    url: "https://roamevo.in/tours",
  },
  alternates: {
    canonical: "https://roamevo.in/tours",
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ToursListingPage() {
  // Fetch all published domestic tours with destination relationship
  const { data: tours } = await supabase
    .from('tours')
    .select('*, destination:destinations(*)')
    .eq('status', 'published')
    .eq('category', 'domestic')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pt-4 sm:pb-16 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1d2952] mb-3" style={{ fontFamily: 'Montserrat' }}>
            Domestic Tours
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Gideon Roman' }}>
            Explore the incredible beauty and diversity of India
          </p>
        </div>

        {/* Tours Grid */}
        {tours && tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <Link 
                key={tour.id} 
                href={`/tours/${tour.slug}`}
                className="flex flex-col border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-300 group"
              >
                {/* Tour Image */}
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  {tour.cover_image ? (
                    <Image 
                      src={tour.cover_image} 
                      alt={tour.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                      <span className="text-6xl">🏔️</span>
                    </div>
                  )}
                </div>

                {/* Tour Info */}
                <div className="mt-4 space-y-3">
                  {/* Location and Difficulty */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#1d2952] rounded-full p-1.5 mr-2">
                        <IoLocationSharp className="text-white text-sm" />
                      </div>
                      <span className="font-medium text-[#1d2952]" style={{ fontFamily: 'Montserrat' }}>
                        {tour.destination?.name || (tour.metadata as { destination_name?: string })?.destination_name || 'Destination TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.is_featured && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md font-medium">
                          Featured
                        </span>
                      )}
                      {tour.is_bestseller && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl text-[#1d2952] font-medium" style={{ fontFamily: 'Montserrat' }}>
                    {tour.title}
                  </h3>

                  {/* Duration and Group Info */}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{tour.duration_days}D / {tour.duration_nights}N</span>
                    <span>{tour.group_size_min}-{tour.group_size_max} people</span>
                  </div>

                  {/* Price */}
                  <div className="pt-3">
                    <span className="text-xl font-bold text-[#1d2952]" style={{ fontFamily: 'Montserrat' }}>
                      ₹{tour.base_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-600 ml-1">per person</span>
                  </div>

                  {/* Button */}
                  <button className="w-full py-3.5 bg-[#1d2952] text-white rounded-md text-center hover:bg-[#2a3d6f] transition-colors duration-300 mt-4 cursor-pointer">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Gideon Roman' }}>
              No tours available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}