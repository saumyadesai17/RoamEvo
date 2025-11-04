import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.slug || !data.overview) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, and overview are required' },
        { status: 400 }
      );
    }

    // Prepare tour data
    const tourData = {
      title: data.title,
      slug: data.slug,
      destination_id: data.destination_id || null, // Added destination_id
      category: data.category || 'domestic',
      status: data.status || 'draft',
      difficulty_level: data.difficulty_level || 'moderate',
      overview: data.overview,
      highlights: data.highlights?.filter((h: string) => h.trim()) || [],
      duration_days: data.duration_days || 5,
      duration_nights: data.duration_nights || 4,
      group_size_min: data.group_size_min || 4,
      group_size_max: data.group_size_max || 15,
      min_age: data.min_age || null,
      max_age: data.max_age || null,
      base_price: data.base_price || 0,
      currency: data.currency || 'INR',
      // Extract simple string arrays from inclusions for backward compatibility
      price_includes: data.inclusions
        ?.filter((inc: { type: string; item: string; description?: string }) => inc.type === 'inclusion')
        .map((inc: { type: string; item: string; description?: string }) => inc.description ? `${inc.item} - ${inc.description}` : inc.item) || [],
      price_excludes: data.inclusions
        ?.filter((exc: { type: string; item: string; description?: string }) => exc.type === 'exclusion')
        .map((exc: { type: string; item: string; description?: string }) => exc.description ? `${exc.item} - ${exc.description}` : exc.item) || [],
      
      // Trip vibes (0-5 scale, 0 means hidden)
      adventure_level: data.adventure_level !== undefined ? Math.min(5, Math.max(0, data.adventure_level)) : null,
      spiritual_level: data.spiritual_level !== undefined ? Math.min(5, Math.max(0, data.spiritual_level)) : null,
      chill_level: data.chill_level !== undefined ? Math.min(5, Math.max(0, data.chill_level)) : null,
      nature_level: data.nature_level !== undefined ? Math.min(5, Math.max(0, data.nature_level)) : null,
      cultural_level: data.cultural_level !== undefined ? Math.min(5, Math.max(0, data.cultural_level)) : null,
      
      // Media
      cover_image: data.cover_image || null,
      gallery_images: data.gallery_images || [],
      video_url: null,
      pdf_itinerary: data.pdf_itinerary || null,
      pdf_terms: data.pdf_terms || null,
      
      // SEO
      seo_title: data.seo_title || data.title,
      seo_description: data.seo_description || null,
      seo_keywords: [],
      
      // Metadata with breadcrumbs and destination name
      metadata: {
        breadcrumbs: data.breadcrumbs?.filter((b: string) => b.trim()) || ['Home', 'Tours'],
        destination_name: data.destination || null, // Store destination name temporarily
        ...data.metadata,
      },
      
      // Features
      is_featured: data.is_featured || false,
      is_bestseller: data.is_bestseller || false,
      featured_order: null,
      
      // Dates
      available_from: null,
      available_to: null,
      blackout_dates: [],
      
      // Stats (initialized to 0)
      views_count: 0,
      bookings_count: 0,
      rating_average: 0,
      reviews_count: 0,
      
      // Timestamps
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    };

    // Insert tour into database
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .insert(tourData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create tour: ' + error.message },
        { status: 500 }
      );
    }

    // Insert itinerary if provided
    if (data.itinerary && data.itinerary.length > 0) {
      const itineraryData = data.itinerary.map((day: { 
        day_number: number; 
        title: string; 
        description?: string; 
        mood?: string; 
        activities?: string[]; 
        meals?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }; 
        accommodation?: string; 
        images?: string[] 
      }) => ({
        tour_id: tour.id,
        day_number: day.day_number,
        title: day.title,
        description: day.description || '',
        mood: day.mood || null,
        // Convert activities array to JSONB { list: [...] } format
        activities: { 
          list: Array.isArray(day.activities) 
            ? day.activities.filter((a: string) => a && a.trim())
            : []
        },
        // Convert simple boolean meals to detailed JSONB format
        meals: {
          breakfast: { included: day.meals?.breakfast || false },
          lunch: { included: day.meals?.lunch || false },
          dinner: { included: day.meals?.dinner || false }
        },
        // Convert accommodation string to JSONB format
        accommodation: day.accommodation && day.accommodation.trim()
          ? { 
              type: 'hotel',
              name: day.accommodation.trim()
            } 
          : null,
        images: Array.isArray(day.images) ? day.images : [],
        display_order: day.day_number,
      }));

      const { error: itineraryError } = await supabaseAdmin
        .from('tour_itinerary')
        .insert(itineraryData);

      if (itineraryError) {
        console.error('Itinerary insert error:', itineraryError);
      }
    }

    // Insert essentials if provided
    if (data.essentials && data.essentials.length > 0) {
      const essentialsData = data.essentials.map((essential: { category: string; items: string[] }, index: number) => ({
        tour_id: tour.id,
        category: essential.category,
        items: essential.items,
        display_order: index + 1,
      }));

      const { error: essentialsError } = await supabaseAdmin
        .from('tour_essentials')
        .insert(essentialsData);

      if (essentialsError) {
        console.error('Essentials insert error:', essentialsError);
      }
    }

    // Insert inclusions if provided
    if (data.inclusions && data.inclusions.length > 0) {
      const inclusionsData = data.inclusions.map((inclusion: { type: string; item: string; description?: string }, index: number) => ({
        tour_id: tour.id,
        type: inclusion.type,
        item: inclusion.item,
        description: inclusion.description || null,
        display_order: index + 1,
      }));

      const { error: inclusionsError } = await supabaseAdmin
        .from('tour_inclusions')
        .insert(inclusionsData);

      if (inclusionsError) {
        console.error('Inclusions insert error:', inclusionsError);
      }
    }

    return NextResponse.json({
      success: true,
      tour,
      message: 'Tour created successfully',
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('tours')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: tours, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tours' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tours,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
