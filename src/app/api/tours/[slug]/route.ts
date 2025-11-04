import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Tour, TourApiResponse } from '@/types/tour';

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
        essentials:tour_essentials(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (tourError) {
      console.error('Error fetching tour:', tourError);
      return NextResponse.json(
        { tour: null, error: 'Tour not found' },
        { status: 404 }
      );
    }

    if (!tour) {
      return NextResponse.json(
        { tour: null, error: 'Tour not found' },
        { status: 404 }
      );
    }

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

    const response: TourApiResponse = {
      tour: tour as Tour,
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

    // Increment view count
    const { error } = await supabase.rpc('increment_tour_views', {
      tour_slug: slug,
    });

    if (error) {
      console.error('Error incrementing view count:', error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in tour POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
