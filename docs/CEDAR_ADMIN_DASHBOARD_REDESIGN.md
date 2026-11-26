# Cedar Elevators — Admin Dashboard Visual Redesign Report

## 1. Existing Dashboard Audit

Prior to the redesign, the Cedar Admin shell and dashboard (`src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/(dashboard)/page.tsx`, `src/components/common/sidebar.tsx`, `src/components/common/header.tsx`) exhibited several visual and technical issues:

- **Visual appearance**: Saturated orange gradients (`from-orange-50/50 to-orange-100/30`), bright full-fill active navigation pills (`bg-orange-600 text-white shadow-md shadow-orange-200`), heavy `shadow-xl` containers, orange-tinted metric card gradients, and a generic `"Dashboard / Welcome to Cedar Elevators Admin Panel"` header.
- **Global font-weight clamp**: `src/styles/globals.css` enforces a storefront 3-weight policy (`--font-weight-medium/semibold/bold: 400`), which flattened typographic hierarchy inside the admin panel.
- **RLS data gap in dashboard queries**: `src/lib/actions/admin-dashboard.ts` (`getQuickStats`, `getQuoteChartData`) and `src/lib/actions/analytics.ts` (`getRecentActivity`) previously used `createServerSupabaseClient()` (anonymous key without an authenticated admin/service-role context), causing RLS-protected `quotes` queries to return `0` on `/admin` even when quotes existed (as visible in the baseline screenshot where the sidebar badge showed `1` while `Quote Requests` showed `0`).
- **Missing visualizations & recent quotes**: Only a single basic bar chart (`QuotationChart`) and an activity feed (`RecentActivities`) were rendered, leaving large empty horizontal space in the 5-column stats row (`grid-cols-2 lg:grid-cols-5` with 3 cards).

---

## 2. Reference Repository Chart Inspection (`D:\web development\mergex-os\src`)

Inspected the Recharts implementation in `D:\web development\mergex-os\src\components\dashboard\analytics\`:

- **Inspected files**:
  - `custom-tooltip.tsx` — Structured custom tooltip reading `payload[0].payload` metadata, color dot swatches, and `tabular-nums` / monospace numeric formatting.
  - `empty-state.tsx` — Centered `EmptyState` component with subtle icon container, crisp title, muted description, and optional hint pill.
  - `chart-gradients.tsx` — Reusable `<defs>` linear gradients for area fills.
  - `pipeline-value.tsx` — `ResponsiveContainer` + `AreaChart` with soft vertical gradient fill, dashed horizontal `CartesianGrid` (`vertical={false}`), clean `XAxis`/`YAxis` without axis lines, and bottom legend summary.
  - `projects-by-status.tsx`, `invoice-status.tsx`, `proposal-win-rate.tsx`, `workload.tsx`, `pipeline-health.tsx` — Consistent wrapper layout, empty-state guards, and legend alignment.
  - `analytics-widgets.tsx` & `dashboard-header.tsx` — Client-safe `useEffect` local-time greeting initialization to avoid SSR/CSR hydration mismatches.

**Adapted to Cedar**: Reused the custom tooltip pattern, clean empty-state component, `ResponsiveContainer` sizing, subtle horizontal gridlines, and client-side time greeting pattern — adapted strictly to Cedar's warm-neutral palette, restrained Cedar-orange accent, and real Supabase quotation/catalog data (zero Mergex OS branding or unrelated business logic).

---

## 3. Files Modified

| File | Summary of Changes |
|---|---|
| `src/styles/globals.css` | Registered `@import "./admin-theme.css"` and safe shadcn/UI `--color-*` theme bindings in `@theme inline`. |
| `next.config.ts` | Scoped `immutable` `Cache-Control` headers on `/_next/static/:path*` to `production` only (`no-store, must-revalidate` in local `development` so browsers never cache stale Turbopack CSS/JS chunks). |
| `src/app/admin/(dashboard)/layout.tsx` | Applied `.cedar-admin-theme` and `.cedar-admin-shell`, warm off-white `#F3F2EE` outer canvas, `.cedar-admin-workspace-surface` panel, updated `LoadingScreen` skeleton, and mobile sheet close callback. Preserved all Supabase auth, RBAC, and `/admin/settings` routing logic. |
| `src/app/admin/(dashboard)/page.tsx` | Recomposed `/admin` dashboard with dynamic local-time serif greeting, authenticated admin name resolution, explicit error banner, 4 balanced KPI cards, restrained Quick Actions, lazy-loaded Recharts analytics, Catalog Overview panel, Recent Quotations list, and Recent Activity feed. |
| `src/app/admin/(dashboard)/components/quotation-chart.tsx` | Updated standalone legacy `QuotationChart` wrapper styling to match Cedar warm-neutral tokens and `ChartTooltip`. |
| `src/app/admin/(dashboard)/settings/layout.tsx` | Aligned Settings shell container with `admin-theme.css`, `#F3F2EE` outer canvas, and `#FFFFFF` workspace card. |
| `src/components/common/sidebar.tsx` | Restyled sidebar to warm `#F3F2EE` surface with hairline dividers, subtle white active state + `#E85A24` icon accent, warm pill badge on `Quotes`, collapsed badge dot, and extracted `SidebarNavItem` helper to remove duplicated JSX. Preserved every nav route, collapsible group, count query, and logout action. |
| `src/components/common/header.tsx` | Refined top header height, hairline bottom border, `#F9F8F5` global search trigger with `⌘J` badge, and neutral admin identity/avatar presentation. |
| `src/components/common/global-search.tsx` | Replaced `bg-red-100 text-red-600` icon containers with warm-neutral `#F9F8F5` / `#EAE8E2` styling. |
| `src/modules/admin/settings/settings-sidebar.tsx` | Aligned Settings sidebar active/inactive states and header/footer borders with the warm-neutral admin tokens while preserving RBAC filtering and logout. |
| `src/modules/admin/settings/settings-header.tsx` | Aligned Settings header controls and borders with the warm-neutral admin tokens while preserving `triggerSave` and toast feedback. |
| `src/modules/admin/dashboard/recent-activities.tsx` | Restyled `RecentActivities` to match the white hairline card and divider list aesthetic with skeleton loading and empty states. |
| `src/lib/actions/admin-dashboard.ts` | Secured `getQuickStats` and `getQuoteChartData` with `requireAdmin('staff')` + `createAdminClient()`, and added `getAdminDashboardOverview(range)` returning real quotation metrics, time-series buckets, status distribution, 12-month trend, catalog stats, recent quotations, and authenticated admin profile. |
| `src/lib/actions/analytics.ts` | Secured `getRecentActivity` with `requireAdmin('staff')` + `createAdminClient()` so quote fallback activities are not blocked by RLS. |

