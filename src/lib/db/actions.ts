
'use server'

import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import {
  Language,
  HeroSectionData,
  ActionSectionData,
  ProductComponent,
  Creator,
  DevNote,
  RoadmapEvent,
  Advantage,
  FaqItem,
  Scenario,
  CompetitorFeature,
  ComparisonSectionData,
} from '../data'
import { eq, and, notInArray, sql as sqlBuilder } from 'drizzle-orm'


const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ==============================
// MAINTENANCE SETTINGS
// ==============================
export type MaintenanceSettings = {
  isActive: boolean;
  message: string;
  endsAt?: Date | null;
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
    const settings = await db.query.maintenanceSettings.findFirst({
        where: eq(schema.maintenanceSettings.id, 1),
    });

    if (settings) {
        // If maintenance mode has an end date and it has passed, automatically turn it off
        if (settings.isActive && settings.endsAt && new Date() > new Date(settings.endsAt)) {
            const [updatedSettings] = await db.update(schema.maintenanceSettings)
                .set({ isActive: false, endsAt: null, updatedAt: new Date() })
                .where(eq(schema.maintenanceSettings.id, 1))
                .returning();
            return updatedSettings;
        }
        return settings;
    }

    // If no settings exist, create the default entry
    const [newSettings] = await db.insert(schema.maintenanceSettings)
        .values({
            id: 1,
            isActive: false,
            message: 'We are currently down for maintenance. Please check back soon!',
            endsAt: null
        })
        .onConflictDoNothing({ target: schema.maintenanceSettings.id })
        .returning();

    return newSettings || { isActive: false, message: '', endsAt: null };
}

export async function updateMaintenanceSettings(data: Partial<MaintenanceSettings>) {
    return await db.update(schema.maintenanceSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.maintenanceSettings.id, 1))
        .returning();
}

// ==============================
// PAGES
// ==============================
export type PageStatus = 'active' | 'hidden' | 'maintenance';
export type PageInfo = { path: string; title: string; status: PageStatus; };

const ALL_PAGES: Omit<PageInfo, 'status'>[] = [
    { path: '/', title: 'Home (Landing Page)' },
    { path: '/dev-notes', title: 'Dev Notes (List)' },
    { path: '/dev-notes/[slug]', title: 'Dev Notes (Detail)' },
    { path: '/creators', title: 'Our Team (List)' },
    { path: '/creators/[slug]', title: 'Our Team (Detail)' },
    { path: '/coming-soon', title: 'Coming Soon' },
    { path: '/not-found', title: '404 Not Found Page' },
    { path: '/admin', title: 'Admin Dashboard' },
    { path: '/login', title: 'Admin Login' }
];

export async function getPages(): Promise<PageInfo[]> {
  const dbPages = await db.query.pages.findMany();
  const dbPagesMap = new Map(dbPages.map(p => [p.path, p]));
  
  const pages = ALL_PAGES.map(p => ({
    ...p,
    status: dbPagesMap.get(p.path)?.status || 'active',
  }));
  
  // Seed pages if they don't exist
  for (const page of pages) {
    await db.insert(schema.pages)
      .values(page)
      .onConflictDoNothing({ target: schema.pages.path });
  }

  return pages;
}

export async function getPageStatus(path: string): Promise<PageStatus | null> {
    const page = await db.query.pages.findFirst({
        where: eq(schema.pages.path, path),
        columns: { status: true }
    });
    return page?.status || null;
}

export async function updatePageStatus(path: string, status: PageStatus) {
    await db.update(schema.pages)
        .set({ status, updatedAt: new Date() })
        .where(eq(schema.pages.path, path));
}



export async function getHeroData(lang: Language): Promise<HeroSectionData | null> {
  const hero = await db.query.heroSections.findFirst({ where: eq(schema.heroSections.lang, lang) })
  if (!hero) return null
  const features = await db.query.heroFeatures.findMany({ where: eq(schema.heroFeatures.lang, lang) })
  return { ...hero, features }
}

export async function updateHeroData(lang: Language, data: Omit<HeroSectionData, 'id'>) {
  const payload = { title: data.title, subtitle: data.subtitle, imageId: data.imageId ?? null }
  await db.insert(schema.heroSections).values({ lang, ...payload }).onConflictDoUpdate({
    target: schema.heroSections.lang,
    set: payload
  })
  await db.delete(schema.heroFeatures).where(eq(schema.heroFeatures.lang, lang))
  if (data.features.length) {
    const rows = data.features.map(f => ({ icon: f.icon, text: f.text, lang }))
    await db.insert(schema.heroFeatures).values(rows)
  }
}

export async function getProductData(lang: Language) {
  const components = await db.query.productComponents.findMany({
    where: eq(schema.productComponents.lang, lang),
    orderBy: (p, { asc }) => [asc(p.id)]
  })
  // This structure is intentionally kept for compatibility with the component
  return { components }
}

