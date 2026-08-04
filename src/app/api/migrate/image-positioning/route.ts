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
    console.log('Running image positioning migration...');

    // Add columns if they don't exist
    await db.execute(sql`
      ALTER TABLE creators
      ADD COLUMN IF NOT EXISTS image_pos_x INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS image_pos_y INTEGER DEFAULT 20;
    `);

    // Update existing records
    await db.execute(sql`
      UPDATE creators
      SET image_pos_x = COALESCE(image_pos_x, 50),
          image_pos_y = COALESCE(image_pos_y, 20)
      WHERE image_id IS NOT NULL;
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully. Image positioning columns added to creators table.'
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
