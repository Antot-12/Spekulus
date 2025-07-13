
import { NextRequest, NextResponse } from 'next/server';
import 'dotenv/config';
import { uploadFile } from '@/lib/db/actions';

// Helper to convert a file stream to a buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
  }

  try {
    const fileBuffer = await streamToBuffer(file.stream());
    
    const result = await uploadFile(fileBuffer, file.name, file.type);
    
    if (!result || !result.id) {
        throw new Error("File upload failed to return an ID.");
    }
    
    return NextResponse.json({ success: true, id: result.id });

  } catch (error) {
    console.error('Error in upload route:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to upload file. ${errorMessage}` }, { status: 500 });
  }
}
