import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/tours/[id]/dates/[dateId] - Update specific tour date
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dateId: string }> }
) {
  try {
    const { id: tourId, dateId } = await params;
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

    // Check for overlapping dates (excluding current date)
    const { data: existingDates } = await supabaseAdmin
      .from('tour_dates')
      .select('id, start_date, end_date')
      .eq('tour_id', tourId)
      .eq('is_active', true)
      .neq('id', dateId);

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

    // Update tour date
    const { data: updatedTourDate, error } = await supabaseAdmin
      .from('tour_dates')
      .update({
        start_date: data.start_date,
        end_date: data.end_date,
        available_slots: parseInt(data.available_slots),
        price: data.price ? parseFloat(data.price) : null,
        is_guaranteed: data.is_guaranteed || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dateId)
      .eq('tour_id', tourId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tour date:', error);
      return NextResponse.json(
        { error: 'Failed to update tour date: ' + error.message },
        { status: 500 }
      );
    }

    if (!updatedTourDate) {
      return NextResponse.json(
        { error: 'Tour date not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      date: updatedTourDate,
    });
  } catch (error) {
    console.error('Error in tour date PUT route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tours/[id]/dates/[dateId] - Delete specific tour date
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dateId: string }> }
) {
  try {
    const { id: tourId, dateId } = await params;

    // Check if there are any bookings for this date
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('tour_date_id', dateId)
      .neq('status', 'cancelled');

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tour date with existing bookings. Cancel bookings first.' },
        { status: 400 }
      );
    }

    // Soft delete (set is_active to false)
    const { data: deletedTourDate, error } = await supabaseAdmin
      .from('tour_dates')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dateId)
      .eq('tour_id', tourId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting tour date:', error);
      return NextResponse.json(
        { error: 'Failed to delete tour date: ' + error.message },
        { status: 500 }
      );
    }

    if (!deletedTourDate) {
      return NextResponse.json(
        { error: 'Tour date not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tour date deleted successfully',
    });
  } catch (error) {
    console.error('Error in tour date DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}