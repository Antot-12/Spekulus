# Spekulus Vision Project Documentation

This document provides a comprehensive overview of the Spekulus Vision website architecture, tech stack, and operational guidelines. It is intended for developers working on the project.

## 1. Project Overview

Spekulus Vision is a marketing and informational website for a conceptual smart mirror product. The site is designed to be fully manageable through a custom admin panel, supporting multiple languages and dynamic content updates without requiring code changes for content editors.

## 2. Tech Stack

The project is built on a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI Library:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) for database querying and schema management.
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) for AI-powered features.
- **Deployment:** Configured for easy deployment on modern hosting platforms.

## 3. Project Structure

The project follows a standard Next.js App Router structure. Here are the key directories:

```
.
├── /drizzle/                # Drizzle ORM migration files (auto-generated)
├── /public/                 # Static assets like images and fonts
├── /src/
│   ├── /ai/                 # AI-related code (Genkit flows and configuration)
│   │   ├── /flows/          # Genkit flows for specific AI tasks
│   │   └── genkit.ts        # Genkit initialization
│   ├── /app/                # Next.js App Router: pages and layouts
│   │   ├── /admin/          # Admin panel pages for content management
│   │   ├── /api/            # API route handlers
│   │   ├── /creators/       # Public-facing pages for creators/team
│   │   ├── /dev-notes/      # Public-facing pages for dev notes
│   │   └── page.tsx         # Homepage component
│   │   └── layout.tsx       # Root layout for the entire application
│   ├── /components/         # Reusable React components
│   │   ├── /landing/        # Components specific to the homepage sections
│   │   ├── /ui/             # ShadCN UI components
│   │   └── Header.tsx       # Site header
│   │   └── Footer.tsx       # Site footer
│   ├── /contexts/           # React Context providers (e.g., LanguageContext)
│   ├── /hooks/              # Custom React hooks (e.g., use-toast)
│   ├── /lib/                # Core logic, utilities, and data definitions
│   │   ├── /db/             # Database-related files
│   │   │   ├── actions.ts   # Server actions for all database CRUD operations
│   │   │   ├── schema.ts    # Drizzle ORM schema definitions
│   │   │   └── seed.ts      # Script to seed the database with initial data
│   │   ├── data.ts          # TypeScript types and initial data structures
│   │   ├── translations.ts  # Static text translations for different languages
│   │   └── utils.ts         # Utility functions
├── drizzle.config.ts        # Drizzle ORM configuration file
├── next.config.ts           # Next.js configuration
└── package.json             # Project dependencies and scripts
```

## 4. Routing

Routing is managed by the Next.js App Router.

- **Public Routes:** Files in `/src/app` define the public-facing pages (e.g., `/`, `/creators`, `/dev-notes`).
- **Dynamic Routes:** Folders with square brackets like `/creators/[slug]` handle dynamic content pages.
- **Admin Routes:** All content management pages are located under `/src/app/admin`. The layout in `/src/app/admin/layout.tsx` provides the sidebar navigation and authentication check.

## 5. Database and Data Management

The website's content is fully dynamic and stored in a Neon Postgres database.

### Schema (`/src/lib/db/schema.ts`)
This file defines the structure of the database using Drizzle ORM's syntax. Each table corresponds to a manageable section of the website (e.g., `heroSections`, `creators`, `faqItems`).

### Server Actions (`/src/lib/db/actions.ts`)
All interactions with the database are handled through **Next.js Server Actions** located in this file. The admin panel UI components call these functions directly to fetch, create, update, or delete content. This approach eliminates the need for traditional API endpoints for CRUD operations.

### Seeding (`/src/lib/db/seed.ts`)
To populate a new database with default content, run the seed script:
```bash
npm run db:seed
```
This script uses the data structures in `/src/lib/data.ts` to fill the database tables.

## 6. Admin Panel

The admin panel is a protected area for managing all website content.

- **Access:** Navigate to `/login` and use the credentials defined in your environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
- **Functionality:** The admin panel provides a user-friendly interface to edit text, upload images, and manage items for every section of the site across all supported languages (English, Ukrainian, Slovak).
- **Authentication:** A simple token-based authentication is handled on the client side using `localStorage`. The `/admin/layout.tsx` component checks for this token and redirects to `/login` if it's not present.

## 7. AI Integration with Genkit

The site uses **Genkit** for its AI capabilities, such as the "Ask Me Anything" feature on the creator pages.

- **Configuration:** The Genkit instance is configured in `/src/ai/genkit.ts`.
- **Flows:** Specific AI tasks are defined as "flows" in `/src/ai/flows/`. Each flow is a server-side function that takes an input, interacts with an AI model (like Google's Gemini), and returns a structured output.
- **Calling Flows:** Client components can import and call these flow functions directly, as they are exposed as Server Actions.
