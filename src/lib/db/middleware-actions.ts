'use server'

import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

const dbSql = neon(process.env.DATABASE_URL!)
const db = drizzle(dbSql, { schema })

// ==============================
// MIDDLEWARE-SAFE ACTIONS
// ==============================
// This file contains only database actions that can be safely
// imported by middleware without pulling in Node.js-only dependencies

export async function getPageStatus(pagePath: string): Promise<'live' | 'maintenance' | 'coming-soon'> {
  const page = await db.query.pageStatus.findFirst({
      where: eq(schema.pageStatus.path, pagePath),
  });
  return page?.status || 'live';
}
