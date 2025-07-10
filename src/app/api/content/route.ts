
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import type { Language } from '@/lib/data';

export const dynamic = 'force-dynamic';

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

const CONTENT_FOLDER = 'spekulus/content';

async function getContentFromCloudinary(lang: Language, section: string): Promise<any | null> {
    try {
        const config = getCloudinaryConfig();
        const public_id = `${CONTENT_FOLDER}/${lang}/${section}.json`;
        const url = cloudinary.url(public_id, { resource_type: 'raw', ...config });

        const response = await fetch(url, { next: { revalidate: 0 } });
        if (!response.ok) return null; // File might not exist yet
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch or parse content for ${lang}/${section}`, error);
        return null;
    }
}

// GET: Fetch content for a given language and section
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') as Language;
    const section = searchParams.get('section');

    if (!lang || !['en', 'uk', 'sk'].includes(lang)) {
        return NextResponse.json({ success: false, error: 'A valid language parameter is required.' }, { status: 400 });
    }
    if (!section) {
        return NextResponse.json({ success: false, error: 'A section parameter is required.' }, { status: 400 });
    }

    try {
        const content = await getContentFromCloudinary(lang, section);
        return NextResponse.json({ success: true, content });
    } catch (error: any) {
        console.error(`Error fetching content for ${lang}/${section} from Cloudinary:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


// POST: Update content for a given language and section
export async function POST(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const body = await request.json();
        const { lang, section, content } = body;

        if (!lang || !['en', 'uk', 'sk'].includes(lang)) {
            return NextResponse.json({ success: false, error: 'A valid language parameter is required.' }, { status: 400 });
        }
        if (!section) {
            return NextResponse.json({ success: false, error: 'A section parameter is required.' }, { status: 400 });
        }
        if (!content) {
            return NextResponse.json({ success: false, error: 'Content payload is required.' }, { status: 400 });
        }
        
        const public_id = `${CONTENT_FOLDER}/${lang}/${section}.json`;
        
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...config,
                    public_id: public_id,
                    folder: `${CONTENT_FOLDER}/${lang}`,
                    resource_type: 'raw',
                    overwrite: true,
                    invalidate: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result) return resolve(result);
                }
            );
            uploadStream.end(JSON.stringify(content, null, 2));
        });

        return NextResponse.json({ success: true, response });

    } catch (error: any) {
        console.error('Error updating content in Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
