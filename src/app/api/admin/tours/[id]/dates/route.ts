import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/tours/[id]/dates - Get all dates for a tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tourId } = await params;

    const { data: tourDates, error } = await supabaseAdmin
      .from('tour_dates')
      .select('*')
      .eq('tour_id', tourId)
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching tour dates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tour dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dates: tourDates || [],
    });
  } catch (error) {
    console.error('Error in tour dates GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tours/[id]/dates - Add new departure date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tourId } = await params;
    const data = await request.json();

    // Validate required fields
    if (!data.start_date || !data.end_date || !data.available_slots) {
      return NextResponse.json(
        { error: 'Start date, end date, and available slots are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    // Check for overlapping dates
    const { data: existingDates } = await supabaseAdmin
      .from('tour_dates')
      .select('start_date, end_date')
      .eq('tour_id', tourId)
      .eq('is_active', true);

    const hasOverlap = existingDates?.some(existing => {
      const existingStart = new Date(existing.start_date);
      const existingEnd = new Date(existing.end_date);
      
      return (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      );
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Date range overlaps with existing departure dates' },
        { status: 400 }
      );
    }

    // Insert new tour date
    const { data: newTourDate, error } = await supabaseAdmin
      .from('tour_dates')
      .insert({
        tour_id: tourId,
        start_date: data.start_date,
        end_date: data.end_date,
        available_slots: parseInt(data.available_slots),
        price: data.price ? parseFloat(data.price) : null,
        is_guaranteed: data.is_guaranteed || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tour date:', error);
      return NextResponse.json(
        { error: 'Failed to create tour date: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      date: newTourDate,
    });
  } catch (error) {
    console.error('Error in tour dates POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}