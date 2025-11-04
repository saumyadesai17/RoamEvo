import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tourId } = await params;

    // Fetch tour
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError || !tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Fetch itinerary
    const { data: itinerary } = await supabaseAdmin
      .from('tour_itinerary')
      .select('*')
      .eq('tour_id', tourId)
      .order('day_number', { ascending: true });

    // Fetch essentials
    const { data: essentials } = await supabaseAdmin
      .from('tour_essentials')
      .select('*')
      .eq('tour_id', tourId)
      .order('display_order', { ascending: true });

    // Fetch inclusions
    const { data: inclusions } = await supabaseAdmin
      .from('tour_inclusions')
      .select('*')
      .eq('tour_id', tourId)
      .order('display_order', { ascending: true});

    return NextResponse.json({
      success: true,
      tour: {
        ...tour,
        destination: (tour.metadata as { destination_name?: string })?.destination_name || '', // Extract destination from metadata
        itinerary: itinerary || [],
        essentials: essentials || [],
        inclusions: inclusions || [],
      },
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tourId } = await params;
    const data = await request.json();

    // Update tour
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .update({
        title: data.title,
        slug: data.slug,
        destination_id: data.destination_id || null, // Added destination_id
        category: data.category,
        status: data.status,
        difficulty_level: data.difficulty_level,
        overview: data.overview,
        highlights: data.highlights?.filter((h: string) => h.trim()) || [],
        duration_days: data.duration_days,
        duration_nights: data.duration_nights,
        group_size_min: data.group_size_min,
        group_size_max: data.group_size_max,
        min_age: data.min_age,
        max_age: data.max_age,
        base_price: data.base_price,
        currency: data.currency,
        // Extract simple string arrays from inclusions for backward compatibility
        price_includes: data.inclusions
          ?.filter((inc: { type: string; item: string; description?: string }) => inc.type === 'inclusion')
          .map((inc: { type: string; item: string; description?: string }) => inc.description ? `${inc.item} - ${inc.description}` : inc.item) || [],
        price_excludes: data.inclusions
          ?.filter((exc: { type: string; item: string; description?: string }) => exc.type === 'exclusion')
          .map((exc: { type: string; item: string; description?: string }) => exc.description ? `${exc.item} - ${exc.description}` : exc.item) || [],
        // Trip vibes (0-5 range, 0 means hidden)
        adventure_level: data.adventure_level !== undefined ? Math.min(5, Math.max(0, data.adventure_level)) : null,
        spiritual_level: data.spiritual_level !== undefined ? Math.min(5, Math.max(0, data.spiritual_level)) : null,
        chill_level: data.chill_level !== undefined ? Math.min(5, Math.max(0, data.chill_level)) : null,
        nature_level: data.nature_level !== undefined ? Math.min(5, Math.max(0, data.nature_level)) : null,
        cultural_level: data.cultural_level !== undefined ? Math.min(5, Math.max(0, data.cultural_level)) : null,
        cover_image: data.cover_image,
        gallery_images: data.gallery_images,
        pdf_itinerary: data.pdf_itinerary || null,
        pdf_terms: data.pdf_terms || null,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        metadata: {
          breadcrumbs: data.breadcrumbs?.filter((b: string) => b.trim()) || [],
          destination_name: data.destination || null, // Store destination name temporarily
          ...data.metadata,
        },
        is_featured: data.is_featured,
        is_bestseller: data.is_bestseller,
        updated_at: new Date().toISOString(), // Update timestamp
        published_at: data.status === 'published' && !data.published_at ? new Date().toISOString() : data.published_at,
      })
      .eq('id', tourId)
      .select()
      .single();

    if (tourError) {
      console.error('Tour update error:', tourError);
      return NextResponse.json(
        { error: 'Failed to update tour: ' + tourError.message },
        { status: 500 }
      );
    }

    // Delete existing itinerary, essentials, inclusions
    await supabaseAdmin.from('tour_itinerary').delete().eq('tour_id', tourId);
    await supabaseAdmin.from('tour_essentials').delete().eq('tour_id', tourId);
    await supabaseAdmin.from('tour_inclusions').delete().eq('tour_id', tourId);

    // Insert new itinerary
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
        tour_id: tourId,
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

      await supabaseAdmin.from('tour_itinerary').insert(itineraryData);
    }

    // Insert new essentials
    if (data.essentials && data.essentials.length > 0) {
      const essentialsData = data.essentials.map((essential: { category: string; items: string[] }, index: number) => ({
        tour_id: tourId,
        category: essential.category,
        items: essential.items,
        display_order: index + 1,
      }));

      await supabaseAdmin.from('tour_essentials').insert(essentialsData);
    }

    // Insert new inclusions
    if (data.inclusions && data.inclusions.length > 0) {
      const inclusionsData = data.inclusions.map((inclusion: { type: string; item: string; description?: string }, index: number) => ({
        tour_id: tourId,
        type: inclusion.type,
        item: inclusion.item,
        description: inclusion.description || null,
        display_order: index + 1,
      }));

      await supabaseAdmin.from('tour_inclusions').insert(inclusionsData);
    }

    return NextResponse.json({
      success: true,
      tour,
      message: 'Tour updated successfully',
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tourId } = await params;

    // Delete related data first (CASCADE should handle this, but being explicit)
    await supabaseAdmin.from('tour_itinerary').delete().eq('tour_id', tourId);
    await supabaseAdmin.from('tour_essentials').delete().eq('tour_id', tourId);
    await supabaseAdmin.from('tour_inclusions').delete().eq('tour_id', tourId);

    // Delete tour
    const { error } = await supabaseAdmin
      .from('tours')
      .delete()
      .eq('id', tourId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete tour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
