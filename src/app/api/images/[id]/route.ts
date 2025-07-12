import { NextRequest, NextResponse } from 'next/server';
import { getImageData } from '@/lib/db/actions';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  const imageId = Number(id);
  if (!imageId || isNaN(imageId)) {
    return new NextResponse('Invalid image ID', { status: 400 });
  }

  try {
    const image = await getImageData(imageId);

    if (!image || !image.data) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(image.data, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType || 'application/octet-stream',
        'Content-Length': image.data.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`Failed to fetch image with ID ${imageId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
