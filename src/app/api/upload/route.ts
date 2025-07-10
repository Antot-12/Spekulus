
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Load environment variables from env.txt
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

  // Explicitly configure Cloudinary for this API call
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return NextResponse.json({ success: false, error: 'Cloudinary credentials are not configured correctly.' }, { status: 500 });
  }

  try {
    const fileBuffer = await streamToBuffer(file.stream());
    
    // Use a promise to handle the upload stream
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                ...config,
                // The `folder` option automatically creates non-existent folders.
                folder: subdirectory || 'spekulus/uploads',
                // Use original filename but make it unique to avoid overwrites
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error(error.message || 'Failed to upload file to Cloudinary.'));
                }
                if (result) {
                    resolve(result);
                }
            }
        );

        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
    
    return NextResponse.json({ success: true, url: result.secure_url, public_id: result.public_id });

  } catch (error) {
    console.error('Error in upload route:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to upload file. ${errorMessage}` }, { status: 500 });
  }
}
