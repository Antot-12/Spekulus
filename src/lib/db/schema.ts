import { pgTable, text, integer, boolean, varchar, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';

export const languages = pgTable('languages', {
    code: varchar('code', { length: 2 }).primaryKey(),
    name: text('name').notNull(),
});

export const heroSections = pgTable('hero_sections', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
    imageUrl: text('image_url').notNull(),
    imageHint: text('image_hint').notNull(),
});

export const productComponents = pgTable('product_components', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    icon: text('icon').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    imageUrl: text('image_url').notNull(),
    imageHint: text('image_hint').notNull(),
});

export const advantages = pgTable('advantages', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    icon: text('icon').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
});

export const actionSections = pgTable('action_sections', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
    description: text('description').notNull(),
    imageUrl: text('image_url').notNull(),
    imageHint: text('image_hint').notNull(),
    visible: boolean('visible').default(true).notNull(),
    buttonText: text('button_text').notNull(),
    buttonUrl: text('button_url').notNull(),
    buttonVisible: boolean('button_visible').default(true).notNull(),
});

export const roadmapEvents = pgTable('roadmap_events', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    date: text('date').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
});

export const faqItems = pgTable('faq_items', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
});

export const devNotes = pgTable('dev_notes', {
    id: serial('id').primaryKey(),
    slug: text('slug').unique().notNull(),
    date: timestamp('date').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    imageHint: text('image_hint'),
    author: text('author'),
    tags: jsonb('tags').$type<string[]>(),
    isVisible: boolean('is_visible').default(true).notNull(),
    reactionCounts: jsonb('reaction_counts').$type<Record<string, number>>(),
});

export const creators = pgTable('creators', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    role: text('role').notNull(),
    bio: text('bio').notNull(),
    imageUrl: text('image_url'),
    imageHint: text('image_hint'),
    location: text('location'),
    languages: jsonb('languages').$type<string[]>(),
    contributions: jsonb('contributions').$type<string[]>(),
    skills: jsonb('skills').$type<string[]>(),
    hobbies: jsonb('hobbies').$type<string[]>(),
    cvUrl: text('cv_url'),
    quote: text('quote'),
    quoteAuthor: text('quote_author'),
    isVisible: boolean('is_visible').default(true).notNull(),
    socials: jsonb('socials').$type<{ twitter?: string, github?: string, linkedin?: string }>(),
    music: jsonb('music').$type<{ spotify?: string, appleMusic?: string, youtubeMusic?: string }>(),
    education: jsonb('education').$type<{ institution: string, degree: string, year: string }[]>(),
    certifications: jsonb('certifications').$type<{ name: string, authority: string, year: string }[]>(),
    gallery: jsonb('gallery').$type<{ imageUrl: string, description: string, imageHint: string }[]>(),
    achievements: jsonb('achievements').$type<{ icon: string, name: string, description: string }[]>(),
    featuredProject: jsonb('featured_project').$type<{ title: string, description: string, url: string, imageUrl?: string, imageHint?: string }>(),
});
