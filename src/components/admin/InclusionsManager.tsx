'use client';

export interface Inclusion {
  type: 'inclusion' | 'exclusion';
  item: string;
  description?: string;
}

interface InclusionsManagerProps {
  value: Inclusion[];
  onChange: (inclusions: Inclusion[]) => void;
}

export default function InclusionsManager({ value, onChange }: InclusionsManagerProps) {
  const inclusions = value.filter((i) => i.type === 'inclusion');
  const exclusions = value.filter((i) => i.type === 'exclusion');

  const addInclusion = () => {
    onChange([...value, { type: 'inclusion', item: '', description: '' }]);
  };

  const addExclusion = () => {
    onChange([...value, { type: 'exclusion', item: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<Inclusion>) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange(newValue);
  };

  const getItemIndex = (item: Inclusion) => value.indexOf(item);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inclusions & Exclusions</h3>
        <p className="text-sm text-gray-600">Specify what&apos;s included and excluded in the tour price</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900">What&apos;s Included</h4>
          </div>

          <div className="space-y-3">
            {inclusions.length > 0 ? (
              inclusions.map((item) => {
                const index = getItemIndex(item);
                return (
                  <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateItem(index, { item: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900 text-sm"
                        placeholder="e.g., Accommodation"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900 text-sm"
                      placeholder="Optional description..."
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No inclusions added yet</p>
            )}
          </div>

          <button
            type="button"
            onClick={addInclusion}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#4A5B2D] hover:text-[#4A5B2D] rounded-lg transition-colors text-sm font-medium"
          >
            + Add Inclusion
          </button>
        </div>

        {/* Exclusions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900">What&apos;s Excluded</h4>
          </div>

          <div className="space-y-3">
            {exclusions.length > 0 ? (
              exclusions.map((item) => {
                const index = getItemIndex(item);
                return (
                  <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateItem(index, { item: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900 text-sm"
                        placeholder="e.g., Personal expenses"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A5B2D] focus:border-transparent bg-white text-gray-900 text-sm"
                      placeholder="Optional description..."
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No exclusions added yet</p>
            )}
          </div>

          <button
            type="button"
            onClick={addExclusion}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#4A5B2D] hover:text-[#4A5B2D] rounded-lg transition-colors text-sm font-medium"
          >
            + Add Exclusion
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex-1 text-center">
          <p className="text-2xl font-light text-green-600">{inclusions.length}</p>
          <p className="text-sm text-gray-600">Inclusions</p>
        </div>
        <div className="w-px bg-gray-300"></div>
        <div className="flex-1 text-center">
          <p className="text-2xl font-light text-red-600">{exclusions.length}</p>
          <p className="text-sm text-gray-600">Exclusions</p>
        </div>
      </div>
    </div>
  );
}
