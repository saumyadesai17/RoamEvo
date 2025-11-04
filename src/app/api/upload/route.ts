import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: 'No bucket specified' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Get image metadata
    const metadata = await sharp(fileBuffer).metadata();
    
    // Validate dimensions (prevent extremely large images)
    if (metadata.width && metadata.width > 4096) {
      return NextResponse.json(
        { error: 'Image width exceeds 4096px limit' },
        { status: 400 }
      );
    }
    if (metadata.height && metadata.height > 4096) {
      return NextResponse.json(
        { error: 'Image height exceeds 4096px limit' },
        { status: 400 }
      );
    }

    // Compress and optimize image
    const optimizedBuffer = await sharp(fileBuffer)
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({
        quality: 85, // Good balance between quality and size
        progressive: true, // Progressive JPEGs load faster
        mozjpeg: true, // Use mozjpeg for better compression
      })
      .toBuffer();

    // Generate unique filename with jpg extension
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = fileName;

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Upload failed: ' + error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Get optimized file size for logging
    const originalSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
    const optimizedSizeMB = (optimizedBuffer.length / (1024 * 1024)).toFixed(2);
    
    console.log(`Image optimized: ${originalSizeMB}MB → ${optimizedSizeMB}MB (${((1 - optimizedBuffer.length / fileBuffer.length) * 100).toFixed(1)}% reduction)`);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
      originalSize: originalSizeMB,
      optimizedSize: optimizedSizeMB,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { bucket, filePath } = body;

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Bucket and filePath are required' },
        { status: 400 }
      );
    }

    console.log('[API] Deleting file from storage:', { bucket, filePath });

    // Delete from Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('[API] Supabase deletion error:', error);
      return NextResponse.json(
        { error: 'Deletion failed: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[API] Successfully deleted file from storage');

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      data: data,
    });
  } catch (error) {
    console.error('[API] Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
