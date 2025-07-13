import { NextRequest, NextResponse } from 'next/server';
import { getFileData } from '@/lib/db/actions';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  const fileId = Number(id);
  if (!fileId || isNaN(fileId)) {
    return new NextResponse('Invalid file ID', { status: 400 });
  }

  try {
    const file = await getFileData(fileId);

    if (!file || !file.data) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Ensure the filename is URL-safe
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
  } catch (error) {
    console.error(`Failed to fetch file with ID ${fileId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
