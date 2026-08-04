import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Adding image positioning columns to creators table...');

    await db.execute(sql`
      ALTER TABLE creators
      ADD COLUMN IF NOT EXISTS image_pos_x INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS image_pos_y INTEGER DEFAULT 20;
    `);

    console.log('Updating existing records with default values...');

    await db.execute(sql`
      UPDATE creators
      SET image_pos_x = 50, image_pos_y = 20
      WHERE image_pos_x IS NULL OR image_pos_y IS NULL;
    `);

    console.log('✅ Migration completed successfully!');
    console.log('Image positioning columns (image_pos_x, image_pos_y) added to creators table.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
