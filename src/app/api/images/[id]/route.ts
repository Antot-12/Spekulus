import { NextRequest, NextResponse } from 'next/server';
import { getFileData } from '@/lib/db/actions';
import sharp from 'sharp';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);

  // Get optimization parameters from query string
  const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
  const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : 80;
  const format = searchParams.get('f') || 'webp';

  const fileId = Number(id);
  if (!fileId || isNaN(fileId)) {
    return new NextResponse('Invalid file ID', { status: 400 });
  }

  try {
    const file = await getFileData(fileId);

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // If file has Cloudinary URL, redirect to it with transformations
    if (file.cloudinaryUrl) {
      // Build Cloudinary transformation URL
      // Format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dmeg16fm5';
      const publicId = file.cloudinaryId;

      // Build transformation string
      const transforms: string[] = [];
      if (width) transforms.push(`w_${width}`);
      transforms.push(`q_${quality}`);
      transforms.push(`f_${format === 'webp' ? 'webp' : format === 'avif' ? 'avif' : 'auto'}`);

      const transformString = transforms.join(',');
      const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;

      // Redirect to Cloudinary CDN
      return NextResponse.redirect(cloudinaryUrl, {
        status: 302,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      });
    }

    // Fallback: serve from database if no Cloudinary URL (legacy support)
    if (!file.data) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Check if it's an image
    const isImage = file.mimeType?.startsWith('image/');

    if (!isImage) {
      // For non-images, return as-is
      const safeFilename = encodeURIComponent(file.filename || 'download');
      return new NextResponse(file.data, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
          'Content-Length': file.data.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': `inline; filename="${safeFilename}"`
        },
      });
    }

    // Optimize image with Sharp (fallback for non-Cloudinary images)
    let sharpInstance = sharp(file.data);

    if (width) {
      sharpInstance = sharpInstance.resize(width, undefined, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    let optimizedBuffer: Buffer;
    let contentType: string;

    if (format === 'webp') {
      optimizedBuffer = await sharpInstance.webp({ quality, effort: 4 }).toBuffer();
      contentType = 'image/webp';
    } else if (format === 'avif') {
      optimizedBuffer = await sharpInstance.avif({ quality, effort: 4 }).toBuffer();
      contentType = 'image/avif';
    } else if (format === 'jpeg' || format === 'jpg') {
      optimizedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
      contentType = 'image/jpeg';
    } else {
      optimizedBuffer = await sharpInstance.webp({ quality, effort: 4 }).toBuffer();
      contentType = 'image/webp';
    }

    return new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': optimizedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(`Failed to fetch file with ID ${fileId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
