
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
  NewsletterSectionData,
  CooperationSectionData,
  Competitor,
} from '../data'
import { eq, and, notInArray, sql, ilike, desc, asc, gte, lte, or } from 'drizzle-orm'
import { logAction } from '../logger'
import { Resend } from 'resend'
import { translations } from '../translations'

const dbSql = neon(process.env.DATABASE_URL!)
const db = drizzle(dbSql, { schema })

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

export async function updateMaintenanceSettings(data: Partial<MaintenanceSettings>, actor: string) {
    const beforeState = await getMaintenanceSettings();
    try {
        const [updatedSettings] = await db.update(schema.maintenanceSettings)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.maintenanceSettings.id, 1))
            .returning();
        
        await logAction({
            actor,
            action: 'Update Maintenance Settings',
            target: 'Site-wide',
            changeType: 'SETTINGS',
            before: beforeState,
            after: updatedSettings,
            status: 'SUCCESS'
        });
        return updatedSettings;
    } catch(err: any) {
        await logAction({
            actor,
            action: 'Update Maintenance Settings',
            target: 'Site-wide',
            changeType: 'SETTINGS',
            before: beforeState,
            status: 'FAILURE',
            error: err.message
        });
        throw err;
    }
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

export async function updatePageStatus(path: string, newStatus: PageStatus, actor: string) {
    const beforeState = await getPageStatus(path);
    try {
        await db.update(schema.pages)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(schema.pages.path, path));
        
        await logAction({
            actor,
            action: 'Update Page Status',
            target: path,
            changeType: 'UI_VISIBILITY',
            before: { status: beforeState },
            after: { status: newStatus },
            status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
            actor,
            action: 'Update Page Status',
            target: path,
            changeType: 'UI_VISIBILITY',
            before: { status: beforeState },
            status: 'FAILURE',
            error: err.message
        });
        throw err;
    }
}



export async function getHeroData(lang: Language): Promise<HeroSectionData | null> {
  const hero = await db.query.heroSections.findFirst({ where: eq(schema.heroSections.lang, lang) })
  if (!hero) return null
  const features = await db.query.heroFeatures.findMany({ where: eq(schema.heroFeatures.lang, lang) })
  return { ...hero, features }
}

