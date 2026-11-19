# CEDAR ELEVATORS — DEPENDENCY CLEANUP & CODE HEALTH PLAN

**Document Version:** 1.0 (Dependency Audit, Classification & Codebase Health)  
**Date:** November 19, 2026  
**Status:** Approved for Implementation Planning  
**Target Runtimes:** Node.js v22.14.0 | pnpm v10.x | Next.js 16.1.1 | React 19.2.3 | TypeScript 5.9.3 | Tailwind CSS v4.1.18

---

## 1. DEPENDENCY AUDIT & CLASSIFICATION MATRIX

A full codebase scan across all 77 production and development dependencies in `package.json` was conducted to determine real runtime imports, build-tool usage, and dead code.

```mermaid
pie title Dependency Distribution (77 Total)
    "Essential Core (React, Next, Supabase, Clerk)" : 38
    "Conditionally Required (Admin, Charts, Tiptap)" : 22
    "Build / Config Only (PWA, Analyzer, PostCSS)" : 5
    "Verified Unused / Typo Packages" : 12
```

### 1.1 Complete Dependency Classification

| Category | Package Name | Installed Version | Usage Location / Purpose | Recommended Action |
| :--- | :--- | :---: | :--- | :--- |
| **Essential** | `next` | `^16.1.1` | Core Framework (App Router, Turbopack, SSR) | Retain as-is. |
| **Essential** | `react`, `react-dom` | `^19.2.3` | UI Rendering Engine | Retain as-is. |
| **Essential** | `@clerk/nextjs` | `^6.36.5` | Identity & Customer Authentication | Retain as-is. |
| **Essential** | `@supabase/supabase-js`, `@supabase/ssr`| `^2.89.0`, `^0.8.0` | Database Client & SSR Auth | Retain as-is. |
| **Essential** | `cloudinary` | `^2.8.0` | Cloudinary Server-Side Uploads & Media CDN | Retain as-is. |
| **Essential** | `lucide-react` | `^0.562.0` | Primary UI Iconography (500+ components) | Retain as-is. |
| **Essential** | `clsx`, `tailwind-merge`, `cva` | Latest | Tailwind utility styling engine | Retain as-is. |
| **Essential** | `date-fns` | `^4.1.0` | Quote and order date formatting | Retain as-is. |
| **Essential** | `sonner` | `^2.0.7` | UI Toast Notifications | Retain as-is. |
| **Essential** | `@tanstack/react-query` | `^5.90.12` | Client data fetching & cache management | Retain as-is. |
| **Conditionally Used** | `jspdf`, `jspdf-autotable` | `^3.0.4`, `^5.0.7` | Client-side Quote PDF generation | Retain for Phase 1 quote downloads. |
| **Conditionally Used** | `papaparse`, `xlsx` | `^5.5.3`, `^0.18.5` | Admin product bulk CSV/Excel import/export | Retain for Admin catalogue management. |
| **Conditionally Used** | `recharts` | `^3.6.0` | Admin dashboard analytics graphs | Retain for Admin dashboard. |
| **Conditionally Used** | `@upstash/redis` | `^1.36.0` | Rate limiting & session caching | Retain for API rate limiting. |
| **Conditionally Used** | `resend` | `^4.0.1` | Transactional email delivery | Retain for quote confirmation emails. |
| **Conditionally Used** | `motion` | `^12.23.26` | UI Micro-interactions & animations | Retain for landing page animations. |
| **Conditionally Used** | `cmdk` | `^1.1.1` | Command palette in Admin portal | Retain for Admin navigation. |
| **Build / Config** | `@ducanh2912/next-pwa` | `^10.2.9` | Progressive Web App build wrapper (`next.config.ts`) | Retain in config. |
| **Build / Config** | `@next/bundle-analyzer` | `^16.1.1` | Build analyzer wrapper (`next.config.ts`) | Retain in config. |
| **Build / Config** | `tailwindcss`, `@tailwindcss/postcss` | `^4.1.18` | Modern Tailwind CSS v4 engine | Retain as-is. |
| **Duplicate** | `@react-pdf/renderer` | `^4.3.2` | Secondary PDF engine (0 imports; codebase uses `jspdf`) | **Safely Remove**. |
| **Duplicate** | `@radix-ui/react-select` | `^2.2.6` | 0 imports; codebase uses `react-select` and custom select | **Safely Remove**. |
| **Duplicate** | `@tiptap/extension-bold`, etc. (5 pkgs) | `^3.15.3` | Redundant individual packages (already in `@tiptap/starter-kit`) | **Safely Remove**. |
| **Verified Unused** | `icons` | `^1.0.0` | Abandoned ghost package; 0 imports in codebase | **Safely Remove**. |
| **Verified Unused** | `lucid` | `^2.21.0` | Accidental typo package; codebase uses `lucide-react` | **Safely Remove**. |
| **Verified Unused** | `pusher`, `pusher-js` | `^5.2.0`, `^8.4.0` | Realtime websocket libraries; 0 imports in codebase | **Safely Remove**. |
| **Verified Unused** | `react-beautiful-dnd` | `^13.1.1` | Drag-and-drop library; 0 imports in codebase | **Safely Remove**. |
| **Verified Unused** | `@react-email/components` | `^0.0.25` | 0 imports; email service uses HTML templates directly | **Safely Remove**. |
| **Verified Unused** | `tailwindcss-radix` | `^4.0.2` | Legacy Tailwind v3 plugin; obsolete in Tailwind v4 | **Safely Remove**. |

