# Spekulus Project: Comprehensive Technical Documentation

## 1. Project Overview

Spekulus is a dynamic, multi-language marketing and informational website for a conceptual smart mirror product. The site is designed to be fully manageable through a custom admin panel, allowing content editors to update most public-facing content without requiring code changes.

This document serves as a complete technical guide for developers.

---

## 2. Developer Operations & Setup

### 2.1. Environment Variables

Create a `.env` file in the project root and define the following variables:

```env
# Neon Serverless Postgres connection string
DATABASE_URL="postgres://..."

# Credentials for the admin panel login
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_admin_password"

# (Optional) Resend API key for the contact form
RESEND_API_KEY="re_..."
```

### 2.2. Database Management (Drizzle ORM)

The project uses Drizzle ORM to manage the database schema and queries.

- **Push Schema Changes:** After modifying the schema in `/src/lib/db/schema.ts`, apply the changes to the database:
  ```bash
  npm run db:push
  ```
- **Seed Database:** To populate a new database with initial content from `/src/lib/data.ts`:
  ```bash
  npm run db:seed
  ```
- **Drizzle Studio:** To open a local GUI for browsing the database:
   ```bash
   npm run db:studio
   ```
- **Configuration:** The Drizzle Kit configuration is in `drizzle.config.ts`. It's crucial to add any new table names to the `tablesFilter` array to ensure they are managed by Drizzle.

### 2.3. Running the AI (Genkit)

The AI flows run on a separate development server.

```bash
# Start the Genkit dev server
npm run genkit:dev

# Or run in watch mode
npm run genkit:watch
```
---

## 3. Project Structure

The project follows a standard Next.js App Router structure.

```
.
├── /drizzle/                # Drizzle ORM migration files (auto-generated)
├── /public/                 # Static assets (images, fonts, documents)
├── /src/
│   ├── /ai/                 # Genkit AI integration
│   │   ├── /flows/          # Genkit flows for specific AI tasks
│   │   └── genkit.ts        # Genkit initialization
│   ├── /app/                # Next.js App Router: pages and layouts
│   │   ├── /admin/          # Admin panel pages for content management
│   │   ├── /api/            # API route handlers (e.g., image serving)
│   │   ├── /creators/       # Public-facing pages for creators/team
│   │   ├── /dev-notes/      # Public-facing pages for dev notes
│   │   └── page.tsx         # Homepage component
│   │   └── layout.tsx       # Root layout for the entire application
│   ├── /components/         # Reusable React components
│   │   ├── /landing/        # Components specific to the homepage sections
│   │   ├── /ui/             # ShadCN UI components
│   │   └── ...              # Shared components (Header, Footer, etc.)
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
├── documentation.md         # This file
└── ...
```

- **Dynamic Routing:** The app uses folders with square brackets like `/creators/[slug]` to handle dynamic content pages. The slug is used to fetch specific data from the database.
- **Language Support:** Internationalization is managed via the `LanguageContext` and `translations.ts` file, allowing components to display text in the user-selected language.

---

## 4. Database Design & Schema

The schema is defined in `/src/lib/db/schema.ts` using Drizzle ORM.

### Tables

- **`languages`**: Stores the supported languages.
  - `code (varchar, PK)`: The 2-letter language code (e.g., 'en').
  - `name (text)`: The full language name (e.g., 'English').

- **`images`**: Stores all uploaded binary image data.
  - `id (serial, PK)`: Unique identifier for the image.
  - `data (bytea)`: The raw binary data of the image.
  - `filename (text)`, `mimeType (text)`, `createdAt (timestamp)`: Metadata.

- **`heroSections`**: Content for the main hero section of the homepage.
  - `lang (varchar, FK -> languages.code)`: Associates the content with a language.
  - `title, subtitle (text)`: The main heading and subheading.
  - `imageId (integer, FK -> images.id)`: The background image for the hero section.

- **`heroFeatures`**: The list of features displayed within the hero section.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - `icon (text)`: The name of the Lucide React icon to display.
  - `text (text)`: The feature's description text.

- **`productComponents`**: The four "Anatomy" components on the homepage.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - `icon, title, description (text)`: Content for each component.
  - `imageId (integer, FK -> images.id)`: The image for the component card.

- **`advantages`**: The key advantages/benefits listed on the homepage.
  - Fields are identical to `productComponents`.

- **`actionSections`**: The "See in Action" section on the homepage.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - `title, subtitle, description, buttonText, buttonUrl (text)`: All text content.
  - `visible, buttonVisible (boolean)`: Toggles for visibility.
  - `imageId (integer, FK -> images.id)`: The main image for this section.

