

## V3 Intelligence Graph — Full-Page 3D Network Visualization

### What We're Building
A dedicated `/v3/graph` route that delivers a full-screen, immersive 3D fraud network visualization — the same caliber as `/p2/dashboard/graph` (the P2NetworkGraph) but adapted to V3's dark workstation aesthetic and wired to V3 case data.

This is the "wow" screen — the one you show in demos. It turns OSINT findings and case relationships into a navigable 3D intelligence environment.

### What Already Exists
- **P2NetworkGraph** (`src/pages/P2NetworkGraph.tsx`, 695 lines): Full 3D graph using `react-force-graph-3d` + Three.js with bloom glow, animated particles, right-click dossier panel, entity type filtering, risk path highlighting, search, zoom controls, and a bottom legend. Uses hardcoded Ahmad Rezaee fraud network data.
- **V3SocialGraph** (`src/components/v3/V3SocialGraph.tsx`): Basic 2D graph embedded in case detail tab. Generates nodes from case OSINT findings. Minimal interactivity.

### Design Approach
Port the P2NetworkGraph's 3D engine into the V3 design system, with these upgrades:

1. **V3 color scheme** — swap P2's navy/blue palette for V3's `--v3-surface`, `--v3-accent` (teal), `--v3-border` CSS variables. Background `#0A0F1A` instead of `#080c14`.

2. **Case-aware data** — accept an optional `?case=<id>` query param. If present, build the graph from that case's OSINT findings + applicant data (using `v3Cases.get()`). If no case param, show a global network view with nodes from multiple high-risk cases.

3. **V3 dossier panel** — right-click dossier styled with V3 border/surface tokens, sharper corners (rounded-md not rounded-xl), monospace IDs. Add "Open in Case Detail" button that navigates to `/v3/cases/:id`.

4. **Sidebar integration** — add "Network Graph" nav item to V3Sidebar under Intelligence section. Register `/v3/graph` route in App.tsx.

5. **Edge types from PRD** — add `SHARED_DOC` and `SAME_MOBILE` edge types (red, thicker) matching the P2 fraud network data model. These are the high-signal connections that make the demo compelling.

### Implementation Steps

**File 1: `src/pages/v3/V3Graph.tsx`** (~600 lines)
- Port P2NetworkGraph wholesale, then restyle:
  - Replace all `bg-[#0f1524]/90` with V3 surface variables
  - Replace `border-white/10` with `var(--v3-border)`
  - Replace blue accents with teal (`var(--v3-accent)`)
  - Use rounded-md everywhere (no rounded-xl)
  - Font sizes: 10px labels, 11px body, monospace for IDs
- Keep all 3D features: ForceGraph3D, Three.js custom geometries, bloom glow rings, animated particles, risk path highlighting
- Keep the dossier slide-in panel, entity type filter panel, search, zoom/reset controls, bottom legend, stats overlay
- Graph data: use the same Ahmad Rezaee fraud network dataset (23 nodes, 30+ links) as the default view — this is the demo scenario
- Add `useSearchParams` to accept `?case=<id>` for future case-specific graph generation

**File 2: `src/components/v3/V3Sidebar.tsx`** (edit)
- Add "Network Graph" nav item with `Network` icon under the Intelligence section, linking to `/v3/graph`

**File 3: `src/App.tsx`** (edit)
- Add `<Route path="graph" element={<V3Graph />} />` inside the V3 layout routes

### Technical Notes
- `react-force-graph-3d` and `three` are already installed (used by P2NetworkGraph)
- The 3D graph renders on a `<canvas>` managed by Three.js — no DOM performance concerns
- Node geometries: Octahedron (applicant/flagged), Box (org), Cone (location), Cylinder (social), Sphere (person) — same as P2
- Particle animation on links at `speed: 0.004` with blue directional particles
- Dossier panel uses `framer-motion` for slide-in animation

