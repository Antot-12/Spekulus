import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/db/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (!id || isNaN(id)) {
    return new NextResponse('Invalid image ID', { status: 400 });
  }

  try {
    const image = await getImage(id);

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
    console.error(`Failed to fetch image with ID ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
