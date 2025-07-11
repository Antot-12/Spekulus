
import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/db/actions';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
        return new NextResponse('Invalid image ID', { status: 400 });
    }

    try {
        const image = await getImage(id);

        if (!image || !image.data) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const headers = new Headers();
        headers.set('Content-Type', image.mimeType || 'application/octet-stream');
        headers.set('Content-Length', image.data.length.toString());
        // Cache for 1 year
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(image.data, { status: 200, headers });

    } catch (error) {
        console.error(`Failed to fetch image ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
