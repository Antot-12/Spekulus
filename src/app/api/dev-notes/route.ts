
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import type { DevNote } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Load environment variables from env.txt
require('dotenv').config({ path: require('path').resolve(process.cwd(), 'env.txt') });

const getCloudinaryConfig = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary credentials are not configured in environment variables.');
    }
    
    return {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    };
};

const NOTES_FOLDER = 'spekulus/dev_notes';

// Helper to fetch and parse a JSON file from Cloudinary
async function getNoteFromCloudinary(public_id: string): Promise<DevNote | null> {
    try {
        const config = getCloudinaryConfig();
        const url = cloudinary.url(public_id, { resource_type: 'raw', ...config });

        const response = await fetch(url, { next: { revalidate: 0 } }); // Disable caching for fresh data
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
        const config = getCloudinaryConfig();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Fetch single note by slug
            const public_id = `${NOTES_FOLDER}/${slug}/${slug}.json`;
            const note = await getNoteFromCloudinary(public_id);
            if (note) {
                return NextResponse.json({ success: true, note });
            } else {
                return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
            }
        } else {
            // Fetch all notes by finding all .json files in subdirectories
            const results = await cloudinary.api.resources({
                ...config,
                type: 'upload',
                resource_type: 'raw',
                prefix: `${NOTES_FOLDER}/`,
                max_results: 500
            });
            
            const notePublicIds = results.resources
                .filter((res: { public_id: string }) => {
                    const parts = res.public_id.split('/');
                    if (parts.length < 4) return false;
                    const slugPart = parts[parts.length - 2];
                    const filename = parts[parts.length - 1];
                    return filename === `${slugPart}.json`;
                })
                .map((res: { public_id: string; }) => res.public_id);

            const notes = (await Promise.all(
                notePublicIds.map((public_id: string) => getNoteFromCloudinary(public_id))
            )).filter((note): note is DevNote => note !== null);

            return NextResponse.json({ success: true, notes });
        }
    } catch (error: any) {
        console.error('Error fetching notes from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a new note
export async function POST(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const note: DevNote = await request.json();

        if (!note.slug || !note.title) {
            return NextResponse.json({ success: false, error: 'Slug and title are required.' }, { status: 400 });
        }
        
        const public_id = `${NOTES_FOLDER}/${note.slug}/${note.slug}.json`;
        
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...config,
                    public_id: public_id,
                    folder: `${NOTES_FOLDER}/${note.slug}`,
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
        const config = getCloudinaryConfig();
        const note: DevNote = await request.json();
        
        if (!note.slug || !note.title) {
            return NextResponse.json({ success: false, error: 'Slug and title are required.' }, { status: 400 });
        }

        const public_id = `${NOTES_FOLDER}/${note.slug}/${note.slug}.json`;
        
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...config,
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
        const config = getCloudinaryConfig();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ success: false, error: 'Slug is required for deletion.' }, { status: 400 });
        }
        
        const folderPath = `${NOTES_FOLDER}/${slug}`;
        
        await cloudinary.api.delete_resources_by_prefix(folderPath, { ...config, resource_type: 'raw' });
        await cloudinary.api.delete_resources_by_prefix(folderPath, { ...config, resource_type: 'image' });
        await cloudinary.api.delete_resources_by_prefix(folderPath, { ...config, resource_type: 'video' });

        const result = await cloudinary.api.delete_folder(folderPath, config);
        
        if (result.deleted && result.deleted[folderPath] === 'deleted') {
            return NextResponse.json({ success: true, message: `Note folder '${slug}' and its contents deleted.` });
        }
        
        return NextResponse.json({ success: true, message: `Note folder '${slug}' and its contents deleted.` });


    } catch (error: any) {
        if ((error as any).http_code === 404) {
            return NextResponse.json({ success: true, message: `Note folder '${slug}' already deleted.` });
        }
        console.error('Error deleting note from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
