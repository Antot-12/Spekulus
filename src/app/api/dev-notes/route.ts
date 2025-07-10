
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import type { DevNote } from '@/lib/data';

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured in environment variables.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

const NOTES_FOLDER = 'spekulus/content/notes';

// Helper to fetch and parse a JSON file from Cloudinary
async function getNoteFromCloudinary(public_id: string): Promise<DevNote | null> {
    try {
        const url = cloudinary.url(public_id, { resource_type: 'raw' });
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch or parse note ${public_id}`, error);
        return null;
    }
}


// GET: Fetch all notes or a single note
export async function GET(request: NextRequest) {
    try {
        configureCloudinary();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Fetch single note by slug
            const public_id = `${NOTES_FOLDER}/${slug}.json`;
            const note = await getNoteFromCloudinary(public_id);
            if (note) {
                return NextResponse.json({ success: true, note });
            } else {
                return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
            }
        } else {
            // Fetch all notes
            const results = await cloudinary.api.resources({
                type: 'upload',
                resource_type: 'raw',
                prefix: `${NOTES_FOLDER}/`,
                max_results: 500
            });
            
            const notes = await Promise.all(
                results.resources.map((res: { public_id: string }) => getNoteFromCloudinary(res.public_id))
            );

            const validNotes = notes.filter(note => note !== null) as DevNote[];

            return NextResponse.json({ success: true, notes: validNotes });
        }
    } catch (error: any) {
        console.error('Error fetching notes from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a new note
export async function POST(request: NextRequest) {
    try {
        configureCloudinary();
        const note: DevNote = await request.json();

        // Basic validation
        if (!note.slug || !note.title) {
            return NextResponse.json({ success: false, error: 'Slug and title are required.' }, { status: 400 });
        }
        
        const public_id = `${NOTES_FOLDER}/${note.slug}`;
        
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: public_id,
                    resource_type: 'raw',
                    invalidate: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result) return resolve(result);
                }
            );
            uploadStream.end(JSON.stringify(note, null, 2));
        });

        return NextResponse.json({ success: true, note, response });

    } catch (error: any) {
        console.error('Error creating note in Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


// PUT: Update an existing note
export async function PUT(request: NextRequest) {
    try {
        configureCloudinary();
        const note: DevNote = await request.json();
        
        if (!note.slug || !note.title) {
            return NextResponse.json({ success: false, error: 'Slug and title are required.' }, { status: 400 });
        }

        const public_id = `${NOTES_FOLDER}/${note.slug}`;
        
        // Overwrite the existing file
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: public_id,
                    resource_type: 'raw',
                    overwrite: true,
                    invalidate: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result) return resolve(result);
                }
            );
            uploadStream.end(JSON.stringify(note, null, 2));
        });

        return NextResponse.json({ success: true, note: response });

    } catch (error: any) {
        console.error('Error updating note in Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


// DELETE: Delete a note
export async function DELETE(request: NextRequest) {
    try {
        configureCloudinary();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ success: false, error: 'Slug is required for deletion.' }, { status: 400 });
        }
        
        const public_id = `${NOTES_FOLDER}/${slug}.json`;

        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: 'raw'
        });

        if (result.result === 'ok') {
            return NextResponse.json({ success: true, message: `Note '${slug}' deleted.` });
        } else {
            return NextResponse.json({ success: false, error: result.result }, { status: 404 });
        }

    } catch (error: any) {
        console.error('Error deleting note from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
