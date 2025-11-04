'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/Admin/RichTextEditor';
import ImageUpload from '@/components/Admin/ImageUpload';
import ImageGalleryUpload from '@/components/Admin/ImageGalleryUpload';
import ItineraryBuilder, { type ItineraryDay } from '@/components/Admin/ItineraryBuilder';
import EssentialsManager, { type Essential } from '@/components/Admin/EssentialsManager';
import InclusionsManager, { type Inclusion } from '@/components/Admin/InclusionsManager';

type TourStatus = 'draft' | 'published' | 'archived' | 'sold_out';
type TourCategory = 'domestic' | 'international' | 'adventure' | 'spiritual' | 'cultural' | 'beach' | 'mountain' | 'desert' | 'wildlife';
type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'difficult' | 'extreme';

// Initial form state
const initialFormData = {
  // Basic Info
  title: '',
  slug: '',
  destination: '',
  category: 'domestic' as TourCategory,
  status: 'draft' as TourStatus,
  difficulty_level: 'moderate' as DifficultyLevel,
  
  // Description
  overview: '',
  highlights: [''],
  
  // Duration & Group
  duration_days: 5,
  duration_nights: 4,
  group_size_min: 4,
  group_size_max: 15,
  min_age: 10,
  max_age: 60,
  
  // Pricing
  base_price: 0,
  currency: 'INR',
  
  // Trip Vibes (1-5)
  adventure_level: 3,
  spiritual_level: 3,
  chill_level: 3,
  nature_level: 3,
  cultural_level: 3,
  
  // Media
  cover_image: '',
  gallery_images: [] as string[],
  
  // Itinerary, Essentials, Inclusions
  itinerary: [] as ItineraryDay[],
  essentials: [] as Essential[],
  inclusions: [] as Inclusion[],
  
  // Features
  is_featured: false,
  is_bestseller: false,
  
  // SEO
  seo_title: '',
  seo_description: '',
  
  // Breadcrumbs
  breadcrumbs: ['Home', 'Tours'],
};

