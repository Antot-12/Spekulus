
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

    // Use a promise to wrap the upload_stream logic
    const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: subdirectory || 'spekulus_general', // Use subdirectory as folder or a default
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );

        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });

    return NextResponse.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to upload file to Cloudinary. ${errorMessage}` }, { status: 500 });
  }
}
