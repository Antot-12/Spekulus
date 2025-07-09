# **App Name**: Spekulus Vision

## Core Features:

- Landing Page: Showcase the Spekulus smart mirror with a full-width hero image, company mission (“Reflect smarter, live better”), and key product benefits (skin & health analysis, stress detection, weather awareness, smart-home integration).
- Product Breakdown: Explain the four hardware / software components – Body (display), Brains (Raspberry Pi 5 – 8 GB), Eyes (camera for facial & skin analysis), and Heart (custom AI software). Include labeled visuals or infographics.
- Roadmap Timeline: Interactive horizontal timeline with milestones: 28 Apr 2024 – Idea creation, 16 Dec 2024 – Implementation start, 16 Jul 2024 – Demo release, Q4 2025 – Widget store release, Q2 2026 – AI makeup tool implementation, Q3 2026 – Official product release, Q4 2026 – Entry into Slovak market
- Developer Notes Feed: Auto-scrolling ticker fixed to the bottom of every page that cycles brief developer updates (Firestore collection notes).
- Admin Panel: Password-protected route opened by a hidden icon in the footer or the shortcut Ctrl + Shift + S. Allows CRUD actions for developer notes, roadmap items, and FAQ entries.
- Language Switcher: Toggle between English (default), Ukrainian (Українська), and Slovak (Slovenčina). Persist choice with next-intl + browser locale storage.
- FAQ: Collapsible accordion answering common questions about device setup, privacy & security, data storage, AI functionality, and future features. Content editable via Admin Panel.

## Style Guidelines:

- Dark gray #222222 for a sleek, modern canvas.
- Neon turquoise #00F0FF for buttons, links, and vector icons.
- Light gray #CCCCCC for optimal contrast and readability.
- Headings — 'Space Grotesk', sans-serif
- Body — 'Inter', sans-serif
- Minimalist line icons in neon turquoise for consistency.
- Fully responsive with Tailwind CSS grid & flex utilities.
- Subtle hover transitions (transition-opacity, transition-translate) on nav links and CTAs.
- Smooth scroll behavior for in-page anchors and roadmap.