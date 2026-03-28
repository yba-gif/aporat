

## V3 Platform — Gap Analysis & Implementation Plan

### What's Built (✓)
- **Login page** — grid background, wordmark, demo credentials toggle
- **Sidebar** — collapsible, sectioned nav, user badge, logout
- **Top bar** — breadcrumbs, search button, notification bell, avatar
- **Dashboard** — 6 KPI cards, recent cases table, risk donut chart, activity feed, top risk signals
- **Cases list** — sortable/filterable table, pagination, bulk actions, checkboxes
- **Case Detail** — 3-column layout, applicant card, documents, OSINT findings (grouped/filterable), timeline, documents tab, risk assessment with breakdown bars, key risk factors, case actions, case history
- **Defence OSINT** — new scan (CSV/manual), scan results with expandable personnel violations
- **Scan Queue** — active queue table with simulated progress, OSINT tool status grid
- **Settings** — 5 tabs (Profile, Team, Risk Scoring, OSINT Tools, System)
- **Mock data** — 30 cases, 3 defence scans, 12 personnel, activity feed, OSINT tools

### What's Missing

1. **Social Graph tab** — currently a placeholder icon. Needs interactive force-directed graph using `react-force-graph-2d` with applicant as center node, connected identities color-coded by risk, clickable nodes, edge labels, legend.

2. **Cmd+K global search overlay** — search bar in top bar exists but doesn't open anything. Needs a modal overlay searching across cases, people, and findings with keyboard navigation.

3. **Confirmation modals** — Approve/Reject/Escalate buttons in case detail have no confirmation dialogs. Need modals for destructive actions.

4. **Toast notifications** — actions like Approve/Reject should trigger toast feedback ("Case PL-2026-00142 approved").

5. **Keyboard shortcuts** — J/K to navigate table rows, Enter to open, Esc to go back. Not implemented.

6. **Skeleton loading states** — no skeleton loaders exist; data loads instantly from mock. Should add skeleton components matching layout shapes.

7. **Consulate filter in Cases** — filter bar has risk and status dropdowns but no consulate dropdown (spec requires it) and no date range picker.

8. **Document mismatch flags** — Documents tab should flag fields where extracted value doesn't match OSINT findings (e.g., name mismatch). Not implemented.

9. **Risk Rationale expandable section** — right column should have an expandable "Risk Rationale" section with full explanation below key risk factors. Not present.

10. **Personnel Database page** — `/v3/personnel` currently routes to `V3Cases` (placeholder). Should be a dedicated personnel database view.

11. **OSINT Scanner page** — `/v3/scanner` routes to `V3Dashboard` (placeholder). Should be a visa-specific OSINT scanner.

12. **Login with real auth** — login currently does `setTimeout` → navigate. Should use the Supabase auth (user berkan@admin.com already created).

13. **Page transitions** — no fade animations between routes.

### Implementation Plan

#### Step 1: Social Graph Visualization
- Install `react-force-graph-2d`
- Generate `socialGraph` data in mockData (nodes for applicant + found identities/orgs, edges with relationship labels)
- Build `V3SocialGraph` component in the case detail graph tab
- Applicant = teal center node (larger), others colored by risk, clickable with detail panel, legend

#### Step 2: Cmd+K Global Search
- Create `V3CommandPalette` modal component
- Wire `⌘K` keyboard listener globally in V3Layout
- Search across cases (by ID, name), personnel, and findings
- Keyboard nav: arrow keys, Enter to select, Esc to close
- Results grouped by type with icons

#### Step 3: Action Modals & Toasts
- Add confirmation dialogs for Reject and Escalate using existing shadcn AlertDialog
- Wire Approve/Reject/Escalate buttons to show toast via sonner
- Add toast on bulk actions (Escalate, Export CSV)

#### Step 4: Missing Filters & UI Polish
- Add consulate dropdown and date range inputs to Cases filter bar
- Add document mismatch flags in Documents tab (compare extracted fields vs applicant data)
- Add expandable "Risk Rationale" section in right column
- Add skeleton loaders for dashboard and case detail

#### Step 5: Keyboard Shortcuts
- J/K navigation in Cases table and Queue table
- Enter to open selected row
- Esc to navigate back

#### Step 6: Placeholder Pages
- Build `V3Personnel` — dedicated personnel database table with search/filter
- Build `V3Scanner` — visa-specific OSINT scanner (similar to defence but for individual applicants)

#### Step 7: Auth Integration
- Wire V3Login to use Supabase auth (`supabase.auth.signInWithPassword`)
- Add protected route wrapper for `/v3/*` routes
- Show real user info in sidebar/topbar

#### Step 8: Page Transitions
- Add framer-motion `AnimatePresence` wrapper in V3Layout
- Subtle fade (150ms) on route changes

### Technical Details

- **react-force-graph-2d**: Lightweight 2D graph renderer, fits the dark theme well with custom node/link colors
- **Social graph data**: Will add `socialGraph: { nodes: [], edges: [] }` to each V3Case in mockData with 5-15 nodes per case
- **Command palette**: Full-screen overlay with backdrop blur, input field, grouped results list
- **Skeleton loaders**: Tailwind `animate-pulse` blocks matching card/table layouts
- **Auth**: Use existing `supabase` client from `@/integrations/supabase/client`

