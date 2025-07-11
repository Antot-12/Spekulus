
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
  await db.delete(schema.creators);
  await db.delete(schema.devNotes);
  await db.delete(schema.faqItems);
  await db.delete(schema.roadmapEvents);
  await db.delete(schema.actionSections);
  await db.delete(schema.advantages);
  await db.delete(schema.productComponents);
  await db.delete(schema.heroSections);
  await db.delete(schema.languages);
  await db.delete(schema.images);

  // Seed languages
  await db.insert(schema.languages).values([
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'sk', name: 'Slovak' },
  ]).onConflictDoNothing();
  console.log("Languages seeded.");

  // Seed hero sections
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.heroSections).values({ ...initialData.heroSectionData[lang], lang, imageId: null }).onConflictDoNothing();
  }
  console.log("Hero sections seeded.");

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

  console.log("Database seeding complete.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
