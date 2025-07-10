
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import type { Creator } from '@/lib/data';

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

const CREATORS_FOLDER = 'spekulus/creators';

async function getCreatorFromCloudinary(public_id: string): Promise<Creator | null> {
    try {
        const config = getCloudinaryConfig();
        const url = cloudinary.url(public_id, { resource_type: 'raw', ...config });
        const response = await fetch(url, { next: { revalidate: 0 } });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch or parse creator ${public_id}`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const lang = searchParams.get('lang');

        if (!lang || !['en', 'uk', 'sk'].includes(lang)) {
            return NextResponse.json({ success: false, error: 'Language parameter is required (en, uk, sk)' }, { status: 400 });
        }

        const langFolder = `${CREATORS_FOLDER}/${lang}`;

        if (slug) {
            const public_id = `${langFolder}/${slug}/${slug}.json`;
            const creator = await getCreatorFromCloudinary(public_id);
            if (creator) {
                return NextResponse.json({ success: true, creator });
            } else {
                return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
            }
        } else {
            const results = await cloudinary.api.resources({
                ...config,
                type: 'upload',
                resource_type: 'raw',
                prefix: `${langFolder}/`,
                max_results: 500
            });
            
            const creatorPublicIds = results.resources
                .filter((res: { format: string, public_id: string }) => {
                    const parts = res.public_id.split('/');
                    // This ensures we only get files like `spekulus/creators/en/anton-shyrko/anton-shyrko.json`
                    return res.format === 'json' && parts.length > 3 && parts.slice(-2)[0] === parts.slice(-1)[0].replace('.json', '');
                })
                .map((res: { public_id: string; }) => res.public_id);

            const creators = (await Promise.all(
                creatorPublicIds.map((public_id: string) => getCreatorFromCloudinary(public_id))
            )).filter(creator => creator !== null) as Creator[];

            return NextResponse.json({ success: true, creators });
        }
    } catch (error: any) {
        console.error('Error fetching creators from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const body = await request.json();
        const { lang, creators }: { lang: 'en' | 'uk' | 'sk', creators: Creator[] } = body;

        if (!lang || !creators) {
             return NextResponse.json({ success: false, error: 'Language and creators array are required.' }, { status: 400 });
        }
        
        // First, get all existing creator folders for the language
        const { folders } = await cloudinary.api.sub_folders(`${CREATORS_FOLDER}/${lang}`, config);
        const existingSlugs = new Set(folders.map((f: { name: string }) => f.name));
        const currentSlugs = new Set(creators.map(c => c.slug));

        // Determine which folders need to be deleted
        const foldersToDelete = [...existingSlugs].filter(slug => !currentSlugs.has(slug));

        // Delete folders for creators that no longer exist
        const deletePromises = foldersToDelete.map(slug => {
            const folderPath = `${CREATORS_FOLDER}/${lang}/${slug}`;
            return cloudinary.api.delete_folder(folderPath, config);
        });

        const uploadPromises = creators.map(creator => {
            const public_id = `${CREATORS_FOLDER}/${lang}/${creator.slug}/${creator.slug}`;
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        ...config,
                        public_id: public_id,
                        resource_type: 'raw',
                        overwrite: true,
                        invalidate: true,
                        format: 'json',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        if (result) return resolve(result);
                    }
                );
                uploadStream.end(JSON.stringify(creator, null, 2));
            });
        });

        const [uploadResponses] = await Promise.all([
             Promise.all(uploadPromises),
             Promise.all(deletePromises)
        ]);
        
        return NextResponse.json({ success: true, creators, responses: uploadResponses });

    } catch (error: any) {
        console.error('Error updating creators in Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const lang = searchParams.get('lang');

        if (!slug || !lang) {
            return NextResponse.json({ success: false, error: 'Slug and language are required for deletion.' }, { status: 400 });
        }
        
        const folderPath = `${CREATORS_FOLDER}/${lang}/${slug}`;
        
        // This is a more aggressive deletion. It's often better to handle deletion
        // by syncing state as done in the POST request. This remains for direct calls if needed.
        await cloudinary.api.delete_resources_by_prefix(folderPath, config);
        const result = await cloudinary.api.delete_folder(folderPath, config);

        if (result.deleted && result.deleted[folderPath]) {
            return NextResponse.json({ success: true, message: `Creator folder '${slug}' deleted.` });
        } else {
             return NextResponse.json({ success: false, error: 'Could not definitively delete creator folder. It may already be removed or empty.' }, { status: 404 });
        }

    } catch (error: any) {
        console.error('Error deleting creator from Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
