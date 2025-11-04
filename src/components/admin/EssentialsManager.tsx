'use client';

import { useState } from 'react';

export interface Essential {
  category: 'carry' | 'know' | 'tips';
  items: string[];
}

interface EssentialsManagerProps {
  value: Essential[];
  onChange: (essentials: Essential[]) => void;
}

export default function EssentialsManager({ value, onChange }: EssentialsManagerProps) {
  const [activeTab, setActiveTab] = useState<'carry' | 'know' | 'tips'>('carry');

  const categories = [
    { id: 'carry' as const, label: 'Things to Carry', icon: '🎒' },
    { id: 'know' as const, label: 'Good to Know', icon: '💡' },
    { id: 'tips' as const, label: 'Travel Tips', icon: '✨' },
  ];

  // Get items for current category
  const getCurrentItems = () => {
    const essential = value.find((e) => e.category === activeTab);
    return essential?.items || [''];
  };

  // Update items for current category
  const updateItems = (items: string[]) => {
    const newEssentials = value.filter((e) => e.category !== activeTab);
    if (items.some((item) => item.trim())) {
      newEssentials.push({
        category: activeTab,
        items: items.filter((item) => item.trim()),
      });
    }
    onChange(newEssentials);
  };

  // Add new item
  const addItem = () => {
    const currentItems = getCurrentItems();
    updateItems([...currentItems, '']);
  };

  // Remove item
  const removeItem = (index: number) => {
    const currentItems = getCurrentItems();
    updateItems(currentItems.filter((_, i) => i !== index));
  };

  // Update specific item
  const updateItem = (index: number, value: string) => {
    const currentItems = getCurrentItems();
    const newItems = [...currentItems];
    newItems[index] = value;
    updateItems(newItems);
  };

  const currentItems = getCurrentItems();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tour Essentials</h3>
        <p className="text-sm text-gray-600">Add important information for travelers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === cat.id
                ? 'text-[#4A5B2D] border-[#4A5B2D]'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-3">
          {currentItems.map((item, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-gray-400 font-medium">
                {index + 1}.
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900"
                placeholder={`Enter ${categories.find((c) => c.id === activeTab)?.label.toLowerCase()} item...`}
              />
              {currentItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 px-4 py-2 text-[#4A5B2D] hover:bg-[#4A5B2D]/5 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = value.find((e) => e.category === cat.id)?.items.length || 0;
          return (
            <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
              </div>
              <p className="text-2xl font-light text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">items</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
