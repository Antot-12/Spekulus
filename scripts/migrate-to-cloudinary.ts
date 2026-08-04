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

interface FileRecord {
  id: number;
  filename: string | null;
  mime_type: string | null;
  data: Buffer;
  cloudinary_id: string | null;
}

async function migrateImages() {
  console.log('🚀 Starting migration to Cloudinary...\n');

  // Check Cloudinary connection
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected:', result.status);
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
    process.exit(1);
  }

  // Get all files from the database that don't have cloudinary_id yet
  const files = await sql`
    SELECT id, filename, mime_type, data, cloudinary_id
    FROM files
    WHERE data IS NOT NULL
  ` as FileRecord[];

  console.log(`\n📁 Found ${files.length} files to process\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    try {
      // Skip if already migrated
      if (file.cloudinary_id) {
        console.log(`⏭️  [${file.id}] ${file.filename} - already migrated`);
        skipped++;
        continue;
      }

      // Skip non-image files
      if (!file.mime_type?.startsWith('image/')) {
        console.log(`⏭️  [${file.id}] ${file.filename} - not an image (${file.mime_type})`);
        skipped++;
        continue;
      }

      // Convert Buffer to base64 data URI
      const base64 = Buffer.from(file.data).toString('base64');
      const dataUri = `data:${file.mime_type};base64,${base64}`;

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'spekulus',
        public_id: `file_${file.id}`,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      });

      // Update database with Cloudinary ID
      await sql`
        UPDATE files
        SET cloudinary_id = ${uploadResult.public_id},
            cloudinary_url = ${uploadResult.secure_url}
        WHERE id = ${file.id}
      `;

      console.log(`✅ [${file.id}] ${file.filename} → ${uploadResult.secure_url}`);
      migrated++;

    } catch (error) {
      console.error(`❌ [${file.id}] ${file.filename} - failed:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Failed:   ${failed}`);
  console.log('='.repeat(50) + '\n');
}

migrateImages().catch(console.error);
