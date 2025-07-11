import {
    pgTable,
    text,
    integer,
    boolean,
    varchar,
    timestamp,
    jsonb,
    serial,
    customType,
  } from "drizzle-orm/pg-core";
  
  /*─────────────────────────────────────────────────────
    Custom bytea type for binary image data
  ─────────────────────────────────────────────────────*/
  const bytea = customType<{ data: Buffer; driverData: string }>({
    dataType() {
      return "bytea";
    },
    toDriver(value: Buffer): string {
      return "\\x" + value.toString("hex");
    },
    fromDriver(value: string): Buffer {
      if (value.startsWith("\\x")) {
        return Buffer.from(value.slice(2), "hex");
      }
      return Buffer.from(value, "hex");
    },
  });
  
  /*─────────────────────────────────────────────────────
    Languages
  ─────────────────────────────────────────────────────*/
  export const languages = pgTable("languages", {
    code: varchar("code", { length: 2 }).primaryKey(),
    name: text("name").notNull(),
  });
  
  /*─────────────────────────────────────────────────────
    Images (Stored in DB)
  ─────────────────────────────────────────────────────*/
  export const images = pgTable("images", {
    id: serial("id").primaryKey(),
    filename: text("filename"),
    mimeType: text("mime_type"),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  
  /*─────────────────────────────────────────────────────
    Hero Section
  ─────────────────────────────────────────────────────*/
  export const heroSections = pgTable("hero_sections", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 })
      .notNull()
      .references(() => languages.code)
      .unique(), // ✅ required for conflict updates
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    imageId: integer("image_id").references(() => images.id, { onDelete: "set null" }),
  });
  
  /*─────────────────────────────────────────────────────
    Product Components
  ─────────────────────────────────────────────────────*/
  export const productComponents = pgTable("product_components", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 }).notNull().references(() => languages.code),
    icon: text("icon").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageId: integer("image_id").references(() => images.id, { onDelete: "set null" }),
  });
  
  /*─────────────────────────────────────────────────────
    Advantages
  ─────────────────────────────────────────────────────*/
  export const advantages = pgTable("advantages", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 }).notNull().references(() => languages.code),
    icon: text("icon").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
  });
  
  /*─────────────────────────────────────────────────────
    Action Section
  ─────────────────────────────────────────────────────*/
  export const actionSections = pgTable("action_sections", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 })
      .notNull()
      .references(() => languages.code)
      .unique(), // ✅ required for conflict update
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description").notNull(),
    visible: boolean("visible").default(true).notNull(),
    buttonText: text("button_text").notNull(),
    buttonUrl: text("button_url").notNull(),
    buttonVisible: boolean("button_visible").default(true).notNull(),
    imageId: integer("image_id").references(() => images.id, { onDelete: "set null" }),
  });
  
  /*─────────────────────────────────────────────────────
    Roadmap Events
  ─────────────────────────────────────────────────────*/
  export const roadmapEvents = pgTable("roadmap_events", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 }).notNull().references(() => languages.code),
    date: text("date").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
  });
  
  /*─────────────────────────────────────────────────────
    FAQ Items
  ─────────────────────────────────────────────────────*/
  export const faqItems = pgTable("faq_items", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 }).notNull().references(() => languages.code),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
  });
  
  /*─────────────────────────────────────────────────────
    Developer Notes
  ─────────────────────────────────────────────────────*/
  export const devNotes = pgTable("dev_notes", {
    id: serial("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    date: timestamp("date").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    author: text("author"),
    tags: jsonb("tags").$type<string[]>(),
    isVisible: boolean("is_visible").default(true).notNull(),
    reactionCounts: jsonb("reaction_counts").$type<Record<string, number>>(),
    imageId: integer("image_id").references(() => images.id, { onDelete: "set null" }),
  });
  
  /*─────────────────────────────────────────────────────
    Creators
  ─────────────────────────────────────────────────────*/
  export const creators = pgTable("creators", {
    id: serial("id").primaryKey(),
    lang: varchar("lang", { length: 2 }).notNull().references(() => languages.code),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    bio: text("bio").notNull(),
    location: text("location"),
    languages: jsonb("languages").$type<string[]>(),
    contributions: jsonb("contributions").$type<string[]>(),
    skills: jsonb("skills").$type<string[]>(),
    hobbies: jsonb("hobbies").$type<string[]>(),
    cvUrl: text("cv_url"),
    quote: text("quote"),
    quoteAuthor: text("quote_author"),
    isVisible: boolean("is_visible").default(true).notNull(),
    socials: jsonb("socials").$type<{
      twitter?: string;
      github?: string;
      linkedin?: string;
    }>(),
    music: jsonb("music").$type<{
      spotify?: string;
      appleMusic?: string;
      youtubeMusic?: string;
    }>(),
    education: jsonb("education").$type<
      { institution: string; degree: string; year: string }[]
    >(),
    certifications: jsonb("certifications").$type<
      { name: string; authority: string; year: string }[]
    >(),
    gallery: jsonb("gallery").$type<{ imageId: number; description: string }>(),
    achievements: jsonb("achievements").$type<
      { icon: string; name: string; description: string }[]
    >(),
    imageId: integer("image_id").references(() => images.id, { onDelete: "set null" }),
    featuredProjectImageId: integer("featured_project_image_id").references(() => images.id, {
      onDelete: "set null",
    }),
    featuredProject: jsonb("featured_project").$type<{
      title: string;
      description: string;
      url: string;
    }>(),
  });
  