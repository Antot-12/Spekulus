
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env file");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["advantages", "dev_notes", "faq_items", "hero_sections", "product_components", "roadmap_events", "creators", "action_sections", "languages", "files", "hero_features", "scenarios", "competitor_features", "comparison_sections", "maintenance_settings", "pages", "newsletter_subscriptions", "cooperation_requests", "newsletter_sections", "competitors"],
  out: "./drizzle",
  verbose: true,
  strict: true,
});
