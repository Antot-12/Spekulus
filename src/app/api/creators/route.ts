import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sectionsOrder, hiddenSections } = body;

    if (!id) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (sectionsOrder !== undefined) {
      updateData.sectionsOrder = sectionsOrder;
    }

    if (hiddenSections !== undefined) {
      updateData.hiddenSections = hiddenSections;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    await db
      .update(schema.creators)
      .set(updateData)
      .where(eq(schema.creators.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating creator:', error);
    return NextResponse.json({ error: 'Failed to update creator' }, { status: 500 });
  }
}
