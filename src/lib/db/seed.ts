
import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { initialData } from '../data';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.maintenanceSettings);
  await db.delete(schema.partnerSections);
  await db.delete(schema.comparisonSections);
  await db.delete(schema.competitorFeatures);
  await db.delete(schema.scenarios);
  await db.delete(schema.creators);
  await db.delete(schema.devNotes);
  await db.delete(schema.faqItems);
  await db.delete(schema.roadmapEvents);
  await db.delete(schema.actionSections);
  await db.delete(schema.advantages);
  await db.delete(schema.productComponents);
  await db.delete(schema.heroFeatures);
  await db.delete(schema.heroSections);
  await db.delete(schema.languages);
  await db.delete(schema.files);

  // Seed languages
  await db.insert(schema.languages).values([
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'sk', name: 'Slovak' },
  ]).onConflictDoNothing();
  console.log("Languages seeded.");
  
  // Seed maintenance settings
  await db.insert(schema.maintenanceSettings).values({ id: 1 }).onConflictDoNothing();
  console.log("Maintenance settings seeded.");


  // Seed hero sections and features
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.heroSections).values({ ...initialData.heroSectionData[lang], lang, imageId: null }).onConflictDoNothing();
      const features = initialData.heroFeaturesData[lang].map(f => ({ ...f, lang }));
      if (features.length > 0) {
        await db.insert(schema.heroFeatures).values(features);
      }
  }
  console.log("Hero sections and features seeded.");

  // Seed product components
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const component of initialData.productSectionData[lang].components) {
          await db.insert(schema.productComponents).values({ ...component, lang, imageId: null }).onConflictDoNothing();
      }
  }
  console.log("Product components seeded.");

  // Seed advantages
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const advantage of initialData.advantagesData[lang]) {
          await db.insert(schema.advantages).values({ ...advantage, lang }).onConflictDoNothing();
      }
  }
  console.log("Advantages seeded.");

    // Seed action sections
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.actionSections).values({ ...initialData.actionSectionData[lang], lang, imageId: null }).onConflictDoNothing();
  }
  console.log("Action sections seeded.");

  // Seed roadmap events
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const event of initialData.roadmapEvents[lang]) {
          await db.insert(schema.roadmapEvents).values({ ...event, lang });
      }
  }
  console.log("Roadmap events seeded.");

  // Seed FAQ items
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const item of initialData.faqData[lang]) {
        await db.insert(schema.faqItems).values({ ...item, lang });
      }
  }
  console.log("FAQ items seeded.");

  // Seed dev notes
  for (const note of initialData.devNotes['en']) {
      await db.insert(schema.devNotes).values({ ...note, date: new Date(note.date), imageId: null });
  }
  console.log("Dev notes seeded.");
  
  // Seed creators
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const creator of initialData.creatorsData[lang]) {
          await db.insert(schema.creators).values({ ...creator, lang, imageId: null, featuredProjectImageId: null });
      }
  }
  console.log("Creators seeded.");

  // Seed scenarios
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const scenario of initialData.scenariosData[lang]) {
          await db.insert(schema.scenarios).values({ ...scenario, lang });
      }
  }
  console.log("Scenarios seeded.");
  
  // Seed comparison section text
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.comparisonSections).values({ ...initialData.comparisonSectionData[lang], lang }).onConflictDoNothing();
  }
  console.log("Comparison section text seeded.");

  // Seed competitor features
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const feature of initialData.competitorFeaturesData[lang]) {
          await db.insert(schema.competitorFeatures).values({ ...feature, lang });
      }
  }
  console.log("Competitor features seeded.");

  // Seed partner sections
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.partnerSections).values({ ...initialData.partnerSectionData[lang], lang, imageId: null }).onConflictDoNothing();
  }
  console.log("Partner sections seeded.");

  console.log("Database seeding complete.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