export async function updateProductComponents(lang: Language, components: ProductComponent[]) {
  // This is a "delete and replace" strategy for simplicity
  await db.delete(schema.productComponents).where(eq(schema.productComponents.lang, lang))
  if (components.length) {
    const rows = components.map(({ id, ...rest }) => ({ ...rest, lang }))
    await db.insert(schema.productComponents).values(rows)
  }
}

export async function getAdvantagesData(lang: Language) {
  return await db.query.advantages.findMany({
    where: eq(schema.advantages.lang, lang),
    orderBy: (a, { asc }) => [asc(a.id)]
  })
}

export async function createAdvantage(lang: Language, advantage: Omit<Advantage, 'id'>) {
  const [row] = await db.insert(schema.advantages).values({ ...advantage, lang }).returning()
  return row
}

export async function updateAdvantagesData(lang: Language, advantages: Advantage[]) {
  await db.delete(schema.advantages).where(eq(schema.advantages.lang, lang))
  if (advantages.length) {
    const rows = advantages.map(({ id, ...rest }) => ({ ...rest, lang }))
    await db.insert(schema.advantages).values(rows)
  }
}

export async function getActionSectionData(lang: Language) {
  return await db.query.actionSections.findFirst({ where: eq(schema.actionSections.lang, lang) })
}

export async function updateActionSectionData(
  lang: Language,
  data: Omit<ActionSectionData, 'id'>
) {
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    visible: data.visible ?? true,
    buttonText: data.buttonText ?? '',
    buttonUrl: data.buttonUrl ?? '',
    buttonVisible: data.buttonVisible ?? true,
    imageId: data.imageId ?? null
  }
  await db.insert(schema.actionSections).values({ lang, ...payload }).onConflictDoUpdate({
    target: schema.actionSections.lang,
    set: payload
  })
}

export async function getRoadmapEvents(lang: Language) {
  return await db.query.roadmapEvents.findMany({
    where: eq(schema.roadmapEvents.lang, lang),
    orderBy: (r, { asc }) => [asc(r.date)]
  })
}

export async function createRoadmapEvent(lang: Language, e: Omit<RoadmapEvent, 'id'>) {
  const [row] = await db.insert(schema.roadmapEvents).values({ ...e, lang }).returning()
  return row
}

export async function updateRoadmapEvents(lang: Language, events: Omit<RoadmapEvent, 'id'>[]) {
  await db.delete(schema.roadmapEvents).where(eq(schema.roadmapEvents.lang, lang))
  if (events.length) {
    const rows = events.map(r => ({ ...r, lang }))
    await db.insert(schema.roadmapEvents).values(rows)
  }
}

export async function getFaqs(lang: Language) {
  return await db.query.faqItems.findMany({
    where: eq(schema.faqItems.lang, lang),
    orderBy: (f, { asc }) => [asc(f.id)]
  })
}

export async function createFaq(lang: Language, faq: Omit<FaqItem, 'id'>) {
  const [row] = await db.insert(schema.faqItems).values({ ...faq, lang }).returning()
  return row
}

export async function updateFaqs(lang: Language, faqs: FaqItem[]) {
  await db.delete(schema.faqItems).where(eq(schema.faqItems.lang, lang))
  if (faqs.length) {
    const rows = faqs.map(({ id, ...rest }) => ({ ...rest, lang }))
    await db.insert(schema.faqItems).values(rows)
  }
}

export async function getCreators(lang: Language) {
  return await db.query.creators.findMany({ where: eq(schema.creators.lang, lang) })
}

export async function getCreatorBySlug(lang: Language, slug: string) {
  return await db.query.creators.findFirst({
    where: and(eq(schema.creators.slug, slug), eq(schema.creators.lang, lang))
  })
}

export async function createCreator(lang: Language, data: Omit<Creator, 'id'>) {
  const payload = {
    ...data,
    lang,
    imageId: data.imageId ?? null,
    featuredProjectImageId: data.featuredProjectImageId ?? null
  }
  const [row] = await db.insert(schema.creators).values(payload).returning()
  return row
}

export async function updateCreators(lang: Language, creatorsData: Creator[]) {
  const rows = creatorsData.map(c => ({
    ...c,
    lang,
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
    cvUrl: c.cvUrl ?? '',
    quote: c.quote ?? '',
    quoteAuthor: c.quoteAuthor ?? '',
    isVisible: c.isVisible ?? true
  }))
  for (const r of rows) {
    await db.insert(schema.creators).values(r).onConflictDoUpdate({
      target: [schema.creators.slug, schema.creators.lang],
      set: r
    })
  }
  const slugs = creatorsData.map(c => c.slug)
  if (slugs.length) {
    await db.delete(schema.creators).where(
      and(eq(schema.creators.lang, lang), notInArray(schema.creators.slug, slugs))
    )
  } else {
    await db.delete(schema.creators).where(eq(schema.creators.lang, lang))
  }
}

export async function getDevNotes() {
  return await db.query.devNotes.findMany({
    orderBy: (n, { desc }) => [desc(n.date)]
  })
}

export async function getDevNoteBySlug(slug: string) {
  return await db.query.devNotes.findFirst({ where: eq(schema.devNotes.slug, slug) })
}