- **`roadmapEvents`**: Milestones for the public roadmap timeline.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - `date (text)`: The date or quarter of the event (e.g., "2024-04-28" or "Q4 2025").
  - `title, description (text)`: Event details.

- **`faqItems`**: Questions and answers for the FAQ section.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - `question, answer (text)`: The FAQ content.

- **`devNotes`**: Content for developer blog posts.
  - `id (serial, PK)`, `slug (text, unique)`: Unique identifiers for the note.
  - `date, title, summary, content, author (text)`: Core content of the note.
  - `tags (jsonb)`: An array of string tags (e.g., `['Backend', 'API']`).
  - `isVisible (boolean)`: Toggles public visibility.
  - `reactionCounts (jsonb)`: Stores reaction counts (e.g., `{'like': 10}`).
  - `imageId (integer, FK -> images.id)`: The header image for the note.

- **`creators`**: Profiles for team members.
  - `id (serial, PK)`, `slug (text, unique per lang)`: Unique identifiers.
  - `lang (varchar, FK -> languages.code)`: Language association.
  - All other fields (`name`, `role`, `bio`, etc.) are `text` or `jsonb` to store profile information. `jsonb` is used for arrays (skills, hobbies) and nested objects (socials, music).
  - `imageId, featuredProjectImageId (integer, FK -> images.id)`: Foreign keys for profile and project images.

### Entity Relationships (ER Summary)

- **One-to-Many**: A `languages` record can be associated with many records in other tables (e.g., one 'en' language has many `faqItems`, `roadmapEvents`, etc.).
- **One-to-Many (Images)**: An `images` record can be referenced by many other records across different tables (`heroSections`, `creators`, etc.), but each content item (like a single creator profile) can only have one primary `imageId`.
- **Composite Keys**: The `creators` table uses a unique constraint on `(slug, lang)` to ensure that a creator's profile URL is unique for each language.

---

## 5. Backend & Data Flow

### 5.1. Server Actions (`/src/lib/db/actions.ts`)

Instead of a traditional REST API, the application uses **Next.js Server Actions**. These are functions that execute on the server but can be called directly from client components. This simplifies data fetching and mutations.

- **`get...` functions (READ)**:
  - e.g., `getHeroData(lang)`, `getCreators(lang)`, `getDevNoteBySlug(slug)`.
  - These functions query the database using Drizzle and return the requested data. They are called from page components (server-side) or client components to fetch initial data.

- **`update...` functions (UPDATE)**:
  - e.g., `updateHeroData(lang, data)`, `updateCreators(lang, data)`.
  - These take a language and a data payload. They typically perform a "delete-and-replace" or `onConflictDoUpdate` operation to update records for a specific language. They are called from the admin panel pages.

- **`create...` functions (CREATE)**:
  - e.g., `createAdvantage(lang, data)`, `createFaq(lang, data)`.
  - These insert a new row into the database for a given language and return the newly created record.

- **`delete...` functions (DELETE)**:
  - e.g., `deleteDevNote(id)`.
  - These remove a specific record from the database by its ID.

- **Image Handling**:
  - `uploadImage(fileBuffer, filename, mimeType)`: Takes raw image data, inserts it into the `images` table, and returns the new image `id`.
  - `getImage(id)`: Retrieves the raw image data from the `images` table based on its `id`.

### 5.2. API Routes (`/src/app/api/`)

A few traditional API routes exist for specific purposes:

- `/api/images/[id]`: Serves the raw image data from the database. This allows using a simple `<img src="/api/images/123" />` tag on the frontend.
- `/api/upload`: Handles file uploads from the admin panel, calls the `uploadImage` server action, and returns the new image ID as JSON.
- `/api/auth/login`: Validates admin credentials against environment variables.
- `/api/contact`: Handles the public contact form submission, using Resend to forward the message.

---

## 6. Admin Panel

The admin panel is a protected section for managing all dynamic site content.

- **Authentication**: Access is controlled via a simple client-side token.
  1. User logs in at `/login`.
  2. The `/api/auth/login` route verifies credentials.
  3. On success, the client sets `localStorage.setItem('admin_token', 'true')`.
  4. The root admin layout (`/src/app/admin/layout.tsx`) checks for this token on mount. If it's not present, it redirects the user to `/login`.
- **Structure**: Each page in `/app/admin/` (e.g., `/admin/faq`, `/admin/roadmap`) is a dedicated form for managing a specific content type.
- **Data Handling**: Admin pages are client components (`'use client'`).
  1. They use `useEffect` to fetch initial data for all languages using the server actions from `actions.ts`.
  2. A language switcher allows the admin to edit content for English, Ukrainian, or Slovak.
  3. When an admin makes a change (e.g., types in an input), the component's React state is updated.
  4. Clicking "Save" calls the corresponding `update...` server action, passing the current state to the server, which then writes it to the database.

