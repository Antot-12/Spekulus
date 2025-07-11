
'use server';

import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import type { Language } from '../data';
import { eq } from 'drizzle-orm';
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Hero Section Actions
export async function getHeroData(lang: Language) {
  return await db.query.heroSections.findFirst({ where: eq(schema.heroSections.lang, lang) });
}

export async function updateHeroData(lang: Language, data: Omit<typeof schema.heroSections.$inferInsert, 'lang'>) {
  return await db.insert(schema.heroSections)
    .values({ ...data, lang })
    .onConflictDoUpdate({ target: schema.heroSections.lang, set: data });
}

// Product Section Actions
export async function getProductData(lang: Language) {
    const components = await db.query.productComponents.findMany({ 
        where: eq(schema.productComponents.lang, lang),
        orderBy: (productComponents, { asc }) => [asc(productComponents.id)],
    });
    // This is a placeholder for a main title/subtitle for the product section if needed.
    // For now, we'll get it from the translations file. In a real scenario, this could be another table.
    return {
        components
    };
}

export async function updateProductComponents(lang: Language, components: (typeof schema.productComponents.$inferInsert)[]) {
    const promises = components.map(component => 
        db.insert(schema.productComponents)
          .values({ ...component, lang })
          .onConflictDoUpdate({ 
              target: [schema.productComponents.id, schema.productComponents.lang], 
              set: { 
                  icon: component.icon, 
                  title: component.title, 
                  description: component.description, 
                  imageId: component.imageId 
                } 
            })
    );
    return Promise.all(promises);
}

// Advantages Section Actions
export async function getAdvantagesData(lang: Language) {
    return await db.query.advantages.findMany({ 
        where: eq(schema.advantages.lang, lang),
        orderBy: (advantages, { asc }) => [asc(advantages.id)],
     });
}

export async function createAdvantage(lang: Language, advantage: Omit<typeof schema.advantages.$inferInsert, 'lang' | 'id'>) {
    const [newAdvantage] = await db.insert(schema.advantages).values({ ...advantage, lang }).returning();
    return newAdvantage;
}

export async function updateAdvantagesData(lang: Language, advantages: (typeof schema.advantages.$inferInsert)[]) {
    await db.delete(schema.advantages).where(eq(schema.advantages.lang, lang));
    if (advantages.length > 0) {
        const insertData = advantages.map(({ id, ...rest }) => ({ ...rest, lang }));
        return db.insert(schema.advantages).values(insertData);
    }
}

// Action Section Actions
export async function getActionSectionData(lang: Language) {
    return await db.query.actionSections.findFirst({ where: eq(schema.actionSections.lang, lang) });
}

export async function updateActionSectionData(lang: Language, data: Omit<typeof schema.actionSections.$inferInsert, 'lang' | 'id'>) {
    return await db.insert(schema.actionSections)
      .values({ ...data, lang })
      .onConflictDoUpdate({ target: schema.actionSections.lang, set: data });
}

// Roadmap Actions
export async function getRoadmapEvents(lang: Language) {
    return await db.query.roadmapEvents.findMany({ 
        where: eq(schema.roadmapEvents.lang, lang),
        orderBy: (roadmapEvents, { asc }) => [asc(roadmapEvents.id)],
    });
}

export async function createRoadmapEvent(lang: Language, event: Omit<typeof schema.roadmapEvents.$inferInsert, 'lang' | 'id'>) {
    const [newEvent] = await db.insert(schema.roadmapEvents).values({ ...event, lang }).returning();
    return newEvent;
}

export async function updateRoadmapEvents(lang: Language, events: (typeof schema.roadmapEvents.$inferInsert)[]) {
    await db.delete(schema.roadmapEvents).where(eq(schema.roadmapEvents.lang, lang));
    if (events.length > 0) {
        const insertData = events.map(({ id, ...rest }) => ({ ...rest, lang }));
        return await db.insert(schema.roadmapEvents).values(insertData);
    }
}


// FAQ Actions
export async function getFaqs(lang: Language) {
    return await db.query.faqItems.findMany({ where: eq(schema.faqItems.lang, lang) });
}

export async function createFaq(lang: Language, faq: Omit<typeof schema.faqItems.$inferInsert, 'lang' | 'id'>) {
    const [newFaq] = await db.insert(schema.faqItems).values({ ...faq, lang }).returning();
    return newFaq;
}

export async function updateFaqs(lang: Language, faqs: (Omit<typeof schema.faqItems.$inferInsert, 'id' | 'lang'>)[]) {
    await db.delete(schema.faqItems).where(eq(schema.faqItems.lang, lang));
    if (faqs.length > 0) {
        return await db.insert(schema.faqItems).values(faqs.map(f => ({...f, lang})));
    }
}

// Creator Actions
export async function getCreators(lang: Language) {
    return await db.query.creators.findMany({ where: eq(schema.creators.lang, lang) });
}

export async function getCreatorBySlug(lang: Language, slug: string) {
    return await db.query.creators.findFirst({ where: eq(schema.creators.slug, slug) && eq(schema.creators.lang, lang) });
}

export async function createCreator(lang: Language, creatorData: Omit<typeof schema.creators.$inferInsert, 'id' | 'lang'>) {
    const [newCreator] = await db.insert(schema.creators).values({ ...creatorData, lang }).returning();
    return newCreator;
}

export async function updateCreators(lang: Language, creatorsData: (typeof schema.creators.$inferInsert)[]) {
    await db.delete(schema.creators).where(eq(schema.creators.lang, lang));
    if (creatorsData.length > 0) {
      const creatorsToInsert = creatorsData.map(c => ({ ...c, lang }));
      return await db.insert(schema.creators).values(creatorsToInsert);
    }
}

// Dev Notes Actions
export async function getDevNotes() {
    return await db.query.devNotes.findMany({ orderBy: (notes, { desc }) => [desc(notes.date)] });
}

export async function getDevNoteBySlug(slug: string) {
    return await db.query.devNotes.findFirst({ where: eq(schema.devNotes.slug, slug) });
}

export async function createDevNote(note: Omit<typeof schema.devNotes.$inferInsert, 'id'>) {
    const [newNote] = await db.insert(schema.devNotes).values(note).returning();
    return newNote;
}

export async function updateDevNote(id: number, note: Partial<typeof schema.devNotes.$inferInsert>) {
    return await db.update(schema.devNotes).set(note).where(eq(schema.devNotes.id, id));
}

export async function deleteDevNote(id: number) {
    return await db.delete(schema.devNotes).where(eq(schema.devNotes.id, id));
}

// Image Actions
export async function getImage(id: number) {
  if (isNaN(id)) return null;
  return await db.query.images.findFirst({ where: eq(schema.images.id, id) });
}

export async function uploadImage(fileBuffer: Buffer, filename: string, mimeType: string) {
    const [inserted] = await db.insert(schema.images).values({
        data: fileBuffer,
        filename,
        mimeType
    }).returning({ id: schema.images.id });
    return inserted;
}
