import { v2 as cloudinary } from 'cloudinary';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sql = neon(process.env.DATABASE_URL!);

// Define folder mappings based on file IDs or filenames
const folderMappings: Record<number, string> = {
  // Hero/Background images
  5: 'spekulus/backgrounds',
  6: 'spekulus/branding',

  // Creator profile photos
  7: 'spekulus/creators',
  8: 'spekulus/creators',
  13: 'spekulus/creators',
  28: 'spekulus/creators',

  // Creator gallery images
  9: 'spekulus/gallery',
  10: 'spekulus/gallery',
  11: 'spekulus/gallery',
  12: 'spekulus/gallery',

  // Logo
  23: 'spekulus/branding',

  // Product images
  24: 'spekulus/products',
  25: 'spekulus/products',
  27: 'spekulus/products',
};

async function organizeImages() {
  console.log('🗂️  Organizing images into folders...\n');

  // Get all files with cloudinary IDs
  const files = await sql`
    SELECT id, filename, cloudinary_id, cloudinary_url
    FROM files
    WHERE cloudinary_id IS NOT NULL
  `;

  console.log(`📁 Found ${files.length} files to organize\n`);

  for (const file of files) {
    const targetFolder = folderMappings[file.id] || 'spekulus/misc';
    const currentFolder = file.cloudinary_id?.split('/').slice(0, -1).join('/');

    if (currentFolder === targetFolder) {
      console.log(`⏭️  [${file.id}] ${file.filename} - already in ${targetFolder}`);
      continue;
    }

    try {
      const oldPublicId = file.cloudinary_id;
      const newPublicId = `${targetFolder}/file_${file.id}`;

      // Rename/move in Cloudinary
      const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
        overwrite: true,
      });

      // Update database
      await sql`
        UPDATE files
        SET cloudinary_id = ${result.public_id},
            cloudinary_url = ${result.secure_url}
        WHERE id = ${file.id}
      `;

      console.log(`✅ [${file.id}] ${file.filename} → ${targetFolder}/`);
    } catch (error: any) {
      console.error(`❌ [${file.id}] ${file.filename} - failed:`, error.message);
    }
  }

  console.log('\n✅ Organization complete!');
}

organizeImages().catch(console.error);