### 6.1. Admin Panel Iconography

The admin panel uses icons from the `lucide-react` library to provide quick, intuitive visual cues for actions and navigation.

#### **Common Actions**

- **`Save`**: Persists all changes made on the current page to the database.
- **`Loader2` (spinning)**: Indicates that an action (like saving or uploading) is in progress. The button is disabled during this state.
- **`PlusCircle`**: Adds a new item to a list (e.g., a new FAQ, a new roadmap event).
- **`Trash2`**: Deletes an item. This action is often irreversible and may be placed inside a confirmation dialog.
- **`Upload` / `UploadCloud`**: Opens a file dialog to upload an image or file.
- **`Eye` / `EyeOff`**: Toggles the public visibility of an item (e.g., a dev note or creator profile).
- **`Copy`**: Copies an item's ID or URL to the clipboard.
- **`LinkIcon`**: Copies an item's full public URL to the clipboard.
- **`Search`**: Indicates a search input field.
- **`Expand`**: Opens a larger preview of an image.

#### **Navigation & Layout**

- **`LayoutDashboard`**: Navigates to the main admin dashboard.
- **`PanelLeft`**: Toggles the mobile sidebar navigation.
- **`LogOut`**: Logs the current user out of the admin panel.
- **`ChevronsLeft` / `ChevronLeft` / `ChevronRight` / `ChevronsRight`**: Used for pagination controls to navigate through pages of items.
- **`LayoutGrid` / `List`**: Toggles between grid and list views in the Uploads manager.

#### **Content-Specific Icons**

- **`Home`**: Manages the Hero section.
- **`Cpu`**: Manages the Product "Anatomy" section.
- **`Sparkles`**: Manages the Advantages section.
- **`Camera`**: Manages the "In Action" or Gallery sections.
- **`FileText`**: Manages Dev Notes.
- **`Users`**: Manages Creator profiles.
- **`Calendar`**: Manages the Roadmap or date-related fields.
- **`HelpCircle`**: Manages the FAQ section.
- **`History`**: Navigates to the Action Logs page.
- **`ImageIcon`**: A placeholder for where an image will appear.
- **`Music`**: Manages music/playlist information.
- **`Briefcase`**: Manages featured project information.
- **`GraduationCap`**: Manages education history.
- **`Award`**: Manages certifications or achievements.
- **`Heart`**: Manages personal details (hobbies, quotes).

---

## 7. AI Integration (Genkit)

The project uses Genkit for its AI features.

- **Configuration**: The core Genkit setup is in `/src/ai/genkit.ts`, which configures the Google AI plugin.
- **Flows**: Specific AI tasks are defined as "flows" in `/src/ai/flows/`.
  - **`creator-chat-flow.ts`**: Powers the "Ask Me Anything" widget on creator profile pages. It takes a creator's bio, skills, and featured project along with a user's question, and prompts the LLM to answer in the first-person persona of the creator.
  - **`mirror-simulator-flow.ts`**: Powers the AI simulator page. It uses a detailed prompt with simulated data (weather, schedule) to respond to user commands as if it were the Spekulus smart mirror.
- **Usage**: These flows are exported as server actions and can be called directly from client components, just like the database actions.

---

## 8. Sample Developer Workflow: Adding a "Testimonials" Section

1.  **DB Schema (`schema.ts`)**: Define a new `testimonials` table.
    ```typescript
    export const testimonials = pgTable('testimonials', {
      id: serial('id').primaryKey(),
      lang: varchar('lang', { length: 2 }).notNull().references(() => languages.code),
      author: text('author').notNull(),
      quote: text('quote').notNull(),
      imageId: integer('image_id').references(() => images.id),
    });
    ```
2.  **Drizzle Config (`drizzle.config.ts`)**: Add `'testimonials'` to the `tablesFilter` array.
3.  **Push to DB**: Run `npm run db:push`.
4.  **Server Actions (`actions.ts`)**: Create `getTestimonials(lang)` and `updateTestimonials(lang, data)` functions.
5.  **Data Types (`data.ts`)**: Define the `Testimonial` type and add initial data for the seed script.
6.  **Seed Script (`seed.ts`)**: Add logic to clear and seed the new `testimonials` table. Run `npm run db:seed`.
7.  **Admin UI (`/admin/testimonials/page.tsx`)**: Create a new admin page to perform CRUD operations on testimonials. Add a link to it in the admin dashboard and sidebar.
8.  **Frontend Component (`/components/landing/TestimonialsSection.tsx`)**: Create the public-facing component to display the testimonials.
9.  **Homepage (`/app/page.tsx`)**: Import and render the new `TestimonialsSection` component, passing it data fetched from the `getTestimonials` action.