---

## 4. Components Reused

- `Button` (`src/components/ui/button.tsx`)
- `Avatar`, `AvatarFallback`, `AvatarImage` (`src/components/ui/avatar.tsx`)
- `ScrollArea` (`src/components/ui/scroll-area.tsx`)
- `Sheet`, `SheetContent` (`src/components/ui/sheet.tsx`)
- `GlobalSearch` (`src/components/common/global-search.tsx`)
- `RecentActivities` (`src/modules/admin/dashboard/recent-activities.tsx`)
- `CustomReactSelect` (`src/components/ui/select.tsx` inside `quotation-chart.tsx`)
- `QueryProvider` (`src/components/providers/query-provider.tsx`)
- `AdminLoginView` & `AdminAccessDeniedView`

---

## 5. Components Created

| File | Component | Purpose |
|---|---|---|
| `src/styles/admin-theme.css` | Scoped Admin Theme | Defines warm-neutral tokens, `.font-cedar-serif` (`Newsreader` + Georgia fallback), scoped admin font weights, and hairline card styles without affecting the public storefront. |
| `src/components/admin/dashboard/chart-tooltip.tsx` | `ChartTooltip` | Shared Recharts custom tooltip formatted for warm-neutral surfaces and `tabular-nums`. |
| `src/components/admin/dashboard/chart-empty-state.tsx` | `ChartEmptyState` | Shared empty and error state for dashboard charts and lists. |
| `src/components/admin/dashboard/dashboard-metric-card.tsx` | `DashboardMetricCard` | Minimal KPI metric card with subtle hover elevation, skeleton loading, and optional verified period comparison. |
| `src/components/admin/dashboard/quotation-activity-chart.tsx` | `QuotationActivityChart` | Recharts `AreaChart` tracking incoming quotation requests across `7D`, `30D`, `90D`, and `This year`. |
| `src/components/admin/dashboard/quotation-status-chart.tsx` | `QuotationStatusChart` | Recharts `BarChart` showing real quotation distribution across Cedar workflow statuses. |
| `src/components/admin/dashboard/monthly-quotation-trend-chart.tsx` | `MonthlyQuotationTrendChart` | Recharts `LineChart` displaying trailing 12-month quotation volume. |
| `src/components/admin/dashboard/catalog-overview-panel.tsx` | `CatalogOverviewPanel` | Compact summary of active products, inactive/draft products, categories, recent additions, and monthly quotation count. |
| `src/components/admin/dashboard/recent-quotations-list.tsx` | `RecentQuotationsList` | Behalf-inspired clean divided list of recent quotation requests with status dot, item count, and direct view links. |

---

## 6. Design Tokens Introduced

Defined inside `.cedar-admin-theme` in `src/styles/admin-theme.css`:

| Token | Value | Purpose |
|---|---|---|
| `--cedar-admin-bg` | `#F7F6F3` | Warm canvas |
| `--cedar-admin-sidebar` | `#F3F2EE` | Off-white sidebar surface |
| `--cedar-admin-surface` | `#FFFFFF` | Workspace panel & cards |
| `--cedar-admin-surface-secondary` | `#F9F8F5` | Secondary controls, icon wells, hover rows |
| `--cedar-admin-text-primary` | `#171717` | Headings, metric figures, active nav text |
| `--cedar-admin-text-secondary` | `#77736D` | Descriptions, metadata, inactive nav text |
| `--cedar-admin-text-muted` | `#A09B94` | Group labels, chart axis ticks, timestamps |
| `--cedar-admin-border` | `#EAE8E2` | Hairline dividers and card outlines |
| `--cedar-admin-border-strong` | `#DCD8CE` | Hover borders |
| `--cedar-admin-accent` | `#E85A24` | Primary Cedar orange accent (primary CTA, active nav icon, primary chart series) |
| `--cedar-admin-accent-hover` | `#D14D1B` | Primary CTA hover |
| `--cedar-admin-accent-subtle` | `#FFF0E8` | Selected/notification subtle tint |
| `--cedar-admin-success` | `#238A62` | Quoted / active / positive delta |
| `--cedar-admin-warning` | `#C48A32` | Attention / warning tone |
| `--cedar-admin-error` | `#C84B42` | Rejected / error tone |
| `--cedar-admin-info` | `#4D6F8F` | Under review status tone |

---

## 7. Sidebar and Headerless Workspace Improvements

- Replaced the bright orange gradient shell with a calm `#F3F2EE` sidebar framing a `#FFFFFF` workspace panel (`border-radius: 10px`, tight `4px–6px` outer padding on top, right, and bottom).
- Removed the desktop top header bar completely so the main workspace starts directly with the personalized greeting, matching the calm editorial layout of the reference. On mobile (`< lg`), a compact `Menu` button opens the sidebar drawer.
- Consolidated the **sidebar collapse/hamburger toggle** (top-right of the sidebar), **global search bar** (`Ctrl/Cmd+J` trigger + `GlobalSearch` dialog), and **admin profile identity link** (`/admin/settings/profile`) directly into `src/components/common/sidebar.tsx`.
- Active navigation item uses a crisp white pill (`border-radius: 8px`) with a `1px` `#EAE8E2` border, near-black text, and a restrained `#E85A24` icon instead of a full orange block.
- Preserved `Cedar Admin` branding, `/logo/CEIicon.png`, all 9 navigation items (`Dashboard`, `Quotes`, `Products`, `Applications`, `Categories`, `Elevator Types`, `Collections`, `Banners`, `Settings`), collapsible `Catalog` and `Other` sections, `Quotes` live submission badge, sidebar collapse toggle, mobile drawer, and `Log out` button.

---

## 8. Dashboard Layout Changes

Organized `/admin` into 6 balanced sections:
1. **Welcome header**: Editorial serif greeting (`Newsreader` + `Georgia` fallback) + subtitle + `Refresh` action.
2. **Key metrics**: 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
3. **Quick actions**: Compact horizontal row (`Review Quotes` in Cedar orange; `Add Product`, `Manage Categories`, `Settings` in neutral white).
4. **Analytics**: 12-column row pairing `Quotation Activity` (`7/8` cols) and `Quotation Status` (`5/4` cols), followed by `Monthly Quotation Trend` (`7` cols) and `Catalog Overview` (`5` cols).
5. **Recent Quotations** (`7` cols) & **Recent Activity** (`5` cols) in a balanced lower row.

---

## 9. Greeting Implementation

- Time-of-day phrase (`Good morning` `< 12:00`, `Good afternoon` `12:00–16:59`, `Good evening` `>= 17:00`) is initialized solely inside a client `useEffect` hook (`greetingPhrase` starts as `null`, rendering `"Welcome back."` during initial SSR) to guarantee zero React hydration mismatches.
- The greeting displays `overview.admin.displayName` (from `admin_profiles.display_name` via `requireAdmin('staff')`), falling back to the formatted email username (`email.split('@')[0]`), and omitting the name cleanly (`Good afternoon.`) if neither is present. No name is hardcoded.

---

## 10. Metric Definitions and Data Sources

All dashboard metrics are fetched server-side in `getAdminDashboardOverview` (`src/lib/actions/admin-dashboard.ts`) using `requireAdmin('staff')` + `createAdminClient()`:

