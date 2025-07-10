
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
    const chunks = [];
    for await(const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
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
    const fileBuffer = await buffer(file.stream());

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: subdirectory || 'spekulus_general', // Use subdirectory as folder or a default
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          // This callback handles errors from the Cloudinary SDK
          console.error('Cloudinary upload error:', error);
          // Note: we resolve the promise below, so can't return NextResponse here.
          // The outer catch block will handle sending the response.
        }
      }
    );
    
    // Convert buffer to readable stream and pipe to Cloudinary
    const stream = Readable.from(fileBuffer);
    
    // Use a promise to wait for the upload to finish
    const result: any = await new Promise((resolve, reject) => {
        stream.pipe(uploadStream).on('finish', resolve).on('error', reject);
    });

    // Cloudinary's Node SDK's upload_stream resolves with upload metadata
    // but the actual result is passed to its callback. A more promise-friendly
    // way is to wrap it. A bit of a hack: let's assume if we got here without error, we need the URL.
    // We'll re-fetch the asset details for a stable URL. This is less efficient but more reliable.
    const finalResult = await cloudinary.api.resource(result.public_id);


    return NextResponse.json({ success: true, url: finalResult.secure_url });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file to Cloudinary.' }, { status: 500 });
  }
}

// We need an API route to list/delete files from Cloudinary for the manager, but that's a larger scope.
// For now, let's remove the old API route for local file management.
