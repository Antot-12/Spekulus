
'use server';

import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import type { Language, HeroSectionData, ActionSectionData, ProductComponent, Creator, DevNote, RoadmapEvent, Advantage, FaqItem } from '../data';
import { eq, and, notInArray } from 'drizzle-orm';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Hero Section Actions
export async function getHeroData(lang: Language) {
  return await db.query.heroSections.findFirst({ where: eq(schema.heroSections.lang, lang) });
}

export async function updateHeroData(lang: Language, data: Omit<HeroSectionData, 'id'>) {
    const payload = {
        title: data.title,
        subtitle: data.subtitle,
        imageId: data.imageId ?? null,
    };
    await db.insert(schema.heroSections)
        .values({ lang, ...payload })
        .onConflictDoUpdate({
            target: schema.heroSections.lang,
            set: payload,
        });
}


// Product Section Actions
export async function getProductData(lang: Language) {
  const components = await db.query.productComponents.findMany({
    where: eq(schema.productComponents.lang, lang),
    orderBy: (productComponents, { asc }) => [asc(productComponents.id)],
  });
  // This part is tricky, we are not storing title/subtitle in db for components.
  // We'll rely on the translations file for this on the page.
  return { components };
}

export async function updateProductComponents(lang: Language, components: ProductComponent[]) {
  await db.transaction(async (tx) => {
    await tx.delete(schema.productComponents).where(eq(schema.productComponents.lang, lang));
    if (components.length > 0) {
      const componentsToInsert = components.map(({ id, ...rest }) => ({ ...rest, lang }));
      await tx.insert(schema.productComponents).values(componentsToInsert);
    }
  });
}

// Advantages Section Actions
export async function getAdvantagesData(lang: Language) {
  return await db.query.advantages.findMany({
    where: eq(schema.advantages.lang, lang),
    orderBy: (advantages, { asc }) => [asc(advantages.id)],
  });
}

export async function createAdvantage(lang: Language, advantage: Omit<Advantage, 'id'>) {
  const [newAdvantage] = await db.insert(schema.advantages).values({ ...advantage, lang }).returning();
  return newAdvantage;
}

export async function updateAdvantagesData(lang: Language, advantages: Advantage[]) {
   await db.transaction(async (tx) => {
      await tx.delete(schema.advantages).where(eq(schema.advantages.lang, lang));
      if (advantages.length > 0) {
        const dataToInsert = advantages.map(({id, ...rest}) => ({...rest, lang}));
        await tx.insert(schema.advantages).values(dataToInsert);
      }
  });
}

// Action Section Actions
export async function getActionSectionData(lang: Language) {
  return db.query.actionSections.findFirst({
    where: eq(schema.actionSections.lang, lang),
  });
}

export async function updateActionSectionData(
  lang: Language,
  data: Omit<ActionSectionData, 'id'>,
) {
  // приводимо undefined → null, аби drizzle не викидав «invalid input»
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    visible: data.visible ?? true,
    buttonText: data.buttonText ?? '',
    buttonUrl: data.buttonUrl ?? '',
    buttonVisible: data.buttonVisible ?? true,
    imageId: data.imageId ?? null,
  };

  await db
    .insert(schema.actionSections)
    .values({ lang, ...payload })
    .onConflictDoUpdate({
      target: schema.actionSections.lang,
      set: payload,
    });
}


// Roadmap Actions
export async function getRoadmapEvents(lang: Language) {
  return await db.query.roadmapEvents.findMany({
    where: eq(schema.roadmapEvents.lang, lang),
    orderBy: (roadmapEvents, { asc }) => [asc(roadmapEvents.date)],
  });
}

export async function createRoadmapEvent(lang: Language, event: Omit<RoadmapEvent, 'id'>) {
  const [newEvent] = await db.insert(schema.roadmapEvents).values({ ...event, lang }).returning();
  return newEvent;
}

export async function updateRoadmapEvents(lang: Language, events: Omit<RoadmapEvent, 'id'>[]) {
   await db.transaction(async (tx) => {
      await tx.delete(schema.roadmapEvents).where(eq(schema.roadmapEvents.lang, lang));
      if (events.length > 0) {
        await tx.insert(schema.roadmapEvents).values(events.map(e => ({ ...e, lang })));
      }
  });
}

