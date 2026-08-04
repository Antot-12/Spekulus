import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = neon(connectionString);
const db = drizzle(client);

export async function POST() {
  try {
    console.log('Running separate image positioning migration...');

    // Step 1: Add new columns for card and profile positioning
    await db.execute(sql`
      ALTER TABLE creators
      ADD COLUMN IF NOT EXISTS card_image_pos_x INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS card_image_pos_y INTEGER DEFAULT 20,
      ADD COLUMN IF NOT EXISTS card_image_zoom INTEGER DEFAULT 100,
      ADD COLUMN IF NOT EXISTS profile_image_pos_x INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS profile_image_pos_y INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS profile_image_zoom INTEGER DEFAULT 100;
    `);

    // Step 2: Migrate data from old columns to new columns (if old columns exist)
    await db.execute(sql`
      UPDATE creators
      SET
        card_image_pos_x = COALESCE(image_pos_x, card_image_pos_x, 50),
        card_image_pos_y = COALESCE(image_pos_y, card_image_pos_y, 20),
        profile_image_pos_x = COALESCE(image_pos_x, profile_image_pos_x, 50),
        profile_image_pos_y = COALESCE(image_pos_y, profile_image_pos_y, 30)
      WHERE image_id IS NOT NULL;
    `);

    // Step 3: Drop old columns (only if they exist)
    await db.execute(sql`
      ALTER TABLE creators
      DROP COLUMN IF EXISTS image_pos_x,
      DROP COLUMN IF EXISTS image_pos_y;
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully. Separate card and profile positioning columns added, old columns migrated and removed.'
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