export async function updateHeroData(lang: Language, data: Omit<HeroSectionData, 'id'>, actor: string) {
  const beforeState = await getHeroData(lang);
  try {
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
      const afterState = await getHeroData(lang);
      await logAction({
          actor,
          action: 'Update Hero Section',
          target: `Hero - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
      });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update Hero Section',
      target: `Hero - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
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

export async function updateProductComponents(lang: Language, components: ProductComponent[], actor: string) {
  const beforeState = await getProductData(lang);
  try {
      await db.delete(schema.productComponents).where(eq(schema.productComponents.lang, lang))
      if (components.length) {
        const rows = components.map(({ id, ...rest }) => ({ ...rest, lang }))
        await db.insert(schema.productComponents).values(rows)
      }
      const afterState = await getProductData(lang);
      await logAction({
          actor,
          action: 'Update Product Section',
          target: `Product - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
      });
  } catch(err: any) {
    await logAction({
        actor,
        action: 'Update Product Section',
        target: `Product - ${lang.toUpperCase()}`,
        changeType: 'CONTENT',
        before: beforeState,
        status: 'FAILURE',
        error: err.message
    });
    throw err;
  }
}

export async function getAdvantagesData(lang: Language) {
  return await db.query.advantages.findMany({
    where: eq(schema.advantages.lang, lang),
    orderBy: (a, { asc }) => [asc(a.id)]
  })
}

export async function createAdvantage(lang: Language, advantage: Omit<Advantage, 'id'>, actor: string) {
  try {
      const [row] = await db.insert(schema.advantages).values({ ...advantage, lang }).returning()
      await logAction({
          actor,
          action: 'Create Advantage',
          target: `Advantage - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          after: row,
          status: 'SUCCESS'
      });
      return row;
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create Advantage',
      target: `Advantage - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateAdvantagesData(lang: Language, advantages: Advantage[], actor: string) {
  const beforeState = await getAdvantagesData(lang);
  try {
    await db.delete(schema.advantages).where(eq(schema.advantages.lang, lang))
    if (advantages.length) {
      const rows = advantages.map(({ id, ...rest }) => ({ ...rest, lang }))
      await db.insert(schema.advantages).values(rows)
    }
    const afterState = await getAdvantagesData(lang);
    await logAction({
        actor,
        action: 'Update Advantages Section',
        target: `Advantages - ${lang.toUpperCase()}`,
        changeType: 'CONTENT',
        before: beforeState,
        after: afterState,
        status: 'SUCCESS'
    });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update Advantages Section',
      target: `Advantages - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function getActionSectionData(lang: Language) {
  return await db.query.actionSections.findFirst({ where: eq(schema.actionSections.lang, lang) })
}

export async function updateActionSectionData(
  lang: Language,
  data: Omit<ActionSectionData, 'id'>,
  actor: string
) {
  const beforeState = await getActionSectionData(lang);
  try {
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
      const afterState = await getActionSectionData(lang);
      await logAction({
        actor,
        action: 'Update Action Section',
        target: `Action - ${lang.toUpperCase()}`,
        changeType: 'CONTENT',
        before: beforeState,
        after: afterState,
        status: 'SUCCESS'
      });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update Action Section',
      target: `Action - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function getRoadmapEvents(lang: Language) {
  return await db.query.roadmapEvents.findMany({
    where: eq(schema.roadmapEvents.lang, lang),
    orderBy: (r, { asc }) => [asc(r.date)]
  })
}

export async function createRoadmapEvent(lang: Language, e: Omit<RoadmapEvent, 'id'>, actor: string) {
  try {
    const [row] = await db.insert(schema.roadmapEvents).values({ ...e, lang }).returning()
    await logAction({
        actor,
        action: 'Create Roadmap Event',
        target: `Roadmap - ${lang.toUpperCase()}`,
        changeType: 'CONTENT',
        after: row,
        status: 'SUCCESS'
    });
    return row
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create Roadmap Event',
      target: `Roadmap - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateRoadmapEvents(lang: Language, events: Omit<RoadmapEvent, 'id'>[], actor: string) {
  const beforeState = await getRoadmapEvents(lang);
  try {
    await db.delete(schema.roadmapEvents).where(eq(schema.roadmapEvents.lang, lang))
    if (events.length) {
      const rows = events.map(r => ({ ...r, lang }))
      await db.insert(schema.roadmapEvents).values(rows)
    }
    const afterState = await getRoadmapEvents(lang);
    await logAction({
      actor,
      action: 'Update Roadmap Events',
      target: `Roadmap - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      after: afterState,
      status: 'SUCCESS'
    });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update Roadmap Events',
      target: `Roadmap - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function getFaqs(lang: Language) {
  return await db.query.faqItems.findMany({
    where: eq(schema.faqItems.lang, lang),
    orderBy: (f, { asc }) => [asc(f.id)]
  })
}

export async function createFaq(lang: Language, faq: Omit<FaqItem, 'id'>, actor: string) {
  try {
    const [row] = await db.insert(schema.faqItems).values({ ...faq, lang }).returning()
    await logAction({
      actor,
      action: 'Create FAQ',
      target: `FAQ - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      after: row,
      status: 'SUCCESS'
    });
    return row
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create FAQ',
      target: `FAQ - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateFaqs(lang: Language, faqs: FaqItem[], actor: string) {
  const beforeState = await getFaqs(lang);
  try {
    await db.delete(schema.faqItems).where(eq(schema.faqItems.lang, lang))
    if (faqs.length) {
      const rows = faqs.map(({ id, ...rest }) => ({ ...rest, lang }))
      await db.insert(schema.faqItems).values(rows)
    }
    const afterState = await getFaqs(lang);
    await logAction({
      actor,
      action: 'Update FAQs',
      target: `FAQ - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      after: afterState,
      status: 'SUCCESS'
    });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update FAQs',
      target: `FAQ - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function getCreators(lang: Language) {
  return await db.query.creators.findMany({ where: eq(schema.creators.lang, lang) })
}

export async function getCreatorBySlug(lang: Language, slug: string) {
  const creator = await db.query.creators.findFirst({
    where: and(eq(schema.creators.slug, slug), eq(schema.creators.lang, lang))
  })
  if (!creator) return null
  return creator
}

export async function createCreator(lang: Language, data: Omit<Creator, 'id'>, actor: string) {
  const payload = {
    ...data,
    lang,
    imageId: data.imageId ?? null,
    featuredProjectImageId: data.featuredProjectImageId ?? null
  }
  try {
    const [row] = await db.insert(schema.creators).values(payload).returning()
    await logAction({
      actor,
      action: 'Create Creator Profile',
      target: `Creator: ${row.name} (${lang.toUpperCase()})`,
      changeType: 'CONTENT',
      after: row,
      status: 'SUCCESS'
    });
    return row
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create Creator Profile',
      target: `Creator: ${data.name} (${lang.toUpperCase()})`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateCreators(lang: Language, creatorsData: Creator[], actor: string) {
    const beforeState = await getCreators(lang);
    try {
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
        }));

        for (const r of rows) {
             if (r.id > 0) { // Existing record
                await db.update(schema.creators).set(r).where(eq(schema.creators.id, r.id));
            } else { // New record (id is likely negative from client)
                const { id, ...newCreatorData } = r;
                await db.insert(schema.creators).values(newCreatorData);
            }
        }

        const currentIds = creatorsData.map(c => c.id).filter(id => id > 0);
        if (currentIds.length > 0) {
            await db.delete(schema.creators).where(
                and(eq(schema.creators.lang, lang), notInArray(schema.creators.id, currentIds))
            );
        } else {
            await db.delete(schema.creators).where(eq(schema.creators.lang, lang));
        }

        const afterState = await getCreators(lang);
        await logAction({
            actor,
            action: 'Update Creator Profiles',
            target: `Creators - ${lang.toUpperCase()}`,
            changeType: 'CONTENT',
            before: beforeState,
            after: afterState,
            status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
            actor,
            action: 'Update Creator Profiles',
            target: `Creators - ${lang.toUpperCase()}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'FAILURE',
            error: err.message
        });
        throw err;
    }
}


export async function getDevNotes(lang: Language) {
  return await db.query.devNotes.findMany({
    where: eq(schema.devNotes.lang, lang),
    orderBy: (n, { desc }) => [desc(n.date)],
  });
}

export async function getDevNoteBySlug(slug: string, lang?: Language): Promise<DevNote[] | null> {
    const whereClause = lang ? and(eq(schema.devNotes.slug, slug), eq(schema.devNotes.lang, lang)) : eq(schema.devNotes.slug, slug);
    const notes = await db.query.devNotes.findMany({
        where: whereClause,
    });
    if (!notes || notes.length === 0) return null;
    return notes.map(note => ({ ...note, date: new Date(note.date) }));
}

export async function createDevNote(note: Omit<DevNote, 'id'>, actor: string) {
  try {
    const [row] = await db.insert(schema.devNotes).values(note).returning()
    await logAction({
        actor,
        action: 'Create Dev Note',
        target: `Note: ${row.title} (${note.lang.toUpperCase()})`,
        changeType: 'CONTENT',
        after: row,
        status: 'SUCCESS'
    });
    return row
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create Dev Note',
      target: `Note: ${note.title} (${note.lang.toUpperCase()})`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateDevNote(note: DevNote, actor: string) {
  const beforeState = await db.query.devNotes.findFirst({
    where: and(eq(schema.devNotes.slug, note.slug), eq(schema.devNotes.lang, note.lang)),
  });
  try {
    const { id, ...noteData } = note;
    const payload = { ...noteData, date: new Date(noteData.date) };

    await db
      .insert(schema.devNotes)
      .values(payload)
      .onConflictDoUpdate({
        target: [schema.devNotes.slug, schema.devNotes.lang],
        set: payload,
      });

    const afterState = await db.query.devNotes.findFirst({
      where: and(eq(schema.devNotes.slug, note.slug), eq(schema.devNotes.lang, note.lang)),
    });

    await logAction({
      actor,
      action: 'Update Dev Note',
      target: `Note: ${note.title} (${note.lang.toUpperCase()})`,
      changeType: 'CONTENT',
      before: beforeState,
      after: afterState,
      status: 'SUCCESS',
    });
  } catch (err: any) {
    await logAction({
      actor,
      action: 'Update Dev Note',
      target: `Note: ${note.title} (${note.lang.toUpperCase()})`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message,
    });
    throw err;
  }
}

export async function deleteDevNote(id: number, actor: string, deleteAllTranslations = false) {
    const beforeState = await db.query.devNotes.findFirst({ where: eq(schema.devNotes.id, id) });
    if (!beforeState) {
        throw new Error("Note not found");
    }
    try {
        if (deleteAllTranslations) {
            await db.delete(schema.devNotes).where(eq(schema.devNotes.slug, beforeState.slug));
        } else {
            await db.delete(schema.devNotes).where(eq(schema.devNotes.id, id));
        }

        await logAction({
            actor,
            action: 'Delete Dev Note',
            target: `Note ID: ${id}, Slug: ${beforeState.slug}, All Translations: ${deleteAllTranslations}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
            actor,
            action: 'Delete Dev Note',
            target: `Note ID: ${id}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'FAILURE',
            error: err.message
        });
        throw err;
    }
}


export async function getScenarios(lang: Language) {
  return await db.query.scenarios.findMany({
    where: eq(schema.scenarios.lang, lang),
    orderBy: (s, { asc }) => [asc(s.id)],
  })
}

export async function createScenario(lang: Language, scenario: Omit<Scenario, 'id'>, actor: string) {
  try {
    const [row] = await db.insert(schema.scenarios).values({ ...scenario, lang }).returning();
    await logAction({
      actor,
      action: 'Create Scenario',
      target: `Scenario - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      after: row,
      status: 'SUCCESS'
    });
    return row;
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Create Scenario',
      target: `Scenario - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

export async function updateScenarios(lang: Language, scenarios: Scenario[], actor: string) {
  const beforeState = await getScenarios(lang);
  try {
    await db.delete(schema.scenarios).where(eq(schema.scenarios.lang, lang));
    if (scenarios.length) {
      const rows = scenarios.map(({ id, ...rest }) => ({ ...rest, lang }));
      await db.insert(schema.scenarios).values(rows);
    }
    const afterState = await getScenarios(lang);
    await logAction({
      actor,
      action: 'Update Scenarios Section',
      target: `Scenarios - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      after: afterState,
      status: 'SUCCESS'
    });
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Update Scenarios Section',
      target: `Scenarios - ${lang.toUpperCase()}`,
      changeType: 'CONTENT',
      before: beforeState,
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

// ==============================
// COMPARISON TABLE
// ==============================

export async function getCompetitors() {
    return await db.query.competitors.findMany({
        orderBy: (c, { asc }) => [asc(c.order)],
    });
}

export async function updateCompetitors(competitors: Competitor[], actor: string) {
    const beforeState = await getCompetitors();
    try {
        await db.delete(schema.competitors);
        if (competitors.length) {
            const validCompetitors = competitors.map(({ id, ...rest }) => ({
                ...rest,
                slug: rest.slug || rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            })).filter(c => c.name);
            if (validCompetitors.length) {
               await db.insert(schema.competitors).values(validCompetitors);
            }
        }
        const afterState = await getCompetitors();
        await logAction({
          actor,
          action: 'Update Competitors',
          target: 'Comparison Table',
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
          actor,
          action: 'Update Competitors',
          target: 'Comparison Table',
          changeType: 'CONTENT',
          before: beforeState,
          status: 'FAILURE',
          error: err.message
        });
        throw err;
    }
}


export async function getComparisonSectionData(lang: Language): Promise<ComparisonSectionData | null> {
    return await db.query.comparisonSections.findFirst({
        where: eq(schema.comparisonSections.lang, lang),
    });
}

export async function updateComparisonSectionData(lang: Language, data: Omit<ComparisonSectionData, 'id'>, actor: string) {
    const beforeState = await getComparisonSectionData(lang);
    try {
        const payload = { ...data };
        await db.insert(schema.comparisonSections)
            .values({ lang, ...payload })
            .onConflictDoUpdate({
                target: schema.comparisonSections.lang,
                set: payload,
            });
        const afterState = await getComparisonSectionData(lang);
        await logAction({
          actor,
          action: 'Update Comparison Section Text',
          target: `Comparison - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
      await logAction({
        actor,
        action: 'Update Comparison Section Text',
        target: `Comparison - ${lang.toUpperCase()}`,
        changeType: 'CONTENT',
        before: beforeState,
        status: 'FAILURE',
        error: err.message
      });
      throw err;
    }
}

export async function getCompetitorFeatures(lang: Language) {
    return await db.query.competitorFeatures.findMany({
        where: eq(schema.competitorFeatures.lang, lang),
        orderBy: (c, { asc }) => [asc(c.id)],
    });
}

export async function updateCompetitorFeatures(lang: Language, features: CompetitorFeature[], actor: string) {
    const beforeState = await getCompetitorFeatures(lang);
    try {
        await db.delete(schema.competitorFeatures).where(eq(schema.competitorFeatures.lang, lang));

        if (features.length > 0) {
            const rowsToInsert = features.map(({ id, ...rest }) => ({
                ...rest,
                lang: lang,
            }));
            await db.insert(schema.competitorFeatures).values(rowsToInsert);
        }
        const afterState = await getCompetitorFeatures(lang);
        await logAction({
          actor,
          action: 'Update Comparison Features',
          target: `Comparison - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
          actor,
          action: 'Update Comparison Features',
          target: `Comparison - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          status: 'FAILURE',
          error: err.message
        });
        throw err;
    }
}

// ==============================
// NEWSLETTER
// ==============================
export async function getNewsletterSectionData(lang: Language): Promise<NewsletterSectionData | null> {
    return await db.query.newsletterSections.findFirst({
        where: eq(schema.newsletterSections.lang, lang),
    });
}

export async function updateNewsletterSectionData(lang: Language, data: Omit<NewsletterSectionData, 'id'>, actor: string) {
    const beforeState = await getNewsletterSectionData(lang);
    try {
        const payload = { 
            ...data,
            button_text: data.buttonText || 'Subscribe',
         };
        await db.insert(schema.newsletterSections)
            .values({ lang, ...payload })
            .onConflictDoUpdate({
                target: schema.newsletterSections.lang,
                set: payload,
            });
        const afterState = await getNewsletterSectionData(lang);
        await logAction({
          actor,
          action: 'Update Newsletter Section',
          target: `Newsletter - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
          actor,
          action: 'Update Newsletter Section',
          target: `Newsletter - ${lang.toUpperCase()}`,
          changeType: 'CONTENT',
          before: beforeState,
          status: 'FAILURE',
          error: err.message
        });
        throw err;
    }
}


export async function subscribeToNewsletter(email: string) {
    try {
        await db.insert(schema.newsletterSubscriptions).values({ email }).onConflictDoNothing();
        return { success: true };
    } catch (error) {
        if (error instanceof Error && 'code' in error && (error as any).code === '23505') { // Unique violation
            return { success: true, message: 'Email is already subscribed.' };
        }
        console.error("Newsletter subscription error:", error);
        return { success: false, error: 'Failed to subscribe.' };
    }
}

// ==============================
// COOPERATION SECTION
// ==============================
export async function getCooperationSectionData(lang: Language): Promise<CooperationSectionData | null> {
    return await db.query.cooperationSections.findFirst({
        where: eq(schema.cooperationSections.lang, lang),
    });
}

export async function updateCooperationSectionData(lang: Language, data: Omit<CooperationSectionData, 'id'>, actor: string) {
    const beforeState = await getCooperationSectionData(lang);
    try {
        const payload = { ...data };
        await db.insert(schema.cooperationSections)
            .values({ lang, ...payload })
            .onConflictDoUpdate({
                target: schema.cooperationSections.lang,
                set: payload,
            });
        const afterState = await getCooperationSectionData(lang);
        await logAction({
            actor,
            action: 'Update Cooperation Section',
            target: `Cooperation - ${lang.toUpperCase()}`,
            changeType: 'CONTENT',
            before: beforeState,
            after: afterState,
            status: 'SUCCESS'
        });
    } catch (err: any) {
        await logAction({
            actor,
            action: 'Update Cooperation Section',
            target: `Cooperation - ${lang.toUpperCase()}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'FAILURE',
            error: err.message
        });
        throw err;
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
    // After saving, trigger the email
    await resendCooperationRequestEmail(row.id, 'System');
    return row;
}

export async function getCooperationRequests(): Promise<CooperationRequest[]> {
    return db.query.cooperationRequests.findMany({
        orderBy: (cr, { desc }) => [desc(cr.submittedAt)],
    });
}

export async function updateCooperationRequestStatus(id: number, status: RequestStatus, actor: string) {
    const beforeState = await db.query.cooperationRequests.findFirst({ where: eq(schema.cooperationRequests.id, id) });
    try {
        await db.update(schema.cooperationRequests)
            .set({ status })
            .where(eq(schema.cooperationRequests.id, id));
        const afterState = await db.query.cooperationRequests.findFirst({ where: eq(schema.cooperationRequests.id, id) });
        await logAction({
          actor,
          action: `Update Cooperation Request Status to ${status.toUpperCase()}`,
          target: `Request ID: ${id}`,
          changeType: 'SETTINGS',
          before: beforeState,
          after: afterState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
          actor,
          action: `Update Cooperation Request Status to ${status.toUpperCase()}`,
          target: `Request ID: ${id}`,
          changeType: 'SETTINGS',
          before: beforeState,
          status: 'FAILURE',
          error: err.message
        });
        throw err;
    }
}

export async function deleteCooperationRequest(id: number, actor: string) {
    const beforeState = await db.query.cooperationRequests.findFirst({ where: eq(schema.cooperationRequests.id, id) });
    try {
        await db.delete(schema.cooperationRequests).where(eq(schema.cooperationRequests.id, id));
        await logAction({
          actor,
          action: 'Delete Cooperation Request',
          target: `Request ID: ${id}`,
          changeType: 'CONTENT',
          before: beforeState,
          status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
          actor,
          action: 'Delete Cooperation Request',
          target: `Request ID: ${id}`,
          changeType: 'CONTENT',
          before: beforeState,
          status: 'FAILURE',
          error: err.message
        });
        throw err;
    }
}

export async function resendCooperationRequestEmail(id: number, actor: string) {
  const request = await db.query.cooperationRequests.findFirst({
    where: eq(schema.cooperationRequests.id, id),
  });

  if (!request) throw new Error("Cooperation request not found");

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend API key is not configured.");
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const t = translations.en.contact; // Using English as a default for notifications

  try {
    const { error } = await resend.emails.send({
      from: 'Spekulus <onboarding@resend.dev>',
      to: 'spekulus.mirror@gmail.com',
      reply_to: request.email,
      subject: `New Cooperation Request from ${request.name}`,
      html: `
        <p>A new cooperation request has been submitted by <strong>${request.name}</strong>.</p>
        <p><strong>Email:</strong> ${request.email}</p>
        ${request.phone ? `<p><strong>Phone:</strong> ${request.phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0;">
            ${request.message.replace(/\n/g, '<br>')}
        </blockquote>
      `,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email via Resend.');
    }

    await logAction({
      actor,
      action: 'Resend Cooperation Email',
      target: `Request ID: ${id} to ${request.email}`,
      changeType: 'SETTINGS',
      after: { email: request.email, subject: `New Cooperation Request from ${request.name}` },
      status: 'SUCCESS',
    });
  } catch (err: any) {
    await logAction({
      actor,
      action: 'Resend Cooperation Email',
      target: `Request ID: ${id}`,
      changeType: 'SETTINGS',
      status: 'FAILURE',
      error: err.message,
    });
    throw new Error(`Failed to send email: ${err.message}`);
  }
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
      size: sql<number>`octet_length(data)`.mapWith(Number),
    }).from(schema.files).orderBy(desc(schema.files.createdAt));
}

export async function deleteFile(id: number, actor: string) {
    const beforeState = await db.query.files.findFirst({ where: eq(schema.files.id, id), columns: { id: true, filename: true, mimeType: true }});
    try {
        await db.delete(schema.files).where(eq(schema.files.id, id));
        await logAction({
            actor,
            action: 'Delete File',
            target: `File ID: ${id}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'SUCCESS'
        });
    } catch(err: any) {
        await logAction({
            actor,
            action: 'Delete File',
            target: `File ID: ${id}`,
            changeType: 'CONTENT',
            before: beforeState,
            status: 'FAILURE',
            error: err.message
        });
        throw err;
    }
}


export async function uploadFile(fileBuffer: Buffer, filename: string, mimeType: string, actor: string) {
  try {
    const [row] = await db
      .insert(schema.files)
      .values({ data: fileBuffer, filename, mimeType })
      .returning({ id: schema.files.id, filename: schema.files.filename, mimeType: schema.files.mimeType })
    
    // Log the action without the binary data
    const logPayload = {
        ...row,
        size: fileBuffer.length,
    };

    await logAction({
      actor,
      action: 'Upload File',
      target: `File: ${row.filename}`,
      changeType: 'CONTENT',
      after: logPayload,
      status: 'SUCCESS'
    });
    
    return row
  } catch(err: any) {
    await logAction({
      actor,
      action: 'Upload File',
      target: `File: ${filename}`,
      changeType: 'CONTENT',
      status: 'FAILURE',
      error: err.message
    });
    throw err;
  }
}

// ==============================
// AUDIT LOGS
// ==============================
type GetAuditLogsParams = {
    page: number;
    filters: {
        query?: string;
        changeType?: string;
        status?: string;
        dateRange?: { from?: Date; to?: Date };
    };
    sort: {
        by: string;
        direction: 'asc' | 'desc';
    };
    pageSize?: number;
};

export async function getAuditLogs(params: GetAuditLogsParams): Promise<{ logs: any[], total: number }> {
    const { page, filters, sort, pageSize = 20 } = params;

    const whereClauses = [];

    if (filters.query) {
        const queryLower = filters.query.toLowerCase();
        whereClauses.push(
            or(
                ilike(schema.auditLogs.actor, `%${queryLower}%`),
                ilike(schema.auditLogs.action, `%${queryLower}%`),
                ilike(schema.auditLogs.target, `%${queryLower}%`)
            )
        );
    }
    if (filters.changeType && filters.changeType !== 'all') {
        whereClauses.push(eq(schema.auditLogs.changeType, filters.changeType as any));
    }
    if (filters.status && filters.status !== 'all') {
        whereClauses.push(eq(schema.auditLogs.status, filters.status as any));
    }
    if (filters.dateRange?.from) {
        whereClauses.push(gte(schema.auditLogs.timestamp, filters.dateRange.from));
    }
    if (filters.dateRange?.to) {
        whereClauses.push(lte(schema.auditLogs.timestamp, filters.dateRange.to));
    }

    const finalWhere = whereClauses.length > 0 ? and(...whereClauses) : undefined;

    const logsQuery = db.select()
        .from(schema.auditLogs)
        .where(finalWhere)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    const sortColumn = (schema.auditLogs as any)[sort.by] || schema.auditLogs.timestamp;
    if (sort.direction === 'asc') {
        logsQuery.orderBy(asc(sortColumn));
    } else {
        logsQuery.orderBy(desc(sortColumn));
    }

    const logs = await logsQuery;

    const [totalResult] = await db.select({ count: sql`count(*)` }).from(schema.auditLogs).where(finalWhere);
    const total = Number(totalResult.count);

    return { logs, total };
}

export async function getAuditLogsAsCsv() {
    const logs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp));
    if (logs.length === 0) return '';

    const headers = Object.keys(logs[0]);
    const csvRows = [headers.join(',')];

    for (const log of logs) {
        const values = headers.map(header => {
            let value = (log as any)[header];
            if (value instanceof Date) {
                value = value.toISOString();
            } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value).replace(/"/g, '""');
            }
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

export async function getStorageInfo() {
  const result = await dbSql.execute(sql`
    SELECT
      pg_database_size(current_database()) as total_size,
      (SELECT pg_total_relation_size('files')) as files_table_size,
      (SELECT pg_total_relation_size('audit_logs')) as logs_table_size;
  `);
  const { total_size, files_table_size, logs_table_size } = (result.rows[0] ?? {}) as any;
  
  return {
    totalSize: Number(total_size) || 0,
    filesSize: Number(files_table_size) || 0,
    logsSize: Number(logs_table_size) || 0,
  };
}

    
