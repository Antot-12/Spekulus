
<div align="center">
  <img src="./public/logo.svg" alt="Spekulus Logo" width="120" />
  <h1 style="border-bottom: none; font-size: 2.5rem;"><strong>Spekulus</strong></h1>
  <p><strong>Reflect Smarter, Live Better.</strong></p>
  <p>The official informational website for the Spekulus smart mirror concept.</p>
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://firebase.google.com/docs/genkit)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

### **Welcome to the Spekulus Project! 👋**

Hello there! This repository contains the source code for the official marketing and informational website for **Spekulus**, a conceptual smart mirror designed to be the elegant centerpiece of your daily routine. We're excited to have you here.

## 💡 What is Spekulus?

Spekulus is more than just a mirror—it's a vision for a smarter way to live. It's an intelligent surface that provides personalized insights into your health, schedule, and environment without adding to your screen time.

**The Problem It Solves:** Our lives are cluttered with notifications and apps spread across multiple devices. Spekulus aims to centralize the essential information you need to start your day—skin analysis, stress levels, weather, and smart home controls—into a single, beautifully integrated device.

**Who It's For:**
- **Tech-Savvy Individuals:** People who love integrating smart technology into their homes.
- **Health & Wellness Enthusiasts:** Anyone looking for proactive ways to monitor their well-being.
- **Modern Homeowners:** Those who appreciate minimalist design and functional art.

---

## ✨ Key Features

This isn't just a static website. It's a fully dynamic, internationalized, and content-manageable platform.

*   **🌐 Multi-Language Support:** The entire site can be switched between **English**, **Ukrainian (Українська)**, and **Slovak (Slovenčina)**, with language preferences saved locally.
*   **🔐 Full-Fledged Admin Panel:** Almost every piece of text and every image on the public site can be edited through a secure, password-protected admin panel. No code changes needed for content updates!
*   **🧠 Genkit AI Integration:** The "Ask Me Anything" feature on creator profiles is powered by Google's Genkit AI, allowing users to have a conversational experience based on the creator's profile data.
*   **💾 Database-Driven Content:** All content is fetched from a Postgres database using **Drizzle ORM**, making the site fast, scalable, and easy to manage.
*   **🖥️ Responsive Design:** Built with Tailwind CSS and ShadCN UI, the site looks great on any device, from a large monitor to a mobile phone.

---

## 🚀 Getting Started

Ready to run the project locally? Here's how to get it up and running on your machine.

**1. Clone the repository:**
```bash
git clone https://github.com/Antot-12/Spekulus.git
cd Spekulus
```

**2. Install dependencies:**
This project uses `npm` for package management.
```bash
npm install
```

**3. Set up environment variables:**
Create a `.env` file in the root of the project by copying the example file:
```bash
cp .env.example .env
```
Now, fill in the `.env` file with your credentials:
```env
# Neon Serverless Postgres connection string
DATABASE_URL="postgres://..."

# Credentials for the admin panel login
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_admin_password"

# (Optional) Resend API key for the contact form
RESEND_API_KEY="re_..."
```

**4. Push the database schema:**
Drizzle ORM manages our database. This command will sync your `schema.ts` file with your Neon database.
```bash
npm run db:push
```

**5. Seed the database:**
This command populates your database with the initial content (text, roadmap events, etc.) needed to run the site.
```bash
npm run db:seed
```

**6. Run the development server:**
You're all set! Start the development server to see the site in action.
```bash
npm run dev
```
The site will be available at `http://localhost:3000`.

---

## 🛠️ Tech Stack

This project is built with a modern, powerful, and scalable tech stack.

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
*   **AI Integration:** [Google's Genkit](https://firebase.google.com/docs/genkit)
*   **Deployment:** [Vercel](https://vercel.com/)

---

## 📸 Screenshots

*(Note: Replace these with your actual screenshots!)*

| Homepage                                    | Admin Panel                                  |
| ------------------------------------------- | -------------------------------------------- |
| ![Homepage Screenshot](./public/spekulus-homepage.png) | ![Admin Panel Screenshot](./public/spekulus-admin.png) |

---

## 🤝 Contributing

We welcome contributions! Whether you want to fix a bug, add a feature, or improve the documentation, we'd love to see your pull request. Please feel free to open an issue to discuss your ideas first.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---
<div align="center">
Made with ❤️ by the S&S Creation Team
</div>
