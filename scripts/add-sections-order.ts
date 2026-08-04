import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not set');

const sql = neon(connectionString);

async function addColumn() {
  try {
    // Add the column with default value
    await sql`
      ALTER TABLE creators
      ADD COLUMN IF NOT EXISTS sections_order JSONB DEFAULT '["about","projects","experience","featuredProject","contributions","skills","achievements","education","music","personal","gallery"]'::jsonb NOT NULL
    `;

    console.log('✅ Column sections_order added successfully');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

addColumn().then(() => process.exit(0)).catch(e => {
  console.error('Failed:', e);
  process.exit(1);
});
