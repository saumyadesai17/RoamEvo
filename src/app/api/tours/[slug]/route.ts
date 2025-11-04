import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Tour, TourApiResponse } from '@/types/tour';

interface TourDate {
  start_date: string;
  is_active: boolean;
  available_slots: number;
}

interface TourInclusion {
  type: 'inclusion' | 'exclusion';
  item: string;
  description?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { tour: null, error: 'Tour slug is required' },
        { status: 400 }
      );
    }

    // Fetch tour with relations
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select(`
        *,
        destination:destinations(*),
        itinerary:tour_itinerary(*),
        essentials:tour_essentials(*),
        inclusions:tour_inclusions(*),
        dates:tour_dates(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (tourError) {
      console.error('[API] Error fetching tour:', tourError);
      return NextResponse.json(
        { tour: null, error: 'Tour not found', details: tourError.message },
        { status: 404 }
      );
    }

    if (!tour) {
      console.log('[API] Tour not found for slug:', slug);
      return NextResponse.json(
        { tour: null, error: 'Tour not found' },
        { status: 404 }
      );
    }

    console.log('[API] Tour fetched:', {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      itineraryCount: tour.itinerary?.length || 0,
      essentialsCount: tour.essentials?.length || 0,
      inclusionsCount: tour.inclusions?.length || 0,
      datesCount: tour.dates?.length || 0,
    });

    // Sort itinerary by day number
    if (tour.itinerary) {
      tour.itinerary.sort((a: { day_number: number }, b: { day_number: number }) => 
        a.day_number - b.day_number
      );
    }

    // Sort essentials by display order
    if (tour.essentials) {
      tour.essentials.sort((a: { display_order: number }, b: { display_order: number }) => 
        a.display_order - b.display_order
      );
    }

    // Process and filter tour dates - only active, future dates with available slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredDates = (tour.dates || [])
      .filter((date: TourDate) => {
        const startDate = new Date(date.start_date);
        return date.is_active && startDate >= today && date.available_slots > 0;
      })
      .sort((a: TourDate, b: TourDate) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

    console.log('[API] Dates processed:', {
      totalDates: tour.dates?.length || 0,
      activeFutureDates: filteredDates.length,
    });

    // Process inclusions and exclusions
    const inclusionsFromTable = (tour.inclusions || [])
      .filter((inc: TourInclusion) => inc.type === 'inclusion')
      .map((inc: TourInclusion) => 
        inc.description ? `${inc.item} - ${inc.description}` : inc.item
      );

    const exclusionsFromTable = (tour.inclusions || [])
      .filter((exc: TourInclusion) => exc.type === 'exclusion')
      .map((exc: TourInclusion) => 
        exc.description ? `${exc.item} - ${exc.description}` : exc.item
      );

    // Add processed data to tour object
    const tourWithProcessedData = {
      ...tour,
      filteredDates,
      processedInclusions: inclusionsFromTable.length > 0 
        ? inclusionsFromTable 
        : (tour.price_includes || []),
      processedExclusions: exclusionsFromTable.length > 0 
        ? exclusionsFromTable 
        : (tour.price_excludes || [])
    };

    const response: TourApiResponse = {
      tour: tourWithProcessedData as Tour,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in tour API route:', error);
    return NextResponse.json(
      { tour: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Increment view count
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Tour slug is required' },
        { status: 400 }
      );
    }

    // First get the tour UUID from slug
    const { data: tour, error: fetchError } = await supabase
      .from('tours')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !tour) {
      console.error('[API] Error fetching tour for view count:', fetchError);
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Increment view count using the UUID
    const { error } = await supabase.rpc('increment_tour_views', {
      tour_uuid: tour.id,
    });

    if (error) {
      console.error('[API] Error incrementing view count:', error);
      // Don't fail the request, just log the error
    } else {
      console.log('[API] View count incremented for tour:', slug);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API] Exception in tour POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
