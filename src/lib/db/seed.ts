
import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { initialData } from '../data'; // We'll move the data here

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // Seed languages
  await db.insert(schema.languages).values([
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'sk', name: 'Slovak' },
  ]).onConflictDoNothing();
  console.log("Languages seeded.");

  // Seed hero sections
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.heroSections).values({ ...initialData.heroSectionData[lang], lang }).onConflictDoUpdate({ target: schema.heroSections.lang, set: initialData.heroSectionData[lang]});
  }
  console.log("Hero sections seeded.");

  // Seed product components
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const component of initialData.productSectionData[lang].components) {
          await db.insert(schema.productComponents).values({ ...component, lang }).onConflictDoUpdate({ target: schema.productComponents.id, set: component});
      }
  }
  console.log("Product components seeded.");

  // Seed advantages
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const advantage of initialData.advantagesData[lang]) {
          await db.insert(schema.advantages).values({ ...advantage, lang }).onConflictDoUpdate({target: schema.advantages.id, set: advantage});
      }
  }
  console.log("Advantages seeded.");

    // Seed action sections
  for (const lang of ['en', 'uk', 'sk'] as const) {
      await db.insert(schema.actionSections).values({ ...initialData.actionSectionData[lang], lang }).onConflictDoUpdate({target: schema.actionSections.lang, set: initialData.actionSectionData[lang]});
  }
  console.log("Action sections seeded.");

  // Seed roadmap events
  await db.delete(schema.roadmapEvents);
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const event of initialData.roadmapEvents[lang]) {
          await db.insert(schema.roadmapEvents).values({ ...event, lang });
      }
  }
  console.log("Roadmap events seeded.");

  // Seed FAQ items
  await db.delete(schema.faqItems);
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const item of initialData.faqData[lang]) {
        // id is a serial, so we don't pass it in
        const { id, ...rest } = item;
        await db.insert(schema.faqItems).values({ ...rest, lang });
      }
  }
  console.log("FAQ items seeded.");

  // Seed dev notes
  await db.delete(schema.devNotes);
  for (const note of initialData.devNotes['en']) {
      await db.insert(schema.devNotes).values({ ...note, date: new Date(note.date) });
  }
  console.log("Dev notes seeded.");
  
  // Seed creators
  await db.delete(schema.creators);
  for (const lang of ['en', 'uk', 'sk'] as const) {
      for (const creator of initialData.creatorsData[lang]) {
          await db.insert(schema.creators).values({ ...creator, lang });
      }
  }
  console.log("Creators seeded.");

  console.log("Database seeding complete.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
