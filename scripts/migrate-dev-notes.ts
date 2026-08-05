import { neon } from '@neondatabase/serverless';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('Adding new columns to dev_notes table...');

  try {
    // Add series column
    await sql`ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS series TEXT`;
    console.log('✓ Added series column');

    // Add series_order column
    await sql`ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS series_order INTEGER`;
    console.log('✓ Added series_order column');

    // Add view_count column with default
    await sql`ALTER TABLE dev_notes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL`;
    console.log('✓ Added view_count column');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
