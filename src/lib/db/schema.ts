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
  primaryKey,
  unique
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Buffer): string {
    return '\\x' + value.toString('hex');
  },
  fromDriver(value: string | Buffer): Buffer {
    if (Buffer.isBuffer(value)) return value;
    if (typeof value === 'string' && value.startsWith('\\x')) {
      return Buffer.from(value.slice(2), 'hex');
    }
    return Buffer.from(value as string, 'hex');
  }
});

export const languages = pgTable('languages', {
  code: varchar('code', { length: 2 }).primaryKey(),
  name: text('name').notNull()
});

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  filename: text('filename'),
  mimeType: text('mime_type'),
  data: bytea('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const heroSections = pgTable('hero_sections', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 })
    .notNull()
    .references(() => languages.code)
    .unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  imageId: integer('image_id').references(() => images.id, { onDelete: 'set null' })
});

export const productComponents = pgTable('product_components', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageId: integer('image_id').references(() => images.id, { onDelete: 'set null' })
});

export const advantages = pgTable('advantages', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull()
});

export const actionSections = pgTable('action_sections', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 })
    .notNull()
    .references(() => languages.code)
    .unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  visible: boolean('visible').default(true).notNull(),
  buttonText: text('button_text').notNull(),
  buttonUrl: text('button_url').notNull(),
  buttonVisible: boolean('button_visible').default(true).notNull(),
  imageId: integer('image_id').references(() => images.id, { onDelete: 'set null' })
});

export const roadmapEvents = pgTable('roadmap_events', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  date: text('date').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull()
});

export const faqItems = pgTable('faq_items', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  question: text('question').notNull(),
  answer: text('answer').notNull()
});

export const devNotes = pgTable('dev_notes', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  date: timestamp('date').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  author: text('author'),
  tags: jsonb('tags').$type<string[]>(),
  isVisible: boolean('is_visible').default(true).notNull(),
  reactionCounts: jsonb('reaction_counts').$type<Record<string, number>>(),
  imageId: integer('image_id').references(() => images.id, { onDelete: 'set null' })
});

export const creators = pgTable(
  'creators',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    name: text('name').notNull(),
    role: text('role').notNull(),
    bio: text('bio').notNull(),
    location: text('location'),
    languages: jsonb('languages').$type<string[]>(),
    contributions: jsonb('contributions').$type<string[]>(),
    skills: jsonb('skills').$type<string[]>(),
    hobbies: jsonb('hobbies').$type<string[]>(),
    cvUrl: text('cv_url'),
    quote: text('quote'),
    quoteAuthor: text('quote_author'),
    isVisible: boolean('is_visible').default(true).notNull(),
    socials: jsonb('socials').$type<{
      twitter?: string;
      github?: string;
      linkedin?: string;
    }>(),
    music: jsonb('music').$type<{
      spotify?: string;
      appleMusic?: string;
      youtubeMusic?: string;
    }>(),
    education: jsonb('education').$type<
      { institution: string; degree: string; year: string }[]
    >(),
    certifications: jsonb('certifications').$type<
      { name: string; authority: string; year: string }[]
    >(),
    gallery: jsonb('gallery').$type<{ imageId: number; description: string }[]>(),
    achievements: jsonb('achievements').$type<
      { icon: string; name: string; description: string }[]
    >(),
    imageId: integer('image_id').references(() => images.id, { onDelete: 'set null' }),
    featuredProjectImageId: integer('featured_project_image_id').references(() => images.id, {
      onDelete: 'set null'
    }),
    featuredProject: jsonb('featured_project').$type<{
      title: string;
      description: string;
      url: string;
    }>()
  },
  table => ({
    slugLangUnique: unique('creators_slug_lang_unique').on(table.slug, table.lang)
  })
);
