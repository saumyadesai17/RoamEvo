import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    console.log('[API] Fetching dates for tour slug:', slug);

    // First, get the tour ID from slug
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (tourError || !tour) {
      console.error('[API] Tour not found:', tourError);
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Fetch active, future dates with available slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: dates, error: datesError } = await supabase
      .from('tour_dates')
      .select('*')
      .eq('tour_id', tour.id)
      .eq('is_active', true)
      .gte('start_date', today.toISOString())
      .gt('available_slots', 0)
      .order('start_date', { ascending: true });

    if (datesError) {
      console.error('[API] Error fetching dates:', datesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dates', details: datesError.message },
        { status: 500 }
      );
    }

    console.log('[API] Dates fetched:', {
      tourId: tour.id,
      slug: slug,
      datesCount: dates?.length || 0
    });

    return NextResponse.json(
      { 
        success: true, 
        dates: dates || [],
        count: dates?.length || 0
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('[API] Exception in dates route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
