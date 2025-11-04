import { supabase } from '@/lib/supabase';

export default async function TestPage() {
  // Test 1: Check connection
  let connectionStatus = 'Not tested';
  let tourData = null;
  let error = null;
  let itineraryCount = 0;

  try {
    // Test basic query
    const { data: tours, error: tourError } = await supabase
      .from('tours')
      .select('*')
      .eq('slug', 'uttarakhand-adventure-2025')
      .single();

    if (tourError) {
      error = tourError.message;
      connectionStatus = 'Error';
    } else if (tours) {
      connectionStatus = 'Connected';
      tourData = tours;
      
      // Check itinerary
      const { data: itinerary, error: itinError } = await supabase
        .from('tour_itinerary')
        .select('*')
        .eq('tour_id', tours.id);
      
      if (!itinError && itinerary) {
        itineraryCount = itinerary.length;
      }
    } else {
      connectionStatus = 'No data found';
    }
  } catch (e) {
    const err = e as Error;
    error = err.message;
    connectionStatus = 'Exception';
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className={`p-4 rounded ${
            connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <strong>Status:</strong> {connectionStatus}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {tourData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Tour Data</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {tourData.id}</p>
              <p><strong>Title:</strong> {tourData.title}</p>
              <p><strong>Slug:</strong> {tourData.slug}</p>
              <p><strong>Status:</strong> {tourData.status}</p>
              <p><strong>Price:</strong> ₹{tourData.base_price}</p>
              <p><strong>Itinerary Days:</strong> {itineraryCount}</p>
            </div>
          </div>
        )}

        {tourData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Full Tour Object</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(tourData, null, 2)}
            </pre>
          </div>
        )}

        {!tourData && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data</h2>
            <p className="text-yellow-600">
              The tour was not found in the database. Make sure you&apos;ve run the SQL insert script.
            </p>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Steps to fix:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to your Supabase Dashboard</li>
                <li>Open SQL Editor</li>
                <li>Run database/cleanup_uttarakhand_tour.sql (if needed)</li>
                <li>Run database/uttarakhand_tour_data.sql</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