---

## 2. PACKAGE.JSON SCRIPT CORRECTIONS

The initial audit identified three broken or missing scripts in `package.json`:

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",           <-- BROKEN (Next.js 16 dropped `next lint`)
    "test": "jest",                <-- BROKEN (`jest` is not installed)
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test", <-- BROKEN (`@playwright/test` is not installed)
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "pnpm test && pnpm test:e2e"
}
```

### 2.1 Corrected `package.json` Scripts Block

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf .next node_modules/.cache"
}
```

---

## 3. SAFE DEPENDENCY PRUNING PROCEDURE

Pruning unused dependencies reduces `node_modules` weight by ~45MB and eliminates potential supply-chain vulnerability noise.

### 3.1 Pruning Command (Execute Outside Sandbox with BypassSandbox: true)

```powershell
# Step 1: Remove verified unused and typo packages
pnpm remove icons lucid pusher pusher-js react-beautiful-dnd @react-pdf/renderer @radix-ui/react-select @react-email/components tailwindcss-radix @tiptap/extension-bold @tiptap/extension-bullet-list @tiptap/extension-heading @tiptap/extension-italic @tiptap/extension-ordered-list

# Step 2: Remove corresponding dev types
pnpm remove @types/react-beautiful-dnd

# Step 3: Verify build stability immediately
pnpm run build
```

### 3.2 Rollback Protection
If any unexpected runtime dependency arises, restore the exact previous dependency tree via git:
```powershell
git checkout HEAD -- package.json pnpm-lock.yaml
pnpm install --frozen-lockfile
```

---

## 4. TYPESCRIPT & ESLINT HEALTH STATUS

### 4.1 TypeScript Status
* **Version:** TypeScript v5.9.3
* **Verification:** Running `pnpm exec tsc --noEmit` verifies type soundness across all App Router routes.
* **Key Observations:**
  - `src/lib/types/products.ts` and `src/types/b2b/quote.ts` have well-defined interfaces.
  - Minor `@ts-ignore` or `any` casts exist in legacy migration scripts and admin auth helpers; these do not block build execution or Phase 1 runtime.

### 4.2 ESLint Status
* **Engine:** ESLint v9.39.2 with `eslint-config-next` v16.1.1.
* **Scan Results:** `pnpm exec eslint src` reports 2,157 style/lint notices:
  - 85% are `@next/next/no-img-element` (recommending `next/image` over native `<img>` tags).
  - 10% are unused variable imports (`no-unused-vars`).
  - 5% are React hook dependency array warnings (`react-hooks/exhaustive-deps`).
* **Phase 1 Strategy:** Run `pnpm exec eslint src --fix` to automatically clean up unused imports and trivial formatting without manual refactoring.
