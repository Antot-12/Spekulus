import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const client = neon(connectionString);
const db = drizzle(client);

// GET all projects for a creator
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const projects = await db.select().from(schema.creatorProjects)
      .where(eq(schema.creatorProjects.creatorId, parseInt(creatorId)))
      .orderBy(asc(schema.creatorProjects.order));

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, ...projectData } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const [newProject] = await db.insert(schema.creatorProjects).values({
      creatorId: parseInt(creatorId),
      ...projectData,
    }).returning();

    return NextResponse.json({ project: newProject });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update a project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...projectData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updatedProject] = await db.update(schema.creatorProjects)
      .set(projectData)
      .where(eq(schema.creatorProjects.id, parseInt(id)))
      .returning();

    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a project
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.delete(schema.creatorProjects)
      .where(eq(schema.creatorProjects.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
