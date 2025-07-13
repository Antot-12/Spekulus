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
  unique,
  pgEnum
} from 'drizzle-orm/pg-core'

const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return 'bytea'
  },
  toDriver(v: Buffer) {
    return '\\x' + v.toString('hex')
  },
  fromDriver(v: string | Buffer) {
    if (Buffer.isBuffer(v)) return v
    if (typeof v === 'string' && v.startsWith('\\x')) return Buffer.from(v.slice(2), 'hex')
    return Buffer.from(v as string, 'hex')
  }
})

export const languages = pgTable('languages', {
  code: varchar('code', { length: 2 }).primaryKey(),
  name: text('name').notNull()
})

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  filename: text('filename'),
  mimeType: text('mime_type'),
  data: bytea('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const maintenanceSettings = pgTable('maintenance_settings', {
    id: serial('id').primaryKey(), // Using a single row with ID 1
    isActive: boolean('is_active').default(false).notNull(),
    message: text('message').notNull().default('We will be back shortly.'),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pageStatusEnum = pgEnum('page_status', ['active', 'hidden', 'maintenance']);

export const pages = pgTable('pages', {
    path: varchar('path', { length: 255 }).primaryKey(),
    title: text('title').notNull(),
    status: pageStatusEnum('status').default('active').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const heroSections = pgTable('hero_sections', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code).unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  imageId: integer('image_id').references(() => files.id, { onDelete: 'set null' })
})

export const heroFeatures = pgTable('hero_features', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  icon: text('icon').notNull(),
  text: text('text').notNull()
})

export const productComponents = pgTable('product_components', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageId: integer('image_id').references(() => files.id, { onDelete: 'set null' })
})

export const advantages = pgTable('advantages', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull()
})

export const scenarios = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    icon: text('icon').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
});

export const comparisonSections = pgTable('comparison_sections', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code).unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
});

export const competitorFeatures = pgTable('competitor_features', {
    id: serial('id').primaryKey(),
    lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
    feature: text('feature').notNull(),
    spekulus: boolean('spekulus').default(false).notNull(),
    himirror: boolean('himirror').default(false).notNull(),
    simplehuman: boolean('simplehuman').default(false).notNull(),
    mirrocool: boolean('mirrocool').default(false).notNull(),
});

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
});

export const requestStatusEnum = pgEnum('request_status', ['pending', 'replied', 'archived']);

export const cooperationRequests = pgTable('cooperation_requests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  status: requestStatusEnum('status').default('pending').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});


export const actionSections = pgTable('action_sections', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code).unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  visible: boolean('visible').default(true).notNull(),
  buttonText: text('button_text').notNull(),
  buttonUrl: text('button_url').notNull(),
  buttonVisible: boolean('button_visible').default(true).notNull(),
  imageId: integer('image_id').references(() => files.id, { onDelete: 'set null' })
})

export const roadmapEvents = pgTable('roadmap_events', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  date: text('date').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull()
})

export const faqItems = pgTable('faq_items', {
  id: serial('id').primaryKey(),
  lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
  question: text('question').notNull(),
  answer: text('answer').notNull()
})

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
  imageId: integer('image_id').references(() => files.id, { onDelete: 'set null' })
})

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
    socials: jsonb('socials').$type<{ twitter?: string; github?: string; linkedin?: string }>(),
    music: jsonb('music').$type<{ spotify?: string; appleMusic?: string; youtubeMusic?: string }>(),
    education: jsonb('education').$type<{ institution: string; degree: string; year: string }[]>(),
    certifications: jsonb('certifications').$type<{ name: string; authority: string; year: string }[]>(),
    gallery: jsonb('gallery').$type<{ imageId: number; description: string }[]>(),
    achievements: jsonb('achievements').$type<{ icon: string; name: string; description: string }[]>(),
    imageId: integer('image_id').references(() => files.id, { onDelete: 'set null' }),
    featuredProjectImageId: integer('featured_project_image_id').references(() => files.id, {
      onDelete: 'set null'
    }),
    featuredProject: jsonb('featured_project').$type<{
      title: string
      description: string
      url: string
    }>()
  },
  t => ({ slugLangUnique: unique().on(t.slug, t.lang) })
)
