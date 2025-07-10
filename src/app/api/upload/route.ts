
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Writable } from 'stream';

// Configure Cloudinary with environment variables from .env
if (!process.env.CLOUDINARY_URL) {
  console.error('CLOUDINARY_URL environment variable is not set');
} else {
  cloudinary.config({ secure: true });
}

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
  const subdirectory: string | null = data.get('subdirectory') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
  }

  try {
    const fileBuffer = await streamToBuffer(file.stream());
    
    // Use a promise to handle the upload stream
    const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: subdirectory ? `spekulus/${subdirectory}` : 'spekulus',
                resource_type: 'auto',
                // public_id is optional, Cloudinary will generate one if not provided
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error('Failed to upload file to Cloudinary.'));
                }
                resolve(result);
            }
        );

        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
    
    return NextResponse.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Error in upload route:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to upload file to Cloudinary. ${errorMessage}` }, { status: 500 });
  }
}
