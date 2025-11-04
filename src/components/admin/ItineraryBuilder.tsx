'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload';

export interface ItineraryDay {
  day_number: number;
  title: string;
  description: string;
  mood?: string;
  activities: string[]; // Will be converted to { list: [...] } in API
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  accommodation?: string; // Will be converted to { name: "..." } in API
  images: string[];
}

interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  totalDays: number;
}

export default function ItineraryBuilder({ value, onChange, totalDays }: ItineraryBuilderProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Initialize days if empty
  useEffect(() => {
    if (value.length === 0 && totalDays > 0) {
      const newDays: ItineraryDay[] = Array.from({ length: totalDays }, (_, i) => ({
        day_number: i + 1,
        title: `Day ${i + 1}`,
        description: '',
        mood: '',
        activities: [''],
        meals: { breakfast: false, lunch: false, dinner: false },
        accommodation: '',
        images: [],
      }));
      onChange(newDays);
    }
  }, [totalDays, value.length, onChange]);

  // Update a specific day
  const updateDay = (dayIndex: number, updates: Partial<ItineraryDay>) => {
    const newDays = [...value];
    newDays[dayIndex] = { ...newDays[dayIndex], ...updates };
    onChange(newDays);
  };

  // Add activity to a day
  const addActivity = (dayIndex: number) => {
    const newDays = [...value];
    newDays[dayIndex].activities.push('');
    onChange(newDays);
  };

  // Remove activity from a day
  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...value];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    onChange(newDays);
  };

  // Update activity
  const updateActivity = (dayIndex: number, activityIndex: number, activityValue: string) => {
    const newDays = [...value];
    newDays[dayIndex].activities[activityIndex] = activityValue;
    onChange(newDays);
  };

  const handleGenerateDays = () => {
    if (totalDays > 0) {
      const newDays: ItineraryDay[] = Array.from({ length: totalDays }, (_, i) => ({
        day_number: i + 1,
        title: `Day ${i + 1}`,
        description: '',
        mood: '',
        activities: [''],
        meals: { breakfast: false, lunch: false, dinner: false },
        accommodation: '',
        images: [],
      }));
      onChange(newDays);
    }
  };

  // Add a new day to the itinerary
  const addNewDay = () => {
    const newDayNumber = value.length + 1;
    const newDay: ItineraryDay = {
      day_number: newDayNumber,
      title: `Day ${newDayNumber}`,
      description: '',
      mood: '',
      activities: [''],
      meals: { breakfast: false, lunch: false, dinner: false },
      accommodation: '',
      images: [],
    };
    onChange([...value, newDay]);
    // Auto-expand the newly added day
    setExpandedDay(value.length);
  };

  // Remove a specific day and renumber remaining days
  const removeDay = (dayIndex: number) => {
    if (window.confirm(`Are you sure you want to remove Day ${dayIndex + 1}? This action cannot be undone.`)) {
      const newDays = value
        .filter((_, index) => index !== dayIndex)
        .map((day, index) => ({
          ...day,
          day_number: index + 1,
          title: day.title.startsWith('Day ') ? `Day ${index + 1}` : day.title,
        }));
      onChange(newDays);
      // Close expanded day if it was the one removed
      if (expandedDay === dayIndex) {
        setExpandedDay(null);
      } else if (expandedDay !== null && expandedDay > dayIndex) {
        setExpandedDay(expandedDay - 1);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Day-by-Day Itinerary</h3>
          <p className="text-sm text-gray-600">
            Plan each day of your {totalDays}-day tour {value.length > 0 && `(${value.length} day${value.length !== 1 ? 's' : ''} added)`}
          </p>
        </div>
        <div className="flex gap-2">
          {value.length === 0 && totalDays > 0 && (
            <button
              type="button"
              onClick={handleGenerateDays}
              className="px-4 py-2 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors text-sm font-medium"
            >
              Generate {totalDays} Days
            </button>
          )}
          {value.length > 0 && value.length < totalDays && (
            <button
              type="button"
              onClick={addNewDay}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Day {value.length + 1}
            </button>
          )}
        </div>
      </div>

      {value.length > 0 ? (
        <div className="space-y-3">
          {value.map((day, dayIndex) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              {/* Day Header */}
              <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                  className="flex items-center gap-4 flex-1 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#4A5B2D] text-white flex items-center justify-center font-medium">
                    {day.day_number}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{day.title || `Day ${day.day_number}`}</h4>
                    {day.mood && <p className="text-sm text-gray-500">{day.mood}</p>}
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove this day"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                    className="p-1"
                  >
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedDay === dayIndex ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Day Content */}
              {expandedDay === dayIndex && (
                <div className="px-6 pb-6 space-y-6 border-t border-gray-100">
                  {/* Title & Mood */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Day Title</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="e.g., Journey to Auli"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Mood</label>
                      <input
                        type="text"
                        value={day.mood || ''}
                        onChange={(e) => updateDay(dayIndex, { mood: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                        placeholder="e.g., Adventure & Scenic"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                    <RichTextEditor
                      content={day.description}
                      onChange={(html) => updateDay(dayIndex, { description: html })}
                      placeholder="Describe what happens on this day..."
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Activities</label>
                    <div className="space-y-2">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => updateActivity(dayIndex, actIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                            placeholder={`Activity ${actIndex + 1}`}
                          />
                          {day.activities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeActivity(dayIndex, actIndex)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="text-sm text-[#4A5B2D] hover:underline font-medium"
                      >
                        + Add Activity
                      </button>
                    </div>
                  </div>

                  {/* Meals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Meals Included</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.meals.breakfast}
                          onChange={(e) =>
                            updateDay(dayIndex, {
                              meals: { ...day.meals, breakfast: e.target.checked },
                            })
                          }
                          className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                        />
                        <span className="text-sm text-gray-700">Breakfast</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.meals.lunch}
                          onChange={(e) =>
                            updateDay(dayIndex, {
                              meals: { ...day.meals, lunch: e.target.checked },
                            })
                          }
                          className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                        />
                        <span className="text-sm text-gray-700">Lunch</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.meals.dinner}
                          onChange={(e) =>
                            updateDay(dayIndex, {
                              meals: { ...day.meals, dinner: e.target.checked },
                            })
                          }
                          className="w-4 h-4 text-[#4A5B2D] border-gray-300 rounded focus:ring-[#4A5B2D]"
                        />
                        <span className="text-sm text-gray-700">Dinner</span>
                      </label>
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Accommodation</label>
                    <input
                      type="text"
                      value={day.accommodation || ''}
                      onChange={(e) => updateDay(dayIndex, { accommodation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                      placeholder="e.g., Hotel in Auli, Camping in Chopta"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <ImageGalleryUpload
                      value={day.images}
                      onChange={(urls) => updateDay(dayIndex, { images: urls })}
                      bucket="itinerary-images"
                      label={`Day ${day.day_number} Images`}
                      maxImages={5}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No itinerary days created yet</p>
          <p className="text-sm text-gray-500">Set the tour duration first, then generate the itinerary</p>
        </div>
      )}
    </div>
  );
}
