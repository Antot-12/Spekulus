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
    console.log('Running projects and experience migration...');

    // Add columns for projects and experience
    await db.execute(sql`
      ALTER TABLE creators
      ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
    `);

    // Initialize with empty arrays for existing records
    await db.execute(sql`
      UPDATE creators
      SET
        projects = COALESCE(projects, '[]'::jsonb),
        experience = COALESCE(experience, '[]'::jsonb);
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully. Projects and experience columns added to creators table.'
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
