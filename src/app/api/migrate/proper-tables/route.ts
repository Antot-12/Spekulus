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
    console.log('Creating proper tables for projects and experience...');

    // Create creator_projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS creator_projects (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
        demo_url TEXT,
        github_url TEXT,
        technologies JSONB DEFAULT '[]'::jsonb NOT NULL,
        category TEXT,
        start_date TEXT,
        end_date TEXT,
        featured BOOLEAN DEFAULT FALSE NOT NULL,
        "order" INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create creator_experience table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS creator_experience (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        description TEXT NOT NULL,
        technologies JSONB DEFAULT '[]'::jsonb NOT NULL,
        location TEXT,
        "order" INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_creator_projects_creator_id ON creator_projects(creator_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_creator_projects_order ON creator_projects("order")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_creator_experience_creator_id ON creator_experience(creator_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_creator_experience_order ON creator_experience("order")`);

    // Check if old columns exist and migrate
    const checkProjects = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='creators' AND column_name='projects'
      ) as has_projects
    `);

    if (checkProjects.rows[0]?.has_projects) {
      // Migrate projects data
      await db.execute(sql`
        INSERT INTO creator_projects (creator_id, title, description, image_id, demo_url, github_url, technologies, category, start_date, end_date, featured, "order")
        SELECT
          c.id,
          p->>'title',
          p->>'description',
          CASE WHEN p->>'imageId' IS NOT NULL THEN (p->>'imageId')::integer ELSE NULL END,
          p->>'demoUrl',
          p->>'githubUrl',
          COALESCE(p->'technologies', '[]'::jsonb),
          p->>'category',
          p->>'startDate',
          p->>'endDate',
          COALESCE((p->>'featured')::boolean, false),
          0
        FROM creators c
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.projects, '[]'::jsonb)) AS p
        WHERE c.projects IS NOT NULL AND jsonb_array_length(c.projects) > 0
      `);

      // Drop old column
      await db.execute(sql`ALTER TABLE creators DROP COLUMN IF EXISTS projects`);
    }

    const checkExperience = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='creators' AND column_name='experience'
      ) as has_experience
    `);

    if (checkExperience.rows[0]?.has_experience) {
      // Migrate experience data
      await db.execute(sql`
        INSERT INTO creator_experience (creator_id, company, position, start_date, end_date, description, technologies, location, "order")
        SELECT
          c.id,
          e->>'company',
          e->>'position',
          e->>'startDate',
          e->>'endDate',
          e->>'description',
          COALESCE(e->'technologies', '[]'::jsonb),
          e->>'location',
          0
        FROM creators c
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.experience, '[]'::jsonb)) AS e
        WHERE c.experience IS NOT NULL AND jsonb_array_length(c.experience) > 0
      `);

      // Drop old column
      await db.execute(sql`ALTER TABLE creators DROP COLUMN IF EXISTS experience`);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully. Created creator_projects and creator_experience tables with proper foreign keys and indexes.'
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
