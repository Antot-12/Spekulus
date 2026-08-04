import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const client = neon(connectionString);
const db = drizzle(client);

// GET all experience for a creator
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const experience = await db.select().from(schema.creatorExperience)
      .where(eq(schema.creatorExperience.creatorId, parseInt(creatorId)))
      .orderBy(asc(schema.creatorExperience.order));

    return NextResponse.json({ experience });
  } catch (error: any) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new experience
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, ...experienceData } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const [newExperience] = await db.insert(schema.creatorExperience).values({
      creatorId: parseInt(creatorId),
      ...experienceData,
    }).returning();

    return NextResponse.json({ experience: newExperience });
  } catch (error: any) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update experience
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...experienceData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updatedExperience] = await db.update(schema.creatorExperience)
      .set(experienceData)
      .where(eq(schema.creatorExperience.id, parseInt(id)))
      .returning();

    return NextResponse.json({ experience: updatedExperience });
  } catch (error: any) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE experience
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.delete(schema.creatorExperience)
      .where(eq(schema.creatorExperience.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
