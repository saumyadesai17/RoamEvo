'use client';

interface DownloadButtonProps {
  pdfUrl: string;
  label: string;
  icon?: string;
}

export default function DownloadButton({ pdfUrl, label, icon = '📄' }: DownloadButtonProps) {
  if (!pdfUrl) return null;

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#4A5B2D] transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{label}</h4>
            <p className="text-xs sm:text-sm text-gray-600">PDF Document</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleView}
            className="px-3 py-2 text-sm font-medium text-[#4A5B2D] hover:bg-green-50 rounded-lg transition-colors"
            title="View PDF"
          >
            View
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 text-sm font-medium bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors flex items-center gap-1"
            title="Download PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
