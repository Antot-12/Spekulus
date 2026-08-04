import { neon } from '@neondatabase/serverless'

// ==============================
// MIDDLEWARE-SAFE ACTIONS
// ==============================
// This file contains only database actions that can be safely
// imported by middleware. Uses edge-compatible @neondatabase/serverless.
// No 'use server' directive here as it's called from edge middleware.

export async function getPageStatus(pagePath: string): Promise<'live' | 'maintenance' | 'coming-soon'> {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      SELECT status FROM pages WHERE path = ${pagePath} LIMIT 1
    `

    if (!result || result.length === 0) return 'live';

    const status = result[0].status;

    // Map the schema status to the expected return values
    switch (status) {
      case 'active':
        return 'live';
      case 'maintenance':
        return 'maintenance';
      case 'hidden':
        return 'coming-soon';
      default:
        return 'live';
    }
  } catch (error) {
    // Return 'live' as default if database query fails
    console.error('Failed to get page status:', error);
    return 'live';
  }
}
