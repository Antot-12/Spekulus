
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import type { FaqItem, Language } from '@/lib/data';

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

const FAQ_FOLDER = 'spekulus/content/faq';

// Helper to get FAQs for a specific language
async function getFaqsFromCloudinary(lang: Language): Promise<FaqItem[] | null> {
    try {
        const config = getCloudinaryConfig();
        const public_id = `${FAQ_FOLDER}/faqs-${lang}.json`;
        const url = cloudinary.url(public_id, { resource_type: 'raw', ...config });

        const response = await fetch(url, { next: { revalidate: 0 } });
        if (!response.ok) return null; // File might not exist yet, which is not an error
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch or parse FAQs for ${lang}`, error);
        return null; // Return null to indicate an error occurred
    }
}

// GET: Fetch FAQs for a given language
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') as Language;

    if (!lang || !['en', 'uk', 'sk'].includes(lang)) {
        return NextResponse.json({ success: false, error: 'A valid language parameter (en, uk, sk) is required.' }, { status: 400 });
    }

    try {
        const faqs = await getFaqsFromCloudinary(lang);
        if (faqs !== null) {
            return NextResponse.json({ success: true, faqs });
        } else {
            // If file doesn't exist, return empty array, which is a valid state
            return NextResponse.json({ success: true, faqs: [] });
        }
    } catch (error: any) {
        console.error(`Error fetching FAQs for ${lang} from Cloudinary:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


// PUT: Update FAQs for a given language
export async function PUT(request: NextRequest) {
    try {
        const config = getCloudinaryConfig();
        const body = await request.json();
        const { lang, faqs } = body;

        if (!lang || !['en', 'uk', 'sk'].includes(lang)) {
            return NextResponse.json({ success: false, error: 'A valid language parameter is required.' }, { status: 400 });
        }
        if (!Array.isArray(faqs)) {
            return NextResponse.json({ success: false, error: 'FAQs must be an array.' }, { status: 400 });
        }
        
        const public_id = `${FAQ_FOLDER}/faqs-${lang}`;
        
        const response: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...config,
                    public_id,
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
            uploadStream.end(JSON.stringify(faqs, null, 2));
        });

        return NextResponse.json({ success: true, response });

    } catch (error: any) {
        console.error('Error updating FAQs in Cloudinary:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
