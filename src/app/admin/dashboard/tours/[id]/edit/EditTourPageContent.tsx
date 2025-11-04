'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload';
import PDFUpload from '@/components/admin/PDFUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ItineraryBuilder from '@/components/admin/ItineraryBuilder';
import EssentialsManager from '@/components/admin/EssentialsManager';
import InclusionsManager from '@/components/admin/InclusionsManager';
import TourDatesManager from '@/components/admin/TourDatesManager';
import AlertDialog from '@/components/admin/AlertDialog';

interface ItineraryDay {
  day_number: number;
  title: string;
  description: string;
  mood?: string;
  activities: string[];
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  accommodation?: string;
  images: string[];
}

interface Essential {
  category: 'carry' | 'know' | 'tips';
  items: string[];
}

interface Inclusion {
  type: 'inclusion' | 'exclusion';
  item: string;
  description?: string;
}

interface EditTourPageContentProps {
  tourId: string;
}

export default function EditTourPageContent({ tourId }: EditTourPageContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    title: '',
    message: '',
    variant: 'info'
  });
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    destination: '',
    category: 'domestic',
    status: 'draft',
    difficulty_level: 'moderate',
    overview: '',
    highlights: [''],
    duration_days: 0,
    duration_nights: 0,
    group_size_min: 1,
    group_size_max: 20,
    min_age: 10,
    max_age: 60,
    base_price: 0,
    currency: 'INR',
    adventure_level: 5,
    spiritual_level: 5,
    chill_level: 5,
    nature_level: 5,
    cultural_level: 5,
    cover_image: '',
    gallery_images: [] as string[],
    pdf_itinerary: '',
    pdf_terms: '',
    seo_title: '',
    seo_description: '',
    metadata: {},
    breadcrumbs: [''],
    is_featured: false,
    is_bestseller: false,
    itinerary: [] as ItineraryDay[],
    essentials: [] as Essential[],
    inclusions: [] as Inclusion[],
  });

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`/api/admin/tours/${tourId}`);
        const result = await response.json();
        
        if (result.success && result.tour) {
          const tour = result.tour;
          setFormData({
            title: tour.title || '',
            slug: tour.slug || '',
            destination: tour.destination || '',
            category: tour.category || 'domestic',
            status: tour.status || 'draft',
            difficulty_level: tour.difficulty_level || 'moderate',
            overview: tour.overview || '',
            highlights: tour.highlights?.length > 0 ? tour.highlights : [''],
            duration_days: tour.duration_days || 0,
            duration_nights: tour.duration_nights || 0,
            group_size_min: tour.group_size_min || 1,
            group_size_max: tour.group_size_max || 20,
            min_age: tour.min_age || 10,
            max_age: tour.max_age || 60,
            base_price: tour.base_price || 0,
            currency: tour.currency || 'INR',
            adventure_level: tour.adventure_level ?? 0,
            spiritual_level: tour.spiritual_level ?? 0,
            chill_level: tour.chill_level ?? 0,
            nature_level: tour.nature_level ?? 0,
            cultural_level: tour.cultural_level ?? 0,
            cover_image: tour.cover_image || '',
            gallery_images: tour.gallery_images || [],
            pdf_itinerary: tour.pdf_itinerary || '',
            pdf_terms: tour.pdf_terms || '',
            seo_title: tour.seo_title || '',
            seo_description: tour.seo_description || '',
            metadata: tour.metadata || {},
            breadcrumbs: tour.metadata?.breadcrumbs?.length > 0 ? tour.metadata.breadcrumbs : [''],
            is_featured: tour.is_featured || false,
            is_bestseller: tour.is_bestseller || false,
            itinerary: tour.itinerary?.map((day: { 
              day_number: number; 
              title: string; 
              description?: string; 
              mood?: string; 
              activities?: { list?: string[] }; 
              meals?: { 
                breakfast?: { included?: boolean }; 
                lunch?: { included?: boolean }; 
                dinner?: { included?: boolean } 
              }; 
              accommodation?: string | { name?: string }; 
              images?: string[] 
            }) => ({
              day_number: day.day_number,
              title: day.title,
              description: day.description || '',
              mood: day.mood || '',
              // Extract activities from JSONB { list: [...] } format
              activities: day.activities?.list || [],
              // Extract simple boolean meals from JSONB format
              meals: {
                breakfast: day.meals?.breakfast?.included || false,
                lunch: day.meals?.lunch?.included || false,
                dinner: day.meals?.dinner?.included || false,
              },
              // Extract accommodation name from JSONB format
              accommodation: typeof day.accommodation === 'string' ? day.accommodation : (day.accommodation?.name || ''),
              images: day.images || [],
            })) || [],
            // Transform essentials to match component interface (strip extra DB fields)
            essentials: (tour.essentials || []).map((ess: { category: string; items?: string[] }) => ({
              category: ess.category,
              items: ess.items || []
            })),
            // Transform inclusions - check both tour_inclusions table AND price_includes/excludes arrays
            inclusions: (() => {
              // If tour_inclusions table has data, use it
              if (tour.inclusions && tour.inclusions.length > 0) {
                return tour.inclusions.map((inc: { type: string; item: string; description?: string }) => ({
                  type: inc.type,
                  item: inc.item,
                  description: inc.description || ''
                }));
              }
              
              // Otherwise, convert from price_includes/excludes arrays (legacy format)
              const converted: Array<{ type: 'inclusion' | 'exclusion'; item: string; description: string }> = [];
              if (tour.price_includes && Array.isArray(tour.price_includes)) {
                tour.price_includes.forEach((item: string) => {
                  converted.push({
                    type: 'inclusion' as const,
                    item: item,
                    description: ''
                  });
                });
              }
              if (tour.price_excludes && Array.isArray(tour.price_excludes)) {
                tour.price_excludes.forEach((item: string) => {
                  converted.push({
                    type: 'exclusion' as const,
                    item: item,
                    description: ''
                  });
                });
              }
              return converted;
            })(),
          });
        } else {
          setAlertState({
            show: true,
            title: 'Error',
            message: 'Failed to load tour',
            variant: 'error'
          });
          setTimeout(() => router.push('/admin/dashboard/tours'), 1500);
        }
      } catch (error) {
        console.error('Error loading tour:', error);
        setAlertState({
          show: true,
          title: 'Error',
          message: 'Failed to load tour',
          variant: 'error'
        });
        setTimeout(() => router.push('/admin/dashboard/tours'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up essentials data before sending
      const cleanedEssentials = formData.essentials.map(essential => ({
        ...essential,
        items: essential.items.filter(item => item.trim()) // Remove empty items
      })).filter(essential => essential.items.length > 0); // Remove categories with no items

      const submitData = {
        ...formData,
        essentials: cleanedEssentials
      };

      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        setAlertState({
          show: true,
          title: 'Success',
          message: 'Tour updated successfully!',
          variant: 'success'
        });
        setTimeout(() => router.push('/admin/dashboard/tours'), 1500);
      } else {
        setAlertState({
          show: true,
          title: 'Error',
          message: result.error || 'Unknown error',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      setAlertState({
        show: true,
        title: 'Error',
        message: 'Failed to update tour',
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const newArray = [...(formData[field as keyof typeof formData] as string[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddArrayItem = (field: string) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field as keyof typeof formData] as string[]), ''],
    });
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const newArray = (formData[field as keyof typeof formData] as string[]).filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'description', label: 'Description' },
    { id: 'pricing', label: 'Pricing & Details' },
    { id: 'media', label: 'Media' },
    { id: 'features', label: 'Features' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'essentials', label: 'Essentials' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'dates', label: 'Departure Dates' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A5B2D] mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium" style={{ fontFamily: 'Gideon Roman' }}>Loading tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
              Edit Tour
            </h1>
            <p className="text-gray-700" style={{ fontFamily: 'Gideon Roman' }}>
              Update tour information and publish when ready
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard/tours')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded hover:bg-gray-50 font-medium"
            style={{ fontFamily: 'Gideon Roman' }}
          >
            Cancel
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#4A5B2D] text-[#4A5B2D] bg-green-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Montserrat' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Tour Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                    style={{ fontFamily: 'Gideon Roman' }}
                    placeholder="e.g., Uttarakhand Adventure Trek"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                    style={{ fontFamily: 'Gideon Roman' }}
                    placeholder="e.g., uttarakhand-adventure-trek"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                    style={{ fontFamily: 'Gideon Roman' }}
                    placeholder="e.g., Uttarakhand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      style={{ fontFamily: 'Gideon Roman' }}
                    >
                      <option value="domestic">Domestic</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      style={{ fontFamily: 'Gideon Roman' }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Difficulty Level *
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                    style={{ fontFamily: 'Gideon Roman' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="difficult">Difficult</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Breadcrumbs
                  </label>
                  {formData.breadcrumbs.map((breadcrumb, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={breadcrumb}
                        onChange={(e) => handleArrayChange('breadcrumbs', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                        placeholder="e.g., Uttarakhand Tours"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('breadcrumbs', index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        style={{ fontFamily: 'Gideon Roman' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('breadcrumbs')}
                    className="text-[#4A5B2D] hover:underline text-sm"
                    style={{ fontFamily: 'Gideon Roman' }}
                  >
                    + Add Breadcrumb
                  </button>
                </div>
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Tour Overview *
                  </label>
                  <RichTextEditor
                    content={formData.overview}
                    onChange={(html) => setFormData({ ...formData, overview: html })}
                    placeholder="Write a compelling overview of the tour..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Highlights
                  </label>
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                        style={{ fontFamily: 'Gideon Roman' }}
                        placeholder="e.g., Visit to Kedarnath Temple"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('highlights', index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        style={{ fontFamily: 'Gideon Roman' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('highlights')}
                    className="text-[#4A5B2D] hover:underline text-sm"
                    style={{ fontFamily: 'Gideon Roman' }}
                  >
                    + Add Highlight
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                    style={{ fontFamily: 'Gideon Roman' }}
                    placeholder="SEO-friendly title (recommended: 50-60 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                    style={{ fontFamily: 'Gideon Roman' }}
                    placeholder="SEO meta description (recommended: 150-160 characters)"
                  />
                </div>
              </div>
            )}

            {/* Pricing & Details Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration_days || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Duration (Nights) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.duration_nights || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_nights: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Base Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.base_price || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Currency *
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Min Group Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.group_size_min || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, group_size_min: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Max Group Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.group_size_max || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, group_size_max: parseInt(e.target.value) || 20 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_age || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, min_age: parseInt(e.target.value) || 10 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                      Maximum Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_age || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, max_age: parseInt(e.target.value) || 60 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent"
                      style={{ fontFamily: 'Gideon Roman' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Cover Image *
                  </label>
                  <ImageUpload
                    value={formData.cover_image}
                    onChange={(url: string) => setFormData({ ...formData, cover_image: url })}
                    bucket="tour-images"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Gallery Images
                  </label>
                  <ImageGalleryUpload
                    value={formData.gallery_images}
                    onChange={(urls: string[]) => setFormData({ ...formData, gallery_images: urls })}
                    bucket="tour-images"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Tour Itinerary PDF
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Upload a detailed PDF itinerary for customers to download</p>
                  <PDFUpload
                    value={formData.pdf_itinerary}
                    onChange={(url: string) => setFormData({ ...formData, pdf_itinerary: url })}
                    bucket="tour-documents"
                    label="Upload Itinerary PDF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Terms & Conditions PDF
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Upload terms and conditions document</p>
                  <PDFUpload
                    value={formData.pdf_terms}
                    onChange={(url: string) => setFormData({ ...formData, pdf_terms: url })}
                    bucket="tour-documents"
                    label="Upload Terms PDF"
                  />
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                    />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat' }}>
                      Featured Tour
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                    />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat' }}>
                      Bestseller
                    </span>
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Trip Vibe Check (1-5 rating)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Gideon Roman' }}>
                    Rate each vibe from 1 to 5. Set to 0 to hide that vibe.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        🔥 Adventure Level (1-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.adventure_level || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, adventure_level: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        🌲 Nature Level (1-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.nature_level || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, nature_level: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        🙏 Spiritual Level (1-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.spiritual_level || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, spiritual_level: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        😎 Chill Level (1-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.chill_level || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, chill_level: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat' }}>
                        🏛️ Cultural Level (1-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.cultural_level || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, cultural_level: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        style={{ fontFamily: 'Gideon Roman' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <div>
                <ItineraryBuilder
                  value={formData.itinerary}
                  onChange={(itinerary: ItineraryDay[]) => setFormData({ ...formData, itinerary })}
                  totalDays={formData.duration_days}
                />
              </div>
            )}

            {/* Essentials Tab */}
            {activeTab === 'essentials' && (
              <div>
                <EssentialsManager
                  value={formData.essentials}
                  onChange={(essentials: Essential[]) => setFormData({ ...formData, essentials })}
                />
              </div>
            )}

            {/* Inclusions Tab */}
            {activeTab === 'inclusions' && (
              <div>
                <InclusionsManager
                  value={formData.inclusions}
                  onChange={(inclusions: Inclusion[]) => setFormData({ ...formData, inclusions })}
                />
              </div>
            )}

            {/* Departure Dates Tab */}
            {activeTab === 'dates' && (
              <div>
                <TourDatesManager tourId={tourId} />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/tours')}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-900 font-medium rounded hover:bg-gray-50"
              style={{ fontFamily: 'Gideon Roman' }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#4A5B2D] text-white font-medium rounded hover:bg-[#3d4a24] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat' }}
            >
              {saving ? 'Saving...' : 'Update Tour'}
            </button>
          </div>
        </form>
      </div>

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
