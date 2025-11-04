// Database types for Tour Management

export type TourStatus = 'draft' | 'published' | 'archived' | 'sold_out';
export type TourCategory = 'domestic' | 'international' | 'adventure' | 'spiritual' | 'cultural' | 'beach' | 'mountain' | 'desert' | 'wildlife';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'difficult' | 'extreme';

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  state?: string;
  city?: string;
  description?: string;
  short_description?: string;
  featured_image?: string;
  gallery_images?: string[];
  latitude?: number;
  longitude?: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  title: string;
  slug: string;
  destination_id?: string;
  category: TourCategory;
  status: TourStatus;
  difficulty_level: DifficultyLevel;
  overview: string;
  highlights: string[];
  duration_days: number;
  duration_nights: number;
  group_size_min: number;
  group_size_max: number;
  min_age?: number;
  max_age?: number;
  base_price: number;
  currency: string;
  price_includes: string[];
  price_excludes: string[];
  
  // Trip vibes (1-5 rating)
  adventure_level?: number;
  spiritual_level?: number;
  chill_level?: number;
  nature_level?: number;
  cultural_level?: number;
  
  // Media
  cover_image?: string;
  gallery_images: string[];
  video_url?: string;
  pdf_itinerary?: string;
  pdf_terms?: string;
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  
  // Metadata - JSONB field for flexible data (includes breadcrumbs)
  metadata?: {
    breadcrumbs?: string[];
    [key: string]: unknown;
  };
  
  // Features
  is_featured: boolean;
  is_bestseller: boolean;
  featured_order?: number;
  
  // Dates
  available_from?: string;
  available_to?: string;
  blackout_dates?: string[];
  
  // Stats
  views_count: number;
  bookings_count: number;
  rating_average: number;
  reviews_count: number;
  
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Relations
  destination?: Destination;
  itinerary?: TourItinerary[];
  essentials?: TourEssential[];
  
  // Processed data from API
  filteredDates?: TourDate[];
  processedInclusions?: string[];
  processedExclusions?: string[];
}

export interface TourItinerary {
  id: string;
  tour_id: string;
  day_number: number;
  title: string;
  description?: string;
  mood?: string;
  activities?: {
    list?: string[];
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  meals?: {
    breakfast?: { included: boolean; location?: string };
    lunch?: { included: boolean; location?: string };
    dinner?: { included: boolean; location?: string };
  };
  accommodation?: {
    type?: string;
    name?: string;
    description?: string;
  };
  transportation?: {
    mode?: string;
    distance?: string;
    duration?: string;
  };
  places_to_visit?: Array<{
    name: string;
    description?: string;
    distance?: string;
    duration?: string;
    entry_fee?: number;
  }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TourEssential {
  id: string;
  tour_id: string;
  category: 'carry' | 'know' | 'tips';
  items: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TourInclusion {
  id: string;
  tour_id: string;
  type: 'inclusion' | 'exclusion';
  category?: string;
  item: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface TourDate {
  id: string;
  tour_id: string;
  start_date: string;
  end_date: string;
  available_slots: number;
  booked_slots: number;
  price?: number;
  is_guaranteed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Props types for components
export interface TourHeaderProps {
  title: string;
  emoji?: string;
}

export interface TourGalleryProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
}

export interface TourContentProps {
  overview: string;
  itinerary: TourItinerary[];
  priceIncludes: string[];
  priceExcludes: string[];
}

export interface TourPricingProps {
  price: number;
  currency?: string;
  tourSlug: string;
  pdfItinerary?: string;
}

export interface TripVibeCheckProps {
  adventureLevel?: number;
  spiritualLevel?: number;
  chillLevel?: number;
  natureLevel?: number;
  culturalLevel?: number;
}

export interface ThingsToCarryProps {
  items: string[];
}

// API Response types
export interface TourApiResponse {
  tour: Tour | null;
  error?: string;
}

export interface ToursListApiResponse {
  tours: Tour[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}
