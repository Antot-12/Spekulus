
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, files: [] });
}

export async function POST() {
    return NextResponse.json({ success: false, error: 'This functionality is now managed by Cloudinary.' }, { status: 404 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'This functionality is now managed by Cloudinary.' }, { status: 404 });
}