| Metric | Source Table & Filter |
|---|---|
| **Total Quotations** | `quotes` — total count of all quotation rows (`quoteStatusRows.length`). |
| **Pending Review** | `quotes` — sum of `status IN ('submitted', 'pending')` (`submittedQuotations`) and `status = 'reviewing'` (`reviewingQuotations`), zero double-counting. |
| **Quoted** | `quotes` — count of `status IN ('quoted', 'approved')` (matching `quote-queries.ts`). |
| **Rejected / Expired** | `quotes` — distinct counts of `status = 'rejected'` and `status = 'expired'`. |
| **This Month vs Last Month** | `quotes.created_at` compared against local server month boundaries (`currentMonthStart` vs `lastMonthStart`..`lastMonthEnd`). Percentage delta is displayed **only** when `lastMonthQuotations > 0`. |
| **Total / Active / Inactive Products** | `products` — `totalProducts`, `status = 'active'` (`activeProducts`), and `totalProducts - activeProducts` (`inactiveProducts`). |
| **Recently Added Products** | `products.created_at >= now - 30 days`. |
| **Categories** | `categories` — exact count (`totalCategories`) and `is_active = true` (`activeCategories`). |

If any Supabase query fails, `getAdminDashboardOverview` returns `{ success: false, error }` and the UI displays an explicit retry banner rather than masquerading errors as `0`.

---

## 11. Recharts Implementation

- Uses the already-installed `recharts` (`^3.6.0`) package.
- **Quotation Activity** (`AreaChart`): Daily buckets for `7D` and `30D`, 13 weekly buckets for `90D`, and `Jan`–current-month buckets for `This year`. Genuine zero counts render accurately along the `0` baseline with integer Y-axis ticks (`domain={[0, (max) => Math.max(max, 4)]}`).
- **Quotation Status** (`BarChart`): Displays mapped status counts (`Submitted`, `Under Review`, `Quoted`, `Rejected`, `Expired`, and `Converted` if `> 0`) with Cedar's restrained palette.
- **Monthly Quotation Trend** (`LineChart`): Trailing 12-month quotation counts.
- All three charts use `ResponsiveContainer` (`width="100%" height="100%"`), custom `ChartTooltip`, `ChartEmptyState`, and skeleton loading placeholders.

---

## 12. Responsive Improvements

- Grid breakpoints adapt cleanly across `1920px`, `1440px`, `1366px`, `1024px`, `768px`, `390px`, and `360px`:
  - Metrics: `1` col (small mobile) -> `2` cols (`sm`) -> `4` cols (`lg`).
  - Quick actions: `2x2` grid (`< sm`) -> inline flex row (`sm+`).
  - Charts & lower panels: stacked `1` col (`< lg`) -> `12`-col asymmetric grid (`lg+`) with `min-w-0` on grid children to prevent Recharts horizontal overflow.
  - Recent quotations rows stack metadata cleanly on mobile and align horizontally on `sm+`.

---

## 13. Performance Considerations

- `QuotationActivityChart`, `QuotationStatusChart`, and `MonthlyQuotationTrendChart` are lazy-loaded with `next/dynamic` (`ssr: false`) inside `src/app/admin/(dashboard)/page.tsx`, preventing Recharts from inflating bundles on unrelated admin routes.
- `getAdminDashboardOverview` executes 8 narrow queries in parallel via `Promise.all` (selecting only `status`, `created_at`, or `count: 'exact', head: true` rather than full tables).
- `isAnimationActive={false}` on chart series keeps range switches instantaneous and avoids jank on mobile/low-power devices.

---

## 14. Tests Performed

- **TypeScript (`pnpm exec tsc --noEmit`)**: Passed with 0 errors.
- **ESLint (`pnpm exec eslint ...` across `src/app/admin`, `src/components/admin/dashboard`, shell & action files)**: Passed with 0 errors (0 warnings on newly created dashboard components and `page.tsx`; pre-existing warnings remain untouched in unrelated files).
- **Production Build (`pnpm build` -> `next build --webpack`)**: Compiled and built cleanly across all 153 routes (`Command exited with code 0`).
- **Quote Module Test Suite (`node tests/quote-module.test.mjs`)**: Passed `7/7` subtests.

---

## 15. Outstanding Issues / Unverified Items

- **Live Supabase Runtime & Browser Verification (Unverified in Offline Sandbox)**: The execution sandbox blocks outbound DNS/network access (`ENOTFOUND hbkdbrxzqaraarivudej.supabase.co`), so live Supabase queries, authenticated admin session rendering, interactive range-filter network calls, and visual inspection across live browser viewports (`1920px` down to `360px`) could not be executed in this environment and should be verified locally in the running dev server (`localhost:3000/admin`).
- **Google Font (`Newsreader`) Offline Fallback**: In offline environments, `.font-cedar-serif` falls back gracefully to `Georgia, Cambria, 'Times New Roman', serif`; in online environments, `Newsreader` loads via `src/styles/admin-theme.css`.
