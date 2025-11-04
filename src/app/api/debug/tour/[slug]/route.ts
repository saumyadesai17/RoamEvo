import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch tour with all relations
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .select(`
        id,
        title,
        slug,
        inclusions:tour_inclusions(*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !tour) {
      return NextResponse.json(
        { error: 'Tour not found', details: error },
        { status: 404 }
      );
    }

    // Also get raw inclusions count
    const { count } = await supabaseAdmin
      .from('tour_inclusions')
      .select('*', { count: 'exact', head: true })
      .eq('tour_id', tour.id);

    return NextResponse.json({
      success: true,
      tour: {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
      },
      inclusions: tour.inclusions,
      inclusionsCount: count,
      debug: {
        inclusionsByType: {
          inclusion: tour.inclusions?.filter((i: { type: string }) => i.type === 'inclusion').length || 0,
          exclusion: tour.inclusions?.filter((i: { type: string }) => i.type === 'exclusion').length || 0,
        },
        allTypes: tour.inclusions?.map((i: { type: string }) => i.type) || [],
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
