'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';

interface ImageGalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: 'tour-images' | 'itinerary-images';
  label?: string;
  maxImages?: number;
  className?: string;
}

export default function ImageGalleryUpload({ 
  value, 
  onChange, 
  bucket,
  label = 'Upload Images',
  maxImages = 10,
  className = ''
}: ImageGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    title: '',
    message: '',
    variant: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - value.length;
    if (files.length > remaining) {
      setAlertState({
        show: true,
        title: 'Too Many Images',
        message: `You can only upload ${remaining} more image(s)`,
        variant: 'warning'
      });
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setAlertState({
          show: true,
          title: 'Invalid File Type',
          message: 'Please select only image files',
          variant: 'error'
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setAlertState({
          show: true,
          title: 'File Too Large',
          message: 'Each image should be less than 10MB',
          variant: 'error'
        });
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        uploadedUrls.push(data.url);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      setAlertState({
        show: true,
        title: 'Upload Failed',
        message: `${errorMessage}\n\nNote: Make sure storage buckets are set up in Supabase.`,
        variant: 'error'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    setImageToDelete(index);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (imageToDelete === null) return;
    
    const imageUrl = value[imageToDelete];
    setShowConfirm(false);

    try {
      // Extract file path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        const [bucketAndPath] = urlParts[1].split('/');
        const filePath = urlParts[1].substring(bucketAndPath.length + 1);
        
        console.log('[Delete] Attempting to delete from storage:', { bucket: bucketAndPath, filePath });
        
        // Call API to delete from storage
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bucket: bucketAndPath,
            filePath: filePath,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('[Delete] Storage deletion failed:', data);
          // Continue with removal even if storage deletion fails
          setAlertState({
            show: true,
            title: 'Storage Warning',
            message: `Failed to delete from storage: ${data.error || 'Unknown error'}\nThe image will be removed from the database but may remain in storage.`,
            variant: 'warning'
          });
        } else {
          console.log('[Delete] Successfully deleted from storage');
        }
      }
    } catch (error) {
      console.error('[Delete] Error deleting from storage:', error);
      setAlertState({
        show: true,
        title: 'Storage Warning',
        message: 'Could not delete from storage. The image will be removed from the database but may remain in storage.',
        variant: 'warning'
      });
    }

    // Remove from array
    const newUrls = value.filter((_, i) => i !== imageToDelete);
    onChange(newUrls);
    setImageToDelete(null);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [removed] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, removed);
    onChange(newUrls);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-4">
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove"
                >
                  ×
                </button>
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
              
              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
          
          {/* Add more button */}
          {value.length < maxImages && (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id={`gallery-input-${bucket}`}
              />
              <label
                htmlFor={`gallery-input-${bucket}`}
                className={`w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  {uploading ? 'Uploading...' : 'Add Images'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {value.length}/{maxImages}
                </span>
              </label>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          JPG, PNG or WebP. Max 10MB per image. {value.length > 0 && 'Hover to reorder or remove.'}
        </p>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Image?"
        message="Are you sure you want to delete this image? This will permanently remove it from storage."
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
