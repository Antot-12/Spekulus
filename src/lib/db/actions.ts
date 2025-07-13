
'use server'

import 'server-only'
import { neon, neonConfig } from '@neondatabase/serverless'
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
  PartnerSectionData,
} from '../data'
import { eq, and, notInArray, sql as sqlBuilder } from 'drizzle-orm'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

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
  return { components }
}

export async function updateProductComponents(lang: Language, components: ProductComponent[]) {
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

export async function createCreator(lang: Language, data: Creator) {
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

export async function getCompetitorFeatures(lang: Language) {
    return await db.query.competitorFeatures.findMany({
        where: eq(schema.competitorFeatures.lang, lang),
        orderBy: (c, { asc }) => [asc(c.id)],
    });
}

export async function updateCompetitorFeatures(lang: Language, features: CompetitorFeature[]) {
    await db.delete(schema.competitorFeatures).where(eq(schema.competitorFeatures.lang, lang));
    if (features.length) {
        const rows = features.map(({ id, ...rest }) => ({...rest, lang }));
        await db.insert(schema.competitorFeatures).values(rows);
    }
}

export async function getPartnerSectionData(lang: Language) {
    return await db.query.partnerSections.findFirst({
        where: eq(schema.partnerSections.lang, lang),
    });
}

export async function updatePartnerSectionData(lang: Language, data: Omit<PartnerSectionData, 'id'>) {
    const payload = { ...data, imageId: data.imageId ?? null };
    await db.insert(schema.partnerSections)
        .values({ lang, ...payload })
        .onConflictDoUpdate({
            target: schema.partnerSections.lang,
            set: payload,
        });
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