// FAQ Actions
export async function getFaqs(lang: Language) {
  return await db.query.faqItems.findMany({
    where: eq(schema.faqItems.lang, lang),
    orderBy: (faqItems, { asc }) => [asc(faqItems.id)],
  });
}

export async function createFaq(lang: Language, faq: Omit<FaqItem, 'id'>) {
  const [newFaq] = await db.insert(schema.faqItems).values({ ...faq, lang }).returning();
  return newFaq;
}

export async function updateFaqs(lang: Language, faqs: FaqItem[]) {
  await db.transaction(async (tx) => {
    await tx.delete(schema.faqItems).where(eq(schema.faqItems.lang, lang));
    if (faqs.length > 0) {
      const dataToInsert = faqs.map(({id, ...rest}) => ({...rest, lang}));
      await tx.insert(schema.faqItems).values(dataToInsert);
    }
  });
}


// Creator Actions
export async function getCreators(lang: Language) {
  return await db.query.creators.findMany({
    where: eq(schema.creators.lang, lang),
    orderBy: (creators, { asc }) => [asc(creators.id)],
  });
}

export async function getCreatorBySlug(lang: Language, slug: string) {
  return await db.query.creators.findFirst({
    where: and(eq(schema.creators.slug, slug), eq(schema.creators.lang, lang)),
  });
}

export async function createCreator(lang: Language, data: Omit<Creator, 'id'>) {
  const payload = {
    ...data,
    lang,
    imageId: data.imageId || null,
    featuredProjectImageId: data.featuredProjectImageId || null,
  };
  const [newCreator] = await db.insert(schema.creators).values(payload).returning();
  return newCreator;
}

export async function updateCreators(lang: Language, creatorsData: Creator[]) {
  const safeCreators = creatorsData.map((c) => {
    const { ...rest } = c;
    return {
      ...rest,
      lang,
      isVisible: c.isVisible ?? true,
      imageId: c.imageId ?? null,
      featuredProjectImageId: c.featuredProjectImageId ?? null,
      gallery: c.gallery ?? [],
      skills: c.skills ?? [],
      languages: c.languages ?? [],
      contributions: c.contributions ?? [],
      hobbies: c.hobbies ?? [],
      music: c.music ?? {},
      socials: c.socials ?? {},
      education: c.education ?? [],
      certifications: c.certifications ?? [],
      achievements: c.achievements ?? [],
      featuredProject: c.featuredProject ?? { title: '', description: '', url: '' },
      cvUrl: c.cvUrl ?? null,
      quote: c.quote ?? null,
      quoteAuthor: c.quoteAuthor ?? null,
    };
  });

  try {
    for (const creator of safeCreators) {
      const { id, ...creatorWithoutId } = creator;
      await db
        .insert(schema.creators)
        .values(creator)
        .onConflictDoUpdate({
          target: [schema.creators.slug, schema.creators.lang],
          set: creatorWithoutId,
        });
    }

    const currentSlugs = creatorsData.map((c) => c.slug);

    if (currentSlugs.length > 0) {
      await db
        .delete(schema.creators)
        .where(
          and(
            eq(schema.creators.lang, lang),
            notInArray(schema.creators.slug, currentSlugs)
          )
        );
    } else {
      await db.delete(schema.creators).where(eq(schema.creators.lang, lang));
    }
  } catch (error: any) {
    const msg = error?.message || "Unknown error in updateCreators";
    console.error("❌ updateCreators error:", msg);
    throw new Error("[updateCreators] " + msg);
  }
}




// Dev Notes Actions
export async function getDevNotes() {
  return await db.query.devNotes.findMany({ orderBy: (notes, { desc }) => [desc(notes.date)] });
}

export async function getDevNoteBySlug(slug: string) {
  return await db.query.devNotes.findFirst({ where: eq(schema.devNotes.slug, slug) });
}

export async function createDevNote(note: Omit<DevNote, 'id'>) {
  const [newNote] = await db.insert(schema.devNotes).values(note).returning();
  return newNote;
}

export async function updateDevNote(id: number, note: Partial<Omit<DevNote, 'id'>>) {
  await db.update(schema.devNotes).set(note).where(eq(schema.devNotes.id, id));
}

export async function deleteDevNote(id: number) {
  await db.delete(schema.devNotes).where(eq(schema.devNotes.id, id));
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
    mimeType,
  }).returning({ id: schema.images.id });
  return inserted;
}