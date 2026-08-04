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
    console.log('Adding visibility columns to projects and experience tables...');

    // Add is_visible column to creator_projects
    await db.execute(sql`
      ALTER TABLE creator_projects
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE NOT NULL
    `);

    // Add is_visible column to creator_experience
    await db.execute(sql`
      ALTER TABLE creator_experience
      ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE NOT NULL
    `);

    return NextResponse.json({
      success: true,
      message: 'Visibility columns added successfully.'
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
