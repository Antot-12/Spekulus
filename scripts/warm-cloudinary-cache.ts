import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Common widths used by Next.js Image component
const WIDTHS = [640, 750, 828, 1080, 1200, 1920];

const images = [
  'spekulus/backgrounds/file_5',
  'spekulus/branding/file_6',
  'spekulus/creators/file_7',
  'spekulus/creators/file_8',
  'spekulus/gallery/file_9',
  'spekulus/gallery/file_10',
  'spekulus/gallery/file_11',
  'spekulus/gallery/file_12',
  'spekulus/creators/file_13',
  'spekulus/branding/file_23',
  'spekulus/products/file_24',
  'spekulus/products/file_25',
  'spekulus/products/file_27',
  'spekulus/creators/file_28',
];

async function warmCache() {
  console.log('🔥 Warming Cloudinary cache...\n');

  for (const publicId of images) {
    for (const width of WIDTHS) {
      const url = `https://res.cloudinary.com/dmeg16fm5/image/upload/w_${width},q_80,f_auto/${publicId}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ ${publicId} @ ${width}px`);
        } else {
          console.log(`❌ ${publicId} @ ${width}px - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${publicId} @ ${width}px - failed`);
      }
    }
  }

  console.log('\n✅ Cache warming complete!');
}

warmCache();
