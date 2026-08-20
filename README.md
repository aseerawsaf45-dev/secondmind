# SecondMind — AI-Powered Second Brain

SecondMind is an intelligent memory assistant that lets you save links, notes, videos, tweets, and documents, automatically extracting insights, metadata, and tags.

---

## 🔒 Security & Environment Configuration

### ⚠️ IMPORTANT: Git History & Secret Rotation Notice

> **CRITICAL SECURITY WARNING**:
> If any API keys, database connection strings, webhook secrets, or service credentials were ever previously committed or used in development environments, their values persist in Git commit history.
>
> **Before deploying to staging or production:**
> 1. **Rotate all Clerk API keys** (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) in the Clerk Dashboard.
> 2. **Rotate your Neon Database credentials & Neon API Keys** in the Neon Console.
> 3. **Regenerate Webhook Secrets** (`CLERK_WEBHOOK_SECRET`).
> 4. Never commit `.env` or `.env.local` files to source control.

---

### Environment Variables Setup

Copy `.env.example` to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public / Client | Clerk public key for browser-side authentication |
| `CLERK_SECRET_KEY` | **Server-Only** | Clerk backend secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Public / Client | Path for sign-in route (`/login`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Public / Client | Path for sign-up route (`/signup`) |
| `CLERK_WEBHOOK_SECRET` | **Server-Only** | Webhook secret for user lifecycle events |
| `DATABASE_URL` | **Server-Only** | Neon Postgres root branch pooled connection string |
| `NEON_API_KEY` | **Server-Only** | Neon API management key for user branch provisioning |
| `NEON_PROJECT_ID` | **Server-Only** | Neon project identifier |
| `NEXT_PUBLIC_SITE_URL` | Public / Client | Canonical app origin (e.g. `https://your-domain.com`) |

> **Note on Client Exposure**:
> In Next.js, only variables prefixed with `NEXT_PUBLIC_` are bundled and exposed to the browser.
> All database connection strings, private API keys, and signing secrets MUST remain non-prefixed and accessible server-side only.

---

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Auth**: Clerk Authentication (`@clerk/nextjs`)
- **Database**: Neon Serverless Postgres with isolated per-user branch provisioning
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Styling**: Tailwind CSS + Framer Motion
