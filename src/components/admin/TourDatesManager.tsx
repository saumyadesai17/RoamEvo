'use client';

import { useState, useEffect, useCallback } from 'react';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';

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

interface TourDatesManagerProps {
  tourId: string;
}

export default function TourDatesManager({ tourId }: TourDatesManagerProps) {
  const [dates, setDates] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDate, setEditingDate] = useState<TourDate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    title: '',
    message: '',
    variant: 'info'
  });
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    available_slots: 15,
    price: '',
    is_guaranteed: false,
  });

  const fetchTourDates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tours/${tourId}/dates`);
      const result = await response.json();
      
      if (result.success) {
        setDates(result.dates);
      } else {
        console.error('Failed to fetch tour dates:', result.error);
      }
    } catch (error) {
      console.error('Error fetching tour dates:', error);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchTourDates();
  }, [fetchTourDates]);

  const resetForm = () => {
    setFormData({
      start_date: '',
      end_date: '',
      available_slots: 15,
      price: '',
      is_guaranteed: false,
    });
    setEditingDate(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.start_date || !formData.end_date || !formData.available_slots) {
      setAlertState({
        show: true,
        title: 'Missing Information',
        message: 'Please fill in all required fields (Start Date, End Date, Available Slots)',
        variant: 'warning'
      });
      return;
    }

    setSaving(true);

    try {
      const url = editingDate 
        ? `/api/admin/tours/${tourId}/dates/${editingDate.id}`
        : `/api/admin/tours/${tourId}/dates`;
      
      const method = editingDate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          available_slots: parseInt(formData.available_slots.toString()),
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAlertState({
          show: true,
          title: 'Success',
          message: editingDate ? 'Tour date updated successfully!' : 'Tour date added successfully!',
          variant: 'success'
        });
        resetForm();
        fetchTourDates();
      } else {
        setAlertState({
          show: true,
          title: 'Error',
          message: result.error || 'Unknown error',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving tour date:', error);
      setAlertState({
        show: true,
        title: 'Error',
        message: 'Failed to save tour date',
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (date: TourDate) => {
    // Extract just the date part (YYYY-MM-DD) from ISO string
    const startDate = date.start_date.split('T')[0];
    const endDate = date.end_date.split('T')[0];
    
    setFormData({
      start_date: startDate,
      end_date: endDate,
      available_slots: date.available_slots,
      price: date.price?.toString() || '',
      is_guaranteed: date.is_guaranteed,
    });
    setEditingDate(date);
    setShowAddForm(true);
  };

  const handleDelete = async (dateId: string) => {
    setDateToDelete(dateId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!dateToDelete) return;
    
    setShowConfirm(false);

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/dates/${dateToDelete}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setAlertState({
          show: true,
          title: 'Success',
          message: 'Tour date deleted successfully!',
          variant: 'success'
        });
        fetchTourDates();
      } else {
        setAlertState({
          show: true,
          title: 'Error',
          message: result.error || 'Unknown error',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting tour date:', error);
      setAlertState({
        show: true,
        title: 'Error',
        message: 'Failed to delete tour date',
        variant: 'error'
      });
    } finally {
      setDateToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5B2D]"></div>
        <span className="ml-2 text-gray-600">Loading tour dates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Departure Dates</h3>
          <p className="text-sm text-gray-600">Manage specific departure dates and availability for this tour</p>
        </div>
        {dates.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Departure Date
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Departure Date
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingDate ? 'Edit Departure Date' : 'Add New Departure Date'}
          </h4>
          
          <div 
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !saving) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Slots *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.available_slots}
                  onChange={(e) => setFormData({ ...formData, available_slots: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Override (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                  placeholder="Leave empty to use base price"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_guaranteed}
                  onChange={(e) => setFormData({ ...formData, is_guaranteed: e.target.checked })}
                  className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                />
                <span className="text-sm font-medium text-gray-700">Guaranteed Departure</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">This trip will depart regardless of bookings</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (editingDate ? 'Update Date' : 'Add Date')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dates List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {dates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No departure dates yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              Create specific departure dates to allow customers to book this tour. Each date can have its own availability and pricing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dates.map((date) => (
                  <tr key={date.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(date.start_date)} - {formatDate(date.end_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(date.start_date) < new Date() ? 'Past' : 'Upcoming'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateDuration(date.start_date, date.end_date)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {date.booked_slots} / {date.available_slots}
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.available_slots - date.booked_slots} slots left
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {date.price ? `₹${date.price.toLocaleString()}` : 'Base price'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {date.is_guaranteed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Guaranteed
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          new Date(date.start_date) < new Date() 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {new Date(date.start_date) < new Date() ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(date)}
                          className="text-[#4A5B2D] hover:text-[#3d4a24]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(date.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setDateToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Departure Date?"
        message="Are you sure you want to delete this departure date? This action cannot be undone."
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