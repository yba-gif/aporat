
# Intelligence Graph — Palantir-Grade Feature Plan

## Phase 1: Path Finder (High Impact)
- Add a "Find Path" mode: click two nodes to select source & target
- Compute and highlight all shortest paths between them using Dijkstra/BFS
- Display a side panel showing the chain of entities with edge labels
- Allow toggling between "shortest path" and "all paths" modes
- Works on both the 3D `/v3/graph` view and 2D Cytoscape case graph

## Phase 2: Timeline Scrubber (Temporal Analysis)
- Add a horizontal time slider at the bottom of the graph
- Filter nodes/edges by timestamp (using OSINT finding dates, case events, application dates)
- Animate connections appearing/disappearing as the slider moves
- Show a mini histogram above the slider indicating event density over time
- Enables analysts to spot coordination patterns (e.g., multiple applications within days)

## Phase 3: Lasso Selection + Bulk Actions
- Draw a rectangle/lasso on the 3D canvas to select multiple nodes
- Selection toolbar appears with actions: Flag All, Export Subgraph, Hide Selected, Group
- Export generates a structured JSON/PDF of the selected entity cluster
- Keyboard shortcut: `Shift+Drag` for lasso, `Escape` to deselect

## Phase 4: Double-Click Expand (Progressive Disclosure)
- Double-click any node to fetch and render its 2nd-degree connections
- New nodes animate in from the clicked node's position
- Visual indicator (pulsing ring) on nodes that have unexplored connections
- Collapse button to remove expanded nodes and return to previous state
- Queries `v3_osint_findings` and cross-case data for real expansion

## Phase 5: Minimap + Polish
- Small overview panel in bottom-right corner showing full graph topology
- Viewport indicator rectangle that can be dragged to navigate
- Undo/redo stack for layout changes (node pins, expansions, filters)
- `Ctrl+Z` / `Ctrl+Shift+Z` keyboard shortcuts

## Technical Notes
- All features built on existing `react-force-graph-3d` (3D) and `cytoscape` (2D) libraries
- Path finding uses client-side graph traversal (no new backend needed for Phase 1-3)
- Phase 4 requires querying the database for connected entities on demand
- No database migrations needed — all features use existing tables
