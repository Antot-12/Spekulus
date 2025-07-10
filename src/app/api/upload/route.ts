
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Explicitly load variables from env.txt for this specific project setup.
require('dotenv').config({ path: require('path').resolve(process.cwd(), 'env.txt') });

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
                // Pass credentials directly in the call to ensure authentication
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                folder: subdirectory ? `spekulus/${subdirectory}` : 'spekulus',
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error(error.message || 'Failed to upload file to Cloudinary.'));
                }
                resolve(result);
            }
        );

        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
    
    return NextResponse.json({ success: true, url: result.secure_url, ...result });

  } catch (error) {
    console.error('Error in upload route:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to upload file. ${errorMessage}` }, { status: 500 });
  }
}