export async function createDevNote(note: Omit<DevNote, 'id'>) {
  const [row] = await db.insert(schema.devNotes).values(note).returning()
  return row
}

export async function updateDevNote(id: number, note: Partial<Omit<DevNote, 'id'>>) {
  await db.update(schema.devNotes).set(note).where(eq(schema.devNotes.id, id))
}

export async function deleteDevNote(id: number) {
  await db.delete(schema.devNotes).where(eq(schema.devNotes.id, id))
}

export async function getScenarios(lang: Language) {
  return await db.query.scenarios.findMany({
    where: eq(schema.scenarios.lang, lang),
    orderBy: (s, { asc }) => [asc(s.id)],
  })
}

export async function createScenario(lang: Language, scenario: Omit<Scenario, 'id'>) {
  const [row] = await db.insert(schema.scenarios).values({ ...scenario, lang }).returning();
  return row;
}

export async function updateScenarios(lang: Language, scenarios: Scenario[]) {
  await db.delete(schema.scenarios).where(eq(schema.scenarios.lang, lang));
  if (scenarios.length) {
    const rows = scenarios.map(({ id, ...rest }) => ({ ...rest, lang }));
    await db.insert(schema.scenarios).values(rows);
  }
}

export async function getComparisonSectionData(lang: Language): Promise<ComparisonSectionData | null> {
    return await db.query.comparisonSections.findFirst({
        where: eq(schema.comparisonSections.lang, lang),
    });
}

export async function updateComparisonSectionData(lang: Language, data: Omit<ComparisonSectionData, 'id'>) {
    const payload = { ...data };
    await db.insert(schema.comparisonSections)
        .values({ lang, ...payload })
        .onConflictDoUpdate({
            target: schema.comparisonSections.lang,
            set: payload,
        });
}

export async function getCompetitorFeatures(lang: Language) {
    return await db.query.competitorFeatures.findMany({
        where: eq(schema.competitorFeatures.lang, lang),
        orderBy: (c, { asc }) => [asc(c.id)],
    });
}

export async function updateCompetitorFeatures(lang: Language, features: Omit<CompetitorFeature, 'lang'>[]) {
    // Delete all features for the given language
    await db.delete(schema.competitorFeatures).where(eq(schema.competitorFeatures.lang, lang));

    // Re-insert the updated features if any exist
    if (features.length > 0) {
        const rowsToInsert = features.map(({ id, ...rest }) => ({
            ...rest,
            lang: lang,
        }));
        await db.insert(schema.competitorFeatures).values(rowsToInsert);
    }
}

// ==============================
// NEWSLETTER
// ==============================
export async function subscribeToNewsletter(email: string) {
    try {
        await db.insert(schema.newsletterSubscriptions).values({ email }).onConflictDoNothing();
        return { success: true };
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === '23505') { // Unique violation
            return { success: true, message: 'Email is already subscribed.' };
        }
        console.error("Newsletter subscription error:", error);
        return { success: false, error: 'Failed to subscribe.' };
    }
}

// ==============================
// COOPERATION REQUESTS
// ==============================
export type CooperationRequest = typeof schema.cooperationRequests.$inferSelect;
export type NewCooperationRequest = typeof schema.cooperationRequests.$inferInsert;
export type RequestStatus = "pending" | "replied" | "archived";

export async function createCooperationRequest(data: Omit<NewCooperationRequest, 'id' | 'submittedAt' | 'status'>) {
    const [row] = await db.insert(schema.cooperationRequests).values(data).returning();
    return row;
}

export async function getCooperationRequests(): Promise<CooperationRequest[]> {
    return db.query.cooperationRequests.findMany({
        orderBy: (cr, { desc }) => [desc(cr.submittedAt)],
    });
}

export async function updateCooperationRequestStatus(id: number, status: RequestStatus) {
    await db.update(schema.cooperationRequests)
        .set({ status })
        .where(eq(schema.cooperationRequests.id, id));
}

export async function deleteCooperationRequest(id: number) {
    await db.delete(schema.cooperationRequests).where(eq(schema.cooperationRequests.id, id));
}

export async function getFileData(id: number) {
  if (isNaN(id)) return null
  return await db.query.files.findFirst({ where: eq(schema.files.id, id) })
}

export async function getFiles() {
  return db.select({
      id: schema.files.id,
      filename: schema.files.filename,
      mimeType: schema.files.mimeType,
      createdAt: schema.files.createdAt,
      size: sqlBuilder<number>`octet_length(data)`.mapWith(Number),
    }).from(schema.files).orderBy(sqlBuilder`${schema.files.createdAt} desc`);
}

export async function deleteFile(id: number) {
    await db.delete(schema.files).where(eq(schema.files.id, id));
}


export async function uploadFile(fileBuffer: Buffer, filename: string, mimeType: string) {
  const [row] = await db
    .insert(schema.files)
    .values({ data: fileBuffer, filename, mimeType })
    .returning({ id: schema.files.id })
  return row
}