export default function CreateTourPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState<'basic' | 'description' | 'pricing' | 'media' | 'itinerary' | 'essentials' | 'inclusions' | 'features'>('basic');
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  // Handle highlight changes
  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Handle breadcrumb changes
  const handleBreadcrumbChange = (index: number, value: string) => {
    const newBreadcrumbs = [...formData.breadcrumbs];
    newBreadcrumbs[index] = value;
    setFormData(prev => ({ ...prev, breadcrumbs: newBreadcrumbs }));
  };

  const addBreadcrumb = () => {
    setFormData(prev => ({ ...prev, breadcrumbs: [...prev.breadcrumbs, ''] }));
  };

  const removeBreadcrumb = (index: number) => {
    if (formData.breadcrumbs.length > 1) {
      setFormData(prev => ({
        ...prev,
        breadcrumbs: prev.breadcrumbs.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.slug || !formData.overview) {
      alert('Please fill in all required fields (Title, Slug, Overview)');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          metadata: {
            breadcrumbs: formData.breadcrumbs.filter(b => b.trim()),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tour');
      }

      const data = await response.json();
      alert('Tour created successfully!');
      router.push(`/admin/dashboard/tours/${data.tour.id}/edit`);
    } catch (error) {
      console.error('Error creating tour:', error);
      alert('Failed to create tour. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'description', label: 'Description', icon: '📄' },
    { id: 'pricing', label: 'Pricing & Group', icon: '💰' },
    { id: 'itinerary', label: 'Itinerary', icon: '📅' },
    { id: 'essentials', label: 'Essentials', icon: '🎒' },
    { id: 'inclusions', label: 'Inclusions', icon: '✓' },
    { id: 'media', label: 'Images', icon: '🖼️' },
    { id: 'features', label: 'Features & SEO', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light font-[family-name:var(--font-montserrat)] text-gray-900 mb-2">
            Create New Tour
          </h1>
          <p className="text-gray-600">Fill in the details below to create a new tour package</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#4A5B2D] border-b-2 border-[#4A5B2D] bg-[#4A5B2D]/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Tour Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="e.g., Uttarakhand Adventure 2025"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="uttarakhand-adventure-2025"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be the URL: /tours/{formData.slug || 'your-slug'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Destination <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="e.g., Uttarakhand, Bali, Ladakh"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Location shown on tour cards
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'domestic' | 'international' | 'adventure' | 'spiritual' | 'cultural' | 'beach' | 'mountain' | 'desert' | 'wildlife' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="domestic">Domestic</option>
                        <option value="international">International</option>
                        <option value="adventure">Adventure</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="cultural">Cultural</option>
                        <option value="beach">Beach</option>
                        <option value="mountain">Mountain</option>
                        <option value="desert">Desert</option>
                        <option value="wildlife">Wildlife</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={formData.difficulty_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value as 'easy' | 'moderate' | 'challenging' | 'difficult' | 'extreme' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                        <option value="difficult">Difficult</option>
                        <option value="extreme">Extreme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' | 'sold_out' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                        <option value="sold_out">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  {/* Breadcrumbs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Breadcrumbs (Navigation Trail)
                    </label>
                    <div className="space-y-2">
                      {formData.breadcrumbs.map((breadcrumb, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={breadcrumb}
                            onChange={(e) => handleBreadcrumbChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                            placeholder={`Breadcrumb ${index + 1}`}
                          />
                          {formData.breadcrumbs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBreadcrumb(index)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBreadcrumb}
                        className="px-4 py-2 text-[#4A5B2D] hover:bg-[#4A5B2D]/5 rounded-lg transition-colors text-sm font-medium"
                      >
                        + Add Breadcrumb
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Example: Home → Tours → Uttarakhand → Adventure Package
                    </p>
                  </div>
                </div>
              )}

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tour Overview <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Write a compelling description of your tour. Use the formatting toolbar to make it look great!
                    </p>
                    <RichTextEditor
                      content={formData.overview}
                      onChange={(html) => setFormData(prev => ({ ...prev, overview: html }))}
                      placeholder="Describe the tour experience, what makes it special, what travelers can expect..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tour Highlights
                    </label>
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleHighlightChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                            placeholder={`Highlight ${index + 1}`}
                          />
                          {formData.highlights.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHighlight(index)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addHighlight}
                        className="px-4 py-2 text-[#4A5B2D] hover:bg-[#4A5B2D]/5 rounded-lg transition-colors text-sm font-medium"
                      >
                        + Add Highlight
                      </button>
                    </div>
                  </div>

                  {/* Trip Vibes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                      Trip Vibes (Rate 1-5)
                    </label>
                    <div className="space-y-4">
                      {[
                        { key: 'adventure_level', label: 'Adventure', emoji: '🏔️' },
                        { key: 'spiritual_level', label: 'Spiritual', emoji: '🕉️' },
                        { key: 'chill_level', label: 'Chill', emoji: '😌' },
                        { key: 'nature_level', label: 'Nature', emoji: '🌿' },
                        { key: 'cultural_level', label: 'Cultural', emoji: '🎭' },
                      ].map(vibe => (
                        <div key={vibe.key} className="flex items-center gap-4">
                          <span className="text-2xl w-8">{vibe.emoji}</span>
                          <span className="w-24 text-sm font-medium text-gray-900">{vibe.label}</span>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData[vibe.key as 'adventure_level' | 'spiritual_level' | 'chill_level' | 'nature_level' | 'cultural_level']}
                            onChange={(e) => setFormData(prev => ({ ...prev, [vibe.key]: parseInt(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="w-8 text-center font-medium text-[#4A5B2D]">
                            {formData[vibe.key as 'adventure_level' | 'spiritual_level' | 'chill_level' | 'nature_level' | 'cultural_level']}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Base Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.base_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="12999"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_days || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Duration (Nights)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_nights || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_nights: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Min Group Size
                      </label>
                      <input
                        type="number"
                        value={formData.group_size_min || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, group_size_min: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Max Group Size
                      </label>
                      <input
                        type="number"
                        value={formData.group_size_max || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, group_size_max: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Minimum Age
                      </label>
                      <input
                        type="number"
                        value={formData.min_age || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_age: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Maximum Age
                      </label>
                      <input
                        type="number"
                        value={formData.max_age || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_age: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === 'itinerary' && (
                <ItineraryBuilder
                  value={formData.itinerary}
                  onChange={(days) => setFormData(prev => ({ ...prev, itinerary: days }))}
                  totalDays={formData.duration_days}
                />
              )}

              {/* Essentials Tab */}
              {activeTab === 'essentials' && (
                <EssentialsManager
                  value={formData.essentials}
                  onChange={(essentials) => setFormData(prev => ({ ...prev, essentials }))}
                />
              )}

              {/* Inclusions Tab */}
              {activeTab === 'inclusions' && (
                <InclusionsManager
                  value={formData.inclusions}
                  onChange={(inclusions) => setFormData(prev => ({ ...prev, inclusions }))}
                />
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  <ImageUpload
                    value={formData.cover_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
                    bucket="tour-images"
                    label="Cover Image (Main tour image)"
                  />

                  <div className="border-t border-gray-200 pt-8">
                    <ImageGalleryUpload
                      value={formData.gallery_images}
                      onChange={(urls) => setFormData(prev => ({ ...prev, gallery_images: urls }))}
                      bucket="tour-images"
                      label="Gallery Images (Multiple images for tour gallery)"
                      maxImages={10}
                    />
                  </div>
                </div>
              )}

              {/* Features & SEO Tab */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                      Tour Features
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-5 h-5 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                        />
                        <span className="text-gray-900">Featured Tour (Show on homepage)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_bestseller}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                          className="w-5 h-5 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                        />
                        <span className="text-gray-900">Bestseller (Mark as popular)</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-900 mb-4">
                      SEO Settings
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          value={formData.seo_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                          placeholder="Leave empty to use tour title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          SEO Description
                        </label>
                        <textarea
                          value={formData.seo_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                          rows={3}
                          placeholder="Brief description for search engines (150-160 characters recommended)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.seo_description.length}/160 characters
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                className="px-6 py-3 border border-[#4A5B2D] text-[#4A5B2D] rounded-lg hover:bg-[#4A5B2D]/5 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="submit"
                disabled={saving}
                onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                className="px-6 py-3 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Tour'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
