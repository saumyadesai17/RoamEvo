import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Tours/Breadcrumb';
import TourHeader from '@/components/Tours/TourHeader';
import TourGallery from '@/components/Tours/TourGallery';
import TourTabs from '@/components/Tours/TourTabs';
import TourContent from '@/components/Tours/TourContent';
import TourPricing from '@/components/Tours/TourPricing';
import TripVibeCheck from '@/components/Tours/TripVibeCheck';
import ThingsToCarry from '@/components/Tours/ThingsToCarry';
import DownloadButton from '@/components/Tours/DownloadButton';
import LiveTripSection from '@/components/Tours/LiveTripSection';
import StructuredData from '@/components/StructuredData';
import { supabase } from '@/lib/supabase';

// Revalidate every 60 seconds
export const revalidate = 60;

// Generate static params for known tours
export async function generateStaticParams() {
  const { data: tours } = await supabase
    .from('tours')
    .select('slug')
    .eq('status', 'published');

  if (!tours) return [];

  return tours.map((tour) => ({
    slug: tour.slug,
  }));
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!tour) {
    return {
      title: 'Tour Not Found | Roamevo',
      description: 'The requested tour could not be found.',
    };
  }

  return {
    title: tour.seo_title || tour.title,
    description: tour.seo_description || tour.overview.substring(0, 160),
    keywords: tour.seo_keywords || [],
    openGraph: {
      title: tour.seo_title || tour.title,
      description: tour.seo_description || tour.overview.substring(0, 160),
      url: `https://roamevo.in/tours/${slug}`,
      images: tour.cover_image
        ? [
            {
              url: tour.cover_image,
              width: 1200,
              height: 630,
              alt: tour.title,
            },
          ]
        : [],
    },
    alternates: {
      canonical: `https://roamevo.in/tours/${slug}`,
    },
  };
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch tour data with relations
  const { data: tour, error } = await supabase
    .from('tours')
    .select(
      `
      *,
      destination:destinations(*),
      itinerary:tour_itinerary(*),
      essentials:tour_essentials(*),
      inclusions:tour_inclusions(*)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !tour) {
    notFound();
  }

  // Sort itinerary by day number
  const sortedItinerary = tour.itinerary?.sort(
    (a: { day_number: number }, b: { day_number: number }) =>
      a.day_number - b.day_number
  ) || [];

  // Get things to carry
  const thingsToCarry = tour.essentials?.find(
    (e: { category: string }) => e.category === 'carry'
  );

  // Get inclusions and exclusions - check both sources
  // Method 1: From tour_inclusions table (detailed with descriptions)
  const inclusionsFromTable = tour.inclusions
    ?.filter((inc: { type: string }) => inc.type === 'inclusion')
    .map((inc: { item: string; description?: string }) => 
      inc.description ? `${inc.item} - ${inc.description}` : inc.item
    ) || [];
  
  const exclusionsFromTable = tour.inclusions
    ?.filter((exc: { type: string }) => exc.type === 'exclusion')
    .map((exc: { item: string; description?: string }) => 
      exc.description ? `${exc.item} - ${exc.description}` : exc.item
    ) || [];
  
  // Method 2: From tours.price_includes and tours.price_excludes arrays (simple strings)
  const priceIncludes = inclusionsFromTable.length > 0 
    ? inclusionsFromTable 
    : (tour.price_includes || []);
  
  const priceExcludes = exclusionsFromTable.length > 0 
    ? exclusionsFromTable 
    : (tour.price_excludes || []);

  // Prepare breadcrumb items from metadata.breadcrumbs or fallback to destination
  const breadcrumbItems: Array<{ label: string; href: string }> = [];
  
  // Check if breadcrumbs are stored in metadata JSON field
  if (tour.metadata && tour.metadata.breadcrumbs && Array.isArray(tour.metadata.breadcrumbs)) {
    tour.metadata.breadcrumbs.forEach((place: string) => {
      breadcrumbItems.push({
        label: place,
        href: `/destinations/${place.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      });
    });
  } else if (tour.destination) {
    // Fallback to main destination if no breadcrumbs specified
    breadcrumbItems.push({ 
      label: tour.destination.name, 
      href: `/destinations/${tour.destination.slug}` 
    });
  }

  // Prepare gallery images
  const tourImages = (tour.gallery_images || []).map((src: string, index: number) => ({
    src,
    alt: `${tour.title} - Image ${index + 1}`,
  }));

  // Add cover image as first image if available
  if (tour.cover_image) {
    tourImages.unshift({
      src: tour.cover_image,
      alt: `${tour.title} - Cover Image`,
    });
  }

  // Structured data for SEO
  const tourStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.overview,
    image: tour.cover_image,
    provider: {
      '@type': 'TravelAgency',
      name: 'Roamevo',
      url: 'https://roamevo.in',
    },
    offers: {
      '@type': 'Offer',
      price: tour.base_price.toString(),
      priceCurrency: tour.currency || 'INR',
      availability: 'https://schema.org/InStock',
      priceValidUntil:
        tour.available_to || (() => {
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          return oneYearFromNow.toISOString().split('T')[0];
        })(),
      description: `${tour.duration_days}-day ${tour.title} including accommodation, transport, activities, and meals`,
    },
    itinerary: sortedItinerary.map((day: { title: string; description: string }) => ({
      '@type': 'TouristDestination',
      name: day.title,
      description: day.description,
    })),
    duration: `P${tour.duration_days}D`,
  };

  return (
    <div className="bg-white">
      <StructuredData data={tourStructuredData} />
      <div className="pb-6 sm:pb-8 lg:pb-12 2xl:pb-16 container mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px]">
        <Breadcrumb items={breadcrumbItems} />

        <TourHeader title={tour.title} emoji="🏔️" />

        <TourGallery images={tourImages} title={tour.title} />

        {/* Tour Details Section */}
        <div className="mt-6 sm:mt-8 lg:mt-12 2xl:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1px_1fr] 2xl:grid-cols-[2.5fr_1px_1fr] gap-6 sm:gap-8 lg:gap-12 2xl:gap-16">
            {/* Main Content */}
            <div className="lg:pr-6 2xl:pr-8">
              {/* Sticky Tour Tabs */}
              <div className="lg:sticky lg:top-16 2xl:top-20 lg:z-20 bg-white">
                <TourTabs />
              </div>
              <TourContent
                overview={tour.overview}
                itinerary={sortedItinerary}
                priceIncludes={priceIncludes}
                priceExcludes={priceExcludes}
              />
            </div>

            {/* Vertical Separator Line */}
            <div className="hidden lg:block w-px bg-[#000000B2] sticky top-24 2xl:top-28 h-96 2xl:h-[500px]"></div>

            {/* Sidebar */}
            <div className="lg:pl-6 2xl:pl-8 lg:pt-3 2xl:pt-4">
              {/* Sticky Sidebar */}
              <div className="lg:sticky lg:top-19 2xl:top-24 lg:max-h-screen 2xl:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide space-y-3 sm:space-y-4 2xl:space-y-6">
                <TourPricing 
                  price={tour.base_price} 
                  currency={tour.currency}
                  tourSlug={slug}
                  pdfItinerary={tour.pdf_itinerary}
                />
                <TripVibeCheck
                  adventureLevel={tour.adventure_level}
                  spiritualLevel={tour.spiritual_level}
                  chillLevel={tour.chill_level}
                  natureLevel={tour.nature_level}
                  culturalLevel={tour.cultural_level}
                />
                {thingsToCarry && <ThingsToCarry items={thingsToCarry.items} />}
                
                {/* Terms & Conditions PDF */}
                {tour.pdf_terms && (
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg 2xl:text-xl font-medium text-gray-900">Documents</h3>
                    <DownloadButton 
                      pdfUrl={tour.pdf_terms}
                      label="Terms & Conditions"
                      icon="📜"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Trip Section */}
      <LiveTripSection />
    </div>
  );
}
