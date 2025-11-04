'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AlertDialog from '@/components/admin/AlertDialog';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Tour {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  base_price: number;
  duration_days: number;
  views_count: number;
  created_at: string;
  metadata?: {
    destination_name?: string;
    [key: string]: unknown;
  };
  destination?: {
    name: string;
  };
}

export default function ToursListPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    title: '',
    message: '',
    variant: 'info'
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const query = supabase
        .from('tours')
        .select(`
          id,
          title,
          slug,
          category,
          status,
          base_price,
          duration_days,
          views_count,
          created_at,
          metadata,
          destination:destinations(name)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match Tour interface
      const transformedData = (data || []).map(tour => ({
        ...tour,
        destination: Array.isArray(tour.destination) && tour.destination.length > 0 
          ? tour.destination[0] 
          : undefined
      }));
      
      setTours(transformedData as Tour[]);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tours/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setTours(tours.filter(t => t.id !== id));
        setDeleteConfirm(null);
        setAlertState({
          show: true,
          title: 'Success',
          message: 'Tour deleted successfully',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to delete tour');
      }
    } catch (error) {
      console.error('Failed to delete tour:', error);
      setAlertState({
        show: true,
        title: 'Error',
        message: 'Failed to delete tour. Please try again.',
        variant: 'error'
      });
    }
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-50 text-green-700 border-green-200',
      draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      archived: 'bg-gray-50 text-gray-700 border-gray-200',
      sold_out: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#00000008] rounded w-1/4"></div>
        <div className="h-96 bg-[#00000008] rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-[#000000] font-(family-name:--font-montserrat)">
            Tours
          </h2>
          <p className="text-[#00000099] mt-1">
            {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'}
          </p>
        </div>
        <Link
          href="/admin/dashboard/tours/create"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#4A5B2D] text-white rounded-md hover:bg-[#3d4a24] transition-colors text-sm font-medium"
        >
          <span className="text-2xl">+</span>
          <span>New Tour</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white text-[#000000] placeholder-[#00000066] border border-[#0000001A] rounded-md focus:outline-none focus:border-[#4A5B2D] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white text-[#000000] border border-[#0000001A] rounded-md focus:outline-none focus:border-[#4A5B2D] transition-colors"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      {/* Tours Table */}
      <div className="bg-white border border-[#0000001A] rounded-lg overflow-hidden">
        {filteredTours.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#00000099]">
              {searchTerm || statusFilter !== 'all' 
                ? 'No tours found matching your filters'
                : 'No tours yet. Create your first tour to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                href="/admin/dashboard/tours/create"
                className="inline-block mt-4 text-[#4A5B2D] hover:underline"
              >
                Create your first tour →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#0000001A]">
              <thead>
                <tr className="bg-[#00000005]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#00000099] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#0000001A]">
                {filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-[#00000005] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-[#000000]">
                          {tour.title}
                        </div>
                        <div className="text-sm text-[#00000066]">
                          {tour.destination?.name || tour.metadata?.destination_name || 'No destination'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md border ${getStatusBadge(tour.status)}`}>
                        {tour.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-[#000000CC] capitalize">
                        {tour.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#000000CC]">
                      ₹{tour.base_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#000000CC]">
                      {tour.duration_days}D
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00000066]">
                      {tour.views_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/tours/${tour.slug}`}
                          target="_blank"
                          className="text-[#000000CC] hover:text-[#4A5B2D] transition-colors"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/dashboard/tours/${tour.id}/edit`}
                          className="text-[#000000CC] hover:text-[#4A5B2D] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(tour.id)}
                          className="text-[#000000CC] hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Tour"
        message="Are you sure you want to delete this tour? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertState.show}
        onClose={() => setAlertState({ ...alertState, show: false })}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
      />
    </div>
  );
}
