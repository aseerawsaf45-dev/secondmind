# SecondMind Roadmap

## 1. User Experience & Interface (UX/UI)
- [x] **Onboarding Flow:** Guided setup to import notes (Notion, Evernote, etc.) or create the first memory.
- [x] **Landing Page Visual Hierarchy:** Add a demo or a clear value proposition with features for logged-out users to improve conversion.
- [x] **Responsive Design:** Ensure full mobile optimization for quick thought capture on the go.

## 2. Core Feature Enhancements
- [x] **Mobile Share Sheet Integration:** Save directly from other apps on mobile.
- [x] **Semantic Search:** Go beyond keyword search to understand query intent and context.
- [x] **Proactive AI Suggestions:** Surface related notes or forgotten ideas during writing/browsing.
- [x] **Advanced Organization:** Flexible structures like folders, bidirectional links (Roam/Obsidian style), and a visual graph view.

## 3. Technical & Performance
- [x] **Progressive Web App (PWA):** Enable offline access for reliability.
- [x] **Performance Optimization:** Code-splitting and lazy loading for faster initial load times.
- [x] **Server-Side Rendering (SSR) / Static Site Generation (SSG):** Implement SSR/SSG fallback for the landing page to improve SEO, speed, and accessibility.
- [x] **Data Export:** Allow users to export their entire "second brain" in standard formats (Markdown, JSON).

## 4. Security & Privacy
- [x] **Privacy Policy:** Add a transparent, easily accessible privacy policy page.
- [ ] **End-to-End Encryption (E2EE):** Option to encrypt notes for full user control over sensitive data.
- [x] **Two-Factor Authentication (2FA):** Integrate 2FA for account security (can be managed via Clerk).

## 5. Growth & Community
- [x] **Templates & Use Cases:** Pre-built workflows (e.g., meeting notes, research, journaling).
- [x] **Public Roadmap:** Share upcoming features to build trust.
- [x] **Community Features:** Allow users to share "memory packs" or templates with privacy controls.

## 6. Search Engine Optimization (SEO) & Discoverability
### 6.1 Technical SEO
- [x] **Dynamic XML Sitemap:** Automatically generate and update `sitemap.xml` for all public landing, template, community, and policy routes via Next.js App Router (`src/app/sitemap.ts`).
- [x] **Crawler Directives (`robots.txt`):** Configure explicit crawler rules via `src/app/robots.ts` to allow indexation of marketing pages while disallowing private user areas (`/app`, `/api/`, `/guest`).
- [x] **Canonical URLs & Base Metadata:** Set global `metadataBase` to prevent duplicate content penalties across domain variants and deployment previews.
- [x] **Open Graph & Twitter Cards:** Comprehensive social meta tags (`summary_large_image`, 1200x630 OG banners) configured across all shareable pages.
- [x] **Core Web Vitals Optimization:** Sub-second LCP and near-zero CLS via font preloading (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`), image optimization, and bundle chunk splitting.

### 6.2 On-Page & Semantic SEO
- [x] **Semantic Heading Hierarchy:** Ensure single `<h1>` tag per page followed by structured `<h2>` and `<h3>` tags for screen readers and crawler comprehension.
- [x] **High-Intent Metadata:** Targeted title tags and descriptions for terms like *"AI second brain"*, *"semantic bookmark manager"*, *"AI knowledge base"*, and *"offline memory capture"*.
- [x] **Structured Data (Schema.org JSON-LD):** Embed `SoftwareApplication` and `FAQPage` rich snippet schemas for enhanced Google search result cards.
- [x] **Image Optimization & Alt Coverage:** Ensure all public illustrations, icons, and hero mockups have contextual, non-generic `alt` descriptions.

### 6.3 Content & Programmatic SEO
- [x] **Public Templates Directory:** Search-indexable templates for common workflows (Research, Meeting Notes, Tech Bookmarks, Travel).
- [x] **Indexable Roadmap & Feature Hub:** Public roadmap capturing long-tail search intent for modern AI productivity features.
- [x] **Programmatic Persona Pages:** Tailored landing pages for specific professions (`/for/developers`, `/for/researchers`, `/for/students`, `/for/creators`).
- [x] **Interactive Dynamic OG Images:** Generate dynamic preview cards on the fly with Next.js App Router `ImageResponse` (`src/app/opengraph-image.tsx`).

## 7. Infrastructure, AI Engine & Database Upgrades
- [x] **P0 - Production Gemini AI Integration:** Configured active Google Generative AI authentication with automatic multi-model failover (`gemini-3.5-flash` with `gemini-3.8-flash` fallback) and 1536-dimensional semantic vector embeddings via `gemini-embedding-001`.
- [x] **P0 - Database & Vector Indexing:** Applied PostgreSQL B-Tree indexes on `user_id` and composite keys, alongside an HNSW vector index (`vector_cosine_ops`) for sub-10ms semantic similarity queries on Neon.
- [x] **P1 - Serverless Execution Reliability:** Removed unawaited background promises from read queries (`fetchItemsAction`) to guarantee idempotent, race-free serverless execution without unhandled rejections.
- [x] **P1 - Search Autocomplete Guardrails:** Implemented cancellation tokens and request guards in `SearchOverlay` to eliminate async race conditions while delivering 0ms local results and debounced AI semantic search.
- [x] **P2 - High-Capacity IndexedDB Storage:** Replaced synchronous 5MB `localStorage` limitations with an asynchronous IndexedDB engine (`src/lib/idb.ts`) featuring automatic legacy data migration and offline persistence.
- [x] **P3 - Architecture Modernization:** Streamlined database architecture to a single high-performance shared database with tenant isolation, retiring legacy Neon branch provisioning roundtrips while preserving GDPR Right to Erasure compliance.

