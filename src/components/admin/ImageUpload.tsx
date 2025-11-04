'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: 'tour-images' | 'itinerary-images';
  label?: string;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  bucket,
  label = 'Upload Image',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertState, setAlertState] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'error' | 'warning' }>({ 
    show: false, 
    title: '', 
    message: '', 
    variant: 'success' 
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAlertState({
        show: true,
        title: 'Invalid File Type',
        message: 'Please select an image file (JPG, PNG, WebP, etc.)',
        variant: 'error'
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setAlertState({
        show: true,
        title: 'File Too Large',
        message: 'Image size should be less than 10MB',
        variant: 'error'
      });
      return;
    }

    setUploading(true);

    try {
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

      setPreview(data.url);
      onChange(data.url);
      setAlertState({
        show: true,
        title: 'Upload Successful',
        message: 'Image has been uploaded successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setAlertState({
        show: true,
        title: 'Upload Failed',
        message: `${errorMessage}. Make sure storage buckets are set up in Supabase.`,
        variant: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);

    try {
      // Extract file path from URL
      const urlParts = value.split('/storage/v1/object/public/');
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
          setAlertState({
            show: true,
            title: 'Storage Deletion Warning',
            message: `Failed to delete from storage: ${data.error || 'Unknown error'}. The image will be removed from the database but may remain in storage.`,
            variant: 'warning'
          });
        } else {
          console.log('[Delete] Successfully deleted from storage');
          setAlertState({
            show: true,
            title: 'Image Deleted',
            message: 'Image has been successfully deleted from storage',
            variant: 'success'
          });
        }
      }
    } catch (error) {
      console.error('[Delete] Error deleting from storage:', error);
      setAlertState({
        show: true,
        title: 'Deletion Warning',
        message: 'Could not delete from storage. The image will be removed from the database but may remain in storage.',
        variant: 'warning'
      });
    }

    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex items-start gap-4">
        {preview ? (
          <div className="relative group">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-input-${bucket}`}
          />
          <label
            htmlFor={`file-input-${bucket}`}
            className={`px-4 py-2 border border-[#4A5B2D] text-[#4A5B2D] rounded-lg hover:bg-[#4A5B2D] hover:text-white transition-colors cursor-pointer text-sm font-medium text-center ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Select Image'}
          </label>
          <p className="text-xs text-gray-500">
            JPG, PNG or WebP. Max 10MB.
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Image?"
        message="Are you sure you want to delete this image? This will permanently remove it from storage and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      
      <AlertDialog
        isOpen={alertState.show}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        onClose={() => setAlertState({ ...alertState, show: false })}
      />
    </div>
  );
}
